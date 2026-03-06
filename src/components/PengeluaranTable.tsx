import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { Pengeluaran } from '@/app/page';

export default function PengeluaranTable({ data, isAdmin, onRefresh }: { data: Pengeluaran[], isAdmin?: boolean, onRefresh?: () => void }) {
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
    const [editData, setEditData] = useState<Partial<Pengeluaran>>({});
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleEditClick = (item: Pengeluaran) => {
        setEditingId(item.id);
        setEditData(item);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSaveEdit = async () => {
        if (!editData.id) return;
        if (editData.jumlah !== undefined && editData.jumlah < 0) {
            toast.error('Jumlah tidak boleh minus');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Menyimpan perubahan...');
        try {
            const res = await fetch('/api/pengeluaran', {
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
            const res = await fetch(`/api/pengeluaran?id=${id}`, { method: 'DELETE' });
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

    return (
        <div className="table-container fade-in">
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Keterangan</th>
                        <th>Tahun/Tanggal</th>
                        <th>Jumlah Pengeluaran</th>
                        {isAdmin && <th>Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 5 : 4} className="text-center">Belum ada data pengeluaran</td>
                        </tr>
                    )}
                    {data.map((item, index) => {
                        const isEditing = editingId === item.id;

                        return (
                            <tr key={item.id}>
                                <td>{index + 1}</td>

                                {isEditing ? (
                                    <>
                                        <td style={{ verticalAlign: 'middle' }}><input type="text" className="input" style={{ padding: '0.4rem', minWidth: '150px', marginBottom: 0 }} value={editData.keterangan || ''} onChange={(e) => setEditData({ ...editData, keterangan: e.target.value })} /></td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="number" className="input" style={{ padding: '0.4rem', minWidth: '100px', marginBottom: 0 }} value={editData.tahun || ''} onChange={(e) => setEditData({ ...editData, tahun: e.target.value })} placeholder="Tahun" /></td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="number" className="input" style={{ padding: '0.4rem', minWidth: '120px', marginBottom: 0 }} value={editData.jumlah || 0} onChange={(e) => setEditData({ ...editData, jumlah: parseInt(e.target.value) || 0 })} /></td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ fontWeight: 600, color: 'var(--foreground)' }}>{item.keterangan}</td>
                                        <td>{formatTanggal(item.timestamp)} ({item.tahun})</td>
                                        <td style={{ fontWeight: 500, color: 'var(--error)' }}>- Rp {item.jumlah.toLocaleString('id-ID')}</td>
                                    </>
                                )}

                                {isAdmin && (
                                    <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', minWidth: '90px' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {isEditing ? (
                                                <>
                                                    <button onClick={handleSaveEdit} disabled={loading} className="btn" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Simpan">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={handleCancelEdit} disabled={loading} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Batal">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(item)} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => setDeleteId(item.id)} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', borderColor: 'var(--error)' }} title="Hapus">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <ConfirmModal
                isOpen={deleteId !== null}
                title="Hapus Data Pengeluaran"
                message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Saldo Kas akan otomatis terkoreksi."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
