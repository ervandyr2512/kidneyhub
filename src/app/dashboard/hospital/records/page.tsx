'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Eye } from 'lucide-react';
import { medicalRecordDb, donorDb, hospitalDb } from '@/lib/firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import type { MedicalRecord, Donor, Hospital } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LabResultsForm } from '@/components/forms/LabResultsForm';
import { Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function HospitalRecordsPage() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showDonorPicker, setShowDonorPicker] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [editRecord, setEditRecord] = useState<MedicalRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);

  const load = async () => {
    setLoading(true);
    const [r, d, h] = await Promise.all([
      medicalRecordDb.getAll(),
      donorDb.getAll(),
      hospitalDb.getAll(),
    ]);
    setRecords(r);
    // Tampilkan semua donor kecuali yang ditolak sebagai pilihan input rekam medis
    setDonors(d.filter((dd) => dd.status !== 'rejected'));
    setHospitals(h);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Cari hospital yang dipilih, fallback ke yang pertama jika belum dipilih
  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0];

  const handleCreate = async (data: Omit<MedicalRecord, 'id' | 'donorName' | 'hospitalName' | 'createdAt' | 'updatedAt'>) => {
    setFormLoading(true);
    try {
      const donor = donors.find((d) => d.id === data.donorId);
      await medicalRecordDb.create({
        ...data,
        donorName: donor?.name ?? 'Unknown',
        hospitalName: currentHospital?.name ?? 'Unknown',
      });
      // Mark donor as assigned
      if (donor) await donorDb.update(donor.id, { status: 'assigned', assignedHospitalId: data.hospitalId });
      toast.success('Rekam medis berhasil disimpan');
      setShowAdd(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal menyimpan: ${msg}`);
      console.error('medicalRecord.create error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: Omit<MedicalRecord, 'id' | 'donorName' | 'hospitalName' | 'createdAt' | 'updatedAt'>) => {
    if (!editRecord) return;
    setFormLoading(true);
    try {
      await medicalRecordDb.update(editRecord.id, data);
      toast.success('Rekam medis diperbarui');
      setEditRecord(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal memperbarui: ${msg}`);
      console.error('medicalRecord.update error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const selectedDonor = donors.find((d) => d.id === selectedDonorId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekam Medis</h1>
          <p className="text-gray-500 text-sm">{records.length} rekam medis tersimpan</p>
        </div>
        <Button onClick={() => { setShowDonorPicker(true); setSelectedDonorId(''); setSelectedHospitalId(''); }}>
          <Plus size={16} /> Input Rekam Medis
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                {['Donor', 'Rumah Sakit', 'Kreatinin', 'HLA', 'Crossmatch', 'Hasil', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Memuat...</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Belum ada rekam medis.</td></tr>}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-gray-900">{r.donorName}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.hospitalName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.labResults?.creatinine ? `${r.labResults.creatinine} mg/dL` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate">
                    {r.labResults?.hlaTyping || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {r.labResults?.crossmatch ? (
                      <Badge variant={r.labResults.crossmatch === 'negative' ? 'green' : r.labResults.crossmatch === 'positive' ? 'red' : 'yellow'}>
                        {r.labResults.crossmatch === 'negative' ? 'Negatif' : r.labResults.crossmatch === 'positive' ? 'Positif' : 'Pending'}
                      </Badge>
                    ) : <span className="text-gray-400 text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.overallResult === 'fit' ? 'green' : r.overallResult === 'unfit' ? 'red' : 'yellow'}>
                      {r.overallResult === 'fit' ? 'Fit' : r.overallResult === 'unfit' ? 'Unfit' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewRecord(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={14} /></button>
                      <button onClick={() => setEditRecord(r)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 1: Pilih donor dan rumah sakit */}
      <Modal open={showDonorPicker} onClose={() => setShowDonorPicker(false)} title="Pilih Donor & Rumah Sakit">
        <div className="space-y-4">
          <Select
            label="Pilih Donor"
            value={selectedDonorId}
            onChange={(e) => setSelectedDonorId(e.target.value)}
            options={[
              { value: '', label: '-- Pilih donor --' },
              ...donors.map((d) => ({ value: d.id, label: `${d.name} (${d.bloodType}${d.rhesus}) — ${d.city}` })),
            ]}
          />
          <Select
            label="Pilih Rumah Sakit"
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            options={[
              { value: '', label: '-- Pilih rumah sakit --' },
              ...hospitals.filter((h) => h.isActive).map((h) => ({ value: h.id, label: h.name })),
            ]}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowDonorPicker(false)} className="flex-1">Batal</Button>
            <Button
              disabled={!selectedDonorId || (!selectedHospitalId && hospitals.length === 0)}
              onClick={() => {
                if (!selectedHospitalId && hospitals.length > 0) {
                  setSelectedHospitalId(hospitals[0].id);
                }
                setShowDonorPicker(false);
                setShowAdd(true);
              }}
              className="flex-1"
            >
              Lanjut
            </Button>
          </div>
        </div>
      </Modal>

      {/* Step 2: Form rekam medis */}
      {showAdd && selectedDonorId && selectedDonor && (
        <Modal
          open
          onClose={() => { setShowAdd(false); setSelectedDonorId(''); }}
          title="Input Rekam Medis Baru"
          size="xl"
        >
          <LabResultsForm
            donorId={selectedDonorId}
            donorName={selectedDonor.name}
            hospitalId={currentHospital?.id ?? 'unknown'}
            hospitalName={currentHospital?.name ?? 'Rumah Sakit'}
            onSubmit={handleCreate}
            onCancel={() => { setShowAdd(false); setSelectedDonorId(''); }}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Edit form */}
      {editRecord && (
        <Modal open onClose={() => setEditRecord(null)} title="Edit Rekam Medis" size="xl">
          <LabResultsForm
            donorId={editRecord.donorId}
            donorName={editRecord.donorName}
            hospitalId={editRecord.hospitalId}
            hospitalName={editRecord.hospitalName}
            initialData={editRecord}
            onSubmit={handleUpdate}
            onCancel={() => setEditRecord(null)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* View modal */}
      {viewRecord && (
        <Modal open onClose={() => setViewRecord(null)} title="Detail Rekam Medis" size="lg">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Donor</p>
                <p className="font-semibold">{viewRecord.donorName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Rumah Sakit</p>
                <p className="font-semibold">{viewRecord.hospitalName}</p>
              </div>
            </div>
            {/* Pemeriksaan Fisik */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pemeriksaan Fisik</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(viewRecord.physicalExam ?? {}).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium">{String(v) || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Lab Results */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Hasil Laboratorium</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(viewRecord.labResults ?? {}).filter(([, v]) => v !== undefined).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3 flex items-center gap-3">
              <p className="text-xs text-gray-500">Hasil Keseluruhan:</p>
              <Badge variant={viewRecord.overallResult === 'fit' ? 'green' : viewRecord.overallResult === 'unfit' ? 'red' : 'yellow'}>
                {viewRecord.overallResult === 'fit' ? 'Fit' : viewRecord.overallResult === 'unfit' ? 'Unfit' : 'Pending'}
              </Badge>
            </div>
            {viewRecord.notes && <p className="text-gray-600 text-xs">{viewRecord.notes}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
