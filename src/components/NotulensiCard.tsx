import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Check, X, ChevronRight } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export type Notulensi = {
    id: string;
    timestamp: string;
    tahun: string;
    tuanRumah?: string;
    catatan: string;
    linkFoto: string;
};

export default function NotulensiCard({ data, isAdmin, onRefresh }: { data: Notulensi[], isAdmin?: boolean, onRefresh?: () => void }) {
    const formatTanggal = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
            const tanggal = String(date.getDate()).padStart(2, '0');
            const bulan = String(date.getMonth() + 1).padStart(2, '0');
            const tahun = date.getFullYear();
            return `${hari}, ${tanggal}-${bulan}-${tahun}`;
        } catch {
            return dateString;
        }
    };
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Notulensi>>({});
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleEditClick = (item: Notulensi) => {
        setEditingId(item.id);
        setEditData(item);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSaveEdit = async () => {
        if (!editData.id) return;

        setLoading(true);
        const toastId = toast.loading('Menyimpan perubahan...');
        try {
            const res = await fetch('/api/notulensi', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Data berhasil diupdate!', { id: toastId });
                setEditingId(null);
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal update data', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error update data', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const id = deleteId;
        setDeleteId(null);

        const toastId = toast.loading('Menghapus data...');
        try {
            const res = await fetch(`/api/notulensi?id=${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                toast.success('Data berhasil dihapus!', { id: toastId });
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal hapus data', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error hapus data', { id: toastId });
        }
    };

    if (data.length === 0) {
        return <div className="text-center mt-4 fade-in"><p>Belum ada catatan pertemuan.</p></div>;
    }

    return (
        <div className="flex fade-in" style={{ flexDirection: 'column', gap: '1rem' }}>
            {data.map((item, index) => {
                const isEditing = editingId === item.id;
                const isExpanded = expandedId === item.id;

                return (
                    <div className="card" key={item.id} style={{ marginBottom: 0, padding: 0, overflow: 'hidden' }}>
                        {!isEditing && (
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.2rem',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                                    backgroundColor: isExpanded ? 'rgba(0,0,0,0.02)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    flexShrink: 0,
                                    marginRight: '1rem'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.tuanRumah ? `Pertemuan di Keluarga ${item.tuanRumah}` : `Pertemuan Keluarga`}
                                    </h3>
                                    <div style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        Tanggal: {formatTanggal(item.tahun)}
                                    </div>
                                </div>
                                <div style={{ paddingLeft: '1rem', color: 'var(--muted)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        )}

                        {(isExpanded || isEditing) && (
                            <div style={{ padding: '1.2rem' }}>
                                {isEditing ? (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 style={{ marginBottom: 0 }}>Edit Catatan</h2>
                                            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{item.timestamp}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tanggal</label>
                                                <input type="date" className="input" value={editData.tahun || ''} onChange={(e) => setEditData({ ...editData, tahun: e.target.value })} />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Tuan Rumah (Opsional)</label>
                                                <input type="text" className="input" placeholder="Keluarga..." value={editData.tuanRumah || ''} onChange={(e) => setEditData({ ...editData, tuanRumah: e.target.value })} />
                                            </div>
                                        </div>
                                        <textarea className="input" rows={4} style={{ width: '100%', marginBottom: '1rem' }} value={editData.catatan || ''} onChange={(e) => setEditData({ ...editData, catatan: e.target.value })} />
                                        <div>
                                            <input type="url" className="input" style={{ width: '100%' }} placeholder="Link Foto/Dokumentasi" value={editData.linkFoto || ''} onChange={(e) => setEditData({ ...editData, linkFoto: e.target.value })} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--foreground)', margin: 0 }}>{item.catatan}</p>
                                        {item.linkFoto && (
                                            <div style={{ marginTop: '1.5rem' }}>
                                                <a href={item.linkFoto} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                                    Lihat Dokumentasi/Foto
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        {isEditing ? (
                                            <>
                                                <button onClick={handleSaveEdit} disabled={loading} className="btn" style={{ padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Simpan">
                                                    <Check size={16} /> Simpan
                                                </button>
                                                <button onClick={handleCancelEdit} disabled={loading} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Batal">
                                                    <X size={16} /> Batal
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(item)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Edit">
                                                    <Edit2 size={16} /> Edit
                                                </button>
                                                <button onClick={() => setDeleteId(item.id)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--error)', borderColor: 'var(--error)' }} title="Hapus">
                                                    <Trash2 size={16} /> Hapus
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <ConfirmModal
                isOpen={deleteId !== null}
                title="Hapus Catatan"
                message="Apakah Anda yakin ingin menghapus catatan pertemuan ini? Data yang dihapus tidak dapat dikembalikan."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
