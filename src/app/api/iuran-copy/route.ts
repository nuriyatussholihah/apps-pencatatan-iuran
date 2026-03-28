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
            range: 'Iuran_Lebaran!A:H',
        });

        const rows = response.data.values || [];
        const dataRows = rows.slice(1); // skip header

        // Cari semua nama unik dan tanggal aslinya dari sourceYear
        const nameToDateMap = new Map<string, string>();
        dataRows.forEach(row => {
            const tahun = row[2] || '';
            const namaKk = row[3] || '';
            // filter by source year, and ensure name is not empty
            if (tahun.startsWith(sourceYear) && namaKk) {
                if (!nameToDateMap.has(namaKk)) {
                    nameToDateMap.set(namaKk, tahun);
                }
            }
        });

        if (nameToDateMap.size === 0) {
            return NextResponse.json({ success: false, error: `Tidak ada data keluarga di tahun ${sourceYear}` }, { status: 404 });
        }

        // Siapkan baris baru untuk targetYear
        const newRows: any[][] = [];
        const parsedJumlah = Number(defaultJumlah || 0);

        nameToDateMap.forEach((oldDate, namaKk) => {
            const timestamp = new Date().toISOString();
            const id = crypto.randomUUID();

            // Use the exact date provided in the 'targetYear' input
            const newDate = targetYear;

            const notes = `(Salinan dari ${sourceYear})`;

            newRows.push([id, timestamp, newDate, namaKk, parsedJumlah, 'Belum', notes, 0]);
        });

        // Append semua baris baru sekaligus
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:H',
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
