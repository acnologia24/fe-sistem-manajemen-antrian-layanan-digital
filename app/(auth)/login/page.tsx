'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react'; // Tambahkan icon
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // State baru untuk sukses
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // Tampilkan notifikasi sukses dulu
      setShowSuccess(true);

      // Kasih jeda 1.5 detik baru pindah halaman
      setTimeout(() => {
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/queue');
        }
      }, 1500);

    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Login gagal. Cek kembali email/password.';
      setError(errorMessage);
      setLoading(false); // Matikan loading hanya jika error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      
      {/* --- OVERLAY NOTIFIKASI SUKSES --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center p-8 rounded-3xl bg-white shadow-2xl border border-green-100 transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Login Berhasil!</h3>
            <p className="text-gray-500 font-medium">Menyiapkan dashboard Anda...</p>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="bg-blue-600 w-12 h-12 rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Selamat Datang</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Sistem Manajemen Antrian Layanan Digital</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                disabled={loading || showSuccess}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 disabled:bg-gray-50"
                placeholder="masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">Password</label>
              <input
                type="password"
                required
                disabled={loading || showSuccess}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-gray-900 disabled:bg-gray-50"
                placeholder="masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || showSuccess}
              className={`w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-white font-black text-lg shadow-lg shadow-blue-100 ${
                loading || showSuccess ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-all active:scale-95`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Sedang Masuk...</span>
                </>
              ) : 'Masuk Sekarang'}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 font-medium">
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-black decoration-2 underline-offset-4 hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}