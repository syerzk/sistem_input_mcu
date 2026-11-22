import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import {
  Stethoscope,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import {
  DoctorItem,
  fetchAllDoctorsGolang,
  createDoctorGolang,
  updateDoctorGolang,
  deleteDoctorGolang
} from '../services/golangApi';

interface DoctorManagerPageProps {
  onDoctorsUpdated?: () => void;
}

export const DoctorManagerPage: React.FC<DoctorManagerPageProps> = ({ onDoctorsUpdated }) => {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [spesialis, setSpesialis] = useState('Dokter Pemeriksa MCU');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDoctors = async () => {
    setIsLoading(true);
    const data = await fetchAllDoctorsGolang();
    setDoctors(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNama('');
    setSpesialis('Dokter Pemeriksa MCU');
    setIsActive(true);
  };

  const handleEdit = (doc: DoctorItem) => {
    setEditingId(doc.id);
    setNama(doc.nama);
    setSpesialis(doc.spesialis || 'Dokter Pemeriksa MCU');
    setIsActive(doc.isActive);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setMessage({ type: 'error', text: 'Nama dokter wajib diisi.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      nama: nama.trim(),
      spesialis: spesialis.trim() || 'Dokter Pemeriksa MCU',
      isActive,
    };

    const res =
      editingId !== null
        ? await updateDoctorGolang(editingId, payload)
        : await createDoctorGolang(payload);

    setIsSaving(false);

    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'Gagal menyimpan data dokter.' });
      return;
    }

    setMessage({
      type: 'success',
      text: editingId !== null ? 'Data dokter berhasil diperbarui.' : 'Dokter baru berhasil ditambahkan.',
    });
    resetForm();
    await loadDoctors();
    onDoctorsUpdated?.();
  };

  const handleDelete = async (doc: DoctorItem) => {
    if (!window.confirm(`Hapus dokter "${doc.nama}" dari daftar?`)) return;

    const res = await deleteDoctorGolang(doc.id);
    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'Gagal menghapus data dokter.' });
      return;
    }

    if (editingId === doc.id) resetForm();
    setMessage({ type: 'success', text: `Dokter "${doc.nama}" berhasil dihapus.` });
    await loadDoctors();
    onDoctorsUpdated?.();
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.spesialis || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header Halaman */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-xs p-4 flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
            MASTER DATA DOKTER PEMERIKSA
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola daftar dokter aktif yang muncul pada pilihan dropdown formulir pemeriksaan MCU.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Tambah / Edit Dokter */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {editingId !== null ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
          </h2>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Dokter &amp; Gelar
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: dr. Ahmad Fauzi, Sp.Ok"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Spesialis / Jabatan
            </label>
            <input
              type="text"
              value={spesialis}
              onChange={(e) => setSpesialis(e.target.value)}
              placeholder="Dokter Pemeriksa MCU"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
              />
              <span>Aktif</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              {editingId !== null ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Menyimpan...' : editingId !== null ? 'Simpan' : 'Tambah'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Tabel Daftar Dokter */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Daftar Dokter Terdaftar ({filteredDoctors.length})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau spesialis..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-blue-600 outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Memuat data dokter...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Belum ada data dokter yang sesuai.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-600">
                  <th className="py-2.5 px-4 font-bold w-12">No</th>
                  <th className="py-2.5 px-4 font-bold">Nama Dokter</th>
                  <th className="py-2.5 px-4 font-bold">Spesialis / Unit</th>
                  <th className="py-2.5 px-4 font-bold text-center">Status</th>
                  <th className="py-2.5 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDoctors.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{doc.nama}</td>
                    <td className="py-2.5 px-4 text-slate-600">{doc.spesialis || '-'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {doc.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Edit Dokter"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Hapus Dokter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};