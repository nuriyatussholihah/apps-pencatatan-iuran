"use client";

import React, { useState, useEffect, useMemo } from 'react';
import IuranTable, { Iuran } from '@/components/IuranTable';
import IuranChecklist from '@/components/IuranChecklist';
import NotulensiCard, { Notulensi } from '@/components/NotulensiCard';
import PinModal from '@/components/PinModal';
import IuranFormInline from '@/components/IuranFormInline';
import NotulensiFormInline from '@/components/NotulensiFormInline';
import PengeluaranForm from '@/components/PengeluaranForm';
import PengeluaranTable from '@/components/PengeluaranTable';
import { Camera, Download, Settings, RefreshCw, Sun, Moon, Filter, MinusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface Pengeluaran {
  id: string;
  timestamp: string;
  tahun: string;
  keterangan: string;
  jumlah: number;
}

const mockIuran: Iuran[] = [];

const mockNotulensi: Notulensi[] = [];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'iuran' | 'notulensi' | 'pengeluaran'>('iuran');
  const [iuranView, setIuranView] = useState<'table' | 'checklist'>('checklist');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [showIuranForm, setShowIuranForm] = useState(false);
  const [showNotulensiForm, setShowNotulensiForm] = useState(false);
  const [showPengeluaranForm, setShowPengeluaranForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [selectedYear, setSelectedYear] = useState<string>('Semua');

  const [iuranData, setIuranData] = useState<Iuran[]>([]);
  const [notulensiData, setNotulensiData] = useState<Notulensi[]>([]);
  const [pengeluaranData, setPengeluaranData] = useState<Pengeluaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    // Detect initial theme
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const t = isDark ? 'dark' : 'light';
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const [resIuran, resNotulensi, resPengeluaran] = await Promise.all([
        fetch('/api/iuran').catch(() => null),
        fetch('/api/notulensi').catch(() => null),
        fetch('/api/pengeluaran').catch(() => null)
      ]);

      let successCount = 0;

      if (resIuran && resIuran.ok) {
        const d = await resIuran.json();
        if (d.success) { setIuranData(d.data); successCount++; }
      }

      if (resNotulensi && resNotulensi.ok) {
        const d = await resNotulensi.json();
        if (d.success) { setNotulensiData(d.data); successCount++; }
      }

      if (resPengeluaran && resPengeluaran.ok) {
        const d = await resPengeluaran.json();
        if (d.success) { setPengeluaranData(d.data); successCount++; }
      }

      if (successCount < 3) {
        setApiError(true);
      }
    } catch (e) {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    toast.success('Berhasil masuk sebagai Admin.');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowIuranForm(false);
    setShowNotulensiForm(false);
    setShowPengeluaranForm(false);
    toast('Sesi Admin diakhiri', { icon: '👋' });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleExportCSV = () => {
    let dataToExport: any[] = [];
    if (activeTab === 'iuran') dataToExport = displayIuran;
    else if (activeTab === 'notulensi') dataToExport = displayNotulensi;
    else if (activeTab === 'pengeluaran') dataToExport = displayPengeluaran;

    if (dataToExport.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }

    let csvContent = "";

    if (activeTab === 'iuran') {
      csvContent = "ID,Timestamp,Tahun,Nama KK,Jumlah,Status,Link Bukti\n" +
        (dataToExport as Iuran[]).map(r => `"${r.id}","${r.timestamp}","${r.tahun}","${r.namaKk}","${r.jumlah}","${r.status}","${r.linkBukti}"`).join("\n");
    } else if (activeTab === 'pengeluaran') {
      csvContent = "ID,Timestamp,Tahun,Keterangan,Jumlah\n" +
        (dataToExport as Pengeluaran[]).map(r => `"${r.id}","${r.timestamp}","${r.tahun}","${r.keterangan}","${r.jumlah}"`).join("\n");
    } else {
      csvContent = "ID,Timestamp,Tahun,Tuan Rumah,Catatan,Link Foto\n" +
        (dataToExport as Notulensi[]).map(r => `"${r.id}","${r.timestamp}","${r.tahun}","${r.tuanRumah || ''}","${r.catatan.replace(/\n/g, ' ')}","${r.linkFoto}"`).join("\n");
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const filterLabel = selectedYear === 'Semua' ? 'Semua_Tahun' : `Tahun_${selectedYear}`;

    // Format tanggal: NamaHari_DD-MM-YYYY
    const today = new Date();
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
    const tanggal = String(today.getDate()).padStart(2, '0');
    const bulan = String(today.getMonth() + 1).padStart(2, '0');
    const tahun = today.getFullYear();
    const formattedDate = `${hari}_${tanggal}-${bulan}-${tahun}`;

    link.setAttribute("href", url);
    link.setAttribute("download", `Data_${activeTab}_${filterLabel}_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Data ${activeTab} (${selectedYear}) berhasil didownload!`);
  };

  const handleQuickUpdateStatus = async (id: string, currentStatus: 'Lunas' | 'Belum') => {
    const newStatus = currentStatus === 'Lunas' ? 'Belum' : 'Lunas';
    const toastId = toast.loading('Mengupdate status...');
    try {
      // Temukan data yang diedit untuk mempertahankan data lain (namakk, tahun, jumlah)
      const dataToUpdate = iuranData.find(d => d.id === id);
      if (!dataToUpdate) throw new Error('Data tidak ditemukan');

      const res = await fetch('/api/iuran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dataToUpdate, status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`Status berhasil diubah menjadi ${newStatus}!`, { id: toastId });
        fetchData(); // Refresh list
      } else {
        toast.error(result.error || 'Gagal update status', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error update status', { id: toastId });
    }
  };

  // Gunakan data mock jika API error (belum setup credentials)
  const baseIuran = apiError || iuranData.length === 0 ? mockIuran : iuranData;
  const baseNotulensi = apiError || notulensiData.length === 0 ? mockNotulensi : notulensiData;
  const basePengeluaran = apiError ? [] : pengeluaranData;

  // Mendapatkan daftar tahun unik dari kedua data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    baseIuran.forEach(item => years.add(item.tahun.substring(0, 4)));
    baseNotulensi.forEach(item => years.add(item.tahun.substring(0, 4)));
    basePengeluaran.forEach(item => years.add(item.tahun.substring(0, 4)));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // urutkan descending
  }, [baseIuran, baseNotulensi, basePengeluaran]);

  // Filter data berdasarkan tahun
  const displayIuran = useMemo(() => {
    if (selectedYear === 'Semua') return baseIuran;
    return baseIuran.filter(item => item.tahun.startsWith(selectedYear));
  }, [baseIuran, selectedYear]);

  const displayNotulensi = useMemo(() => {
    if (selectedYear === 'Semua') return baseNotulensi;
    return baseNotulensi.filter(item => item.tahun.startsWith(selectedYear));
  }, [baseNotulensi, selectedYear]);

  const displayPengeluaran = useMemo(() => {
    if (selectedYear === 'Semua') return basePengeluaran;
    return basePengeluaran.filter(item => item.tahun.startsWith(selectedYear));
  }, [basePengeluaran, selectedYear]);

  const totalPemasukan = displayIuran
    .filter(i => i.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const totalPengeluaran = displayPengeluaran
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const saldoAkhir = totalPemasukan - totalPengeluaran;

  return (
    <main className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <header className="mb-8 flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Iuran Keluarga</h1>
          <p>Transparansi dana Lebaran & Reuni Keluarga Besar.</p>
        </div>

        <div className="flex items-center" style={{ gap: '1rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
            title="Ganti Tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {isAdmin ? (
            <div className="flex gap-2">
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={handleExportCSV}>
                <Download size={16} /> Data Sheets
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleLogout}>
                Keluar Admin
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setIsPinModalOpen(true)}>
              <Settings size={16} /> Akses Admin
            </button>
          )}
        </div>
      </header>

      {apiError && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.9rem' }}>
          <strong>Mode Demo:</strong> Kredensial Google belum disetup atau ada masalah koneksi API (Data ditampilkan adalah simulasi).
        </div>
      )}

      <section className="flex" style={{ gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card flex items-center justify-between" style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', padding: '1.5rem 2rem', border: 'none', marginBottom: 0 }}>
          <div style={{ width: '100%' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, marginBottom: '0.25rem', fontSize: '1rem' }}>
              Rekap Keuangan {selectedYear !== 'Semua' ? `Tahun ${selectedYear}` : 'Keseluruhan'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Pemasukan: Rp {totalPemasukan.toLocaleString('id-ID')}</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Pengeluaran: - Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '-5px' }}>Saldo Kas Bersih</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-1px' }}>
                  Rp {saldoAkhir.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex items-center" style={{ padding: '1.5rem', marginBottom: 0, minWidth: '220px', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.8rem', borderRadius: '50%' }}>
            <Filter size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Filter Tahun</label>
            <select
              className="input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ padding: '0.5rem', cursor: 'pointer', appearance: 'none', fontSize: '1rem', fontWeight: 500 }}
            >
              <option value="Semua">Tampilkan Semua</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="tabs">
        <div className={`tab ${activeTab === 'iuran' ? 'active' : ''}`} onClick={() => setActiveTab('iuran')}>
          📝 Daftar Iuran
        </div>
        <div className={`tab ${activeTab === 'pengeluaran' ? 'active' : ''}`} onClick={() => setActiveTab('pengeluaran')}>
          💸 Daftar Pengeluaran
        </div>
        <div className={`tab ${activeTab === 'notulensi' ? 'active' : ''}`} onClick={() => setActiveTab('notulensi')}>
          📸 Notulensi & Foto
        </div>
      </div>

      <section>
        {activeTab === 'iuran' && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2>Status Pembayaran</h2>

                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 4px', overflow: 'hidden' }}>
                  <select
                    className="input"
                    value={iuranView}
                    onChange={(e) => setIuranView(e.target.value as 'checklist' | 'table')}
                    style={{
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                      marginBottom: 0
                    }}
                  >
                    <option value="checklist" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>📋 List Absensi</option>
                    <option value="table" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>📊 Tabel Detail</option>
                  </select>
                </div>

                <button onClick={fetchData} className="btn " style={{ background: 'transparent', color: 'var(--muted)', padding: '0.4rem' }} title="Refresh Data">
                  <RefreshCw size={16} className={loading ? "spinning" : ""} />
                </button>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    className={`btn ${showIuranForm ? 'btn-secondary' : ''}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    onClick={() => { setShowIuranForm(!showIuranForm); setShowPengeluaranForm(false); }}
                  >
                    {showIuranForm ? 'Tutup Form' : '+ Input Iuran'}
                  </button>
                </div>
              )}
            </div>

            <IuranFormInline isOpen={showIuranForm} onSuccess={() => { setShowIuranForm(false); fetchData(); }} />

            {loading ? (
              <p className="text-center" style={{ padding: '2rem 0' }}>Memuat data Iuran...</p>
            ) : iuranView === 'checklist' ? (
              <IuranChecklist data={displayIuran} isAdmin={isAdmin} onQuickUpdate={handleQuickUpdateStatus} />
            ) : (
              <IuranTable data={displayIuran} isAdmin={isAdmin} onRefresh={fetchData} />
            )}
          </div>
        )}

        {activeTab === 'pengeluaran' && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2>Riwayat Pengeluaran Kas</h2>
                <button onClick={fetchData} className="btn" style={{ background: 'transparent', color: 'var(--muted)', padding: '0.4rem' }} title="Refresh Data">
                  <RefreshCw size={16} className={loading ? "spinning" : ""} />
                </button>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    className={`btn ${showPengeluaranForm ? 'btn-secondary' : 'btn-secondary'}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: showPengeluaranForm ? 'inherit' : 'var(--error)', borderColor: showPengeluaranForm ? '' : 'var(--error)' }}
                    onClick={() => { setShowPengeluaranForm(!showPengeluaranForm); setShowIuranForm(false); }}
                  >
                    {showPengeluaranForm ? 'Tutup Form' : <><MinusCircle size={16} /> Catat Pengeluaran</>}
                  </button>
                </div>
              )}
            </div>

            <PengeluaranForm isOpen={showPengeluaranForm} onSuccess={() => { setShowPengeluaranForm(false); fetchData(); }} />

            {loading ? (
              <p className="text-center" style={{ padding: '2rem 0' }}>Memuat data Pengeluaran...</p>
            ) : (
              <PengeluaranTable data={displayPengeluaran} isAdmin={isAdmin} onRefresh={fetchData} />
            )}
          </div>
        )}

        {activeTab === 'notulensi' && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2>Catatan Pertemuan</h2>
                <button onClick={fetchData} className="btn" style={{ background: 'transparent', color: 'var(--muted)', padding: '0.4rem' }} title="Refresh Data">
                  <RefreshCw size={16} className={loading ? "spinning" : ""} />
                </button>
              </div>
              {isAdmin && (
                <button
                  className={`btn ${showNotulensiForm ? 'btn-secondary' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  onClick={() => setShowNotulensiForm(!showNotulensiForm)}
                >
                  {showNotulensiForm ? 'Tutup Form' : <><Camera size={16} /> Upload Dokumentasi</>}
                </button>
              )}
            </div>
            <NotulensiFormInline isOpen={showNotulensiForm} onSuccess={() => { setShowNotulensiForm(false); fetchData(); }} />

            {loading ? <p className="text-center" style={{ padding: '2rem 0' }}>Memuat Notulensi...</p> : <NotulensiCard data={displayNotulensi} isAdmin={isAdmin} onRefresh={fetchData} />}
          </div>
        )}
      </section>

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .fade-in { animation: fadeIn 0.4s ease; }
        .spinning { animation: spin 1s linear infinite; }
      `}} />
    </main>
  );
}
