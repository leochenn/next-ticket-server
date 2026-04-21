'use client'

import { useState, useEffect, useCallback } from 'react'

interface LogEntry {
  id: string
  type: 'config' | 'result'
  pluginId: string
  timestamp: string
  data: any
}

export default function LogsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [logType, setLogType] = useState<'all' | 'config' | 'result'>('all')

  const getBasePath = () => {
    if (typeof window === 'undefined') return ''
    const seg = window.location.pathname.split('/').filter(Boolean)[0]
    return seg ? `/${seg}` : ''
  }

  const fetchLogs = useCallback(async (pageNum: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`${getBasePath()}/api/logs?date=${selectedDate}&page=${pageNum}&pageSize=100`)
      const data = await response.json()
      
      if (data.success) {
        let filteredLogs = data.data.logs
        if (logType !== 'all') {
          filteredLogs = data.data.logs.filter((log: LogEntry) => log.type === logType)
        }
        
        if (pageNum === 1) {
          setLogs(filteredLogs)
        } else {
          setLogs(prev => [...prev, ...filteredLogs])
        }
        
        setHasMore(data.data.hasMore)
        setTotal(data.data.total)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, logType])

  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  const loadMore = () => {
    fetchLogs(page + 1)
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  const renderConfigLog = (data: any) => {
    return (
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">任务计划</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
          <div>任务数: {data.taskPlan.taskCount}</div>
          <div>分组数: {data.taskPlan.groupCount}</div>
          <div>导游数: {data.taskPlan.guideCount}</div>
          <div>模式: {data.taskPlan.mode}</div>
        </div>
        
        <h4 className="font-medium text-blue-900 mt-4 mb-2">票型分配</h4>
        <div className="space-y-1">
          {data.ticketTypes.map((ticket: any, index: number) => (
            <div key={index} className="text-sm text-blue-800">
              {ticket.name}: {ticket.count}张
            </div>
          ))}
        </div>
        
        <h4 className="font-medium text-blue-900 mt-4 mb-2">导游分配</h4>
        <div className="space-y-1">
          {data.guideAssignments.map((assignment: any, index: number) => (
            <div key={index} className="text-sm text-blue-800">
              {assignment.guideName}: {assignment.groupCount}组, {assignment.peopleCount}人
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderResultLog = (data: any) => {
    const successCount = data.tasks.filter((task: any) => task.status === '成功').length
    const failCount = data.tasks.filter((task: any) => task.status === '失败').length
    
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">
          第{data.roundInfo.roundNumber}轮 ({data.roundInfo.mode}模式)
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-green-800 mb-4">
          <div>开始时间: {formatDateTime(data.roundInfo.startTime)}</div>
          <div>结束时间: {formatDateTime(data.roundInfo.endTime)}</div>
          <div>成功: {successCount}个</div>
          <div>失败: {failCount}个</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-green-100">
                <th className="px-2 py-1 text-left">状态</th>
                <th className="px-2 py-1 text-left">导游</th>
                <th className="px-2 py-1 text-left">组</th>
                <th className="px-2 py-1 text-left">票型</th>
                <th className="px-2 py-1 text-left">人数</th>
                <th className="px-2 py-1 text-left">失败原因</th>
              </tr>
            </thead>
            <tbody>
              {data.tasks.map((task: any, index: number) => (
                <tr key={index} className="border-t">
                  <td className={`px-2 py-1 font-medium ${
                    task.status === '成功' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {task.status}
                  </td>
                  <td className="px-2 py-1">{task.guide}</td>
                  <td className="px-2 py-1">{task.group}</td>
                  <td className="px-2 py-1">{task.ticketType}</td>
                  <td className="px-2 py-1">{task.peopleCount}</td>
                  <td className="px-2 py-1 text-red-600">{task.failReason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">日志查看</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日志类型</label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="config">配置导入</option>
              <option value="result">抢票结果</option>
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          共 {total} 条日志
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无日志
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.type === 'config' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {log.type === 'config' ? '配置导入' : '抢票结果'}
                    </span>
                    <span className="text-sm text-gray-600">
                      插件ID: {log.pluginId}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(log.timestamp)}
                  </div>
                </div>
                
                {log.type === 'config' ? renderConfigLog(log.data) : renderResultLog(log.data)}
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
