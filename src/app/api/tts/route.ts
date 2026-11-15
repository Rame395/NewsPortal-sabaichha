import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import https from 'https'

export const dynamic = 'force-dynamic'

// In-memory cache for generated MP3 buffers (key -> Buffer)
const audioCache = new Map<string, { buffer: Buffer; timestamp: number }>()
const CACHE_MAX_SIZE = 100
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function extractPlainText(htmlOrText: string): string {
  if (!htmlOrText) return ''
  let text = htmlOrText

  // Remove scripts, styles, iframes, figcaptions
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  text = text.replace(/<figcaption\b[^<]*(?:(?!<\/figcaption>)<[^<]*)*<\/figcaption>/gi, '')

  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, ' — ')
    .replace(/&ndash;/g, ' - ')

  // Remove URLs & emails so speech doesn't awkwardly spell out characters
  text = text.replace(/https?:\/\/\S+/gi, '')
  text = text.replace(/[\w.-]+@[\w.-]+\.\w+/gi, '')

  // Remove markdown symbols or hashtags
  text = text.replace(/[#*_~`]/g, '')

  // Normalize whitespace
  return text.replace(/\s+/g, ' ').trim()
}

function splitIntoChunks(text: string): string[] {
  // Split by Devanagari danda, periods, question marks, exclamation, and newlines
  const rawSentences = text
    .split(/([।?!.\n]+)/)
    .reduce<string[]>((acc, part, i, arr) => {
      if (i % 2 === 0 && part.trim()) {
        const punct = arr[i + 1] || ''
        acc.push((part + punct).trim())
      }
      return acc
    }, [])

  const chunks: string[] = []
  let current = ''

  for (const s of rawSentences) {
    if (!s) continue
    // If a single sentence is longer than 150 characters, split by commas
    if (s.length > 150) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      const subParts = s.split(/([,;]+)/).reduce<string[]>((subAcc, subPart, si, subArr) => {
        if (si % 2 === 0 && subPart.trim()) {
          const subPunct = subArr[si + 1] || ''
          subAcc.push((subPart + subPunct).trim())
        }
        return subAcc
      }, [])

      for (const sp of subParts) {
        if (!sp) continue
        if ((current + ' ' + sp).trim().length <= 150) {
          current = (current ? current + ' ' : '') + sp
        } else {
          if (current) chunks.push(current)
          current = sp
        }
      }
    } else if ((current + ' ' + s).trim().length <= 150) {
      current = (current ? current + ' ' : '') + s
    } else {
      if (current) chunks.push(current)
      current = s
    }
  }
  if (current) chunks.push(current)

  // Cap at 25 chunks (~4000 characters, covers the full news report without exhausting connection)
  return chunks.slice(0, 25)
}

function fetchGoogleTtsChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve) => {
    const targetLang = lang === 'en' ? 'en' : 'ne'
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${targetLang}&client=tw-ob`

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
        timeout: 7000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          resolve(Buffer.alloc(0))
          return
        }
        const chunks: Buffer[] = []
        res.on('data', (d: Buffer) => chunks.push(d))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      }
    )

    req.on('error', () => resolve(Buffer.alloc(0)))
    req.on('timeout', () => {
      req.destroy()
      resolve(Buffer.alloc(0))
    })
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const rawText = searchParams.get('text')
    const lang = searchParams.get('lang') || 'ne'

    let titleText = ''
    let bodyText = ''

    if (slug) {
      const article = await prisma.article.findUnique({
        where: { slug },
        select: {
          title: true,
          content: true,
        },
      })

      if (article) {
        titleText = article.title || ''
        bodyText = article.content || ''
      }
    }

    if (!titleText && !bodyText && rawText) {
      bodyText = rawText
    }

    if (!titleText && !bodyText) {
      return new NextResponse('Article text not found', { status: 404 })
    }

    const cleanTitle = extractPlainText(titleText)
    const cleanBody = extractPlainText(bodyText)
    const fullText = cleanTitle ? `${cleanTitle}। ${cleanBody}` : cleanBody

    // Cache key based on content hash or slug
    const cacheKey = `${slug || cleanTitle.slice(0, 30)}_${lang}`

    const cached = audioCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return respondWithAudio(cached.buffer, request)
    }

    const chunks = splitIntoChunks(fullText)
    if (chunks.length === 0) {
      return new NextResponse('No readable text for audio generation', { status: 400 })
    }

    // Process in batches of 4 concurrent requests to prevent throttling
    const audioBuffers: Buffer[] = []
    const BATCH_SIZE = 4

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(
        batch.map((chunk) => fetchGoogleTtsChunk(chunk, lang))
      )
      audioBuffers.push(...batchResults)
    }

    const completeMp3 = Buffer.concat(audioBuffers.filter((b) => b.length > 0))

    if (completeMp3.length === 0) {
      return new NextResponse('Audio synthesis temporarily unavailable', { status: 503 })
    }

    // Cache in memory (evict oldest if cache gets full)
    if (audioCache.size >= CACHE_MAX_SIZE) {
      const firstKey = audioCache.keys().next().value
      if (firstKey) audioCache.delete(firstKey)
    }
    audioCache.set(cacheKey, { buffer: completeMp3, timestamp: Date.now() })

    return respondWithAudio(completeMp3, request)
  } catch (error: any) {
    console.error('TTS Audio streaming error:', error)
    return new NextResponse('Internal audio generation error', { status: 500 })
  }
}

/**
 * Handles HTTP 200 and HTTP 206 Partial Content (Byte Range) requests
 * Required for iOS Safari and Apple AVPlayer streaming & lockscreen seeking.
 */
function respondWithAudio(buffer: Buffer, request: NextRequest) {
  const totalLength = buffer.length
  const rangeHeader = request.headers.get('range')

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1

    if (isNaN(start) || start >= totalLength) {
      return new NextResponse('Requested range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${totalLength}` },
      })
    }

    const clampedEnd = Math.min(end, totalLength - 1)
    const chunk = buffer.subarray(start, clampedEnd + 1)

    return new NextResponse(new Uint8Array(chunk), {
      status: 206,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Range': `bytes ${start}-${clampedEnd}/${totalLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunk.length),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Content-Length': String(totalLength),
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
