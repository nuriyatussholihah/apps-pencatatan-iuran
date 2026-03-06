"use client";

import React, { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';

export default function NotulensiFormModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [catatan, setCatatan] = useState('');
    const [linkFoto, setLinkFoto] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTahun(new Date().getFullYear().toString());
            setCatatan('');
            setLinkFoto('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/notulensi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tahun,
                    catatan,
                    linkFoto
                })
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.error || 'Terjadi kesalahan');
            }
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative', margin: '1rem', animation: 'scaleIn 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.5rem' }}
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6 mt-2">
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Camera size={28} />
                    </div>
                    <h2 style={{ marginBottom: '0.25rem', fontSize: '1.5rem' }}>Upload Dokumentasi</h2>
                    <p style={{ fontSize: '0.9rem' }}>Masukkan catatan pertemuan & link foto keluarga.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tahun Pertemuan</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="Contoh: 2025"
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Catatan Pertemuan</label>
                        <textarea
                            className="input"
                            placeholder="Tuliskan hasil diskusi, keputusan, atau ringkasan acara reuni..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            required
                            style={{ minHeight: '120px', resize: 'vertical' }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Link Album Foto</label>
                        <input
                            type="url"
                            className="input"
                            placeholder="https://drive.google.com/..."
                            value={linkFoto}
                            onChange={(e) => setLinkFoto(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn" style={{ width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                        {loading ? 'Menyimpan...' : 'Upload & Simpan'}
                    </button>
                </form>
            </div>
        </div>
    );
}
