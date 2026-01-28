import { getPastesCollection } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Helper to escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatTimeRemaining(expiresAt) {
    if (!expiresAt) return null;

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;

    if (diffMs <= 0) return 'Expired';

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

export default async function PasteViewPage({ params }) {
    const { id } = await params;
    const collection = await getPastesCollection();
    const currentTime = new Date();

    // Find the paste
    const paste = await collection.findOne({ id });

    if (!paste) {
        notFound();
    }

    // Check if expired by TTL
    if (paste.expires_at && new Date(paste.expires_at) <= currentTime) {
        notFound();
    }

    // Check if view limit exceeded
    if (paste.max_views !== null && paste.view_count >= paste.max_views) {
        notFound();
    }

    // Atomically increment view count
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
        notFound();
    }

    const updatedPaste = result;

    // Calculate remaining views
    let remainingViews = null;
    if (updatedPaste.max_views !== null) {
        remainingViews = Math.max(0, updatedPaste.max_views - updatedPaste.view_count);
    }

    const timeRemaining = formatTimeRemaining(updatedPaste.expires_at);
    const escapedContent = escapeHtml(updatedPaste.content);

    return (
        <div className="container">
            <header className="header">
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h1 className="logo">Pastebin Lite</h1>
                </Link>
                <p className="tagline">Viewing shared paste</p>
            </header>

            <main>
                <div className="card">
                    <div className="paste-header">
                        <h2 className="paste-title">Paste Content</h2>
                        <div className="paste-meta">
                            {remainingViews !== null && (
                                <div className="paste-meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <span className="paste-meta-value">{remainingViews}</span> views left
                                </div>
                            )}
                            {timeRemaining && (
                                <div className="paste-meta-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Expires in <span className="paste-meta-value">{timeRemaining}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <pre
                        className="paste-content"
                        dangerouslySetInnerHTML={{ __html: escapedContent }}
                    />
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link href="/" className="btn btn-secondary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Create New Paste
                    </Link>
                </div>
            </main>

            <footer className="footer">
                <p>
                    Built with Next.js and MongoDB •{' '}
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        View Source
                    </a>
                </p>
            </footer>
        </div>
    );
}
