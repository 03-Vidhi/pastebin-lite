import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getPastesCollection } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate content
        if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
            return NextResponse.json(
                { error: 'content is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate ttl_seconds
        if (body.ttl_seconds !== undefined) {
            if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Validate max_views
        if (body.max_views !== undefined) {
            if (!Number.isInteger(body.max_views) || body.max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be an integer >= 1' },
                    { status: 400 }
                );
            }
        }

        // Generate unique ID
        const id = nanoid(10);

        // Calculate expires_at if TTL is provided
        let expires_at = null;
        if (body.ttl_seconds) {
            expires_at = new Date(Date.now() + body.ttl_seconds * 1000);
        }

        // Create paste document
        const paste = {
            id,
            content: body.content,
            created_at: new Date(),
            expires_at,
            max_views: body.max_views || null,
            view_count: 0,
        };

        // Insert into database
        const collection = await getPastesCollection();
        await collection.insertOne(paste);

        // Build the URL
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const url = `${protocol}://${host}/p/${id}`;

        return NextResponse.json({ id, url }, { status: 201 });
    } catch (error) {
        console.error('Error creating paste:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
