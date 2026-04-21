'use client'

import { useState, useEffect, useCallback } from 'react'

export default function Home() {
  const [status, setStatus] = useState<{ enabled: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const getBasePath = () => {
    if (typeof window === 'undefined') return ''
    const seg = window.location.pathname.split('/').filter(Boolean)[0]
    return seg ? `/${seg}` : ''
  }

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${getBasePath()}/api/status`)
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('获取状态失败:', error)
      setStatus({ enabled: false, message: '获取状态失败' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const toggleStatus = async () => {
    if (!status) return
    
    setUpdating(true)
    try {
      const response = await fetch(`${getBasePath()}/api/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !status.enabled }),
      })
      
      if (response.ok) {
        setStatus({ ...status, enabled: !status.enabled, message: !status.enabled ? '抢票功能已启用' : '抢票功能已停用' })
      }
    } catch (error) {
      console.error('更新状态失败:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">抢票功能状态控制</h2>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-lg font-medium text-gray-900">当前状态</h3>
            <p className="text-sm text-gray-600 mt-1">{status?.message}</p>
          </div>
          
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status?.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {status?.enabled ? '已启用' : '已停用'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={toggleStatus}
            disabled={updating}
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              status?.enabled
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {updating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                更新中...
              </div>
            ) : (
              status?.enabled ? '停用抢票功能' : '启用抢票功能'
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">使用说明</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 插件在导入配置时会检查此状态</li>
            <li>• 如果抢票功能被停用，插件会提示 &quot;抢票配置异常&quot;</li>
            <li>• 状态变更后，已导入的配置需要重新导入才能生效</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
