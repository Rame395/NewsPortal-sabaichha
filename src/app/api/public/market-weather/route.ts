import { NextResponse } from 'next/server'
import { getAggregatedMarketWeatherData } from '@/lib/market/market-service'

export async function GET() {
  try {
    const data = await getAggregatedMarketWeatherData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Market-weather route error:', error)
    return NextResponse.json({ error: 'Failed to retrieve market & weather data' }, { status: 500 })
  }
}
