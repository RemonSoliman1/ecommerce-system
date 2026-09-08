import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';
import mammoth from 'mammoth';

export async function POST(request) {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            try {
                // Handle pdf-parse carefully in Next.js App Router
                let pdf;
                try {
                    pdf = (await import('pdf-parse')).default || await import('pdf-parse');
                } catch (importErr) {
                    console.error('Failed to import pdf-parse:', importErr);
                    throw new Error('PDF extraction library not found. Please ensure it is installed.');
                }
                const data = await pdf(buffer);
                text = data.text;
                if (!text) console.warn('PDF parsed but returned empty text');
            } catch (pdfErr) {
                console.error('PDF Parse Error Details:', pdfErr);
                throw new Error('PDF Parse Failed: ' + pdfErr.message);
            }
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or DOCX.' }, { status: 400 });
        }

        return NextResponse.json({ text });

    } catch (error) {
        console.error('File parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse file: ' + error.message }, { status: 500 });
    }
}
