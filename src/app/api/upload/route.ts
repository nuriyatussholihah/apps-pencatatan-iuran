import { NextResponse } from 'next/server';
import { getDriveClient, DRIVE_FOLDER_ID } from '@/lib/google';
import { Readable } from 'stream';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const drive = getDriveClient();

        // Convert Web File to Stream (for Google Drive API)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        const fileMetadata = {
            name: file.name,
            parents: [DRIVE_FOLDER_ID as string]
        };

        const media = {
            mimeType: file.type,
            body: stream
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        });

        // Make the file publicly accessible
        if (response.data.id) {
            await drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                }
            });
        }

        return NextResponse.json({
            success: true,
            id: response.data.id,
            url: response.data.webViewLink
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
