
import { RPAClient, AndroidClient } from 'jpy-cloud-sdk';
import WebSocket from 'ws';

// Polyfill WebSocket for Node.js environment if not handled by isomorphic-ws automatically in some contexts
// or just to be safe as global.WebSocket might be needed by some libs
if (!global.WebSocket) {
    global.WebSocket = WebSocket;
}

const WS_URL = 'ws://127.0.0.1:9009/ws';

async function main() {
    console.log(`[Demo] Connecting to ${WS_URL}...`);

    const rpaClient = new RPAClient(WS_URL);
    
    // Setup connection callbacks
    await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Connection timeout')), 5000);

        const originalOnConnect = rpaClient.onConnect;
        rpaClient.onConnect = () => {
            clearTimeout(timer);
            console.log('[Demo] Connected successfully!');
            if (originalOnConnect) originalOnConnect.call(rpaClient);
            resolve();
        };

        rpaClient.onClose = () => {
            console.log('[Demo] Connection closed.');
        };
        
        // Override log to see SDK logs
        rpaClient.log = (msg) => {
            // Uncomment to see verbose SDK logs
            // console.log('[SDK]', msg);
        };

        rpaClient.start();
    });

    const androidClient = new AndroidClient(rpaClient);

    try {
        // 1. Grant Root (Optional but recommended for automation)
        console.log('[Demo] Granting root permission...');
        await androidClient.device.rootGrant("com.android.shell");
        console.log('[Demo] Root granted (or skipped).');

        // 2. Enable ADB Wifi
        console.log('[Demo] Enabling ADB Wifi...');
        await androidClient.device.enableAdbWifi();
        console.log('[Demo] ADB Wifi command sent.');

        // 3. Take Screenshot
        console.log('[Demo] Taking screenshot...');
        const screenshotRes = await androidClient.screen.screenshot({ width: 540, quality: 50 });
        if (screenshotRes && screenshotRes.data) {
             console.log(`[Demo] Screenshot received: ${screenshotRes.data.length} bytes`);
        } else {
             console.log('[Demo] Screenshot returned no data (possibly failed or not supported).');
        }
        
        // 4. Get device info (Example of another command)
        // Note: AndroidDeviceModule might not have getInfo exposed directly in the simplified SDK yet, 
        // let's check what's available. Based on previous reads, we have enableAdbWifi.
        
    } catch (error) {
        console.error('[Demo] Error during operations:', error);
    } finally {
        console.log('[Demo] Closing connection...');
        rpaClient.Close();
        // Give it a moment to close
        setTimeout(() => process.exit(0), 500);
    }
}

main().catch(err => {
    console.error('[Demo] Fatal Error:', err);
    process.exit(1);
});
