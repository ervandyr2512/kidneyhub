'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/firebase/auth';
import { getUserProfile } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const dashboardPath: Record<string, string> = {
  admin: '/dashboard/admin',
  doctor: '/dashboard/doctor',
  hospital_staff: '/dashboard/hospital',
  donor: '/dashboard/donor',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fbUser = await signIn(email, password);
      const profile = await getUserProfile(fbUser.uid);
      // Cek verifikasi: dari Firebase Auth ATAU dari flag DB (untuk akun dummy/staff)
      if (!fbUser.emailVerified && !profile?.isEmailVerified) {
        toast.error('Email belum diverifikasi. Cek kotak masuk Anda.');
        setLoading(false);
        return;
      }
      toast.success(`Selamat datang, ${profile?.name ?? email}!`);
      router.push(dashboardPath[profile?.role ?? 'donor']);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login gagal';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        toast.error('Email atau password salah.');
      } else if (msg.includes('user-not-found')) {
        toast.error('Akun tidak ditemukan.');
      } else {
        toast.error('Terjadi kesalahan. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-blue-700">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <span>kidney<span className="text-teal-600">hub</span><span className="text-gray-400 font-normal">.id</span></span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Masuk ke akun Anda</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Masuk
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Daftar sebagai donor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
