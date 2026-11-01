import React, { useState } from 'react';
import { MCURecord } from '../types';
import { formatIndonesianDate } from '../utils/mcuHelpers';
import { Calendar, Search, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ScheduleTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MCURecord[];
  onSelectRecord: (record: MCURecord) => void;
}

export const ScheduleTrackerModal: React.FC<ScheduleTrackerModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'UPCOMING'>('ALL');

  if (!isOpen) return null;

  const today = new Date();

  const getRecordStatus = (record: MCURecord) => {
    if (!record.tanggalMCUBerikutnya) return { label: 'Terjadwal', color: 'bg-slate-100 text-slate-700' };
    const dueDate = new Date(record.tanggalMCUBerikutnya);
    const diffMonths = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.4);

    if (diffMonths < 0) {
      return { label: 'Terlewat / Overdue', color: 'bg-red-100 text-red-800 border-red-300' };
    } else if (diffMonths <= 2) {
      return { label: 'Jatuh Tempo Segera (< 2 Bln)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else {
      return { label: 'Terjadwal Rutin', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.bagian.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === 'ALL' || rec.jenisKelamin === genderFilter;

    const status = getRecordStatus(rec);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DUE' && (status.label.includes('Jatuh Tempo') || status.label.includes('Terlewat'))) ||
      (statusFilter === 'UPCOMING' && status.label.includes('Terjadwal'));

    return matchesSearch && matchesGender && matchesStatus;
  });

  const handleExportSchedule = () => {
    const wb = XLSX.utils.book_new();
    const rows = filteredRecords.map((r) => ({
      BADGE: r.badge,
      NAMA: r.nama,
      GENDER: r.jenisKelamin === 'L' ? 'Laki-laki (1 Thn)' : 'Perempuan (2 Thn)',
      BAGIAN: r.bagian,
      TANGGAL_TERAKHIR_MCU: r.tanggal,
      JADWAL_MCU_BERIKUTNYA: r.tanggalMCUBerikutnya,
      STATUS_KESEHATAN: r.hasilPemkes,
      STATUS_JADWAL: getRecordStatus(r).label
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal MCU Pusri');
    XLSX.writeFile(wb, `Jadwal_MCU_Karyawan_Pusri_${today.getFullYear()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-0.5 flex items-center justify-center shrink-0 border border-white/20 overflow-hidden">
              <img
                src="/logo_sm.png"
                alt="Logo PT Pusri"
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm">MONITORING JADWAL MCU RUTIN RS PT PUSRI</h2>
              <p className="text-[11px] text-slate-400">
                Aturan Siklus: Laki-laki <strong className="text-indigo-300">1 Tahun Sekali</strong> &bull; Perempuan <strong className="text-pink-300">2 Tahun Sekali</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSchedule}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Jadwal Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari badge, nama karyawan, atau bagian/unit..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-lg font-medium text-xs text-slate-700"
            >
              <option value="ALL">Semua Gender (L &amp; P)</option>
              <option value="L">Laki-laki Saja (Siklus 1 Thn)</option>
              <option value="P">Perempuan Saja (Siklus 2 Thn)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-lg font-medium text-xs text-slate-700"
            >
              <option value="ALL">Semua Status Jadwal</option>
              <option value="DUE">Jatuh Tempo / Segera</option>
              <option value="UPCOMING">Terjadwal Rutin</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Badge &amp; Nama</th>
                <th className="p-2.5">Gender &amp; Siklus</th>
                <th className="p-2.5">Unit Kerja / Bagian</th>
                <th className="p-2.5">MCU Terakhir</th>
                <th className="p-2.5">Jadwal Berikutnya</th>
                <th className="p-2.5">Status MCU</th>
                <th className="p-2.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const status = getRecordStatus(rec);
                  const isL = rec.jenisKelamin === 'L';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900 uppercase">{rec.nama}</div>
                        <div className="font-mono text-[11px] text-slate-500">Badge: {rec.badge}</div>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            isL ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {isL ? 'Laki-laki (1 Thn Sekali)' : 'Perempuan (2 Thn Sekali)'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700 truncate max-w-45" title={rec.bagian}>
                        {rec.bagian}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {formatIndonesianDate(rec.tanggal)}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {formatIndonesianDate(rec.tanggalMCUBerikutnya)}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRecord(rec);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Buka Form
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data rekam medis MCU dengan kriteria pencarian ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>Menampilkan {filteredRecords.length} dari {records.length} data karyawan</div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
