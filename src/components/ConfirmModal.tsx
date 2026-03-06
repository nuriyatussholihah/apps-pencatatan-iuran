"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel
}: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', position: 'relative', margin: '1rem', animation: 'scaleIn 0.3s ease' }}>
                <button
                    onClick={onCancel}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0.5rem' }}
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6 mt-2">
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.25rem', fontSize: '1.5rem' }}>{title}</h2>
                    <p>{message}</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>Batal</button>
                    <button onClick={onConfirm} className="btn" style={{ flex: 1, backgroundColor: 'var(--error)' }}>Ya, Hapus</button>
                </div>
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
