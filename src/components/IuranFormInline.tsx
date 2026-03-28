"use client";

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IuranFormInline({ isOpen, onSuccess }: { isOpen: boolean, onSuccess: () => void }) {
    const [namaKk, setNamaKk] = useState('');
    const [tahun, setTahun] = useState(new Date().toISOString().split('T')[0]);
    const [jumlah, setJumlah] = useState('');
    const [status, setStatus] = useState<'Belum' | 'Lunas'>('Belum');
    const [linkBukti, setLinkBukti] = useState('');
    const [inputMode, setInputMode] = useState<'manual' | 'salin'>('manual');
    const [sourceYear, setSourceYear] = useState(new Date().getFullYear() - 1 + '');
    const [targetYear, setTargetYear] = useState(new Date().toISOString().split('T')[0]);
    const [defaultJumlah, setDefaultJumlah] = useState('');

    const [loading, setLoading] = useState(false);
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setNamaKk('');
            setTahun(new Date().toISOString().split('T')[0]);
            setJumlah('');
            setStatus('Belum');
            setLinkBukti('');
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setRender(false);
    };

    if (!render) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');

        try {
            if (inputMode === 'salin') {
                const res = await fetch('/api/iuran-copy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sourceYear,
                        targetYear,
                        defaultJumlah: parseInt(defaultJumlah.replace(/[^0-9]/g, '')) || 0,
                    })
                });

                const data = await res.json();
                if (data.success) {
                    toast.success(data.message, { id: toastId });
                    onSuccess();
                } else {
                    toast.error(data.error || 'Terjadi kesalahan sistem', { id: toastId });
                }
            } else {
                const res = await fetch('/api/iuran', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        namaKk,
                        tahun,
                        jumlah: parseInt(jumlah.replace(/[^0-9]/g, '')) || 0,
                        status,
                        linkBukti
                    })
                });

                const data = await res.json();

                if (data.success) {
                    toast.success('Iuran berhasil ditambahkan!', { id: toastId });
                    onSuccess(); // Close form & refresh parent
                } else {
                    toast.error(data.error || 'Terjadi kesalahan sistem', { id: toastId });
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyimpan data', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`card ${isOpen ? 'accordion-enter' : 'accordion-exit'}`}
            style={{ marginBottom: '1.5rem', marginTop: '0', animationDuration: '0.4s' }}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="flex items-center gap-4 mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                </div>
                <div>
                    <h2 style={{ marginBottom: '0', fontSize: '1.25rem' }}>Input Iuran Baru</h2>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Masukkan data pembayaran keluarga ke tabel.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    type="button"
                    onClick={() => setInputMode('manual')}
                    style={{
                        background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                        borderBottom: inputMode === 'manual' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: inputMode === 'manual' ? 'var(--primary)' : 'var(--muted)',
                        fontWeight: inputMode === 'manual' ? 600 : 500,
                        transition: 'all 0.2s'
                    }}
                >
                    Input Manual
                </button>
                <button
                    type="button"
                    onClick={() => setInputMode('salin')}
                    style={{
                        background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                        borderBottom: inputMode === 'salin' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: inputMode === 'salin' ? 'var(--primary)' : 'var(--muted)',
                        fontWeight: inputMode === 'salin' ? 600 : 500,
                        transition: 'all 0.2s'
                    }}
                >
                    Salin Nama Tahun Lalu
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                {inputMode === 'manual' ? (
                    <>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Nama KK</label>
                            <input type="text" className="input" placeholder="Contoh: Keluarga Budi" value={namaKk} onChange={(e) => setNamaKk(e.target.value)} required />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tanggal Iuran</label>
                            <input type="date" className="input" value={tahun} onChange={(e) => setTahun(e.target.value)} required />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Jumlah Total (Wajib + Seikhlasnya)</label>
                            <input type="number" className="input" placeholder="Contoh: 500000" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required min="0" />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Status Pembayaran</label>
                            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as 'Lunas' | 'Belum')} style={{ cursor: 'pointer', appearance: 'none' }}>
                                <option value="Belum">Belum Lunas</option>
                                <option value="Lunas">Lunas</option>
                            </select>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Link Bukti Transfer (Opsional)</label>
                            <input type="url" className="input" placeholder="https://drive.google.com/..." value={linkBukti} onChange={(e) => setLinkBukti(e.target.value)} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Salin Nama Dari Tahun</label>
                            <input type="number" className="input" placeholder="Contoh: 2026" value={sourceYear} onChange={(e) => setSourceYear(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tanggal Iuran (Tahun Baru)</label>
                            <input type="date" className="input" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} required />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Atur Nominal Wajib Awal (Rp)</label>
                            <input type="number" className="input" placeholder="Contoh: 50000" value={defaultJumlah} onChange={(e) => setDefaultJumlah(e.target.value)} required min="0" />
                        </div>
                        <div style={{ gridColumn: '1 / -1', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <strong>Info:</strong> Menekan tombol Simpan akan otomatis memasukkan semua nama dari tahun sumber ke tabel tahun yang baru dengan status <strong>Belum Bayar</strong>.
                        </div>
                    </>
                )}

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn" style={{ minWidth: '150px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </div>
            </form>
        </div>
    );
}
