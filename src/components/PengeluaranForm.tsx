"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PengeluaranForm({ isOpen, onSuccess }: { isOpen: boolean, onSuccess: () => void }) {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [keterangan, setKeterangan] = useState('Diserahkan ke Tuan Rumah');
    const [jumlah, setJumlah] = useState('');

    const [loading, setLoading] = useState(false);
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setTahun(new Date().getFullYear().toString());
            setKeterangan('Diserahkan ke Tuan Rumah');
            setJumlah('');
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setRender(false);
    };

    if (!render) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Menyimpan data pengeluaran...');

        try {
            const res = await fetch('/api/pengeluaran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tahun,
                    keterangan,
                    jumlah: parseInt(jumlah.replace(/[^0-9]/g, '')) || 0,
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Pengeluaran berhasil dicatat!', { id: toastId });
                onSuccess();
            } else {
                toast.error(data.error || 'Terjadi kesalahan sistem', { id: toastId });
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
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} />
                </div>
                <div>
                    <h2 style={{ marginBottom: '0', fontSize: '1.25rem', color: 'var(--error)' }}>Catat Pengeluaran</h2>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Catat dana yang diserahkan ke tuan rumah atau pengeluaran lainnya.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tahun Iuran Berlangsung</label>
                    <input type="number" className="input" value={tahun} onChange={(e) => setTahun(e.target.value)} required />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Keterangan</label>
                    <input type="text" className="input" placeholder="Misal: Tuan Rumah Bude Budi" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Jumlah (Rp)</label>
                    <input type="number" className="input" placeholder="Contoh: 500000" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required min="0" />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="submit" className="btn" style={{ minWidth: '150px', background: 'var(--error)', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                    </button>
                </div>
            </form>
        </div>
    );
}
