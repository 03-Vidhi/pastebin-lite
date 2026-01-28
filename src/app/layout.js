import './globals.css';

export const metadata = {
  title: 'Pastebin Lite - Share Text Instantly',
  description: 'A simple, fast, and secure way to share text snippets with optional expiry and view limits.',
  keywords: 'pastebin, paste, share, text, snippet, code',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
