import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '100')
    
    if (!date) {
      return NextResponse.json(
        { success: false, message: '缺少日期参数' },
        { status: 400 }
      )
    }
    
    const result = await DataService.getLogs(date, page, pageSize)
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('查询日志失败:', error)
    return NextResponse.json(
      { success: false, message: '查询日志失败' },
      { status: 500 }
    )
  }
}
