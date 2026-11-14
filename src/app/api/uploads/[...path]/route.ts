import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import prisma from '@/lib/prisma'

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads')
const TMP_UPLOAD_DIR = path.resolve(os.tmpdir(), 'sabaichha-uploads')

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
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

    const fileName = path.basename(resolvedPath)
    const ext = path.extname(resolvedPath).toLowerCase()
    const defaultContentType = MIME_MAP[ext] || 'application/octet-stream'

    // 1. Try local disk (public/uploads)
    try {
      const fileBuffer = await fs.readFile(resolvedPath)
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': defaultContentType,
          'Content-Length': String(fileBuffer.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {}

    // 2. Try OS temp cache (/tmp/sabaichha-uploads)
    const tmpPath = path.resolve(TMP_UPLOAD_DIR, fileName)
    if (tmpPath.startsWith(TMP_UPLOAD_DIR + path.sep)) {
      try {
        const tmpBuffer = await fs.readFile(tmpPath)
        return new NextResponse(tmpBuffer, {
          status: 200,
          headers: {
            'Content-Type': defaultContentType,
            'Content-Length': String(tmpBuffer.length),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      } catch {}
    }

    // 3. Fallback to PostgreSQL database blob storage (for serverless / Vercel deployments)
    const dbRecord = await prisma.siteSetting.findUnique({
      where: { key: `media_file:${fileName}` },
    })

    if (dbRecord?.value) {
      const parsed = JSON.parse(dbRecord.value) as { mimeType?: string; base64?: string }
      if (parsed.base64) {
        const dbBuffer = Buffer.from(parsed.base64, 'base64')
        const resolvedMime = parsed.mimeType || defaultContentType

        // Warm the temp cache asynchronously for subsequent hits
        fs.mkdir(TMP_UPLOAD_DIR, { recursive: true })
          .then(() => fs.writeFile(tmpPath, dbBuffer))
          .catch(() => {})

        return new NextResponse(dbBuffer, {
          status: 200,
          headers: {
            'Content-Type': resolvedMime,
            'Content-Length': String(dbBuffer.length),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    return new NextResponse('File Not Found', { status: 404 })
  } catch {
    return new NextResponse('File Not Found', { status: 404 })
  }
}
