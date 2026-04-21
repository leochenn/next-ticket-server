import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET() {
  try {
    const status = await DataService.getStatus()
    
    return NextResponse.json({
      enabled: status.enabled,
      message: status.enabled ? '抢票功能已启用' : '抢票功能已停用'
    })
  } catch (error) {
    console.error('获取状态失败:', error)
    return NextResponse.json(
      { enabled: false, message: '获取状态失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, message: '参数错误' },
        { status: 400 }
      )
    }
    
    await DataService.setStatus(enabled)
    
    return NextResponse.json({
      success: true,
      message: enabled ? '抢票功能已启用' : '抢票功能已停用'
    })
  } catch (error) {
    console.error('设置状态失败:', error)
    return NextResponse.json(
      { success: false, message: '设置状态失败' },
      { status: 500 }
    )
  }
}