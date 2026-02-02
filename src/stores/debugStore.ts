import { defineStore } from 'pinia'

export interface LogEntry {
  id: number
  timestamp: string
  type: 'ws-send' | 'ws-recv' | 'ws-push' | 'api-req' | 'api-res'
  method: string
  data: any
  summary: string
  expanded: boolean
}

export const useDebugStore = defineStore('debug', {
  state: () => ({
    logs: [] as LogEntry[],
    maxLogs: 1000,
    isOpen: false
  }),

  actions: {
    addLog(type: LogEntry['type'], data: any, method: string = '') {
      const id = Date.now() + Math.random()
      const timestamp = new Date().toLocaleTimeString()
      
      let summary = ''
      try {
        if (typeof data === 'string') {
             summary = data.substring(0, 100)
        } else {
             summary = JSON.stringify(data).substring(0, 100)
        }
      } catch (e) {
        summary = '[Complex Data]'
      }

      this.logs.unshift({
        id,
        timestamp,
        type,
        method,
        data,
        summary,
        expanded: false
      })

      if (this.logs.length > this.maxLogs) {
        this.logs.pop()
      }
    },

    clearLogs() {
      this.logs = []
    },
    
    togglePanel() {
        this.isOpen = !this.isOpen
    }
  }
})
