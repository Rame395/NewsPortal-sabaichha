import { NextResponse } from 'next/server'
import { getAggregatedMarketWeatherData } from '@/lib/market/market-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAggregatedMarketWeatherData()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Market-weather route error:', error)
    return NextResponse.json({ error: 'Failed to retrieve market & weather data' }, { status: 500 })
  }
}
