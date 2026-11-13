import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
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

// Whitelisted MIME types (Images + Short Looping/News Videos)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
])

// Whitelisted file extensions
const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.jfif',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.mp4',
  '.webm',
])

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

// Category-specific maximum file size ceilings
export const MAX_IMAGE_RAW_SIZE = 10 * 1024 * 1024 // 10MB (Raw incoming image, will be compressed)
export const MAX_GIF_SIZE_BYTES = 4 * 1024 * 1024  // 4MB for Animated GIFs
export const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024 // 25MB for News & Ad Videos (MP4/WebM)
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // Overall fallback ceiling

/**
 * Ensures the uploads directory exists on disk.
 */
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create uploads directory:', error)
  }
}

/**
 * Hybrid Storage Handler
 * Uses local server storage by default, or Cloudinary if CLOUDINARY_URL is set in environment.
 * Includes complete SVG sanitization and file extension/MIME verification.
 */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  const rawExt = path.extname(file.name).toLowerCase() || '.jpg'
  const originalExt = rawExt === '.jfif' ? '.jpg' : rawExt

  // 1. Strict Extension and MIME Type Validation
  if (!ALLOWED_EXTENSIONS.has(rawExt)) {
    throw new Error(
      `Disallowed file extension: "${rawExt}". Only JPG, PNG, WebP, GIF, SVG, MP4, and WebM are permitted.`
    )
  }

  // Normalize missing or generic MIME types (e.g. Windows drag-and-drop or image/jpg)
  const rawType = (file.type || '').toLowerCase()
  const resolvedType =
    !rawType || rawType === 'application/octet-stream'
      ? EXT_TO_MIME[rawExt] || ''
      : rawType === 'image/jpg'
      ? 'image/jpeg'
      : rawType

  if (!ALLOWED_MIME_TYPES.has(resolvedType)) {
    throw new Error(
      `Unsupported MIME type: ${file.type || 'unknown'}. Allowed formats: JPG, PNG, WebP, GIF, SVG, MP4, WebM.`
    )
  }

  const isVideo =
    resolvedType === 'video/mp4' ||
    resolvedType === 'video/webm' ||
    originalExt === '.mp4' ||
    originalExt === '.webm'
  const isGif = resolvedType === 'image/gif' || originalExt === '.gif'
  const isSvg = resolvedType === 'image/svg+xml' || originalExt === '.svg'

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
      `Animated GIF exceeds maximum allowed size of 4MB (${(file.size / (1024 * 1024)).toFixed(
        1
      )}MB provided). Please compress or use a short looping MP4 video instead.`
    )
  }

  if (!isVideo && file.size > MAX_IMAGE_RAW_SIZE) {
    throw new Error('Image file exceeds maximum allowed raw upload size of 10MB.')
  }

  const bytes = await file.arrayBuffer()
  let buffer = Buffer.from(bytes)
  const originalSize = file.size
  let effectiveSize = file.size
  let mimeType = resolvedType
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
  }

  // 4. Server-Side Image Compression with Sharp (for JPEG, PNG, and WebP)
  // Downscales oversized dimensions (max width 1920px) and applies high-efficiency compression
  else if (!isVideo && !isGif) {
    try {
      const imagePipeline = sharp(buffer).rotate()
      const metadata = await imagePipeline.metadata()

      const shouldResize = metadata.width && metadata.width > 1920

      let compressedBuffer: Buffer

      if (originalExt === '.png') {
        compressedBuffer = await imagePipeline
          .resize(shouldResize ? { width: 1920, withoutEnlargement: true } : undefined)
          .png({ compressionLevel: 8, quality: 85 })
          .toBuffer()
      } else if (originalExt === '.webp') {
        compressedBuffer = await imagePipeline
          .resize(shouldResize ? { width: 1920, withoutEnlargement: true } : undefined)
          .webp({ quality: 82, effort: 4 })
          .toBuffer()
      } else {
        // Standard JPEG with progressive encoding
        compressedBuffer = await imagePipeline
          .resize(shouldResize ? { width: 1920, withoutEnlargement: true } : undefined)
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toBuffer()
      }

      if (compressedBuffer && compressedBuffer.length < buffer.length) {
        buffer = Buffer.from(compressedBuffer)
        effectiveSize = buffer.length
        isCompressed = true
      }
    } catch (compressionErr) {
      console.warn('Sharp image compression skipped, saving original buffer:', compressionErr)
    }
  }

  // 3. Cloudinary upload if CLOUDINARY_URL is present
  if (process.env.CLOUDINARY_URL) {
    try {
      return await uploadBufferToCloudinary(buffer, file.name, mimeType, effectiveSize)
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr)
    }
  }

  // 4. Default Local Disk Storage
  await ensureUploadDir()

  // Generate safe filename: originalName-hash.ext (sanitized against path traversal)
  const baseName = path
    .basename(file.name, originalExt)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 30)
  const randomSuffix = crypto.randomBytes(6).toString('hex')
  const safeFileName = `${baseName || 'upload'}-${Date.now()}-${randomSuffix}${originalExt}`

  const targetPath = path.join(UPLOAD_DIR, safeFileName)
  await fs.writeFile(targetPath, buffer)

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
  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`

  const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
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
 * Deletes a stored file from disk if it was saved locally.
 */
export async function deleteStoredFile(fileUrl: string): Promise<boolean> {
  try {
    if (fileUrl.startsWith('/uploads/')) {
      const fileName = path.basename(fileUrl)
      const targetPath = path.join(UPLOAD_DIR, fileName)
      await fs.unlink(targetPath)
      return true
    }
    return false
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to delete file from disk:', err)
    }
    return false
  }
}
