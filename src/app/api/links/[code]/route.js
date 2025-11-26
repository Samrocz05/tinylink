import { NextResponse } from "next/server";
import { query } from "../../../../lib/db"; // adjust if needed

export async function GET(req, context) {
  const { code } = await context.params;

  try {
    const result = await query(
      "SELECT code, url, clicks, last_clicked_at, created_at FROM links WHERE code = $1",
      [code]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  const { code } = await context.params;

  try {
    const result = await query("DELETE FROM links WHERE code = $1", [code]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
