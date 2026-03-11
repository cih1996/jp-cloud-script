<template>
  <div class="api-docs">
    <div class="header-actions">
      <div class="top-bar">
         <el-alert
          title="WebSocket Endpoint: ws://127.0.0.1:1001/api/unified/ws"
          type="info"
          show-icon
          :closable="false"
          class="endpoint-alert"
        />
        <el-button type="primary" @click="copyAll">Copy All Documentation</el-button>
      </div>
    </div>

    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="(api, index) in apiList" :key="index" :title="api.title" :name="index">
        <div class="api-item">
          <div class="api-desc">{{ api.description }}</div>
          
          <div class="code-section">
            <div class="section-header">
              <span class="label">Request</span>
              <el-button type="primary" link size="small" @click="copyToClipboard(api.request)">Copy</el-button>
            </div>
            <pre class="json-block">{{ formatJson(api.request) }}</pre>
          </div>

          <div class="code-section">
            <div class="section-header">
              <span class="label">Response (Example)</span>
              <el-button type="primary" link size="small" @click="copyToClipboard(api.response)">Copy</el-button>
            </div>
            <pre class="json-block">{{ formatJson(api.response) }}</pre>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeNames = ref([0])

const copyToClipboard = (data: any) => {
  const text = JSON.stringify(data, null, 2)
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Copied to clipboard')
  }).catch(() => {
    ElMessage.error('Failed to copy')
  })
}

const copyAll = () => {
  let allText = "WebSocket API Documentation\n\nEndpoint: ws://127.0.0.1:1001/api/unified/ws\n\n";
  
  apiList.forEach(api => {
    allText += `### ${api.title}\n`;
    allText += `${api.description}\n\n`;
    allText += `**Request:**\n\`\`\`json\n${JSON.stringify(api.request, null, 2)}\n\`\`\`\n\n`;
    allText += `**Response (Example):**\n\`\`\`json\n${JSON.stringify(api.response, null, 2)}\n\`\`\`\n\n`;
    allText += `---\n\n`;
  });

  navigator.clipboard.writeText(allText).then(() => {
    ElMessage.success('All API documentation copied to clipboard')
  }).catch(() => {
    ElMessage.error('Failed to copy')
  })
}

const formatJson = (data: any) => {
  return JSON.stringify(data, null, 2)
}

