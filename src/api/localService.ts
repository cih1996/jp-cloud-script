// 动态获取后端地址：根据当前网页 HOST，端口固定 1001
const getBaseUrl = () => {
    const host = window.location.hostname || '127.0.0.1'
    return `http://${host}:1001`
}

export interface ConnectParams {
    key: string;
    deviceId: number;
    tbYunJiUserDeviceId: number;
    localPort: number;
    phonePort: number;
}

export interface DisconnectParams {
    key: string;
    localPort: number;
}

export interface MiddleParams {
    key: string;
    deviceId: number;
    data: any;
}

export const localService = {
    getBaseUrl,

    async callMiddle(params: MiddleParams): Promise<any> {
        const res = await fetch(`${getBaseUrl()}/api/middle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async checkHealth(): Promise<boolean> {
        try {
            // Using /api/mappings as a lightweight check
            const res = await fetch(`${getBaseUrl()}/api/mappings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'check' })
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    },

    async getMappings(): Promise<{ mappings: any[] }> {
        const res = await fetch(`${getBaseUrl()}/api/mappings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async connect(params: ConnectParams) {
        const res = await fetch(`${getBaseUrl()}/api/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async disconnect(params: DisconnectParams) {
        const res = await fetch(`${getBaseUrl()}/api/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async callUnified(data: any): Promise<any> {
        const res = await fetch(`${getBaseUrl()}/api/unified`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async updateConfig(wsUrl: string) {
        try {
            const res = await fetch(`${getBaseUrl()}/api/config/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wsUrl })
            });
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn('Failed to update local service config:', e);
            // Non-blocking failure, as local service might not be running
            return null;
        }
    }
};
