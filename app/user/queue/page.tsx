'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Ticket, Download, Loader2, LogOut, Bell, Users, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Service {
  id: string;
  name: string;
  code: string;
}

interface Queue {
  id: string;
  display_num: string;
  status: string;
}

// Pastikan variabel ini ada di .env.local kamu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UserQueuePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [myQueue, setMyQueue] = useState<Queue | null>(null);
  const [currentNumber, setCurrentNumber] = useState<string>("-");
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/ping.mp3'); // Simpan file suara di /public/ping.mp3
    fetchServices();

    // REAL-TIME: Dengar perubahan pada tabel 'queues' di Supabase
    const channel = supabase
      .channel('public:queues')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'queues' }, (payload) => {
        const updatedData = payload.new;
        
        // Update nomor yang sedang dipanggil jika statusnya 'called'
        if (updatedData.status === 'called') {
          setCurrentNumber(updatedData.display_num);
          
          // Jika ID antrian yang diupdate adalah milik user ini
          if (myQueue && updatedData.id === myQueue.id) {
            playNotif();
            alert("Nomor Anda sedang dipanggil! Silakan menuju loket.");
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myQueue]);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.data || []);
    } catch (err) {
      console.error('Gagal ambil layanan', err);
    } finally { setLoading(false); }
  };

  const playNotif = () => audioRef.current?.play().catch(() => {});

  const handleTakeQueue = async (id: string) => {
    setBooking(true);
    try {
      const res = await api.post('/queues', { service_id: id });
      setMyQueue(res.data.data);
    } catch (err) {
      alert("Gagal mengambil antrian.");
    } finally { setBooking(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Top Navbar */}
      <nav className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg"><Ticket size={20} /></div>
          <span className="font-bold">ANTRIAN<span className="text-blue-500">DIGITAL</span></span>
        </div>
        <button onClick={() => {localStorage.clear(); router.push('/login');}} className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        {/* DASHBOARD REAL-TIME */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 flex justify-between items-center">
              <div>
                 <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Sekarang Dipanggil</p>
                 <h2 className="text-7xl font-black text-white tracking-tighter">{currentNumber}</h2>
              </div>
              <div className="text-right">
                 <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Nomor Anda</p>
                 <h2 className="text-5xl font-black text-white/50">{myQueue ? myQueue.display_num : '--'}</h2>
              </div>
           </div>
           
           <div className="mt-8 pt-6 border-t border-white/10 flex justify-between text-xs text-blue-100 font-medium">
              <span className="flex items-center gap-2"><Users size={14}/> Sisa Antrian: 4 Orang</span>
              <span className="flex items-center gap-2"><Clock size={14}/> Estimasi: 15 Menit</span>
           </div>
        </div>

        {/* LIST LAYANAN */}
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="text-blue-500" size={20}/> Pilih Layanan</h3>
        <div className="grid grid-cols-1 gap-3">
          {services.map((s) => (
            <button 
              key={s.id} 
              onClick={() => handleTakeQueue(s.id)}
              disabled={booking}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex justify-between items-center hover:border-blue-500/50 hover:bg-gray-800 transition-all group"
            >
              <div className="text-left">
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 mb-2 inline-block">{s.code}</span>
                <h4 className="font-bold text-gray-200 group-hover:text-white">{s.name}</h4>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
                {booking ? <Loader2 className="animate-spin" size={20}/> : <Ticket size={20}/>}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}