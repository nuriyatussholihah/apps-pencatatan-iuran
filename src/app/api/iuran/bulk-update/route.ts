import { NextResponse } from 'next/server';
import { getSheetsClient, SPREADSHEET_ID } from '@/lib/google';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ids, status } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: 'Daftar ID tidak valid' }, { status: 400 });
        }

        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:G',
        });

        const rows = response.data.values || [];
        const updates = [];

        // Find all rows that match the given ids
        for (let i = 0; i < rows.length; i++) {
            const rowId = rows[i][0] || `row-${i}`;
            if (ids.includes(rowId)) {
                // Update status (index 5)
                const sheetRowNumber = i + 1;
                updates.push({
                    range: `Iuran_Lebaran!F${sheetRowNumber}:F${sheetRowNumber}`,
                    values: [[status]]
                });
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, error: 'Tidak ada data yang cocok ditemukan' }, { status: 404 });
        }

        // Batch update
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: updates
            }
        });

        return NextResponse.json({ success: true, message: `${updates.length} data berhasil diupdate menjadi ${status}` });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
