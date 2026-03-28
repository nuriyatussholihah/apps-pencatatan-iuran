import { NextResponse } from 'next/server';
import { getSheetsClient, SPREADSHEET_ID } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:H', // Fetch all to include headers
        });

        const rows = response.data.values || [];
        const dataRows = rows.slice(1); // skip header
        const data = dataRows.map((row, i) => ({
            id: row[0] || `row-${i + 1}`,
            timestamp: row[1] || '',
            tahun: row[2] || '',
            namaKk: row[3] || '',
            jumlah: typeof row[4] === 'string' ? Number(row[4].replace(/[^0-9-]/g, '')) : Number(row[4] || 0),
            status: row[5] || 'Belum',
            linkBukti: row[6] || '',
            donasi: typeof row[7] === 'string' ? Number(row[7].replace(/[^0-9-]/g, '')) : Number(row[7] || 0)
        }));

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("GET /api/iuran ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tahun, namaKk, jumlah, status, linkBukti, donasi } = body;

        const parsedJumlah = typeof jumlah === 'string' ? Number(jumlah.replace(/[^0-9-]/g, '')) : Number(jumlah || 0);
        const parsedDonasi = typeof donasi === 'string' ? Number(donasi.replace(/[^0-9-]/g, '')) : Number(donasi || 0);
        if (parsedJumlah < 0) {
            return NextResponse.json({ success: false, error: 'Jumlah tidak boleh minus' }, { status: 400 });
        }

        const timestamp = new Date().toISOString();
        const id = crypto.randomUUID();

        const sheets = getSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A2:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[id, timestamp, tahun, namaKk, parsedJumlah, status, linkBukti || '', parsedDonasi]]
            }
        });

        return NextResponse.json({ success: true, message: 'Data berhasil ditambahkan', data: { id, timestamp, tahun, namaKk, jumlah: parsedJumlah, donasi: parsedDonasi, status, linkBukti } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, tahun, namaKk, jumlah, status, linkBukti, donasi } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const parsedJumlah = typeof jumlah === 'string' ? Number(jumlah.replace(/[^0-9-]/g, '')) : Number(jumlah || 0);
        const parsedDonasi = typeof donasi === 'string' ? Number(donasi.replace(/[^0-9-]/g, '')) : Number(donasi || 0);
        if (parsedJumlah < 0) {
            return NextResponse.json({ success: false, error: 'Jumlah tidak boleh minus' }, { status: 400 });
        }

        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:H',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row, i) => row[0] === id || `row-${i}` === id);

        if (rowIndex === -1) {
            return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
        }

        const timestamp = rows[rowIndex][1] || new Date().toISOString();
        const sheetRowNumber = rowIndex + 1; // +1 to convert 0-indexed to 1-indexed sheet row

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Iuran_Lebaran!A${sheetRowNumber}:H${sheetRowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[id, timestamp, tahun, namaKk, parsedJumlah, status, linkBukti || '', parsedDonasi]]
            }
        });

        return NextResponse.json({ success: true, message: 'Data berhasil diupdate' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A:A',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row, i) => row[0] === id || `row-${i}` === id);

        if (rowIndex === -1) {
            return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
        }

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Iuran_Lebaran');
        const sheetId = sheet?.properties?.sheetId || 0;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'ROWS',
                                startIndex: rowIndex, // 0-indexed
                                endIndex: rowIndex + 1
                            }
                        }
                    }
                ]
            }
        });

        return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
