import { NextResponse } from 'next/server'
import { getAggregatedMarketWeatherData } from '@/lib/market/market-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAggregatedMarketWeatherData()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Market-weather route error:', error)
    return NextResponse.json({ error: 'Failed to retrieve market & weather data' }, { status: 500 })
  }
}
