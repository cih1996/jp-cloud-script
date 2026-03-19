<template>
  <div v-if="task" class="editor-container">
    <div class="editor-header">
      <div class="header-left">
        <div class="editor-icon" :style="{ background: getTaskColor(task.id) }">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="title-section">
          <input 
            v-if="isEditing" 
            v-model="editingForm.name" 
            class="ios-title-input" 
            :placeholder="t('rpa.shortcutName')"
          />
          <h1 v-else>{{ task.name }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <div class="test-device-selector" v-if="isEditing">
           <el-select 
              v-model="currentTestDeviceId" 
              :placeholder="t('rpa.testDevice')" 
              filterable 
              size="small" 
              style="width: 160px; margin-right: 12px"
              class="ios-select-device"
           >
              <el-option 
                  v-for="d in allDevices" 
                  :key="d.deviceId" 
                  :label="`${d.deviceId}${d.note ? ' - ' + d.note : ''}`" 
                  :value="d.deviceId"
              >
                 <span style="float: left">{{ d.deviceId }}</span>
                 <span style="float: right; color: var(--el-text-color-secondary); font-size: 12px; margin-left: 10px">{{ d.deviceInfo?.brand }}</span>
              </el-option>
           </el-select>
        </div>

        <template v-if="!isEditing">
           <el-button class="ios-icon-btn" circle @click="openRunDialog">
              <el-icon><VideoPlay /></el-icon>
           </el-button>
           <el-button class="ios-nav-btn" link @click="startEditing">{{ t('rpa.edit') }}</el-button>
        </template>
        <template v-else>
          <el-button class="ios-nav-btn" link @click="cancelEdit">{{ t('rpa.cancel') }}</el-button>
          <el-button class="ios-nav-btn" link @click="runQuickTest">{{ t('rpa.test') }}</el-button>
          <el-button class="ios-nav-btn done" link @click="saveTask">{{ t('rpa.done') }}</el-button>
        </template>
      </div>
    </div>

    <!-- Steps Flow -->
    <el-scrollbar class="editor-body">
      <div class="steps-flow" :class="{ 'editing-mode': isEditing }">
        <div 
          v-for="(step, index) in displaySteps" 
          :key="step.id" 
          class="action-block"
        >
          <div class="action-header" :style="{ borderLeftColor: getStepStyle(step.type).color }">
            <!-- Status Indicator Overlay -->
            <div class="status-indicator" v-if="stepExecutionState[step.id]" :class="stepExecutionState[step.id]?.status">
                <el-icon v-if="stepExecutionState[step.id]?.status === 'running'" class="is-loading"><Loading /></el-icon>
                <el-icon v-if="stepExecutionState[step.id]?.status === 'success'"><Check /></el-icon>
                <el-icon v-if="stepExecutionState[step.id]?.status === 'error'"><Close /></el-icon>
            </div>

            <div class="action-icon" :style="{ background: getStepStyle(step.type).bg, color: getStepStyle(step.type).color }">
              <component :is="getStepStyle(step.type).icon" />
            </div>
            <div class="action-title">
              <span class="action-type">{{ formatStepType(step.type, t) }}</span>
              <input v-if="isEditing" v-model="step.name" class="action-name-input" :placeholder="t('rpa.actionName')" />
              <span v-else class="action-name-display">{{ step.name }}</span>
            </div>
            <div class="action-controls" v-if="isEditing">
              <el-button text circle size="small" @click="moveStep(index, -1)" :disabled="index === 0">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button text circle size="small" @click="moveStep(index, 1)" :disabled="index === displaySteps.length - 1">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button text circle size="small" type="danger" @click="removeStep(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- Execution Result View -->
          <div class="execution-result" v-if="stepExecutionState[step.id] && stepExecutionState[step.id]?.status !== 'pending' && stepExecutionState[step.id]?.status !== 'running'">
              <div v-if="stepExecutionState[step.id]?.error" class="result-error">
                  {{ t('rpa.error') }}: {{ stepExecutionState[step.id]?.error }}
              </div>
              <div v-else class="result-success">
                  <span v-if="stepExecutionState[step.id]?.outputVar" class="var-badge">{{ stepExecutionState[step.id]?.outputVar }} = </span>
                  <span class="result-value">{{ typeof stepExecutionState[step.id]?.result === 'object' ? JSON.stringify(stepExecutionState[step.id]?.result).slice(0, 50) + '...' : stepExecutionState[step.id]?.result }}</span>
              </div>
          </div>

          <!-- Step Content (Inputs) -->
          <div class="action-content" v-if="isEditing || true">
             <!-- Shell -->
             <template v-if="step.type === 'shell'">
               <div class="ios-field">
                 <label>{{ t('rpa.command') }}</label>
                 <el-input type="textarea" v-model="step.params.command" :rows="2" :placeholder="t('rpa.scriptPlaceholder')" resize="none" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                  <label>{{ t('rpa.outputVar') }}</label>
                  <el-input v-model="step.params.outputVar" :placeholder="t('rpa.outputVarPlaceholder')" :readonly="!isEditing" />
               </div>
             </template>

             <!-- Download URL -->
             <template v-if="step.type === 'download_url'">
               <div class="ios-field">
                 <label>{{ t('rpa.url') }}</label>
                 <el-input v-model="step.params.url" placeholder="https://..." :readonly="!isEditing" />
               </div>
               <div class="field-row">
                 <div class="ios-field half">
                   <label>{{ t('rpa.fileName') }}</label>
                   <el-input v-model="step.params.fileName" placeholder="app.apk" :readonly="!isEditing" />
                 </div>
                 <div class="ios-field half">
                   <label>{{ t('rpa.sha256') }}</label>
                   <el-input v-model="step.params.hash" :placeholder="t('rpa.optional')" :readonly="!isEditing" />
                 </div>
               </div>
               <div class="ios-hint">
                 <p>文件将下载到设备的 /sdcard/download_1/ 目录</p>
               </div>
             </template>

             <!-- Download Cloud -->
             <template v-if="step.type === 'download_cloud'">
               <div class="ios-field has-button">
                  <label>云端文件（支持多选）</label>
                  <div class="input-wrapper">
                    <el-input
                      :model-value="formatCloudFiles(step.params.files)"
                      readonly
                      :placeholder="t('rpa.selectFile')"
                    />
                    <el-button v-if="isEditing" type="primary" link @click="openCloudSelectorMulti(index)">{{ t('rpa.choose') }}</el-button>
                  </div>
               </div>
               <div class="ios-field">
                  <label>目标目录（可选）</label>
                  <el-input v-model="step.params.targetDir" placeholder="/sdcard/scripts/" :readonly="!isEditing" />
               </div>
               <div class="field-row">
                  <div class="ios-field half">
                    <el-checkbox v-model="step.params.executable" :disabled="!isEditing">赋予运行权限 (chmod +x)</el-checkbox>
                  </div>
               </div>
               <div class="ios-hint">
                 <p>默认下载到 /sdcard/download_1/，设置目标目录后会自动移动</p>
               </div>
             </template>

             <!-- Change OS -->
             <template v-if="step.type === 'change_os_and_wait'">
                <div class="field-row">
                  <div class="ios-field half">
                    <label>网络类型</label>
                    <el-select v-model="step.params.bs" :disabled="!isEditing">
                       <el-option label="WIFI" value="wifi" />
                       <el-option label="移动网络" value="cellular" />
                    </el-select>
                  </div>
                  <div class="ios-field half">
                    <label>安卓版本</label>
                    <el-select
                      v-model="step.params.androidVersion"
                      :disabled="!isEditing"
                      @change="(val: string) => handleAndroidVersionChange(val, step)"
                    >
                       <el-option label="Android 12" value="12" />
                       <el-option label="Android 13" value="13" />
                       <el-option label="Android 14" value="14" />
                       <el-option label="Android 15" value="15" />
                    </el-select>
                  </div>
                </div>
                <div class="field-row">
                  <div class="ios-field half">
                    <label>国家/地区</label>
                    <el-select
                      v-model="step.params.country"
                      filterable
                      :disabled="!isEditing"
                      @change="(val: string) => handleCountryChange(val, step)"
                    >
                      <el-option
                        v-for="c in countryList"
                        :key="c.code"
                        :label="`${c.name} (${c.code.toUpperCase()})`"
                        :value="c.code"
                      />
                    </el-select>
                  </div>
                </div>
                <el-collapse class="ios-collapse">
                  <el-collapse-item :title="t('rpa.advancedSettings')">
                     <div class="field-grid">
                       <div class="ios-field">
                         <label>{{ t('rpa.language') }}</label>
                         <el-select v-model="step.params.language" filterable allow-create :disabled="!isEditing">
                           <el-option
                             v-for="lang in (filteredLanguages.length > 0 ? filteredLanguages : languageList.slice(0, 50))"
                             :key="lang.code"
                             :label="lang.name"
                             :value="lang.code"
                           />
                         </el-select>
                       </div>
                       <div class="ios-field">
                         <label>{{ t('rpa.timezone') }}</label>
                         <el-select v-model="step.params.timezone" filterable allow-create :disabled="!isEditing">
                           <el-option
                             v-for="tz in (filteredTimezones.length > 0 ? filteredTimezones : timezoneList.slice(0, 50))"
                             :key="tz.id"
                             :label="tz.displayName"
                             :value="tz.id"
                           />
                         </el-select>
                       </div>
                       <div class="ios-field">
                         <label>{{ t('rpa.operator') }}</label>
                         <el-select
                           v-model="step.params.operator"
                           filterable
                           allow-create
                           :disabled="!isEditing"
                           @change="(val: string) => handleOperatorChange(val, step)"
                         >
                           <el-option
                             v-for="op in filteredOperators"
                             :key="`${op.mcc}-${op.mnc}`"
                             :label="`${op.name} (${op.mcc}${op.mnc})`"
                             :value="op.name"
                           />
                         </el-select>
                       </div>
                       <div class="ios-field"><label>运营商名称</label><el-input v-model="step.params.operatorName" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>MCC</label><el-input v-model="step.params.mcc" :readonly="!isEditing" /></div>
                       <div class="ios-field"><label>MNC</label><el-input v-model="step.params.mnc" :readonly="!isEditing" /></div>
                     </div>
                     <div class="sim-section">
                       <div class="section-title">SIM卡信息</div>
                       <div class="field-row">
                         <div class="ios-field flex-grow">
                           <label>本机号码 (MSISDN)</label>
                           <el-input v-model="step.params.msisdn" placeholder="如 +8613800138000" :readonly="!isEditing" :disabled="step.params.randomMsisdn" />
                         </div>
                         <div class="ios-field checkbox-field">
                           <el-checkbox v-model="step.params.randomMsisdn" :disabled="!isEditing || !hasPhoneRule(step.params.country)">随机</el-checkbox>
                         </div>
                       </div>
                       <div class="field-row">
                         <div class="ios-field flex-grow">
                           <label>短信中心 (SMSC)</label>
                           <el-input v-model="step.params.smsc" placeholder="如 +8613800100500" :readonly="!isEditing" :disabled="step.params.randomSmsc" />
                         </div>
                         <div class="ios-field checkbox-field">
                           <el-checkbox v-model="step.params.randomSmsc" :disabled="!isEditing || !hasSMSCRule(step.params.country)">随机</el-checkbox>
                         </div>
                       </div>
                     </div>
                     <div class="ios-field"><label>自定义参数 (JSON)</label><el-input v-model="step.params.customParams" placeholder="{}" :readonly="!isEditing" /></div>
                  </el-collapse-item>
                </el-collapse>
             </template>

             <!-- HTTP Request -->
             <template v-if="step.type === 'http_request'">
               <div class="field-row">
                 <div class="ios-field quarter">
                   <label>{{ t('rpa.method') }}</label>
                   <el-select v-model="step.params.method" :disabled="!isEditing"><el-option value="GET" /><el-option value="POST" /></el-select>
                 </div>
                 <div class="ios-field three-quarter">
                   <label>{{ t('rpa.url') }}</label>
                   <el-input v-model="step.params.url" :readonly="!isEditing" />
                 </div>
               </div>
               <div class="ios-field"><label>{{ t('rpa.headers') }}</label><el-input v-model="step.params.headers" placeholder="{}" :readonly="!isEditing" /></div>
               <div class="ios-field" v-if="step.params.method === 'POST'"><label>{{ t('rpa.body') }}</label><el-input type="textarea" v-model="step.params.body" :rows="2" :readonly="!isEditing" /></div>
               <div class="field-row">
                 <div class="ios-field half"><label>{{ t('rpa.extract') }}</label><el-input v-model="step.params.extractPath" placeholder="path.to.val" :readonly="!isEditing" /></div>
                 <div class="ios-field half"><label>{{ t('rpa.saveAs') }}</label><el-input v-model="step.params.outputVar" placeholder="varName" :readonly="!isEditing" /></div>
               </div>
             </template>

             <!-- Custom JS -->
             <template v-if="step.type === 'custom_js'">
               <div class="ios-field code-field">
                 <label>{{ t('rpa.script') }}</label>
                 <el-input type="textarea" v-model="step.params.code" :rows="6" class="code-font" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                  <label>{{ t('rpa.outputVar') }}</label>
                  <el-input v-model="step.params.outputVar" :placeholder="t('rpa.outputVarPlaceholder')" :readonly="!isEditing" />
               </div>
             </template>

             <!-- Set Proxy -->
             <template v-if="step.type === 'set_proxy_and_wait'">
               <div class="ios-field">
                 <label>出口线路</label>
                 <div class="input-wrapper" style="display: flex; gap: 10px;">
                   <el-select
                     v-model="step.params.nOutSwID"
                     :disabled="!isEditing"
                     :loading="s5OutLinesLoading"
                     placeholder="请先加载线路"
                     style="flex: 1;"
                   >
                     <el-option
                       v-for="line in s5OutLines"
                       :key="line.nSwID"
                       :label="line.szName || `线路 ${line.nSwID}`"
                       :value="line.nSwID"
                     />
                   </el-select>
                   <el-button v-if="isEditing" type="primary" link @click="loadS5OutLines" :loading="s5OutLinesLoading">
                     {{ s5OutLines.length > 0 ? '刷新' : '加载线路' }}
                   </el-button>
                 </div>
                 <div class="ios-hint" v-if="s5OutLinesError">
                   <p style="color: #ff3b30;">{{ s5OutLinesError }}</p>
                 </div>
               </div>
               <div class="ios-field">
                 <label>代理来源</label>
                 <el-radio-group v-model="step.params.proxySource" :disabled="!isEditing">
                   <el-radio value="variable">从变量获取</el-radio>
                   <el-radio value="direct">直接输入</el-radio>
                 </el-radio-group>
               </div>
               <div class="ios-field" v-if="step.params.proxySource === 'variable'">
                 <label>代理地址变量</label>
                 <el-input v-model="step.params.s5Url" placeholder="{{proxyData.s5Url}}" :readonly="!isEditing" />
                 <div class="ios-hint">
                   <p>引用上一步输出的变量，格式：&#123;&#123;变量名.字段&#125;&#125;</p>
                   <p>例如：先用 HTTP请求 获取代理，outputVar 设为 "proxyData"</p>
                   <p>然后这里填 &#123;&#123;proxyData.s5Url&#125;&#125;</p>
                 </div>
               </div>
               <div class="ios-field" v-if="step.params.proxySource === 'direct'">
                 <label>S5代理地址</label>
                 <el-input v-model="step.params.s5Url" placeholder="socks5://user:pass@host:port" :readonly="!isEditing" />
               </div>
             </template>

             <!-- Set Location -->
             <template v-if="step.type === 'set_location'">
               <div class="ios-field">
                 <label>坐标来源</label>
                 <el-radio-group v-model="step.params.locationSource" :disabled="!isEditing">
                   <el-radio value="variable">从变量获取</el-radio>
                   <el-radio value="direct">直接输入</el-radio>
                 </el-radio-group>
               </div>
               <template v-if="step.params.locationSource === 'variable'">
                 <div class="field-row">
                   <div class="ios-field half">
                     <label>纬度变量</label>
                     <el-input v-model="step.params.lat" placeholder="{{data.lat}}" :readonly="!isEditing" />
                   </div>
                   <div class="ios-field half">
                     <label>经度变量</label>
                     <el-input v-model="step.params.lng" placeholder="{{data.lng}}" :readonly="!isEditing" />
                   </div>
                 </div>
                 <div class="ios-hint">
                   <p>引用上一步输出的变量，格式：&#123;&#123;变量名.字段&#125;&#125;</p>
                   <p>例如：先用 HTTP请求 获取位置数据，outputVar 设为 "location"</p>
                   <p>然后这里填 &#123;&#123;location.lat&#125;&#125; 和 &#123;&#123;location.lng&#125;&#125;</p>
                 </div>
               </template>
               <template v-else>
                 <div class="field-row">
                   <div class="ios-field half">
                     <label>纬度</label>
                     <el-input-number v-model="step.params.lat" :precision="6" :step="0.001" :disabled="!isEditing" style="width: 100%" />
                   </div>
                   <div class="ios-field half">
                     <label>经度</label>
                     <el-input-number v-model="step.params.lng" :precision="6" :step="0.001" :disabled="!isEditing" style="width: 100%" />
                   </div>
                 </div>
               </template>
               <div class="ios-field">
                 <el-checkbox v-model="step.params.enableRandom" :disabled="!isEditing">启用随机偏移</el-checkbox>
               </div>
               <div class="ios-field" v-if="step.params.enableRandom">
                 <label>随机范围（公里）</label>
                 <el-slider v-model="step.params.randomRange" :min="0" :max="50" :step="0.5" show-input :disabled="!isEditing" />
                 <div class="ios-hint">在原坐标基础上随机偏移 0~{{ step.params.randomRange || 0 }} 公里</div>
               </div>
             </template>

             <!-- Install App -->
             <template v-if="step.type === 'install_app_and_wait'">
               <div class="ios-field">
                 <label>应用来源</label>
                 <el-radio-group v-model="step.params.appSource" :disabled="!isEditing">
                   <el-radio value="cloud">云文件</el-radio>
                   <el-radio value="url">URL地址</el-radio>
                 </el-radio-group>
               </div>
               <div class="ios-field has-button" v-if="step.params.appSource === 'cloud'">
                 <label>选择应用</label>
                 <div class="input-wrapper">
                   <el-input v-model="step.params.fileName" readonly placeholder="点击选择云文件" />
                   <el-button v-if="isEditing" type="primary" link @click="openCloudSelector(index)">选择</el-button>
                 </div>
               </div>
               <template v-else>
                 <div class="ios-field">
                   <label>应用URL</label>
                   <el-input v-model="step.params.url" placeholder="https://example.com/app.apk" :readonly="!isEditing" />
                 </div>
                 <div class="field-row">
                   <div class="ios-field half">
                     <label>文件名</label>
                     <el-input v-model="step.params.fileName" placeholder="app.apk" :readonly="!isEditing" />
                   </div>
                   <div class="ios-field half">
                     <label>SHA256校验（可选）</label>
                     <el-input v-model="step.params.sha256" placeholder="" :readonly="!isEditing" />
                   </div>
                 </div>
               </template>
             </template>

             <!-- Run Script -->
             <template v-if="step.type === 'start_bot'">
               <div class="ios-field">
                 <label>服务器地址</label>
                 <el-input v-model="step.params.serverUrl" placeholder="ws://192.168.1.100:1003/ws/device" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                 <label>APK包名</label>
                 <el-input v-model="step.params.packageName" placeholder="com.jpy.bot（默认）" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                 <label>设备别名（可选）</label>
                 <el-input v-model="step.params.deviceName" placeholder="留空则不设置" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                 <label>等待连接次数</label>
                 <el-input-number v-model="step.params.maxRetries" :min="1" :max="30" :disabled="!isEditing" />
               </div>
               <div class="ios-hint">写入配置到 /sdcard/accbot/config.json，启动脚本APK，等待WebSocket连接</div>
             </template>

             <!-- Execute Script via WebSocket -->
             <template v-if="step.type === 'run_script'">
               <div class="ios-field">
                 <label>任务名称</label>
                 <el-input v-model="step.params.taskName" placeholder="脚本任务名称（用于日志追踪）" :readonly="!isEditing" />
               </div>
               <div class="ios-field code-field">
                 <label>脚本代码</label>
                 <el-input type="textarea" v-model="step.params.code" :rows="10" class="code-font" :readonly="!isEditing" placeholder="// 在此编写脚本代码&#10;// 设备端会执行此代码" />
               </div>
               <div class="ios-field">
                 <label>超时时间（毫秒）</label>
                 <el-input-number v-model="step.params.timeout" :min="1000" :max="600000" :step="1000" :disabled="!isEditing" style="width: 100%" />
               </div>
               <div class="ios-hint">
                 <p>通过 WebSocket 将脚本推送到设备执行</p>
                 <p>小脚本（&lt;10KB）直接推送代码，大脚本先缓存后推送 hash</p>
               </div>
             </template>

             <!-- Get Root -->
             <template v-if="step.type === 'get_root'">
               <div class="ios-field">
                 <label>应用包名</label>
                 <el-input v-model="step.params.packageName" placeholder="com.android.shell" :readonly="!isEditing" />
               </div>
               <div class="ios-hint">
                 <p>为指定应用授予 Root 权限，常用于脚本执行器等需要高权限的应用</p>
                 <p>默认包名 com.android.shell 用于 Shell 命令提权</p>
               </div>
             </template>

             <!-- Execute Repo Script -->
             <template v-if="step.type === 'execute_repo_script'">
               <div class="ios-field">
                 <label>选择脚本</label>
                 <el-select v-model="step.params.scriptId" placeholder="选择仓库中的脚本" :disabled="!isEditing" style="width: 100%">
                   <el-option v-for="s in scriptList" :key="s.id" :label="s.name" :value="s.id">
                     <span>{{ s.name }}</span>
                     <span style="float: right; color: #8e8e93; font-size: 12px">{{ s.timeout }}ms</span>
                   </el-option>
                 </el-select>
               </div>
               <div class="ios-field">
                 <label>超时时间（毫秒，可选）</label>
                 <el-input-number v-model="step.params.timeout" :min="1000" :max="600000" :step="1000" :disabled="!isEditing" style="width: 100%" placeholder="留空使用脚本默认值" />
               </div>
               <div class="ios-hint">
                 <p>从代码仓库加载脚本并推送到设备执行</p>
                 <p>脚本返回值会保存到流程变量，可在后续步骤中通过 <code v-pre>{{result}}</code> 引用</p>
               </div>
             </template>

             <!-- Set Variables -->
             <template v-if="step.type === 'set_variables'">
               <div class="ios-field">
                 <label>变量设置（JSON 格式）</label>
                 <el-input
                   type="textarea"
                   v-model="step.params.variablesJson"
                   :rows="6"
                   class="code-font"
                   :readonly="!isEditing"
                   placeholder='{"username": "test", "count": 10, "enabled": true}'
                 />
               </div>
               <div class="ios-hint">
                 <p>设置流程变量，供后续步骤使用</p>
                 <p>在其他步骤中通过 <code v-pre>{{变量名}}</code> 引用，如 <code v-pre>{{username}}</code></p>
               </div>
             </template>

             <!-- Condition Check -->
             <template v-if="step.type === 'condition_check'">
               <div class="ios-field">
                 <label>变量名</label>
                 <el-input v-model="step.params.variable" placeholder="要检查的变量名，如 result" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                 <label>运算符</label>
                 <el-select v-model="step.params.operator" :disabled="!isEditing" style="width: 100%">
                   <el-option-group label="比较">
                     <el-option value="eq" label="等于 (==)" />
                     <el-option value="ne" label="不等于 (!=)" />
                     <el-option value="gt" label="大于 (>)" />
                     <el-option value="lt" label="小于 (<)" />
                     <el-option value="gte" label="大于等于 (>=)" />
                     <el-option value="lte" label="小于等于 (<=)" />
                   </el-option-group>
                   <el-option-group label="字符串">
                     <el-option value="contains" label="包含" />
                     <el-option value="not_contains" label="不包含" />
                   </el-option-group>
                   <el-option-group label="空值">
                     <el-option value="empty" label="为空" />
                     <el-option value="not_empty" label="不为空" />
                   </el-option-group>
                   <el-option-group label="布尔">
                     <el-option value="true" label="为真" />
                     <el-option value="false" label="为假" />
                   </el-option-group>
                 </el-select>
               </div>
               <div class="ios-field" v-if="!['empty', 'not_empty', 'true', 'false'].includes(step.params.operator)">
                 <label>比较值</label>
                 <el-input v-model="step.params.value" placeholder="要比较的值" :readonly="!isEditing" />
               </div>
               <div class="ios-field">
                 <label>条件为真时</label>
                 <el-select v-model="step.params.onTrue" :disabled="!isEditing" style="width: 100%">
                   <el-option value="continue" label="继续执行下一步" />
                   <el-option value="skip_next" label="跳过下一步" />
                   <el-option value="jump_to_step" label="跳转到指定步骤" />
                   <el-option value="stop_success" label="成功停止流程" />
                   <el-option value="stop_error" label="错误停止流程" />
                 </el-select>
               </div>
               <div class="ios-field" v-if="step.params.onTrue === 'jump_to_step'">
                 <label>跳转到步骤（索引从0开始）</label>
                 <el-input-number v-model="step.params.jumpStepTrue" :min="0" :disabled="!isEditing" style="width: 100%" />
               </div>
               <div class="ios-field">
                 <label>条件为假时</label>
                 <el-select v-model="step.params.onFalse" :disabled="!isEditing" style="width: 100%">
                   <el-option value="continue" label="继续执行下一步" />
                   <el-option value="skip_next" label="跳过下一步" />
                   <el-option value="jump_to_step" label="跳转到指定步骤" />
                   <el-option value="stop_success" label="成功停止流程" />
                   <el-option value="stop_error" label="错误停止流程" />
                 </el-select>
               </div>
               <div class="ios-field" v-if="step.params.onFalse === 'jump_to_step'">
                 <label>跳转到步骤（索引从0开始）</label>
                 <el-input-number v-model="step.params.jumpStepFalse" :min="0" :disabled="!isEditing" style="width: 100%" />
               </div>
               <div class="ios-hint">
                 <p>根据变量值判断条件，控制流程走向</p>
               </div>
             </template>
          </div>
        </div>

        <!-- Add Action Button -->
        <div class="add-action-wrapper" v-if="isEditing">
          <div class="add-action-search">
             <button class="ios-search-btn" @click="actionDrawerVisible = true">
               <el-icon class="mr-2"><Plus /></el-icon> {{ t('rpa.addAction') }}
             </button>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <ActionDrawer v-model="actionDrawerVisible" @add-step="addStep" />
    <CloudFileSelector
        v-model="cloudSelectorVisible"
        :cloud-files="cloudFiles"
        :loading="cloudLoading"
        :multi-select="cloudMultiSelect"
        @select="handleCloudFileSelect"
        @select-multi="handleCloudFileSelectMulti"
    />
    <RunDialog 
        v-model="runDialogVisible" 
        :task-name="task.name" 
        :all-devices="allDevices"
        :running="running"
        :logs="executionLogs"
        @run="handleRun"
    />
  </div>
  <div v-else class="empty-state-ios">
      <div class="empty-icon"><el-icon><VideoPlay /></el-icon></div>
      <h3>{{ t('rpa.noShortcutSelected') }}</h3>
      <p>{{ t('rpa.noShortcutMsg') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRpaStore, type RpaTask, type RpaStep, type StepType } from '@/stores/rpaStore';
import { useSdkStore } from '@/stores/sdkStore';
import { backendApi } from '@/api/backendApi';
import { useRpaExecution } from '@/composables/useRpaExecution';
import { getStepStyle, getTaskColor, formatStepType } from '@/utils/rpaHelpers';
import { getCountryList, getOperatorsByCountry } from '@/data/operators';
import { hasPhoneRule, hasSMSCRule } from '@/utils/phoneGenerator';
import {
  Monitor, VideoPlay, ArrowUp, ArrowDown, Delete, Loading, Check, Close, Plus
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ActionDrawer from './ActionDrawer.vue';
import CloudFileSelector from './CloudFileSelector.vue';
import RunDialog from './RunDialog.vue';
import type { ListRes } from '@sdk/index';

// 时区和语言数据类型
interface TimezoneItem {
  id: string;
  countryCode: string;
  displayName: string;
}

interface LanguageItem {
  code: string;
  name: string;
  countryCode: string;
}

const props = defineProps<{
  allDevices: any[];
}>();

const { t } = useI18n();
const rpaStore = useRpaStore();
const sdkStore = useSdkStore();
const { running, executionLogs, stepExecutionState, executeTask } = useRpaExecution();

const isEditing = ref(false);
const editingForm = ref<RpaTask>({} as RpaTask);
const currentTestDeviceId = ref<number | null>(null);

const actionDrawerVisible = ref(false);

const cloudSelectorVisible = ref(false);
const cloudFiles = ref<ListRes[]>([]);
const cloudLoading = ref(false);
const currentStepIndexForCloud = ref(-1);

// S5 出口线路
interface S5OutLine {
  nSwID: number;
  szName: string;
  szAlias: string;
  nVrfID: number;
  nPosition: number;
}
const s5OutLines = ref<S5OutLine[]>([]);
const s5OutLinesLoading = ref(false);
const s5OutLinesError = ref('');

// 脚本仓库列表
interface ScriptItem {
  id: number;
  name: string;
  description: string;
  timeout: number;
}
const scriptList = ref<ScriptItem[]>([]);

const runDialogVisible = ref(false);

// 改机相关数据
const countryList = getCountryList();
const timezoneList = ref<TimezoneItem[]>([]);
const languageList = ref<LanguageItem[]>([]);
const filteredTimezones = ref<TimezoneItem[]>([]);
const filteredLanguages = ref<LanguageItem[]>([]);
const filteredOperators = ref<{ name: string; mcc: string; mnc: string }[]>([]);

const task = computed(() => rpaStore.currentTask);
const displaySteps = computed(() => isEditing.value ? editingForm.value.steps : task.value?.steps || []);

// Edit Logic
const startEditing = () => {
    if (task.value) {
        editingForm.value = JSON.parse(JSON.stringify(task.value));
        // 处理 set_variables 步骤：将 variables 对象转换为 JSON 字符串用于编辑
        for (const step of editingForm.value.steps) {
            if (step.type === 'set_variables' && step.params.variables && !step.params.variablesJson) {
                step.params.variablesJson = JSON.stringify(step.params.variables, null, 2);
            }
        }
        isEditing.value = true;
    }
};

const cancelEdit = () => {
    isEditing.value = false;
};

const saveTask = () => {
    if (!editingForm.value.name) {
        ElMessage.warning(t('rpa.messages.taskNameRequired'));
        return;
    }

    // 处理 set_variables 步骤：将 JSON 字符串转换为对象
    for (const step of editingForm.value.steps) {
        if (step.type === 'set_variables' && step.params.variablesJson) {
            try {
                step.params.variables = JSON.parse(step.params.variablesJson);
            } catch (e) {
                ElMessage.error(`步骤 "${step.name}" 的变量 JSON 格式错误`);
                return;
            }
        }
    }

    rpaStore.updateTask(editingForm.value);
    isEditing.value = false;
    ElMessage.success(t('common.success'));
};

// Step Logic
const addStep = (type: string) => {
    const newStep: RpaStep = {
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        type: type as StepType,
        name: formatStepType(type, t),
        params: {}
    };

    // Init params based on step type
    if (type === 'shell') newStep.params = { command: '' };
    if (type === 'download_url') newStep.params = { url: '', fileName: '', hash: '' };
    if (type === 'download_cloud') newStep.params = { files: [], targetDir: '', executable: false };
    if (type === 'change_os_and_wait') newStep.params = {
        bs: 'wifi', androidVersion: '14', category: '391', version: '14', country: 'us',
        language: '', timezone: '', operator: '', operatorName: '',
        mcc: '', mnc: '', msisdn: '', smsc: '', randomMsisdn: false, randomSmsc: false, customParams: ''
    };
    if (type === 'set_proxy_and_wait') newStep.params = { proxySource: 'variable', s5Url: '', nOutSwID: 0 };
    if (type === 'set_location') newStep.params = { locationSource: 'direct', lat: 39.916527, lng: 116.397128, enableRandom: false, randomRange: 5 };
    if (type === 'install_app_and_wait') newStep.params = { appSource: 'cloud', url: '', fileName: '', sha256: '' };
    if (type === 'start_bot') newStep.params = { serverUrl: '', packageName: '', deviceName: '', maxRetries: 10 };
    if (type === 'run_script') newStep.params = { taskName: '', code: '', timeout: 60000 };
    if (type === 'http_request') newStep.params = { method: 'GET', url: '', headers: '', body: '', extractPath: '', outputVar: '' };
    if (type === 'custom_js') newStep.params = { code: '// Use context.variables.lastResult for previous output\n// context.variables.myVar = "value";\nreturn "done";' };
    if (type === 'get_root') newStep.params = { packageName: 'com.android.shell' };
    // 新增步骤类型
    if (type === 'execute_repo_script') newStep.params = { scriptId: null, timeout: null };
    if (type === 'set_variables') newStep.params = { variablesJson: '{\n  "key": "value"\n}' };
    if (type === 'condition_check') newStep.params = { variable: '', operator: 'eq', value: '', onTrue: 'continue', onFalse: 'stop_error', jumpStepTrue: 0, jumpStepFalse: 0 };

    editingForm.value.steps.push(newStep);
};

const removeStep = (index: number) => {
    editingForm.value.steps.splice(index, 1);
};

const moveStep = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < editingForm.value.steps.length) {
        const temp = editingForm.value.steps[index]!;
        editingForm.value.steps[index] = editingForm.value.steps[newIndex]!;
        editingForm.value.steps[newIndex] = temp;
    }
};

// S5 出口线路加载
const loadS5OutLines = async () => {
  s5OutLinesLoading.value = true;
  s5OutLinesError.value = '';
  try {
    // 找一个在线设备来获取线路（所有设备的线路是一样的）
    const onlineDevice = props.allDevices.find(d => d.deviceInfo?.online);
    const deviceId = onlineDevice?.deviceId || props.allDevices[0]?.deviceId;

    if (!deviceId) {
      s5OutLinesError.value = '没有可用设备';
      return;
    }

    const res = await backendApi.getS5outLine(deviceId);
    if (res && Array.isArray(res)) {
      s5OutLines.value = res;
      if (res.length === 0) {
        s5OutLinesError.value = '未找到出口线路（可能未配置CPE）';
      }
    } else {
      s5OutLinesError.value = '获取线路失败';
    }
  } catch (e: any) {
    s5OutLinesError.value = e.message || '获取线路失败';
  } finally {
    s5OutLinesLoading.value = false;
  }
};

// Cloud Logic
const cloudMultiSelect = ref(false);

const openCloudSelector = async (stepIndex: number) => {
  if (!sdkStore.apiKey) {
      ElMessage.warning(t('rpa.messages.sdkNotReady'));
      return;
  }
  currentStepIndexForCloud.value = stepIndex;
  cloudMultiSelect.value = false;
  cloudSelectorVisible.value = true;
  cloudLoading.value = true;
  try {
      const res = await backendApi.getCloudFiles({});
      cloudFiles.value = (res || []);
  } catch (e) {
      ElMessage.error(t('rpa.messages.loadCloudFilesFailed'));
  } finally {
      cloudLoading.value = false;
  }
};

const openCloudSelectorMulti = async (stepIndex: number) => {
  if (!sdkStore.apiKey) {
      ElMessage.warning(t('rpa.messages.sdkNotReady'));
      return;
  }
  currentStepIndexForCloud.value = stepIndex;
  cloudMultiSelect.value = true;
  cloudSelectorVisible.value = true;
  cloudLoading.value = true;
  try {
      const res = await backendApi.getCloudFiles({});
      cloudFiles.value = (res || []);
  } catch (e) {
      ElMessage.error(t('rpa.messages.loadCloudFilesFailed'));
  } finally {
      cloudLoading.value = false;
  }
};

const handleCloudFileSelect = (file: ListRes) => {
    if (currentStepIndexForCloud.value !== -1) {
        const step = editingForm.value.steps[currentStepIndexForCloud.value];
        if (step) {
            // 后端返回的数据包含 url 字段，但 ListRes 类型定义没有
            const fileWithUrl = file as ListRes & { url?: string };
            if (step.type === 'download_cloud') {
                // 单选模式（兼容旧数据）
                step.params.files = [{
                    fileName: file.fileName,
                    fileId: file.fileId,
                    url: fileWithUrl.url || '',
                    hash: file.hash
                }];
            } else if (step.type === 'install_app_and_wait') {
                step.params.fileName = file.fileName;
                step.params.url = fileWithUrl.url || '';
                step.params.sha256 = file.hash;
            }
        }
        cloudSelectorVisible.value = false;
        currentStepIndexForCloud.value = -1;
    }
};

const handleCloudFileSelectMulti = (files: ListRes[]) => {
    if (currentStepIndexForCloud.value !== -1) {
        const step = editingForm.value.steps[currentStepIndexForCloud.value];
        if (step && step.type === 'download_cloud') {
            step.params.files = files.map(f => {
                const fileWithUrl = f as ListRes & { url?: string };
                return {
                    fileName: f.fileName,
                    fileId: f.fileId,
                    url: fileWithUrl.url || '',
                    hash: f.hash
                };
            });
        }
        cloudSelectorVisible.value = false;
        currentStepIndexForCloud.value = -1;
    }
};

const formatCloudFiles = (files: any[]) => {
    if (!files || files.length === 0) return '';
    if (files.length === 1) return files[0].fileName;
    return `${files[0].fileName} 等 ${files.length} 个文件`;
};

// Execution Logic
const openRunDialog = () => {
    runDialogVisible.value = true;
};

const handleRun = async (devices: any[]) => {
    if (task.value) {
        await executeTask(task.value, devices);
    }
};

const runQuickTest = async () => {
    if (!currentTestDeviceId.value) {
        ElMessage.warning(t('rpa.selectTestDevice'));
        return;
    }
    const device = props.allDevices.find(d => d.deviceId === currentTestDeviceId.value);
    if (!device) {
        ElMessage.warning(t('rpa.messages.testDeviceNotFound'));
        return;
    }

    // 先自动保存当前编辑的流程
    if (!editingForm.value.name) {
        ElMessage.warning(t('rpa.messages.taskNameRequired'));
        return;
    }
    rpaStore.updateTask(editingForm.value);

    const rpaId = task.value?.id;
    if (!rpaId) {
        ElMessage.error('流程未保存，无法测试');
        return;
    }

    // 通过后端引擎执行（和设备列表启动任务走同一套）
    try {
        running.value = true;
        await backendApi.bindDeviceRpa(device.deviceId, rpaId, 'single');
        await backendApi.startDeviceRpa(device.deviceId);
        ElMessage.success(`已在设备 ${device.deviceId} 上启动测试`);
    } catch (e: any) {
        ElMessage.error('启动测试失败: ' + e.message);
    } finally {
        running.value = false;
    }
};

// Watch for task change to reset editing mode
watch(() => task.value?.id, () => {
    isEditing.value = false;
});

// 加载时区数据
const loadTimezones = async () => {
  try {
    const response = await fetch('/全球时区.xml');
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    const items = doc.querySelectorAll('timezone');
    timezoneList.value = Array.from(items).map(item => ({
      id: item.getAttribute('id') || '',
      countryCode: item.getAttribute('country_code') || '',
      displayName: item.getAttribute('display_name') || ''
    }));
  } catch (e) {
    console.error('加载时区数据失败', e);
  }
};

// 加载语言数据
const loadLanguages = async () => {
  try {
    const response = await fetch('/全球语言.xml');
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    const items = doc.querySelectorAll('item');
    languageList.value = Array.from(items).map(item => {
      const content = item.textContent || '';
      const [code, name] = content.split(' - ');
      // 从语言代码中提取国家代码（如 zh-CN -> cn）
      const parts = (code || '').split('-');
      const countryCode = parts.length > 1 ? parts[1]!.toLowerCase() : '';
      return { code: code || '', name: name || '', countryCode };
    });
  } catch (e) {
    console.error('加载语言数据失败', e);
  }
};

// 处理国家变更 - 自动填充相关字段
const handleCountryChange = (countryCode: string, step: RpaStep) => {
  // 过滤时区
  filteredTimezones.value = timezoneList.value.filter(t => t.countryCode === countryCode);
  // 过滤语言
  filteredLanguages.value = languageList.value.filter(l => l.countryCode.toLowerCase() === countryCode);
  // 过滤运营商
  filteredOperators.value = getOperatorsByCountry(countryCode);

  // 自动选择第一个时区
  if (filteredTimezones.value.length > 0) {
    step.params.timezone = filteredTimezones.value[0]!.id;
  }

  // 自动选择第一个语言
  if (filteredLanguages.value.length > 0) {
    step.params.language = filteredLanguages.value[0]!.code;
  } else {
    // 如果没有匹配的语言，尝试用国家代码匹配
    const fallbackLang = languageList.value.find(l => l.code.toLowerCase().includes(countryCode));
    if (fallbackLang) {
      step.params.language = fallbackLang.code;
    }
  }

  // 自动选择第一个运营商
  if (filteredOperators.value.length > 0) {
    const op = filteredOperators.value[0]!;
    step.params.operator = op.name;
    step.params.operatorName = op.name;
    step.params.mcc = op.mcc;
    step.params.mnc = op.mnc;
  }
};

// 处理运营商变更
const handleOperatorChange = (operatorName: string, step: RpaStep) => {
  const op = filteredOperators.value.find(o => o.name === operatorName);
  if (op) {
    step.params.mcc = op.mcc;
    step.params.mnc = op.mnc;
  }
};

// 处理安卓版本变更 - 自动设置 category 和 version
const handleAndroidVersionChange = (version: string, step: RpaStep) => {
  // 安卓版本对应的 category: 12->191, 13->291, 14->391, 15->491
  const categoryMap: Record<string, string> = {
    '12': '191',
    '13': '291',
    '14': '391',
    '15': '491'
  };
  step.params.category = categoryMap[version] || '491';
  step.params.version = version;
};

// 加载脚本仓库列表
const loadScriptList = async () => {
  try {
    const data = await backendApi.getScripts();
    scriptList.value = data || [];
  } catch (e) {
    console.error('Failed to load scripts', e);
  }
};

// 初始化加载数据
onMounted(() => {
  loadTimezones();
  loadLanguages();
  loadScriptList();
});
</script>

<style scoped lang="scss">
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 24px 40px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e5ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 20;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .editor-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .title-section {
      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .ios-title-input {
        font-size: 28px;
        font-weight: 700;
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        color: #000;
        &::placeholder { color: #c7c7cc; }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .ios-select-device {
      :deep(.el-input__wrapper) {
        background-color: rgba(118, 118, 128, 0.12) !important;
        border-radius: 8px;
        box-shadow: none !important;
        
        &.is-focus {
            background-color: rgba(118, 118, 128, 0.2) !important;
        }
      }
    }
    
    .ios-icon-btn {
       font-size: 20px;
       border: none;
       background: rgba(118, 118, 128, 0.12);
       color: #007aff;
       width: 40px;
       height: 40px;
       
       &:hover {
         background: rgba(118, 118, 128, 0.2);
       }
    }

    .ios-nav-btn {
      font-size: 17px;
      font-weight: 400;
      color: #007aff;
      
      &.done {
        font-weight: 600;
      }
    }
  }
}

.editor-body {
  flex: 1;
  background-color: #f2f2f7;
}

.steps-flow {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 100px;
  
  &.editing-mode {
    .action-block {
      border: 1px dashed #d1d1d6;
      box-shadow: none;
      
      &:hover {
        border-color: #007aff;
      }
    }
  }
}

.action-block {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.2s;
  
  .action-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-left: 6px solid transparent;
    background: #fff;
    position: relative;
    
    .status-indicator {
        position: absolute;
        left: -20px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.running { color: #007aff; }
        &.success { color: #34c759; }
        &.error { color: #ff3b30; }
        
        .is-loading { animation: rotate 1s linear infinite; }
    }
    
    .action-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin-right: 16px;
    }
    
    .action-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .action-type {
        font-size: 12px;
        text-transform: uppercase;
        color: #8e8e93;
        font-weight: 600;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }
      
      .action-name-display {
        font-size: 17px;
        font-weight: 600;
        color: #000;
      }
      
      .action-name-input {
        font-size: 17px;
        font-weight: 600;
        border: none;
        outline: none;
        width: 100%;
        padding: 0;
        margin: 0;
        &::placeholder { color: #c7c7cc; }
      }
    }
    
    .action-controls {
       display: flex;
       gap: 4px;
    }
  }
  
  .action-content {
    padding: 0 20px 20px 20px;
    animation: slideDown 0.3s;
    
    .ios-field {
      margin-bottom: 16px;
      
      label {
        display: block;
        font-size: 13px;
        color: #8e8e93;
        margin-bottom: 6px;
        font-weight: 500;
      }
      
      :deep(.el-input__wrapper), :deep(.el-textarea__inner) {
        background-color: #f2f2f7;
        border-radius: 10px;
        box-shadow: none !important;
        padding: 8px 12px;
        
        &.is-focus {
            background-color: #e5e5ea;
        }
      }
      
      &.has-button {
        .input-wrapper {
          display: flex;
          gap: 10px;
        }
      }
      
      &.code-field {
        :deep(.el-textarea__inner) {
          font-family: monospace;
          font-size: 13px;
          line-height: 1.4;
          background-color: #1c1c1e;
          color: #fff;
        }
      }
    }
    
    .field-row {
      display: flex;
      gap: 16px;
      .half { flex: 1; }
      .quarter { flex: 1; }
      .three-quarter { flex: 3; }
    }
    
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }
}

.add-action-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  .ios-search-btn {
    background: #007aff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,122,255,0.3);
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.execution-result {
  background: #1c1c1e;
  padding: 10px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-family: monospace;
  font-size: 13px;
  
  .result-error { color: #ff453a; }
  .result-success { color: #32d74b; display: flex; gap: 8px; }
  .var-badge { color: #0a84ff; font-weight: bold; }
  .result-value { color: #fff; }
}

.empty-state-ios {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
  
  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    color: #d1d1d6;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #000;
  }
  
  p {
    font-size: 15px;
    max-width: 300px;
    text-align: center;
    line-height: 1.4;
  }
}

@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.ios-hint {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 6px;
  line-height: 1.5;

  p {
    margin: 0 0 2px 0;
  }
}

.sim-section {
  margin: 16px 0;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;

  .section-title {
    font-size: 13px;
    font-weight: 500;
    color: #606266;
    margin-bottom: 12px;
  }
}

.flex-grow {
  flex: 1;
}

.checkbox-field {
  display: flex;
  align-items: flex-end;
  padding-bottom: 8px;
  min-width: 70px;
}
</style>
