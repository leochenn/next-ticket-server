import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await DataService.getPluginStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取统计信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取统计信息失败' },
      { status: 500 }
    )
  }
}
