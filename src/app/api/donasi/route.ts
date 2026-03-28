import { NextResponse } from 'next/server';
import { getSheetsClient, SPREADSHEET_ID } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Donasi_Lebaran!A:E', // A=ID, B=Timestamp, C=Tahun, D=Keterangan, E=Jumlah
        });

        const rows = response.data.values || [];
        const dataRows = rows.slice(1);
        const data = dataRows.map((row, i) => ({
            id: row[0] || `row-${i + 1}`,
            timestamp: row[1] || '',
            tahun: row[2] || '',
            keterangan: row[3] || '',
            jumlah: typeof row[4] === 'string' ? Number(row[4].replace(/[^0-9]/g, '')) : Number(row[4] || 0),
        }));

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        if (error.message?.includes('Unable to parse range')) {
            return NextResponse.json({ success: true, data: [] });
        }
        console.error('GET /api/donasi ERROR:', error);
        return NextResponse.json({ success: false, error: "Gagal mengambil data, pastikan sheet 'Donasi_Lebaran' sudah ada" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tanggal, keterangan, jumlah } = body;

        const parsedJumlah = typeof jumlah === 'string' ? Number(jumlah.replace(/[^0-9-]/g, '')) : Number(jumlah || 0);
        if (parsedJumlah < 0) {
            return NextResponse.json({ success: false, error: 'Jumlah tidak boleh minus' }, { status: 400 });
        }

        let timestamp = new Date().toISOString();
        if (tanggal) {
            try {
                const d = new Date(tanggal);
                if (!isNaN(d.getTime())) timestamp = d.toISOString();
            } catch {}
        }

        const tahun = new Date(timestamp).getFullYear().toString();
        const id = crypto.randomUUID();

        const sheets = getSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Donasi_Lebaran!A2:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[id, timestamp, tahun, keterangan, parsedJumlah]]
            }
        });

        return NextResponse.json({ success: true, message: 'Donasi berhasil dicatat' });
    } catch (error: any) {
        if (error.message?.includes('Unable to parse range')) {
            return NextResponse.json({ success: false, error: "Sheet 'Donasi_Lebaran' belum dibuat di Google Sheet Anda." }, { status: 404 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, timestamp: bodyTimestamp, keterangan, jumlah } = body;

        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const parsedJumlah = typeof jumlah === 'string' ? Number(jumlah.replace(/[^0-9-]/g, '')) : Number(jumlah || 0);

        const sheets = getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Donasi_Lebaran!A:A',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row, i) => row[0] === id || `row-${i}` === id);

        if (rowIndex === -1) {
            return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
        }

        let timestamp = bodyTimestamp || '';
        if (!timestamp) {
            const fullResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `Donasi_Lebaran!B${rowIndex + 1}:B${rowIndex + 1}`,
            });
            timestamp = fullResponse.data.values?.[0]?.[0] || new Date().toISOString();
        } else {
            try {
                const d = new Date(timestamp);
                if (!isNaN(d.getTime())) timestamp = d.toISOString();
            } catch {}
        }

        const tahun = new Date(timestamp).getFullYear().toString();

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Donasi_Lebaran!A${rowIndex + 1}:E${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[id, timestamp, tahun, keterangan, parsedJumlah]]
            }
        });

        return NextResponse.json({ success: true, message: 'Donasi berhasil diupdate' });
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
            range: 'Donasi_Lebaran!A:A',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row, i) => row[0] === id || `row-${i}` === id);

        if (rowIndex === -1) {
            return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
        }

        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Donasi_Lebaran');
        const sheetId = sheet?.properties?.sheetId || 0;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        }
                    }
                }]
            }
        });

        return NextResponse.json({ success: true, message: 'Donasi berhasil dihapus' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
