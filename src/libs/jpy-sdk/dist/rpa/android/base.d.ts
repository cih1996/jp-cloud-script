import { RPAClient } from '../rpaClient.js';
export declare class BaseAndroidModule {
    protected connection: RPAClient;
    constructor(connection: RPAClient);
    protected get deviceId(): number;
}
