const { google } = require('googleapis');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
        const idx = line.indexOf('=');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
            env[key] = val;
        }
    }
});

async function test() {
    try {
        const credentials = {
            client_email: env.GOOGLE_CLIENT_EMAIL,
            private_key: env.GOOGLE_PRIVATE_KEY,
        };
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
            range: 'Iuran_Lebaran!A2:G',
        });
        console.log('SUCCESS, Rows:', res.data.values ? res.data.values.length : 'no values');
    } catch (e) {
        console.error('API ERROR:', e.message);
    }
}
test();
