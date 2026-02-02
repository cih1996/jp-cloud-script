
<script setup lang="ts">
import { RouterView } from 'vue-router'
import DebugLogPanel from '@/components/DebugLogPanel.vue'
import { onMounted } from 'vue'
import { useDebugStore } from '@/stores/debugStore'
import { SendInterface } from '@sdk/index'

const debugStore = useDebugStore()

onMounted(() => {
  // Setup WS Interceptor
  // Use 'any' cast to avoid TS issues if d.ts isn't fully updated in editor context
  if (SendInterface && (SendInterface as any).addDebugListener) {
      (SendInterface as any).addDebugListener((type: any, data: any, method: string) => {
          debugStore.addLog(type, data, method)
      })
  } else {
      console.warn("SendInterface debug listener not available")
  }

  // Setup Fetch Interceptor
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const [resource, config] = args
    // Skip if resource is not a string (Request object) for simplicity, or handle it
    let url = ''
    if (typeof resource === 'string') {
        url = resource
    } else if (resource instanceof URL) {
        url = resource.toString()
    } else if (resource instanceof Request) {
        url = resource.url
    }

    const method = config?.method || (resource instanceof Request ? resource.method : 'GET')
    
    // Log Request
    let reqData = config?.body
    try {
        if (reqData && typeof reqData === 'string') {
            // Check if it looks like JSON
            if (reqData.startsWith('{') || reqData.startsWith('[')) {
                 reqData = JSON.parse(reqData)
            }
        }
    } catch(e) {}
    
    debugStore.addLog('api-req', reqData || { url }, `${method} ${url}`)
    
    try {
        const response = await originalFetch(...args)
        
        // Clone response to read body
        const clone = response.clone()
        let resData: any = `Status: ${response.status}`
        
        // Only read text for JSON or Text content types to avoid reading binary blobs
        const contentType = response.headers.get('content-type')
        if (contentType && (contentType.includes('application/json') || contentType.includes('text'))) {
            try {
                const text = await clone.text()
                try {
                    resData = JSON.parse(text)
                } catch {
                    resData = text
                }
            } catch(e) {}
        }
        
        debugStore.addLog('api-res', resData, `${method} ${url} (${response.status})`)
        
        return response
    } catch (error) {
        debugStore.addLog('api-res', { error: String(error) }, `${method} ${url} (Error)`)
        throw error
    }
  }
})
</script>

<template>
  <RouterView />
  <DebugLogPanel />
</template>

<style>
/* Global styles are now in assets/styles/main.scss */
</style>
