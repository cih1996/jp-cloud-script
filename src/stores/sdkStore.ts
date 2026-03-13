import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { localService } from '@/api/localService'

interface SdkState {
  user: { token: string } | null
  isConnected: boolean
  apiKey: string
  serverHost: string
}

export const useSdkStore = defineStore('sdk', {
  state: (): SdkState => ({
    user: null,
    isConnected: false,
    apiKey: localStorage.getItem('jpy_api_key') || '',
    serverHost: localStorage.getItem('jpy_ws_host') || 'minio.accjs.cn'
  }),

  actions: {
    // 通过后端 API 登录（不再直连集控平台）
    async login(secretKey: string, host?: string) {
      const targetHost = host || this.serverHost

      try {
        // 调用后端统一接口登录
        const res = await localService.callUnified({
          type: 'Login',
          seq: Date.now(),
          token: secretKey,
          host: targetHost
        })

        if (res.code === 200) {
          this.user = { token: secretKey }
          this.apiKey = secretKey
          this.serverHost = targetHost
          this.isConnected = true
          localStorage.setItem('jpy_api_key', secretKey)
          localStorage.setItem('jpy_ws_host', targetHost)
          ElMessage.success('登录成功')
          return true
        } else {
          throw new Error(res.msg || '登录失败')
        }
      } catch (error) {
        console.error('Login failed:', error)
        ElMessage.error('登录失败: ' + (error as any).message)
        throw error
      }
    },

    logout() {
      this.user = null
      this.apiKey = ''
      this.isConnected = false
      localStorage.removeItem('jpy_api_key')
      // 保留 serverHost，方便下次登录
      window.location.reload()
    },

    setServerHost(host: string) {
      this.serverHost = host
      localStorage.setItem('jpy_ws_host', host)
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.user
  }
})
