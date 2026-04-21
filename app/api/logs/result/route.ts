import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证必要字段
    if (!body.pluginId || !body.timestamp || !body.roundInfo || !body.tasks) {
      return NextResponse.json(
        { success: false, message: '缺少必要字段' },
        { status: 400 }
      )
    }
    
    await DataService.saveResultLog(body)
    
    return NextResponse.json({
      success: true,
      message: '抢票结果日志已保存'
    })
  } catch (error) {
    console.error('保存抢票结果日志失败:', error)
    return NextResponse.json(
      { success: false, message: '保存日志失败' },
      { status: 500 }
    )
  }
}