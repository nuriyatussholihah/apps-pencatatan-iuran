import { NextResponse } from 'next/server';
import { getSheetsClient, SPREADSHEET_ID } from '@/lib/google';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sourceYear, targetYear, defaultJumlah } = body;

        if (!sourceYear || !targetYear) {
            return NextResponse.json({ success: false, error: 'Tahun sumber dan tahun target harus diisi' }, { status: 400 });
        }

        const sheets = getSheetsClient();

        // Ambil semua data iuran
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:G',
        });

        const rows = response.data.values || [];
        const dataRows = rows.slice(1); // skip header

        // Cari semua nama unik dari sourceYear
        const uniqueNames = new Set<string>();
        dataRows.forEach(row => {
            const tahun = row[2] || '';
            const namaKk = row[3] || '';
            // filter by source year, and ensure name is not empty
            if (tahun.startsWith(sourceYear) && namaKk) {
                uniqueNames.add(namaKk);
            }
        });

        if (uniqueNames.size === 0) {
            return NextResponse.json({ success: false, error: `Tidak ada data keluarga di tahun ${sourceYear}` }, { status: 404 });
        }

        // Siapkan baris baru untuk targetYear
        const newRows: any[][] = [];
        const parsedJumlah = Number(defaultJumlah || 0);

        Array.from(uniqueNames).forEach(namaKk => {
            const timestamp = new Date().toISOString();
            const id = crypto.randomUUID();
            newRows.push([id, timestamp, targetYear, namaKk, parsedJumlah, 'Belum', '']);
        });

        // Append semua baris baru sekaligus
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:G',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: newRows
            }
        });

        return NextResponse.json({
            success: true,
            message: `Berhasil menyalin ${newRows.length} nama keluarga dari ${sourceYear} ke ${targetYear}`,
            copiedCount: newRows.length
        });

    } catch (error: any) {
        console.error("POST /api/iuran-copy ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
