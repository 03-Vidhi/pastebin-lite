'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const body = { content };

      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          throw new Error('TTL must be a positive integer');
        }
        body.ttl_seconds = ttl;
      }

      if (maxViews) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          throw new Error('Max views must be a positive integer');
        }
        body.max_views = views;
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setResult(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.url) {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">Pastebin Lite</h1>
        <p className="tagline">Share text snippets instantly with optional expiry</p>
      </header>

      <main>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="content">
                Your Text
              </label>
              <textarea
                id="content"
                className="textarea"
                placeholder="Paste your text, code, or notes here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ttl">
                  Expires After
                  <span className="form-label-optional">(optional)</span>
                </label>
                <input
                  id="ttl"
                  type="number"
                  className="input"
                  placeholder="e.g., 3600"
                  min="1"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                />
                <p className="input-hint">Time in seconds (e.g., 3600 = 1 hour)</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="maxViews">
                  Max Views
                  <span className="form-label-optional">(optional)</span>
                </label>
                <input
                  id="maxViews"
                  type="number"
                  className="input"
                  placeholder="e.g., 10"
                  min="1"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                />
                <p className="input-hint">Paste will expire after this many views</p>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create Paste
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="success-box">
              <div className="success-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Paste Created Successfully!
              </div>
              <div className="url-box">
                <input
                  type="text"
                  className="url-input"
                  value={result.url}
                  readOnly
                />
                <button
                  type="button"
                  className={`btn-copy ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? '✓ Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}
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
