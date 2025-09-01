// app/api/_diag/route.ts
export const runtime = 'nodejs'
export async function GET() {
  return new Response(
    JSON.stringify({ hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN) }),
    { headers: { 'content-type': 'application/json' } }
  )
}
