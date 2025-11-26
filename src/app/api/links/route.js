import { NextResponse } from "next/server";
import { query } from "../../../lib/db";


function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function GET() {
  try {
    const result = await query(
      "SELECT code, url, clicks, last_clicked_at, created_at FROM links ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { url, code } = body;

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL. Use http(s) URLs only." },
        { status: 400 }
      );
    }

    if (code && !isValidCode(code)) {
      return NextResponse.json(
        { error: "Code must match [A-Za-z0-9]{6,8}." },
        { status: 400 }
      );
    }

    // Generate random code if not provided
    if (!code) {
      for (let i = 0; i < 5; i++) {
        const tmp = generateCode(6);
        const exists = await query("SELECT 1 FROM links WHERE code = $1", [tmp]);
        if (exists.rowCount === 0) {
          code = tmp;
          break;
        }
      }
      if (!code) {
        return NextResponse.json(
          { error: "Could not generate unique code." },
          { status: 500 }
        );
      }
    }

    const insertQuery =
      "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url, clicks, last_clicked_at, created_at";

    try {
      const result = await query(insertQuery, [code, url]);
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
      if (err.code === "23505") {
        return NextResponse.json(
          { error: "Code already exists." },
          { status: 409 }
        );
      }
      console.error(err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }
}
