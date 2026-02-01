import { ref } from 'vue';
import { useSdkStore } from '@/stores/sdkStore';
import { localService } from '@/api/localService';
import { RPAClient, AndroidClient } from '@sdk/index';
import { ElMessage, ElNotification } from 'element-plus';
import { useI18n } from 'vue-i18n';

// Singleton State
const activeDeviceId = ref<number | null>(null);
const isConnecting = ref(false);
const connectionStatus = ref('');
const deviceMappings = ref<Record<number, number[]>>({}); // deviceId -> [ports]

let rpaClient: RPAClient | null = null;
let androidClient: AndroidClient | null = null;

export function useDeviceTunnel() {
    const sdkStore = useSdkStore();
    const { t } = useI18n();

    const checkActiveTunnels = async () => {
        try {
            const res = await localService.getMappings();
            const mappings = res.mappings || [];
            
            const newDeviceMappings: Record<number, number[]> = {};
            
            mappings.forEach((m: any) => {
                if (!newDeviceMappings[m.deviceId]) {
                    newDeviceMappings[m.deviceId] = [];
                }
                newDeviceMappings[m.deviceId]!.push(m.localPort);
            });
            
            deviceMappings.value = newDeviceMappings;
            
            // Restore activeDeviceId if we find a device with 9009 or 5555
            // Prefer one that has both or at least 9009
            let foundActive = null;
            for (const devIdStr in newDeviceMappings) {
                const devId = parseInt(devIdStr);
                const ports = newDeviceMappings[devId];
                if (ports && (ports.includes(9009) || ports.includes(5555))) {
                    foundActive = devId;
                    break; 
                }
            }
            
            if (foundActive && activeDeviceId.value === null) {
                activeDeviceId.value = foundActive;
                connectionStatus.value = t('tunnel.restored');
            } else if (!foundActive && activeDeviceId.value !== null) {
                // If backend says no mappings but frontend thinks active, clear it?
                // Maybe not, in case of sync delay, but generally yes.
                // activeDeviceId.value = null; 
            }
            
        } catch (e) {
            console.error("Failed to sync mappings", e);
        }
    };

    const stopTunnel = async () => {
        try {
            if (rpaClient) {
                rpaClient.Close();
                rpaClient = null;
                androidClient = null;
            }
            // Disconnect both potential ports
            if (sdkStore.apiKey) {
                await localService.disconnect({
                    key: sdkStore.apiKey,
                    localPort: 9009
                }).catch(() => {});
                
                await localService.disconnect({
                    key: sdkStore.apiKey,
                    localPort: 5555
                }).catch(() => {});
            }
            activeDeviceId.value = null;
            connectionStatus.value = '';
            await checkActiveTunnels(); // Refresh mappings
        } catch (e) {
            console.error("Stop tunnel error", e);
        }
    };

    const startTunnel = async (device: any) => {
        if (isConnecting.value) return;
        
        // If clicking the same device, maybe toggle off? 
        // For now, let's assume it restarts or we explicitly stop first.
        if (activeDeviceId.value === device.deviceId) {
             await stopTunnel();
             return; 
        }

        // If another device is active, stop it
        if (activeDeviceId.value !== null) {
             await stopTunnel();
        }

        isConnecting.value = true;
        activeDeviceId.value = device.deviceId;
        connectionStatus.value = t('tunnel.initializing');

        const log = (msg: string) => {
            console.log(`[Tunnel] ${msg}`);
            connectionStatus.value = msg;
        };

        try {
            if (!sdkStore.apiKey) throw new Error(t('tunnel.apiKeyMissing'));

            // 1. Map 9009
            log(t('tunnel.step1'));
            const res9009 = await localService.connect({
                key: sdkStore.apiKey,
                deviceId: device.deviceId,
                tbYunJiUserDeviceId: device.tbYunJiUserDeviceId || 0,
                localPort: 9009,
                phonePort: 9009
            });
            
            if (!res9009.success) throw new Error(res9009.message || t('tunnel.mappingFailed', { port: 9009 }));

            // 2. Connect WS
            log(t('tunnel.step2'));
            await new Promise(r => setTimeout(r, 1500)); // Wait for mapping

            const wsUrl = 'ws://127.0.0.1:9009/ws';
            
            await new Promise<void>((resolve, reject) => {
                if (rpaClient) rpaClient.Close();
                rpaClient = new RPAClient(wsUrl);
                androidClient = new AndroidClient(rpaClient);
                
                let resolved = false;
                // Hooking into internal socket callback or just waiting for start?
                // The RPAClient I copied has onConnect.
                
                // We need to override the instance's onConnect
                const originalOnConnect = rpaClient.onConnect;
                rpaClient.onConnect = () => {
                    if (originalOnConnect) originalOnConnect.call(rpaClient!);
                    if (resolved) return;
                    resolved = true;
                    resolve();
                };
                
                setTimeout(() => {
                    if (!resolved) {
                        rpaClient?.Close();
                        reject(new Error(t('tunnel.wsTimeout')));
                    }
                }, 10000);
                
                try {
                    rpaClient.start();
                } catch(e) {
                    reject(e);
                }
            });

            log(t('tunnel.step3'));
            if (!androidClient) throw new Error(t('tunnel.androidClientNull'));
            
            try {
                await androidClient.device.rootGrant("com.android.shell");
                await new Promise(r => setTimeout(r, 500));
            } catch(e) { 
                console.warn("Root grant failed/ignored", e);
            }

            await androidClient.device.enableAdbWifi();
            
            log(t('tunnel.step4'));
            await new Promise(r => setTimeout(r, 3000));

            // 4. Map 5555
            log(t('tunnel.step5'));
             const res5555 = await localService.connect({
                key: sdkStore.apiKey,
                deviceId: device.deviceId,
                tbYunJiUserDeviceId: device.tbYunJiUserDeviceId || 0,
                localPort: 5555,
                phonePort: 5555
            });
            
            if (!res5555.success) throw new Error(res5555.message || t('tunnel.mappingFailed', { port: 5555 }));

            log(t('tunnel.ready'));
            ElNotification.success({
                title: t('tunnel.established'),
                message: t('tunnel.establishedMsg', { deviceId: device.deviceId }),
                duration: 5000
            });

        } catch (e: any) {
            console.error(e);
            ElMessage.error(t('tunnel.failed', { message: e.message }));
            // Cleanup on failure
            await stopTunnel();
        } finally {
            isConnecting.value = false;
        }
    };

    return {
        startTunnel,
        stopTunnel,
        checkActiveTunnels,
        isConnecting,
        activeDeviceId,
        connectionStatus,
        deviceMappings
    };
}
