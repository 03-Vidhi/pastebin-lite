import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container">
            <header className="header">
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h1 className="logo">Pastebin Lite</h1>
                </Link>
            </header>

            <main className="error-page">
                <div className="error-icon">🔍</div>
                <h2 className="error-title">Paste Not Found</h2>
                <p className="error-message">
                    This paste may have expired, reached its view limit, or never existed.
                </p>
                <Link href="/" className="btn btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create New Paste
                </Link>
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
