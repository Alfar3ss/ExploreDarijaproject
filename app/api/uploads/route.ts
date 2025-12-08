import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Expect { dataUrl: string } from client (data URL or base64)
    if (!body?.dataUrl) return NextResponse.json({ error: 'dataUrl required' }, { status: 400 })
    // For this scaffold we simply echo back the dataUrl as the "uploaded" url.
    return NextResponse.json({ ok: true, url: body.dataUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
