import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export interface UploadResult {
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Allowed image types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

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
 */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed formats: JPG, PNG, WebP, GIF, SVG.`)
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File exceeds maximum allowed size of 10MB.')
  }

  // 1. Cloudinary upload if CLOUDINARY_URL is present
  if (process.env.CLOUDINARY_URL) {
    try {
      return await uploadToCloudinary(file)
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr)
    }
  }

  // 2. Default Local Disk Storage
  await ensureUploadDir()

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Generate safe filename: originalName-hash.ext
  const originalExt = path.extname(file.name) || '.jpg'
  const baseName = path
    .basename(file.name, originalExt)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 30)
  const randomSuffix = crypto.randomBytes(6).toString('hex')
  const safeFileName = `${baseName || 'upload'}-${Date.now()}-${randomSuffix}${originalExt.toLowerCase()}`

  const targetPath = path.join(UPLOAD_DIR, safeFileName)
  await fs.writeFile(targetPath, buffer)

  return {
    fileName: safeFileName,
    fileUrl: `/uploads/${safeFileName}`,
    mimeType: file.type,
    fileSize: file.size,
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

/**
 * Optional Cloudinary Uploader
 */
async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`

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
    fileName: file.name,
    fileUrl: data.secure_url || data.url,
    mimeType: file.type,
    fileSize: file.size,
  }
}
