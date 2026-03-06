import { google } from 'googleapis';

export const getGoogleAuth = () => {
    const credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ],
    });

    return auth;
};

export const getSheetsClient = () => {
    const auth = getGoogleAuth();
    return google.sheets({ version: 'v4', auth });
};

export const getDriveClient = () => {
    const auth = getGoogleAuth();
    return google.drive({ version: 'v3', auth });
};

export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
export const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
