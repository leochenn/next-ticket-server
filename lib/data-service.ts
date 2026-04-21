import fs from 'fs-extra'
import path from 'path'

const LOGS_DIR = path.join(process.cwd(), 'data', 'logs')
const STATUS_FILE = path.join(process.cwd(), 'data', 'status.json')

export interface ConfigLogData {
  pluginId: string
  timestamp: string
  taskPlan: {
    taskCount: number
    groupCount: number
    guideCount: number
    mode: string
  }
  ticketTypes: Array<{
    name: string
    count: number
  }>
  fileGroups: Array<{
    fileName: string
    peopleCount: number
  }>
  guideAssignments: Array<{
    guideName: string
    groupCount: number
    peopleCount: number
  }>
}

export interface ResultLogData {
  pluginId: string
  timestamp: string
  roundInfo: {
    roundNumber: number
    date: string
    startTime: string
    endTime: string
    mode: string
    status: string
  }
  tasks: Array<{
    status: string
    successTime?: string
    guide: string
    group: number
    ticketType: string
    peopleCount: number
    tourists: string
    failReason?: string
  }>
}

export interface LogEntry {
  id: string
  type: 'config' | 'result'
  pluginId: string
  timestamp: string
  data: ConfigLogData | ResultLogData
}

export interface StatusData {
  enabled: boolean
  updatedAt: string
}

export class DataService {
  private static toTimestampMs(value: unknown): number {
    const s = String(value || '').trim()
    if (!s) return 0

    const t1 = Date.parse(s)
    if (Number.isFinite(t1)) return t1

    const normalized = s.replace(/\//g, '-').replace(' ', 'T')
    const t2 = Date.parse(normalized)
    if (Number.isFinite(t2)) return t2

    return 0
  }

  private static extractIdTimeMs(id: unknown): number {
    const s = String(id || '').trim()
    const m = s.match(/^[^_]+_(\d+)_/)
    if (!m) return 0
    const n = Number(m[1])
    return Number.isFinite(n) ? n : 0
  }

  private static normalizeIsoTimestamp(input: unknown): string {
    const ms = this.toTimestampMs(input)
    return ms > 0 ? new Date(ms).toISOString() : new Date().toISOString()
  }

  private static async ensureDirs() {
    await fs.ensureDir(LOGS_DIR)
    await fs.ensureDir(path.dirname(STATUS_FILE))
  }

  static async getStatus(): Promise<StatusData> {
    await this.ensureDirs()
    
    try {
      const data = await fs.readJson(STATUS_FILE)
      return data
    } catch {
      const defaultStatus: StatusData = {
        enabled: true,
        updatedAt: new Date().toISOString()
      }
      await fs.writeJson(STATUS_FILE, defaultStatus)
      return defaultStatus
    }
  }

  static async setStatus(enabled: boolean): Promise<void> {
    await this.ensureDirs()
    
    const status: StatusData = {
      enabled,
      updatedAt: new Date().toISOString()
    }
    
    await fs.writeJson(STATUS_FILE, status)
  }

  static async saveConfigLog(data: ConfigLogData): Promise<void> {
    await this.ensureDirs()
    
    const timestamp = this.normalizeIsoTimestamp(data.timestamp)
    const date = timestamp.split('T')[0]
    const logEntry: LogEntry = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'config',
      pluginId: data.pluginId,
      timestamp,
      data
    }
    
    await this.appendLog(date, logEntry)
  }

  static async saveResultLog(data: ResultLogData): Promise<void> {
    await this.ensureDirs()
    
    const timestamp = this.normalizeIsoTimestamp(data.timestamp)
    const date = timestamp.split('T')[0]
    const logEntry: LogEntry = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'result',
      pluginId: data.pluginId,
      timestamp,
      data
    }
    
    await this.appendLog(date, logEntry)
  }

  private static async appendLog(date: string, entry: LogEntry): Promise<void> {
    const logFile = path.join(LOGS_DIR, `${date}.json`)
    
    let logs: LogEntry[] = []
    try {
      logs = await fs.readJson(logFile)
    } catch {
      // 文件不存在，创建新数组
    }
    
    logs.push(entry)
    await fs.writeJson(logFile, logs)
  }

  static async getLogs(date: string, page: number = 1, pageSize: number = 100): Promise<{
    logs: LogEntry[]
    total: number
    hasMore: boolean
  }> {
    await this.ensureDirs()
    
    const logFile = path.join(LOGS_DIR, `${date}.json`)
    
    let logs: LogEntry[] = []
    try {
      logs = await fs.readJson(logFile)
    } catch {
      return { logs: [], total: 0, hasMore: false }
    }
    
    // 按时间戳排序（最新在前）；若时间异常则回退到日志ID里的时间段（兼容历史数据）
    logs.sort((a, b) => {
      const bt = this.toTimestampMs(b && b.timestamp)
      const at = this.toTimestampMs(a && a.timestamp)
      if (bt !== at) return bt - at

      const bid = this.extractIdTimeMs(b && b.id)
      const aid = this.extractIdTimeMs(a && a.id)
      return bid - aid
    })
    
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedLogs = logs.slice(start, end)
    
    return {
      logs: paginatedLogs,
      total: logs.length,
      hasMore: end < logs.length
    }
  }

  static async cleanupOldLogs(): Promise<void> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    try {
      const files = await fs.readdir(LOGS_DIR)
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        
        const fileDate = file.replace('.json', '')
        const fileDateObj = new Date(fileDate)
        
        if (fileDateObj < thirtyDaysAgo) {
          await fs.remove(path.join(LOGS_DIR, file))
        }
      }
    } catch {
      // 清理失败不影响主要功能
    }
  }

  static async getPluginStats(): Promise<{
    totalPlugins: number
    activePlugins: string[]
    totalLogs: number
    todayLogs: number
  }> {
    await this.ensureDirs()
    
    const today = new Date().toISOString().split('T')[0]
    const activeSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    let totalLogs = 0
    let todayLogs = 0
    const pluginIds = new Set<string>()
    const activePluginIds = new Set<string>()
    
    try {
      const files = await fs.readdir(LOGS_DIR)
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        
        const fileDate = file.replace('.json', '')
        const raw = await fs.readJson(path.join(LOGS_DIR, file))
        const logs: LogEntry[] = Array.isArray(raw) ? raw : []
        
        totalLogs += logs.length
        
        if (fileDate === today) {
          todayLogs = logs.length
        }
        
        logs.forEach((log: LogEntry) => {
          pluginIds.add(log.pluginId)
          if (fileDate >= activeSince && fileDate <= today) activePluginIds.add(log.pluginId)
        })
      }
    } catch {
      // 统计失败返回默认值
    }
    
    return {
      totalPlugins: pluginIds.size,
      activePlugins: Array.from(activePluginIds),
      totalLogs,
      todayLogs
    }
  }
}
