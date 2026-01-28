import { NextResponse } from 'next/server';
import { getPastesCollection } from '@/lib/db';

function getCurrentTime(request) {
    // Check for TEST_MODE and x-test-now-ms header
    if (process.env.TEST_MODE === '1') {
        const testTimeMs = request.headers.get('x-test-now-ms');
        if (testTimeMs) {
            const parsed = parseInt(testTimeMs, 10);
            if (!isNaN(parsed)) {
                return new Date(parsed);
            }
        }
    }
    return new Date();
}

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const collection = await getPastesCollection();
        const currentTime = getCurrentTime(request);

        // Find the paste
        const paste = await collection.findOne({ id });

        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found' },
                { status: 404 }
            );
        }

        // Check if expired by TTL
        if (paste.expires_at && new Date(paste.expires_at) <= currentTime) {
            return NextResponse.json(
                { error: 'Paste has expired' },
                { status: 404 }
            );
        }

        // Check if view limit exceeded
        if (paste.max_views !== null && paste.view_count >= paste.max_views) {
            return NextResponse.json(
                { error: 'Paste view limit exceeded' },
                { status: 404 }
            );
        }

        // Atomically increment view count and check limits
        const result = await collection.findOneAndUpdate(
            {
                id,
                $or: [
                    { max_views: null },
                    { $expr: { $lt: ['$view_count', '$max_views'] } }
                ]
            },
            { $inc: { view_count: 1 } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Paste view limit exceeded' },
                { status: 404 }
            );
        }

        const updatedPaste = result;

        // Calculate remaining views
        let remaining_views = null;
        if (updatedPaste.max_views !== null) {
            remaining_views = Math.max(0, updatedPaste.max_views - updatedPaste.view_count);
        }

        return NextResponse.json({
            content: updatedPaste.content,
            remaining_views,
            expires_at: updatedPaste.expires_at ? updatedPaste.expires_at.toISOString() : null,
        });
    } catch (error) {
        console.error('Error fetching paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