const apiList = [
  {
    title: '1. Login',
    description: 'Authenticate with the WebSocket server using your API token. Optionally specify a host to connect to a different cloud server.',
    request: {
      type: "Login",
      seq: 1,
      token: "YOUR_API_TOKEN",
      host: "minio.accjs.cn"
    },
    response: {
      type: "Login",
      seq: 1,
      code: 200,
      msg: "Success"
    }
  },
  {
    title: '2. Heartbeat (Ping)',
    description: 'Keep the connection alive. Server auto-disconnects if inactive.',
    request: {
      type: "Ping",
      seq: 100
    },
    response: {
      type: "Ping",
      seq: 100,
      code: 200,
      msg: "pong"
    }
  },
  {
    title: '3. Get Device List',
    description: 'Retrieve a list of devices associated with the user.',
    request: {
      type: "GetDeviceList",
      seq: 200,
      data: null
    },
    response: {
      type: "GetDeviceList",
      seq: 200,
      code: 200,
      data: {
        list: [
          {
            deviceId: 12345,
            device_name: "Pixel 4",
            is_online: 1
          }
        ],
        total: 1
      }
    }
  },
  {
    title: '4. Get App List',
    description: 'Get list of installed apps on a specific device.',
    request: {
      type: "getAppList",
      seq: 300,
      data: {
        deviceId: 12345
      }
    },
    response: {
      type: "getAppList",
      seq: 300,
      code: 200,
      data: [
        {
          deviceId: 12345,
          data: "{\"apps\": [{\"pkg\": \"com.android.chrome\", \"name\": \"Chrome\"}]}"
        }
      ]
    }
  },
  {
    title: '5. Start App',
    description: 'Launch an application on a specific device.',
    request: {
      type: "startApp",
      seq: 400,
      data: {
        deviceId: 12345,
        packageName: "com.example.app"
      }
    },
    response: {
      type: "startApp",
      seq: 400,
      code: 200,
      data: [
        {
          deviceId: 12345,
          data: "Success"
        }
      ]
    }
  },
  {
    title: '6. Execute Shell Command',
    description: 'Run a shell command on the device.',
    request: {
      type: "execShell",
      seq: 500,
      data: {
        deviceId: 12345,
        shell: "ls -l /sdcard"
      }
    },
    response: {
      type: "execShell",
      seq: 500,
      code: 200,
      data: [
        {
          deviceId: 12345,
          data: "Download\nDCIM\nAndroid"
        }
      ]
    }
  },
  {
    title: '7. Change Phones (Change OS)',
    description: 'Submit a Change OS task for one or more devices.',
    request: {
      type: "Changephones",
      seq: 600,
      req: true,
      data: [
        {
          deviceId: 12345,
          category: "491",
          bs: "wifi",
          operator: "00",
          timezone: "America/New_York",
          language: "en-US",
          version: "491",
          country: "us",
          operatorName: "AmeriLink",
          mcc: "310",
          mnc: "630",
          msisdn: "",
          smsc: ""
        }
      ]
    },
    response: {
      type: "Changephones",
      seq: 600,
      code: 200,
      data: [
        {
          id: 1001,
          deviceId: 12345,
          status: 0,
          data: "{\"taskId\": 1001}"
        }
      ]
    }
  },
  {
    title: '8. Get Task Status',
    description: 'Check the status of Change OS tasks.',
    request: {
      type: "getTaskStatus",
      seq: 700,
      data: {
        tbChangeOsIds: [1001]
      }
    },
    response: {
      type: "getTaskStatus",
      seq: 700,
      code: 200,
      data: [
        {
          id: 1001,
          status: 1,
          data: "{\"progress\": 100, \"result\": \"success\"}"
        }
      ]
    }
  },
  {
    title: '9. Download & Install App',
    description: 'Download and install an APK on devices.',
    request: {
      type: "downLoadInstallApp",
      seq: 800,
      data: {
        devices: [12345, 67890],
        name: "MyApp.apk",
        url: "https://example.com/app.apk",
        sha256: "optional_sha256_hash",
        install: true,
        receive: true
      }
    },
    response: {
      type: "downLoadInstallApp",
      seq: 800,
      code: 200,
      data: [
        {
          deviceId: 12345,
          data: "{\"id\": \"download_task_123\"}"
        }
      ]
    }
  },
  {
    title: '10. Get Download Progress',
    description: 'Check progress of a download task.',
    request: {
      type: "getDownloadProgress",
      seq: 900,
      data: {
        deviceId: 12345,
        id: "download_task_123"
      }
    },
    response: {
      type: "getDownloadProgress",
      seq: 900,
      code: 200,
      data: [
        {
          deviceId: 12345,
          data: "{\"progress\": 45, \"status\": \"downloading\"}"
        }
      ]
    }
  },
  {
    title: '11. Set Location',
    description: 'Set GPS location for devices.',
    request: {
      type: "setLocation",
      seq: 1000,
      data: [
        {
          deviceId: 12345,
          lat: 34.052235,
          lng: -118.243683
        }
      ]
    },
    response: {
      type: "setLocation",
      seq: 1000,
      code: 200,
      data: "Success"
    }
  },
  {
    title: '12. Set Socks5 Proxy',
    description: 'Configure Socks5 proxy on device.',
    request: {
      type: "setSocket5",
      seq: 1100,
      data: {
        deviceId: 12345,
        s5Url: "socks5://user:pass@1.2.3.4:1080",
        nOutSwID: 11211
      }
    },
    response: {
      type: "setSocket5",
      seq: 1100,
      code: 200,
      data: "Success"
    }
  },
  {
    title: '13. Hide App',
    description: 'Hide or unhide an application package.',
    request: {
      type: "hideApp",
      seq: 1200,
      data: {
        deviceId: 12345,
        packageName: "com.sensitive.app",
        isHide: true
      }
    },
    response: {
      type: "hideApp",
      seq: 1200,
      code: 200,
      data: "Success"
    }
  },
  {
    title: '14. Get Root',
    description: 'Execute root extraction for a specific package.',
    request: {
      type: "getRoot",
      seq: 1300,
      data: {
        deviceId: 12345,
        pkg: "com.android.shell"
      }
    },
    response: {
      type: "getRoot",
      seq: 1300,
      code: 200,
      data: "Success"
    }
  }
]
</script>

<style scoped>
.api-docs {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 20px;
}

.endpoint-alert {
  flex-grow: 1;
}

.api-item {
  padding: 10px;
}

.api-desc {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.code-section {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
  border: 1px solid #dcdfe6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 5px;
}

.label {
  font-weight: bold;
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
}

.json-block {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #303133;
}
</style>
