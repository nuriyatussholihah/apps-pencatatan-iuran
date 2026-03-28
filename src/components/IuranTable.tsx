import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Check, X, Copy } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export type Iuran = {
    id: string;
    timestamp: string;
    tahun: string;
    namaKk: string;
    jumlah: number;
    donasi: number;
    status: 'Lunas' | 'Belum';
    linkBukti: string;
};

export default function IuranTable({ data, notulensiYearHost, isAdmin, onRefresh }: { data: Iuran[], notulensiYearHost?: string, isAdmin?: boolean, onRefresh?: () => void }) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
    const [editData, setEditData] = useState<Partial<Iuran>>({});
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const handleEditClick = (item: Iuran) => {
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
            const res = await fetch('/api/iuran', {
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
            const res = await fetch(`/api/iuran?id=${id}`, { method: 'DELETE' });
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

    const handleDuplicate = async (item: Iuran) => {
        const toastId = toast.loading('Menduplikasi data...');
        try {
            // Remove the old ID to let backend generate a new one
            const { id, timestamp, ...dataToDuplicate } = item;

            const res = await fetch('/api/iuran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToDuplicate)
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Data berhasil diduplikasi!', { id: toastId });
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal duplikasi data', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error duplikasi data', { id: toastId });
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(data.map(item => item.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkUpdate = async (status: 'Lunas' | 'Belum') => {
        if (selectedIds.size === 0) return;

        const toastId = toast.loading(`Mengubah ${selectedIds.size} data menjadi ${status}...`);
        try {
            const res = await fetch('/api/iuran/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds), status })
            });
            const result = await res.json();
            if (result.success) {
                toast.success(result.message, { id: toastId });
                setSelectedIds(new Set());
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal update massal', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error update massal', { id: toastId });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        // Show modal and wait for confirmation via another function
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        setShowBulkDeleteConfirm(false);
        const toastId = toast.loading(`Menghapus ${selectedIds.size} data...`);
        try {
            const res = await fetch('/api/iuran/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            const result = await res.json();
            if (result.success) {
                toast.success(result.message, { id: toastId });
                setSelectedIds(new Set());
                if (onRefresh) onRefresh();
            } else {
                toast.error(result.error || 'Gagal hapus massal', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error hapus massal', { id: toastId });
        }
    };

    const totalLunas = data.filter(i => i.status === 'Lunas').length;
    const totalBelum = data.filter(i => i.status === 'Belum').length;
    const totalDana = data.filter(i => i.status === 'Lunas').reduce((acc, curr) => acc + curr.jumlah, 0);
    const totalDonasi = data.reduce((acc, curr) => acc + (curr.donasi || 0), 0);

    return (
        <div className="table-container fade-in">
            {isAdmin && data.length > 0 && (
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--card-bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                        <input
                            type="checkbox"
                            checked={selectedIds.size === data.length && data.length > 0}
                            onChange={handleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        Pilih Semua ({selectedIds.size})
                    </label>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkUpdate('Lunas')}
                            disabled={selectedIds.size === 0}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
                        >
                            Tandai Lunas
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleBulkUpdate('Belum')}
                            disabled={selectedIds.size === 0}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
                        >
                            Tandai Belum
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleBulkDelete}
                            disabled={selectedIds.size === 0}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--error)', borderColor: 'var(--error)', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
                        >
                            Hapus Terpilih
                        </button>
                    </div>
                </div>
            )}
            <table>
                <thead>
                    <tr>
                        {isAdmin && <th style={{ width: '40px', textAlign: 'center' }}>Pilih</th>}
                        <th>No</th>
                        <th>Nama KK</th>
                        <th>Tanggal</th>
                        <th>Jumlah Iuran</th>
                        <th>Donasi</th>
                        <th>Status</th>
                        <th>Bukti</th>
                        {isAdmin && <th>Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 8 : 7} className="text-center">Belum ada data iuran</td>
                        </tr>
                    )}
                    {data.map((item, index) => {
                        const isEditing = editingId === item.id;

                        return (
                            <tr key={item.id} style={{ background: selectedIds.has(item.id) ? 'rgba(16, 185, 129, 0.05)' : '' }}>
                                {isAdmin && (
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => handleSelectRow(item.id)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                    </td>
                                )}
                                <td>{index + 1}</td>

                                {isEditing ? (
                                    <>
                                        <td style={{ verticalAlign: 'middle' }}><input type="text" className="input" style={{ padding: '0.4rem', minWidth: '120px', marginBottom: 0 }} value={editData.namaKk || ''} onChange={(e) => setEditData({ ...editData, namaKk: e.target.value })} /></td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="date" className="input" style={{ padding: '0.4rem', minWidth: '135px', marginBottom: 0 }} value={editData.tahun || ''} onChange={(e) => setEditData({ ...editData, tahun: e.target.value })} /></td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="number" className="input" style={{ padding: '0.4rem', minWidth: '100px', marginBottom: 0 }} value={editData.jumlah || 0} onChange={(e) => setEditData({ ...editData, jumlah: parseInt(e.target.value) || 0 })} /></td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="number" className="input" style={{ padding: '0.4rem', minWidth: '100px', marginBottom: 0 }} value={editData.donasi || 0} onChange={(e) => setEditData({ ...editData, donasi: parseInt(e.target.value) || 0 })} /></td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <select className="input" style={{ padding: '0.4rem', minWidth: '90px', marginBottom: 0 }} value={editData.status || 'Belum'} onChange={(e) => setEditData({ ...editData, status: e.target.value as 'Lunas' | 'Belum' })}>
                                                <option value="Belum">Belum</option>
                                                <option value="Lunas">Lunas</option>
                                            </select>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}><input type="url" className="input" style={{ padding: '0.4rem', minWidth: '100px', marginBottom: 0 }} placeholder="Link" value={editData.linkBukti || ''} onChange={(e) => setEditData({ ...editData, linkBukti: e.target.value })} /></td>
                                    </>
                                ) : (
                                    <>
                                        <td style={{ fontWeight: 600, color: 'var(--foreground)' }}>{item.namaKk}</td>
                                        <td>{formatTanggal(item.tahun)}</td>
                                        <td style={{ fontWeight: 500 }}>Rp {item.jumlah.toLocaleString('id-ID')}</td>
                                        <td style={{ fontWeight: 500, color: item.donasi > 0 ? 'var(--primary)' : 'var(--muted)' }}>
                                            {item.donasi > 0 ? `Rp ${item.donasi.toLocaleString('id-ID')}` : '-'}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${item.status === 'Lunas' ? 'status-lunas' : 'status-belum'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            {item.linkBukti ? (
                                                <a href={item.linkBukti} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                                                    Lihat Bukti
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </td>
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
                                                    <button onClick={() => handleDuplicate(item)} className="btn btn-secondary" style={{ padding: '0', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', borderColor: 'var(--primary)' }} title="Duplikasi">
                                                        <Copy size={16} />
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
                {data.length > 0 && (
                    <tfoot style={{ background: 'var(--card-bg)', fontWeight: 600, borderTop: '2px solid var(--border)' }}>
                        <tr>
                            <td colSpan={isAdmin ? 3 : 2} style={{ padding: '1rem' }}>
                                <div style={{ marginBottom: '4px' }}>Total Keluarga (KK): <span style={{ color: 'var(--primary)' }}>{data.length}</span></div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
                                    Lunas: {totalLunas} | Belum: {totalBelum}
                                </div>
                            </td>
                            <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                <div style={{ marginBottom: '4px' }}>Total Dana Terkumpul:</div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--foreground)' }}>Rp {totalDana.toLocaleString('id-ID')}</div>
                            </td>
                            <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                                <div style={{ marginBottom: '4px' }}>Total Donasi:</div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Rp {totalDonasi.toLocaleString('id-ID')}</div>
                            </td>
                            <td colSpan={isAdmin ? 3 : 2} style={{ padding: '1rem', verticalAlign: 'top' }}>
                                <div style={{ marginBottom: '4px' }}>Tuan Rumah:</div>
                                <div style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                                    {notulensiYearHost ? notulensiYearHost : <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 'normal' }}>Belum ada data (tambah di tab Notulensi)</span>}
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>

            <ConfirmModal
                isOpen={deleteId !== null}
                title="Hapus Data Iuran"
                message="Apakah Anda yakin ingin menghapus data iuran ini? Data yang dihapus tidak dapat dikembalikan."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <ConfirmModal
                isOpen={showBulkDeleteConfirm}
                title="Hapus Banyak Data"
                message={`Apakah Anda yakin ingin menghapus ${selectedIds.size} data terpilih secara massal? Aksi ini tidak dapat dibatalkan.`}
                onConfirm={confirmBulkDelete}
                onCancel={() => setShowBulkDeleteConfirm(false)}
            />
        </div>
    );
}
