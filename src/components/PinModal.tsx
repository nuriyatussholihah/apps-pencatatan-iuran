"use client";

import React, { useState, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

export default function PinModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Di aplikasi nyata, validasi ini sebaiknya dilakukan via API backend.
        // Tapi karena request adalah PIN sederhana (misal 000000):
        if (pin === '123456') {
            onSuccess();
            onClose();
        } else {
            setError('PIN salah. Silakan coba lagi.');
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', position: 'relative', margin: '1rem', animation: 'scaleIn 0.3s ease' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.5rem' }}
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-4 mt-2">
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.25rem' }}>Akses Admin</h2>
                    <p>Masukkan PIN rahasia untuk mengelola data.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            className="input"
                            placeholder="Masukkan PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
                    <button type="submit" className="btn" style={{ width: '100%' }}>Masuk</button>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
        </div>
    );
}
