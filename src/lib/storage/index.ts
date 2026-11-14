import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import prisma from '@/lib/prisma'
import { sanitizeSvgXml } from '@/lib/security/sanitizer'

export interface UploadResult {
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  originalSize?: number
  isCompressed?: boolean
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const TMP_UPLOAD_DIR = path.join(os.tmpdir(), 'sabaichha-uploads')

// Whitelisted MIME types (Images + Short Looping/News Videos)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

// Whitelisted file extensions
const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.jfif',
  '.pjpeg',
  '.pjp',
  '.png',
  '.webp',
  '.avif',
  '.heic',
  '.heif',
  '.bmp',
  '.tiff',
  '.tif',
  '.ico',
  '.gif',
  '.svg',
  '.mp4',
  '.webm',
  '.mov',
])

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.pjpeg': 'image/jpeg',
  '.pjp': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/mp4',
}

// Category-specific maximum file size ceilings
export const MAX_IMAGE_RAW_SIZE = 25 * 1024 * 1024 // 25MB (Raw incoming image, will be compressed)
export const MAX_GIF_SIZE_BYTES = 15 * 1024 * 1024 // 15MB for Animated GIFs
export const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024 // 25MB for News & Ad Videos (MP4/WebM)
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // Overall fallback ceiling

/**
 * Hybrid Storage Handler
 * Stores uploaded media on local disk (when writable), in OS temp cache, AND in PostgreSQL
 * so uploads work reliably on both local machines and read-only serverless platforms (e.g., Vercel).
 */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  const rawExt = path.extname(file.name || '').toLowerCase() || '.jpg'
  const rawType = (file.type || '').toLowerCase().trim()

  const isKnownExt = ALLOWED_EXTENSIONS.has(rawExt)
  const isImageOrVideoMime = rawType.startsWith('image/') || rawType.startsWith('video/')

  // 1. Extension and MIME Type Validation
  if (!isKnownExt && !isImageOrVideoMime) {
    throw new Error(
      `Disallowed file extension: "${rawExt}". Only image (JPG, PNG, WebP, AVIF, GIF, SVG) and video (MP4, WebM) files are permitted.`
    )
  }

  // Normalize missing or generic MIME types
  const resolvedType =
    !rawType || rawType === 'application/octet-stream'
      ? EXT_TO_MIME[rawExt] || 'image/jpeg'
      : rawType === 'image/jpg' || rawType === 'image/pjpeg'
      ? 'image/jpeg'
      : rawType

  if (!ALLOWED_MIME_TYPES.has(resolvedType) && !isImageOrVideoMime) {
    throw new Error(
      `Unsupported MIME type: ${file.type || 'unknown'}. Allowed formats: JPG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM.`
    )
  }

  const isVideo =
    resolvedType.startsWith('video/') ||
    rawExt === '.mp4' ||
    rawExt === '.webm' ||
    rawExt === '.mov'
  const isGif = resolvedType === 'image/gif' || rawExt === '.gif'
  const isSvg = resolvedType === 'image/svg+xml' || rawExt === '.svg'

  // Determine normalized extension
  const needsJpegConversion = ['.jfif', '.pjpeg', '.pjp', '.avif', '.heic', '.heif', '.bmp', '.tiff', '.tif'].includes(rawExt)
  let finalExt = needsJpegConversion
    ? '.jpg'
    : ALLOWED_EXTENSIONS.has(rawExt)
    ? rawExt === '.mov'
      ? '.mp4'
      : rawExt
    : isVideo
    ? '.mp4'
    : '.jpg'

  // 2. Format-Specific Size Ceiling Validation
  if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `Video file exceeds maximum allowed size of 25MB (${(file.size / (1024 * 1024)).toFixed(
        1
      )}MB provided). Please compress or trim the video.`
    )
  }

  if (isGif && file.size > MAX_GIF_SIZE_BYTES) {
    throw new Error(
      `Animated GIF exceeds maximum allowed size of 15MB (${(file.size / (1024 * 1024)).toFixed(
        1
      )}MB provided).`
    )
  }

  if (!isVideo && file.size > MAX_IMAGE_RAW_SIZE) {
    throw new Error('Image file exceeds maximum allowed raw upload size of 25MB.')
  }

  const bytes = await file.arrayBuffer()
  let buffer = Buffer.from(bytes)
  const originalSize = file.size
  let effectiveSize = buffer.length
  let mimeType = needsJpegConversion ? 'image/jpeg' : resolvedType
  let isCompressed = false

  // 3. SVG Vector Sanitization: Strip embedded script tags, foreignObject, or event handlers
  if (isSvg) {
    const rawSvgText = buffer.toString('utf-8')
    const sanitizedSvg = sanitizeSvgXml(rawSvgText)

    if (!sanitizedSvg || !sanitizedSvg.includes('<svg')) {
      throw new Error('The uploaded SVG file is malformed or invalid.')
    }

    buffer = Buffer.from(sanitizedSvg, 'utf-8')
    effectiveSize = buffer.length
    mimeType = 'image/svg+xml'
    finalExt = '.svg'
  }

  // 4. Server-Side Image Compression with Sharp (for JPEG, PNG, WebP, AVIF, BMP, etc.)
  else if (!isVideo && !isGif) {
    try {
      const imagePipeline = sharp(buffer).rotate()
      const metadata = await imagePipeline.metadata()

      const shouldResize = Boolean(metadata.width && metadata.width > 1600)

      let compressedBuffer: Buffer

      if (finalExt === '.png') {
        compressedBuffer = await imagePipeline
          .resize(shouldResize ? { width: 1600, withoutEnlargement: true } : undefined)
          .png({ compressionLevel: 8, quality: 82 })
          .toBuffer()
        mimeType = 'image/png'
      } else if (finalExt === '.webp') {
        compressedBuffer = await imagePipeline
          .resize(shouldResize ? { width: 1600, withoutEnlargement: true } : undefined)
          .webp({ quality: 80, effort: 4 })
          .toBuffer()
        mimeType = 'image/webp'
      } else {
        // Convert or compress to standard progressive JPEG
        compressedBuffer = await imagePipeline
          .resize(shouldResize ? { width: 1600, withoutEnlargement: true } : undefined)
          .jpeg({ quality: 80, progressive: true, mozjpeg: true })
          .toBuffer()
        mimeType = 'image/jpeg'
        finalExt = '.jpg'
      }

      if (compressedBuffer && (compressedBuffer.length < buffer.length || needsJpegConversion)) {
        buffer = Buffer.from(compressedBuffer)
        effectiveSize = buffer.length
        isCompressed = true
      }
    } catch (compressionErr) {
      console.warn('Sharp image compression skipped, saving original buffer:', compressionErr)
    }
  }

  // 5. Optional Cloudinary upload if valid CLOUDINARY_URL is configured (not demo)
  if (
    process.env.CLOUDINARY_URL &&
    !process.env.CLOUDINARY_URL.includes('/demo/') &&
    process.env.CLOUDINARY_CLOUD_NAME
  ) {
    try {
      return await uploadBufferToCloudinary(buffer, file.name, mimeType, effectiveSize)
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, falling back to built-in storage:', cloudErr)
    }
  }

  // Generate safe filename: originalName-timestamp-hash.ext
  const rawBaseName = path.basename(file.name || 'upload', path.extname(file.name || ''))
  const baseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)
  const randomSuffix = crypto.randomBytes(6).toString('hex')
  const safeFileName = `${baseName || 'upload'}-${Date.now()}-${randomSuffix}${finalExt}`

  // 6A. Attempt Local Disk Write (succeeds in local dev & persistent VPS; skipped on read-only serverless)
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    await fs.writeFile(path.join(UPLOAD_DIR, safeFileName), buffer)
  } catch {
    // Expected on read-only serverless filesystems (e.g. Vercel /var/task)
  }

  // 6B. Attempt OS Temp Directory Cache Write (writable in serverless for fast warm-instance reads)
  try {
    await fs.mkdir(TMP_UPLOAD_DIR, { recursive: true })
    await fs.writeFile(path.join(TMP_UPLOAD_DIR, safeFileName), buffer)
  } catch {}

  // 6C. Persist in PostgreSQL Database so /uploads/<safeFileName> works permanently across all serverless instances
  try {
    const payload = JSON.stringify({
      mimeType,
      base64: buffer.toString('base64'),
    })
    await prisma.siteSetting.upsert({
      where: { key: `media_file:${safeFileName}` },
      update: { value: payload },
      create: { key: `media_file:${safeFileName}`, value: payload },
    })
  } catch (dbErr) {
    console.warn('Database media blob persistence warning:', dbErr)
  }

  return {
    fileName: safeFileName,
    fileUrl: `/uploads/${safeFileName}`,
    mimeType,
    fileSize: effectiveSize,
    originalSize,
    isCompressed,
  }
}

/**
 * Optional Cloudinary Uploader using sanitized buffer
 */
async function uploadBufferToCloudinary(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  fileSize: number
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo'
  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64Data,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset',
    }),
  })

  if (!response.ok) {
    throw new Error(`Cloudinary responded with ${response.status}`)
  }

  const data = await response.json()
  return {
    fileName: originalName,
    fileUrl: data.secure_url || data.url,
    mimeType,
    fileSize,
  }
}

/**
 * Deletes a stored file from local disk, temp cache, and database blob store.
 */
export async function deleteStoredFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl.startsWith('/uploads/')) {
    return false
  }

  const fileName = path.basename(fileUrl)
  let deleted = false

  try {
    await fs.unlink(path.join(UPLOAD_DIR, fileName))
    deleted = true
  } catch {}

  try {
    await fs.unlink(path.join(TMP_UPLOAD_DIR, fileName))
    deleted = true
  } catch {}

  try {
    await prisma.siteSetting.deleteMany({
      where: { key: `media_file:${fileName}` },
    })
    deleted = true
  } catch {}

  return deleted
}
