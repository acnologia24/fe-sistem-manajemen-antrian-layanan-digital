'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2, 
  ArrowLeft, 
  LayoutDashboard, 
  LogOut, 
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // --- STATE NOTIFIKASI ---
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    show: boolean;
  } | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: ''
  });

  // --- FUNGSI SHOW NOTIFY ---
  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(prev => prev ? { ...prev, show: false } : null), 3000);
  };
    // --- SEARCH ---
  const filteredServices = useMemo(() => {
    return services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.code.toUpperCase().includes(searchTerm.toUpperCase()) 
    );
  }, [searchTerm, services]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.data || []);
    } catch (err) {
      console.error("Gagal ambil layanan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const openModal = (service: Service | null = null) => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name,
        code: service.code,
        description: service.description
      });
    } else {
      setFormData({ id: '', name: '', code: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.id) {
        await api.put(`/services/${formData.id}`, formData);
        showNotify("Layanan berhasil diperbarui", 'success');
      } else {
        const { id, ...dataToPost } = formData;
        await api.post('/services', dataToPost);
        showNotify("Layanan baru berhasil dibuat", 'success');
      }
      fetchServices();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        (err as { response: { data?: { message?: string } } }).response?.data?.message
        ? (err as { response: { data: { message: string } } }).response.data.message
        : "Terjadi kesalahan";
      showNotify(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      try {
        await api.delete(`/services/${id}`);
        showNotify("Layanan berhasil dihapus", 'success');
        fetchServices();
      } catch (err) {
        showNotify("Gagal menghapus layanan", 'error');
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- NAVBAR PREMIUM --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/admin')}>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                <LayoutDashboard className="text-white" size={22} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-none">SMALD</h1>
                <div className="flex items-center gap-1.5 mt-1">
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              <LogOut size={18} /> 
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        {/* --- TOMBOL UNDO / BACK --- */}
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold mb-6 transition-colors"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors border border-gray-100">
            <ArrowLeft size={20} />
          </div>
          Kembali ke Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Layanan</h1>
            <p className="text-gray-500">Kelola kategori layanan antrian instansi Anda</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm w-fit active:scale-95"
          >
            <Plus size={20} /> Tambah Layanan
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="mb-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          </div>
          <input 
            type="text"
            placeholder="Cari berdasarkan nama, kode, atau deskripsi layanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 py-3.5 pl-12 pr-4 rounded-2xl shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-700 font-medium"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabel Layanan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kode</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nama Layanan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Deskripsi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredServices
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((service) => (
                  <tr key={service.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs uppercase">
                        {service.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{service.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{service.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => openModal(service)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl text-gray-700 font-bold mb-6">
              {formData.id ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Layanan</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 placeholder-gray-500 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Contoh: Customer Service"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Layanan (Maks 2 Huruf)</label>
                <input 
                  type="text" 
                  required
                  maxLength={2}
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 placeholder-gray-500 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition uppercase"
                  placeholder="A"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 placeholder-gray-500 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  rows={3}
                  placeholder="Penjelasan singkat layanan..."
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:bg-blue-300"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {formData.id ? 'Simpan Perubahan' : 'Buat Layanan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CUSTOM TOAST NOTIFICATION --- */}
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
              <AlertCircle className="text-red-600" size={20} />
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