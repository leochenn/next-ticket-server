import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证必要字段
    if (!body.pluginId || !body.timestamp || !body.taskPlan) {
      return NextResponse.json(
        { success: false, message: '缺少必要字段' },
        { status: 400 }
      )
    }
    
    await DataService.saveConfigLog(body)
    
    return NextResponse.json({
      success: true,
      message: '配置日志已保存'
    })
  } catch (error) {
    console.error('保存配置日志失败:', error)
    return NextResponse.json(
      { success: false, message: '保存日志失败' },
      { status: 500 }
    )
  }
}