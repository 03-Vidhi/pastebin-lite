# Pastebin Lite

A simple, fast, and secure Pastebin-like application. Create text pastes with optional expiry and view limits, and share them via unique URLs.

![Pastebin Lite](https://img.shields.io/badge/Next.js-14-black) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-blue)

## Live Demo

🔗 **[View Live App](https://your-app.vercel.app)**

## Features

- ✅ Create text pastes instantly
- ✅ Optional time-based expiry (TTL)
- ✅ Optional view count limits
- ✅ Shareable URLs
- ✅ Clean, modern dark UI
- ✅ XSS-protected content rendering
- ✅ RESTful API

## How to Run Locally

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pastebin-lite.git
   cd pastebin-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   TEST_MODE=0
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Persistence Layer

**MongoDB Atlas** was chosen as the persistence layer for the following reasons:

- **Serverless-friendly**: Maintains connections efficiently across serverless function invocations
- **Free tier**: MongoDB Atlas offers a generous free tier (512MB storage)
- **Scalable**: Easy to scale as traffic grows
- **Flexible schema**: No migrations needed for simple document storage
- **Atomic operations**: `findOneAndUpdate` ensures view counts are updated atomically to prevent race conditions

### Database Schema

```javascript
{
  id: String,           // Unique paste ID (nanoid)
  content: String,      // Paste content
  created_at: Date,     // Creation timestamp
  expires_at: Date,     // Expiry timestamp (null if no TTL)
  max_views: Number,    // Maximum views allowed (null if unlimited)
  view_count: Number    // Current view count
}
```

## Design Decisions

### 1. Atomic View Counting
View counts are incremented using MongoDB's `findOneAndUpdate` with a conditional query. This ensures that even under concurrent load, a paste cannot be viewed more times than its `max_views` limit.

### 2. TEST_MODE for Deterministic Testing
When `TEST_MODE=1` is set, the application respects the `x-test-now-ms` header for time calculations. This allows automated tests to simulate time progression without waiting for real time to pass.

### 3. HTML Escaping for XSS Prevention
All paste content is escaped before rendering to prevent cross-site scripting attacks. The content is stored as-is but escaped during display.

### 4. Separate HTML and API Views
The `/p/:id` route returns HTML (counts as a view), while `/api/pastes/:id` returns JSON (also counts as a view). Both routes share the same view counting logic.

### 5. URL-Safe IDs
Paste IDs are generated using `nanoid` (10 characters), which produces URL-safe, collision-resistant unique identifiers.

## API Documentation

### Health Check
```
GET /api/healthz
Response: { "ok": true }
```

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "Hello, World!",
  "ttl_seconds": 3600,    // optional
  "max_views": 10         // optional
}

Response: { "id": "abc123xyz", "url": "https://..." }
```

### Get Paste (API)
```
GET /api/pastes/:id

Response: {
  "content": "Hello, World!",
  "remaining_views": 9,     // null if unlimited
  "expires_at": "2026-..."  // null if no TTL
}
```

### View Paste (HTML)
```
GET /p/:id
Response: HTML page with paste content
```

## Deployment to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `TEST_MODE`: Set to `1` for testing, `0` for production

4. Deploy!

## License

MIT
