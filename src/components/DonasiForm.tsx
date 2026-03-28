"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DonasiForm({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) {
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [keterangan, setKeterangan] = useState('');
    const [jumlah, setJumlah] = useState('');
    const [loading, setLoading] = useState(false);
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setTanggal(new Date().toISOString().split('T')[0]);
            setKeterangan('');
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
        const toastId = toast.loading('Menyimpan donasi...');
        try {
            const res = await fetch('/api/donasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tanggal,
                    keterangan,
                    jumlah: parseInt(jumlah.replace(/[^0-9]/g, '')) || 0,
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Donasi berhasil dicatat!', { id: toastId });
                onSuccess();
            } else {
                toast.error(data.error || 'Terjadi kesalahan', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyimpan', { id: toastId });
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
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} />
                </div>
                <div>
                    <h2 style={{ marginBottom: '0', fontSize: '1.25rem' }}>Catat Donasi Masuk</h2>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Catat total donasi yang terkumpul (bukan per-KK).</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tanggal Donasi</label>
                    <input type="date" className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Jumlah Donasi (Rp)</label>
                    <input type="number" className="input" placeholder="Contoh: 150000" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required min="0" />
                </div>

                <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Keterangan</label>
                    <input type="text" className="input" placeholder="Contoh: Donasi kotak Lebaran 2025" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn" style={{ minWidth: '150px', background: '#f59e0b', borderColor: '#f59e0b', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Simpan Donasi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
