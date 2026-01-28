'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { 
  Users, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  Settings,
  X
} from 'lucide-react';

interface Stats {
  total: number;
  waiting: number;
  processing: number;
  completed: number;
}

interface Service {
  id: string;
  name: string;
  code: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'gray';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // State untuk menyimpan data notifikasi
  const [notification, setNotification] = useState<{
  message: string;
  type: 'success' | 'error';
  show: boolean;
} | null>(null);

// Fungsi pembantu untuk memunculkan notifikasi
  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
  setNotification({ message, type, show: true });
  // Sembunyikan otomatis setelah 3 detik
  setTimeout(() => setNotification(prev => prev ? { ...prev, show: false } : null), 3000);
};

  const fetchData = async () => {
    try {
      const [statsRes, serviceRes] = await Promise.all([
        api.get('/stats/today'),
        api.get('/services')
      ]);
      setStats(statsRes.data.data || statsRes.data.summary);
      setServices(serviceRes.data.data || []);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && 
          (err as { response: { status: number } }).response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const handleCallNext = async (serviceId: string) => {
  try {
    const response = await api.post('/queues/call', { service_id: serviceId });
    // Panggil notifikasi sukses
    showNotify(`Berhasil memanggil antrian ${response.data.data.display_num}`, 'success');
    fetchData();
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    const errorMessage = error.response?.data?.message || "Antrian sedang kosong";
    // Panggil notifikasi error
    showNotify(errorMessage, 'error');
  }
};

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
    
    {/* Sisi Kiri: Brand & Status */}
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/admin')}>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
          <LayoutDashboard className="text-white" size={22} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 leading-none">SMALD</h1>
          <div className="flex items-center gap-1.5 mt-1">
          </div>
        </div>
      </div>
    </div>

    {/* Sisi Kanan: Actions & User Profile */}
    <div className="flex items-center gap-3">
      
      {/* Tombol Kelola Layanan */}
      <button 
        onClick={() => router.push('/admin/services')}
        className="group flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:border-blue-500 hover:text-blue-600 hover:shadow-md hover:shadow-blue-50/50 transition-all duration-300"
      >
        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
        <span className="hidden md:inline">Kelola Layanan</span>
      </button>

      {/* Separator */}
      <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

      {/* Tombol Logout */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all duration-300"
      >
        <LogOut size={18} /> 
        <span className="hidden md:inline">Logout</span>
      </button>

      {/* Mini Profile Avatar (Hanya Visual) */}
      <div className="ml-2 hidden sm:flex items-center gap-2 border-l pl-4 border-gray-100">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center border border-white shadow-sm">
          <Users size={18} className="text-gray-500" />
        </div>
      </div>
    </div>
  </div>
</nav>

      <main className="p-8 max-w-7xl mx-auto">
        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Hari Ini" value={stats?.total || 0} icon={<Users />} color="blue" />
          <StatCard title="Menunggu" value={stats?.waiting || 0} icon={<Clock />} color="yellow" />
          <StatCard title="Diproses" value={stats?.processing || 0} icon={<PlayCircle />} color="green" />
          <StatCard title="Selesai" value={stats?.completed || 0} icon={<CheckCircle />} color="gray" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Layanan (Kontrol Utama) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-700 font-bold">Kontrol Loket</h2>
                <button onClick={fetchData} className="text-blue-600 hover:rotate-180 transition-all duration-500">
                  <RefreshCw size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {services
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((service) => (
                  <div key={service.id} className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">Kode Layanan: {service.code}</p>
                    </div>
                    <button
                      onClick={() => handleCallNext(service.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition">
                      Panggil <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips / Info */}
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg h-fit">
            <h3 className="font-bold text-lg mb-4">Informasi Admin</h3>
            <ul className="space-y-3 text-sm opacity-90">
              <li>• Klik <b>Panggil</b> untuk memajukan antrian.</li>
              <li>• Sistem otomatis mengubah antrian sebelumnya menjadi Selesai.</li>
              <li>• Data statistik diperbarui secara otomatis setelah aksi.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-[100] transform transition-all duration-500 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
          notification.show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        } ${
          notification.type === 'success' 
          ? 'bg-white border-green-100 text-green-800' 
          : 'bg-white border-red-100 text-red-800'
        }`}>
          <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <Clock className="text-red-600" size={20} />
            )}
          </div>
          <p className="font-bold text-sm tracking-tight">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-4 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors: Record<StatCardProps['color'], string> = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-50 text-gray-600"
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}