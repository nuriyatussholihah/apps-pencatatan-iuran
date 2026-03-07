import { NextResponse } from 'next/server';
import { getSheetsClient, SPREADSHEET_ID } from '@/lib/google';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: 'Daftar ID tidak valid' }, { status: 400 });
        }

        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:A',
        });

        const rows = response.data.values || [];

        // Find indices
        const indicesToDelete: number[] = [];
        for (let i = 0; i < rows.length; i++) {
            const rowId = rows[i][0] || `row-${i}`;
            if (ids.includes(rowId)) {
                indicesToDelete.push(i);
            }
        }

        if (indicesToDelete.length === 0) {
            return NextResponse.json({ success: false, error: 'Tidak ada data yang cocok ditemukan' }, { status: 404 });
        }

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Iuran_Lebaran');
        const sheetId = sheet?.properties?.sheetId || 0;

        // Sort indices descending to avoid shifting issues when deleting multiple rows
        indicesToDelete.sort((a, b) => b - a);

        const requests = indicesToDelete.map(index => ({
            deleteDimension: {
                range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: index,
                    endIndex: index + 1
                }
            }
        }));

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests
            }
        });

        return NextResponse.json({ success: true, message: `${indicesToDelete.length} data berhasil dihapus` });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
