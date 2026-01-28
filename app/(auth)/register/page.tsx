'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import api from '@/lib/axios';
import { CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react'; // Tambahkan icon

interface ApiErrorResponse {
  message: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State untuk Modal
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      // Jika sukses, munculkan modal kustom
      setShowSuccessModal(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverError = err as AxiosError<ApiErrorResponse>;
        const msg = serverError.response?.data?.message || '';
        
        // Logika penanganan pesan error spesifik dari backend
        if (msg.toLowerCase().includes('email')) {
          setError('Email sudah digunakan, silakan gunakan email lain.');
        } else if (msg.toLowerCase().includes('username')) {
          setError('Username sudah ada, cari nama lain ya.');
        } else {
          setError(msg || 'Terjadi kesalahan pada inputan Anda.');
        }
      } else {
        setError('Terjadi kesalahan sistem. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="bg-blue-600 w-12 h-12 rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <Users className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Daftar Akun</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Lengkapi data untuk bergabung ke sistem</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900"
                placeholder="masukkan username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900"
                placeholder="minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Hak Akses (Role)</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 appearance-none bg-white"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">user</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-blue-100 ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-all active:scale-95`}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Daftar Sekarang'}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 font-medium">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-black decoration-2 underline-offset-4 hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* --- MODAL SUCCESS CUSTOM --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Registrasi Berhasil!</h3>
            <p className="text-gray-500 font-medium mb-8">Akun Anda telah terdaftar di sistem. Silakan masuk untuk memulai.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}