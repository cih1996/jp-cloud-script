/**
 * RPA任务执行组合式函数
 * 用于管理RPA任务的执行状态和日志
 * Date: 2026-2-1
 * Author: Cih1996
 */
import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdkStore';
import { localService } from '@/api/localService';
import { backendApi } from '@/api/backendApi';
import type { RpaTask, RpaStep } from '@/stores/rpaStore';

interface ExecutionContext {
    variables: Record<string, any>;
    deviceId: number;
    log: (msg: string, type?: 'info' | 'error' | 'success') => void;
}

export const useRpaExecution = () => {
    const sdkStore = useSdkStore();
    const running = ref(false);
    const executionLogs = ref<{type: string, msg: string}[]>([]);
    const stepExecutionState = ref<Record<string, { status: 'pending'|'running'|'success'|'error', result?: any, error?: string, outputVar?: string }>>({});

    const logExecution = (msg: string, type: 'info'|'error'|'success' = 'info') => {
        executionLogs.value.push({ type, msg: `[${new Date().toLocaleTimeString()}] ${msg}` });
    };

    const interpolate = (str: string, context: ExecutionContext): string => {
        if (!str) return '';
        return str.replace(/\$\{([^}]+)\}/g, (_, key) => {
            const keys = key.split('.');
            let val = context.variables;
            for (const k of keys) {
                if (val === undefined || val === null) break;
                val = val[k];
            }
            return val !== undefined ? String(val) : '';
        });
    };

    const resolveParams = (params: any, context: ExecutionContext): any => {
        const resolved: any = {};
        for (const key in params) {
            if (typeof params[key] === 'string') {
                resolved[key] = interpolate(params[key], context);
            } else {
                resolved[key] = params[key];
            }
        }
        return resolved;
    };

    const httpHelper = {
        request: async (method: string, url: string, headers: any, body: any) => {
            const opts: RequestInit = { method, headers };
            if (body && (method === 'POST' || method === 'PUT')) {
                opts.body = typeof body === 'string' ? body : JSON.stringify(body);
            }
            const res = await fetch(url, opts);
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        },
        get: (url: string, headers: any) => httpHelper.request('GET', url, headers, null),
        post: (url: string, body: any, headers: any) => httpHelper.request('POST', url, headers, body)
    };

    const runShellCommand = async (deviceId: number, command: string) => {
        if (!sdkStore.apiKey) throw new Error('No API Key');
        return await localService.callMiddle({
            key: sdkStore.apiKey,
            deviceId: deviceId,
            data: {
                f: 289,
                req: true,
                seq: Math.floor(Date.now() / 1000),
                data: { shell: command }
            }
        });
    };

    const runDownloadUrl = async (deviceId: number, url: string, name: string, sha256: string) => {
        if (!sdkStore.apiKey) throw new Error('No API Key');
        await localService.callMiddle({
            key: sdkStore.apiKey,
            deviceId: deviceId,
            data: {
                f: 293,
                req: true,
                seq: Math.floor(Date.now() / 1000),
                data: {
                    url,
                    name,
                    install: true,
                    receive: true,
                    sha256: sha256 || ''
                }
            }
        });
    };

    const runChangeOs = async (deviceId: number, params: any) => {
        if (!sdkStore.apiKey) throw new Error('Not logged in');
        await backendApi.changePhones([{
            deviceId: deviceId,
            ...params
        }]);
    };

    const runHttpRequest = async (_step: RpaStep, resolvedParams: any, _context: ExecutionContext) => {
        let headers = {};
        try {
            if (resolvedParams.headers) headers = JSON.parse(resolvedParams.headers);
        } catch { console.warn('Invalid headers JSON'); }

        const body = resolvedParams.body;
        const res = await httpHelper.request(resolvedParams.method, resolvedParams.url, headers, body);
        
        let result = res;
        if (resolvedParams.extractPath) {
            const parts = resolvedParams.extractPath.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
            for (const part of parts) {
                if (result === undefined || result === null) break;
                result = result[part];
            }
        }
        return result;
    };

    const runCustomJs = async (code: string, context: ExecutionContext, device: any) => {
        try {
            // eslint-disable-next-line no-new-func
            const func = new Function('context', 'api', 'http', 'device', `return (async () => { ${code} })()`);
            return await func(context, backendApi, httpHelper, device);
        } catch (e: any) {
            throw new Error(`Script error: ${e.message}`);
        }
    };

    const executeStep = async (step: RpaStep, context: ExecutionContext, device: any) => {
        context.log(`Running step: ${step.name}`);
        const resolvedParams = resolveParams(step.params, context);
        let result: any = null;
    
        if (step.type === 'shell') {
            result = await runShellCommand(context.deviceId, resolvedParams.command);
        } else if (step.type === 'download_url') {
            result = await runDownloadUrl(context.deviceId, resolvedParams.url, resolvedParams.fileName, resolvedParams.hash);
        } else if (step.type === 'download_cloud') {
             // Cloud files already have URL in the response
             if (!step.params.url) throw new Error('Cloud file URL not available');
             result = await runDownloadUrl(context.deviceId, step.params.url, step.params.fileName, step.params.hash);
        } else if (step.type === 'change_os_and_wait') {
            result = await runChangeOs(context.deviceId, resolvedParams);
        } else if (step.type === 'http_request') {
            result = await runHttpRequest(step, resolvedParams, context);
        } else if (step.type === 'custom_js') {
            result = await runCustomJs(step.params.code, context, device);
        }
        
        return result;
    };

    const executeTask = async (task: RpaTask, devices: any[]) => {
        if (!task || devices.length === 0) return;
        
        running.value = true;
        logExecution(`Starting task "${task.name}" on ${devices.length} devices...`);
        
        task.steps.forEach(s => {
            stepExecutionState.value[s.id] = { status: 'pending' };
        });
    
        let successCount = 0;
        let failCount = 0;
    
        const visualDeviceId = devices[0].deviceId;
    
        const promises = devices.map(async (device) => {
             const context: ExecutionContext = {
                 deviceId: device.deviceId,
                 variables: {},
                 log: (msg) => logExecution(`[Device ${device.deviceId}] ${msg}`)
             };
    
             try {
                 for (const step of task.steps) {
                     if (device.deviceId === visualDeviceId) {
                         stepExecutionState.value[step.id] = { status: 'running' };
                     }
    
                     try {
                        const result = await executeStep(step, context, device);
                        
                        context.variables['lastResult'] = result;
                        if (step.params.outputVar) {
                            context.variables[step.params.outputVar] = result;
                            context.log(`Set variable ${step.params.outputVar} = ${typeof result === 'object' ? JSON.stringify(result).slice(0, 50) + '...' : result}`);
                        }
    
                        if (device.deviceId === visualDeviceId) {
                            stepExecutionState.value[step.id] = { 
                                status: 'success', 
                                result: result,
                                outputVar: step.params.outputVar
                            };
                        }
                     } catch (stepError: any) {
                         if (device.deviceId === visualDeviceId) {
                             stepExecutionState.value[step.id] = { 
                                 status: 'error', 
                                 error: stepError.message 
                             };
                         }
                         throw stepError;
                     }
                 }
                 successCount++;
                 context.log('Task completed successfully', 'success');
             } catch (e: any) {
                 context.log(`Failed: ${e.message}`, 'error');
                 failCount++;
             }
        });
    
        await Promise.all(promises);
        
        logExecution(`Execution finished: ${successCount} success, ${failCount} failed`, 'info');
        running.value = false;
    };

    return {
        running,
        executionLogs,
        stepExecutionState,
        executeTask
    };
};
