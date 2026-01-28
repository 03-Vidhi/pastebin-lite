import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET() {
    try {
        const isHealthy = await checkDatabaseHealth();

        if (isHealthy) {
            return NextResponse.json({ ok: true }, { status: 200 });
        } else {
            return NextResponse.json({ ok: false, error: 'Database connection failed' }, { status: 503 });
        }
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
}
