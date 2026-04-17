'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { screeningDb } from '@/lib/firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Screening } from '@/types';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function DoctorDashboard() {
  const { userProfile } = useAuth();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await screeningDb.getAll();
      setScreenings(all);
      setLoading(false);
    };
    load();
  }, [userProfile]);

  const pending = screenings.filter((s) => s.status === 'pending').length;
  const scheduled = screenings.filter((s) => s.status === 'scheduled').length;
  const completed = screenings.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Dokter</h1>
        <p className="text-gray-500 text-sm">Selamat datang, {userProfile?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Skrining" value={loading ? '…' : screenings.length} icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Menunggu" value={loading ? '…' : pending} icon={Clock} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
        <StatsCard title="Terjadwal" value={loading ? '…' : scheduled} icon={UserCheck} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatsCard title="Selesai" value={loading ? '…' : completed} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
      </div>

      <Card>
        <CardHeader
          title="Skrining Terbaru"
          action={
            <Link href="/dashboard/doctor/screenings" className="text-xs text-blue-600 hover:underline">
              Lihat semua
            </Link>
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : screenings.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada penugasan skrining.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {screenings.slice(-8).reverse().map((s) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.donorName}</p>
                    <p className="text-xs text-gray-400">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleDateString('id-ID') : 'Belum dijadwalkan'}</p>
                  </div>
                  <Badge variant={s.status === 'completed' ? 'green' : s.status === 'scheduled' ? 'blue' : 'yellow'}>
                    {s.status === 'completed' ? 'Selesai' : s.status === 'scheduled' ? 'Terjadwal' : 'Menunggu'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
