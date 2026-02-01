
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { JpySdk, type LoginUserEntity } from '@sdk/index'

interface SdkState {
  sdk: JpySdk | null
  user: LoginUserEntity | null
  isConnected: boolean
  apiKey: string
}

export const useSdkStore = defineStore('sdk', {
  state: (): SdkState => ({
    sdk: null,
    user: null,
    isConnected: false,
    apiKey: localStorage.getItem('jpy_api_key') || ''
  }),

  actions: {
    async initSdk(host?: string) {
      if (this.sdk && this.sdk.conn && !this.sdk.conn.isClosed) return

      // Use provided host or default
      // If host is provided, construct URL
      let wsUrl = 'wss://minio.accjs.cn/ws'
      if (host) {
        // Remove protocol and path if user accidentally added them (simple cleanup)
        let cleanHost = host.replace(/^wss?:\/\//, '').replace(/\/ws$/, '').replace(/\/$/, '')
        wsUrl = `wss://${cleanHost}/ws`
      }

      console.log(`Connecting to ${wsUrl}`)
      this.sdk = new JpySdk(wsUrl)
      
      // Listen for connection open
      this.sdk.conn.addOpenEventListener(() => {
        this.isConnected = true
        console.log('SDK Connected')
        // Auto login if key exists
        if (this.apiKey) {
            this.login(this.apiKey).catch(err => {
                console.error("Auto login failed", err)
                this.logout()
            })
        }
      })

      this.sdk.conn.addCloseEventListener(() => {
        this.isConnected = false
        console.warn('SDK Disconnected')
      })
    },

    async login(secretKey: string, host?: string) {
      // Re-init if host is provided or sdk not initialized
      if (host) {
          if (this.sdk) {
              // If we are already connected, we might want to check if it's the same host
              // For simplicity, if host is passed, we treat it as a new connection attempt
              this.sdk.close()
              this.sdk = null
              this.isConnected = false
          }
          await this.initSdk(host)
      } else if (!this.sdk) {
        await this.initSdk()
      }
      
      // Wait for connection if not open
      if (!this.isConnected) {
         // Simple wait loop or promise wrapper could be better, 
         // but for now assume initSdk triggers connection soon.
         // In production, use a promise that resolves on open.
         await new Promise(resolve => setTimeout(resolve, 1000))
      }

      try {
        const user = await this.sdk!.loginCtl.secretKeyLogin({ secretKey })
        if (user && user.token) {
          this.user = user
          this.apiKey = secretKey
          localStorage.setItem('jpy_api_key', secretKey)
          ElMessage.success('Login Successful')
          return true
        } else {
            throw new Error("Invalid response")
        }
      } catch (error) {
        console.error('Login failed:', error)
        ElMessage.error('Login failed: ' + (error as any).message)
        throw error
      }
    },

    logout() {
      this.user = null
      this.apiKey = ''
      localStorage.removeItem('jpy_api_key')
      // Optional: Close connection or reset SDK
      // this.sdk?.close()
      // this.sdk = null
      window.location.reload() // Simple way to reset state
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.user
  }
})
