'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Tambahkan ini
import api from '@/lib/axios';
import { Ticket, Download, Loader2, LogOut } from 'lucide-react'; // Tambahkan LogOut

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface QueueResponse {
  id: string;
  display_num: string;
  status: string;
}

export default function UserQueuePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [myQueue, setMyQueue] = useState<QueueResponse | null>(null);
  const router = useRouter(); // Inisialisasi router

  // 1. Ambil daftar layanan saat halaman dimuat
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data.data || []);
      } catch (err) {
        console.error('Gagal mengambil layanan', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  // 2. Fungsi untuk mengambil nomor antrian
  const handleTakeQueue = async (serviceId: string) => {
    setBooking(true);
    try {
      const response = await api.post('/queues', { service_id: serviceId });
      setMyQueue(response.data.data);
    } catch (err) {
      alert('Gagal mengambil antrian. Silakan coba lagi.');
    } finally {
      setBooking(false);
    }
  };

  // 3. Fungsi untuk download struk PDF
  const handleDownloadTicket = async () => {
    if (!myQueue) return;

    setDownloading(true);
    try {
      const response = await api.get(`/queues/download/${myQueue.id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tiket-${myQueue.display_num}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal download PDF:", err);
      alert("Gagal mengunduh tiket. Cek koneksi server atau status login Anda.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar Baru */}
      <nav className="bg-white shadow-sm px-4 sm:px-8 py-4 flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Ticket size={20} />
          </div>
          <span className="font-bold text-gray-800 text-lg hidden sm:inline">SMALD</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Ambil Nomor Antrian</h1>
          <p className="mt-4 text-lg text-gray-600">Silakan pilih layanan yang Anda tuju</p>
        </div>

        {/* Modal Sukses Ambil Antrian */}
        {myQueue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Antrian Anda</h2>
              <div className="my-6">
                <span className="text-6xl font-black text-blue-600 tracking-tighter">
                  {myQueue.display_num}
                </span>
              </div>
              <p className="text-gray-500 mb-6">Simpan nomor ini atau download struk PDF untuk bukti.</p>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadTicket}
                  disabled={downloading}
                  className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition ${
                    downloading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {downloading ? (
                    <><Loader2 className="animate-spin" size={20} /> Memproses...</>
                  ) : (
                    <><Download size={20} /> Download PDF</>
                  )}
                </button>
                <button
                  onClick={() => setMyQueue(null)}
                  className="w-full text-gray-500 font-medium hover:text-gray-700 disabled:opacity-50"
                  disabled={downloading}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daftar Layanan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services
          .sort((a, b) => a.code.localeCompare(b.code)) 
          .map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">
                  Kode: {service.code}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{service.description}</p>
              <button
                disabled={booking}
                onClick={() => handleTakeQueue(service.id)}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold group-hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                {booking ? 'Memproses...' : 'Pilih Layanan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}