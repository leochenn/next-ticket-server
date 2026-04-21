'use client'

import { useState, useEffect, useCallback } from 'react'

interface StatsData {
  totalPlugins: number
  activePlugins: string[]
  totalLogs: number
  todayLogs: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const getBasePath = () => {
    if (typeof window === 'undefined') return ''
    const seg = window.location.pathname.split('/').filter(Boolean)[0]
    return seg ? `/${seg}` : ''
  }

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${getBasePath()}/api/stats`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">统计信息</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalPlugins || 0}</div>
            <div className="text-sm text-blue-800">总插件数</div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats?.activePlugins.length || 0}</div>
            <div className="text-sm text-green-800">活跃插件数</div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats?.totalLogs || 0}</div>
            <div className="text-sm text-purple-800">总日志数</div>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats?.todayLogs || 0}</div>
            <div className="text-sm text-orange-800">今日日志数</div>
          </div>
        </div>

        {stats && stats.activePlugins.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">活跃插件列表</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {stats.activePlugins.map((pluginId, index) => (
                <div key={index} className="bg-white px-3 py-2 rounded text-sm font-mono text-gray-700">
                  {pluginId}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">数据说明</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 总插件数：历史上报过日志的插件总数</li>
            <li>• 活跃插件数：最近30天内有日志上报的插件数</li>
            <li>• 日志数据保留30天，过期自动清理</li>
            <li>• 统计数据每小时更新一次</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
