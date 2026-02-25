const BASE_URL = 'http://127.0.0.1:1001';

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
    async callMiddle(params: MiddleParams): Promise<any> {
        const res = await fetch(`${BASE_URL}/api/middle`, {
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
            const res = await fetch(`${BASE_URL}/api/mappings`, {
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
        const res = await fetch(`${BASE_URL}/api/mappings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async connect(params: ConnectParams) {
        const res = await fetch(`${BASE_URL}/api/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async disconnect(params: DisconnectParams) {
        const res = await fetch(`${BASE_URL}/api/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async callUnified(data: any): Promise<any> {
        const res = await fetch(`${BASE_URL}/api/unified`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
    },

    async updateConfig(wsUrl: string) {
        try {
            const res = await fetch(`${BASE_URL}/api/config/update`, {
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
