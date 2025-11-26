TinyLink – URL Shortener (Take-Home Assignment)

A lightweight, full-stack URL shortening service inspired by Bit.ly.
Built as part of Aganitha Cognitive Solutions' Full Stack Developer take-home assignment.

TinyLink allows users to:

Create short URLs with optional custom codes

Redirect using /:code (HTTP 302)

Track click statistics

View detailed analytics for each short link

Delete links

Run a healthcheck endpoint

Use a clean, responsive UI

🚀 Live Demo

Vercel URL:
https://tinylink-sage-eta.vercel.app/

📦 GitHub Repository
https://github.com/Samrocz05/tinylink

🎥 Video Walkthrough

(Add your YouTube/Drive video link here)


🔧 Tech Stack
Frontend & Backend

Next.js (App Router)

React

Tailwind CSS

Next.js Route Handlers (API Routes)

Database

Neon Postgres (Serverless PostgreSQL)

pg node driver for DB queries

Deployment

Vercel (Frontend + API)

Environment Variables stored securely in Vercel

📐 System Architecture
[Next.js App Router]
       |
       ├── /api/links        → Create & list links
       ├── /api/links/:code  → Stats + delete
       ├── /:code            → Redirect handler (302)
       ├── /code/:code       → Stats UI page
       └── /healthz          → Health check

[Postgres (Neon)]
       |
       └── links table → Stores code, URL, clicks, timestamps

🗄️ Database Schema
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

🌐 API Endpoints (Required by Assignment)
1. POST /api/links

Create a new short link.

Validates URL

Accepts optional custom code (6–8 alphanumeric)

Returns 409 if code already exists

2. GET /api/links

List all links in the database.

3. GET /api/links/:code

Fetch stats for one short link.

4. DELETE /api/links/:code

Remove an existing short link.

5. GET /:code

Redirect to the original long URL and increment:

clicks

last_clicked_at

Returns 404 if deleted or invalid.

6. GET /healthz

Response:

{
  "ok": true,
  "version": "1.0",
  "uptime": 1234,
  "timestamp": "2025-...",
}


Useful for automated testing.

🖥️ Pages & Routes
/ – Dashboard

Includes:

Create link form

Inline validation

Error & success states

Search/filter

Responsive table view

Delete & copy actions

/code/:code – Stats Page

Shows:

Short URL

Target URL

Total clicks

Created time

Last clicked time

/:code – Redirect Handler

302 redirects to full URL.

🎨 UI / UX Highlights

Clean Tailwind components

Responsive layout (mobile-friendly)

Form validation with friendly messages

Disabled submit during loading

Truncated long URLs with hover-expand

Sorted table

Copy to clipboard buttons

Smooth error/success states

🔑 Environment Variables

Provide .env.example:

DATABASE_URL=postgres://USER:PASSWORD@HOST/db?sslmode=require
NEXT_PUBLIC_BASE_URL=https://your-vercel-url.vercel.app

🚀 Deployment Steps (Vercel)

Push project to GitHub

Import repo into Vercel

Add environment variables:

DATABASE_URL

NEXT_PUBLIC_BASE_URL

Deploy

Test all routes & redirect

Submit URLs

🧪 Testing Checklist (Required by Aganitha)
Test	Status
/healthz returns 200	✔️
Can create a short link	✔️
Duplicate code returns 409	✔️
/:code redirects correctly	✔️
Redirect increments clicks	✔️
Stats show correct values	✔️
Delete removes link	✔️
Deleted link returns 404	✔️
Responsive, clean UI	✔️
📚 Project Structure
/src
 ├── app
 │    ├── page.jsx                 → Dashboard
 │    ├── code/[code]/page.jsx     → Stats page
 │    ├── [code]/route.js          → Redirect API
 │    ├── healthz/route.js         → Health check
 │    └── api/links
 │         ├── route.js            → POST + GET
 │         └── [code]/route.js     → GET + DELETE
 └── lib
      └── db.js                    → Database connection

🙌 Author

Sam D
Full Stack Developer (Applicant)
Aganitha Cognitive Solutions Assignment

✔️ License

This project is built for evaluation purposes as part of a take-home assignment.
