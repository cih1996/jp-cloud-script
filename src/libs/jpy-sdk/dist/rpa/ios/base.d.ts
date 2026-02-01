import { RPAClient } from '../rpaClient.js';
export declare class BaseIOSModule {
    protected connection: RPAClient;
    constructor(connection: RPAClient);
    protected get deviceId(): number;
}
