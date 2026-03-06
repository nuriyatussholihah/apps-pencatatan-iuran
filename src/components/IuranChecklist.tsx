import React from 'react';
import { Iuran } from './IuranTable';
import { CheckCircle2, Circle } from 'lucide-react';

export default function IuranChecklist({ data, isAdmin, onQuickUpdate }: { data: Iuran[], isAdmin?: boolean, onQuickUpdate?: (id: string, currentStatus: 'Lunas' | 'Belum') => void }) {
    if (data.length === 0) {
        return <div className="text-center mt-4 fade-in"><p>Belum ada data iuran</p></div>;
    }

    // Sort: Belum first, Lunas later
    const sortedData = [...data].sort((a, b) => {
        if (a.status === 'Belum' && b.status === 'Lunas') return -1;
        if (a.status === 'Lunas' && b.status === 'Belum') return 1;
        return 0; // maintain original relative order otherwise
    });

    return (
        <div className="card fade-in" style={{ padding: '1.5rem', background: 'var(--card-bg)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📋 Daftar Pembayaran
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {sortedData.map((item, index) => {
                    const isLunas = item.status === 'Lunas';
                    return (
                        <div
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.5rem 0',
                                borderBottom: index < data.length - 1 ? '1px dashed var(--border)' : 'none'
                            }}
                        >
                            <div
                                style={{
                                    color: isLunas ? 'var(--success)' : 'var(--muted)',
                                    flexShrink: 0,
                                    cursor: isAdmin ? 'pointer' : 'default',
                                    transition: 'transform 0.1s ease',
                                    display: 'flex'
                                }}
                                onClick={() => {
                                    if (isAdmin && onQuickUpdate) {
                                        onQuickUpdate(item.id, item.status);
                                    }
                                }}
                                onMouseEnter={(e) => { if (isAdmin) e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={(e) => { if (isAdmin) e.currentTarget.style.transform = 'scale(1)'; }}
                                title={isAdmin ? "Klik untuk ubah status" : ""}
                            >
                                {isLunas ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: isLunas ? 'var(--foreground)' : 'var(--muted)' }}>
                                    {index + 1}. {item.namaKk}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                                    {isLunas ? `Rp ${item.jumlah.toLocaleString('id-ID')}` : 'Belum bayar'}
                                </div>
                            </div>

                            {isLunas && item.linkBukti && (
                                <a
                                    href={item.linkBukti}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        padding: '0.3rem 0.6rem',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '6px',
                                        flexShrink: 0
                                    }}
                                >
                                    Bukti
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Total Lunas:</span>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                        {data.filter(i => i.status === 'Lunas').length} dari {data.length} Keluarga
                    </span>
                </div>
            </div>
        </div>
    );
}
