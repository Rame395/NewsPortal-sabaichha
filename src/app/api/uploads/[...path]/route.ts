import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads')

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params
    if (!segments || segments.length === 0) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const relativePath = segments.join('/')
    const resolvedPath = path.resolve(UPLOAD_DIR, relativePath)

    // Security check: prevent path traversal outside public/uploads
    if (!resolvedPath.startsWith(UPLOAD_DIR + path.sep) && resolvedPath !== UPLOAD_DIR) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const ext = path.extname(resolvedPath).toLowerCase()
    const contentType = MIME_MAP[ext] || 'application/octet-stream'

    const fileBuffer = await fs.readFile(resolvedPath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('File Not Found', { status: 404 })
  }
}
