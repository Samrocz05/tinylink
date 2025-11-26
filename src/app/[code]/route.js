import { NextResponse } from "next/server";
import { query } from "../../lib/db";

export async function GET(req, context) {
  
  const { code } = await context.params;

  try {
    
    const found = await query(
      "SELECT url FROM links WHERE code = $1",
      [code]
    );

    if (found.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const targetUrl = found.rows[0].url;

   
    await query(
      "UPDATE links SET clicks = clicks + 1, last_clicked_at = NOW() WHERE code = $1",
      [code]
    );

    return NextResponse.redirect(targetUrl, { status: 302 });
  } catch (err) {
    console.error("Redirect error for code:", code, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
