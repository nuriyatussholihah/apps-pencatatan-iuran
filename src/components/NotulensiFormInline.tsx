"use client";

import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotulensiFormInline({ isOpen, onSuccess }: { isOpen: boolean, onSuccess: () => void }) {
    const [tahun, setTahun] = useState(new Date().toISOString().split('T')[0]);
    const [tuanRumah, setTuanRumah] = useState('');

    const [catatan, setCatatan] = useState('');

    const [linkFoto, setLinkFoto] = useState('');

    const [loading, setLoading] = useState(false);
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setTahun(new Date().toISOString().split('T')[0]);
            setTuanRumah('');
            setCatatan('');
            setLinkFoto('');
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setRender(false);
    };

    if (!render) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Mengunggah dokumentasi...');

        try {
            const res = await fetch('/api/notulensi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tahun, tuanRumah, catatan, linkFoto })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Dokumentasi berhasil disimpan!', { id: toastId });
                onSuccess(); // Close form & refresh parent
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
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={20} />
                </div>
                <div>
                    <h2 style={{ marginBottom: '0', fontSize: '1.25rem' }}>Upload Dokumentasi</h2>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Masukkan catatan pertemuan & link album foto keluarga.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tanggal Pertemuan</label>
                            <input type="date" className="input" value={tahun} onChange={(e) => setTahun(e.target.value)} required />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tuan Rumah</label>
                            <input type="text" className="input" placeholder="Keluarga..." value={tuanRumah} onChange={(e) => setTuanRumah(e.target.value)} required />
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Link Album Foto (Opsional)</label>
                            <input type="url" className="input" placeholder="https://drive.google.com/..." value={linkFoto} onChange={(e) => setLinkFoto(e.target.value)} />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Catatan Pertemuan</label>
                        <textarea enterKeyHint="enter" className="input" placeholder="Tuliskan hasil diskusi, keputusan, atau ringkasan acara reuni..." value={catatan} onChange={(e) => setCatatan(e.target.value)} required style={{ minHeight: '135px', resize: 'vertical' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn" style={{ minWidth: '150px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Upload & Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
