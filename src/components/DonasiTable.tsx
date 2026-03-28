import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export type Donasi = {
    id: string;
    timestamp: string;
    tahun: string;
    keterangan: string;
    jumlah: number;
};

export default function DonasiTable({ data, isAdmin, onRefresh }: { data: Donasi[]; isAdmin?: boolean; onRefresh?: () => void }) {
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
    const [editData, setEditData] = useState<Partial<Donasi>>({});
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleEditClick = (item: Donasi) => {
        setEditingId(item.id);
        let formattedTimestamp = item.timestamp;
        try {
            const d = new Date(item.timestamp);
            if (!isNaN(d.getTime())) {
                formattedTimestamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        } catch {}
        setEditData({ ...item, timestamp: formattedTimestamp });
    };

    const handleCancelEdit = () => { setEditingId(null); setEditData({}); };

    const handleSaveEdit = async () => {
        if (!editData.id) return;
        setLoading(true);
        const toastId = toast.loading('Menyimpan perubahan...');
        try {
            const res = await fetch('/api/donasi', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Donasi berhasil diupdate!', { id: toastId });
                setEditingId(null);
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal update', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const id = deleteId;
        setDeleteId(null);
        const toastId = toast.loading('Menghapus donasi...');
        try {
            const res = await fetch(`/api/donasi?id=${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                toast.success('Donasi berhasil dihapus!', { id: toastId });
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal hapus', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message, { id: toastId });
        }
    };

    const totalDonasi = data.reduce((acc, curr) => acc + curr.jumlah, 0);

    return (
        <div className="table-container fade-in">
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Keterangan</th>
                        <th>Tanggal</th>
                        <th>Jumlah Donasi</th>
                        {isAdmin && <th>Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 5 : 4} className="text-center">Belum ada catatan donasi</td>
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
                                        <td style={{ verticalAlign: 'middle' }}><input type="date" className="input" style={{ padding: '0.4rem', minWidth: '135px', marginBottom: 0 }} value={editData.timestamp || ''} onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })} /></td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="number" className="input" style={{ padding: '0.4rem', minWidth: '100px', marginBottom: 0 }} value={editData.jumlah || 0} onChange={(e) => setEditData({ ...editData, jumlah: parseInt(e.target.value) || 0 })} /></td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ fontWeight: 600, color: 'var(--foreground)' }}>{item.keterangan}</td>
                                        <td>{formatTanggal(item.timestamp)}</td>
                                        <td style={{ fontWeight: 500, color: '#f59e0b' }}>+ Rp {item.jumlah.toLocaleString('id-ID')}</td>
                                    </>
                                )}
                                {isAdmin && (
                                    <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {isEditing ? (
                                                <>
                                                    <button onClick={handleSaveEdit} disabled={loading} className="btn" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Simpan"><Check size={16} /></button>
                                                    <button onClick={handleCancelEdit} disabled={loading} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Batal"><X size={16} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(item)} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit"><Edit2 size={16} /></button>
                                                    <button onClick={() => setDeleteId(item.id)} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', borderColor: 'var(--error)' }} title="Hapus"><Trash2 size={16} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
                {data.length > 0 && (
                    <tfoot style={{ background: 'var(--card-bg)', fontWeight: 600, borderTop: '2px solid var(--border)' }}>
                        <tr>
                            <td colSpan={isAdmin ? 3 : 2} style={{ padding: '1rem' }}>
                                Total Catatan: <span style={{ color: '#f59e0b' }}>{data.length}</span>
                            </td>
                            <td colSpan={isAdmin ? 2 : 2} style={{ padding: '1rem' }}>
                                <div style={{ marginBottom: '4px' }}>Total Donasi Terkumpul:</div>
                                <div style={{ fontSize: '1.25rem', color: '#f59e0b' }}>Rp {totalDonasi.toLocaleString('id-ID')}</div>
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>

            <ConfirmModal
                isOpen={deleteId !== null}
                title="Hapus Catatan Donasi"
                message="Apakah Anda yakin ingin menghapus catatan donasi ini?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
