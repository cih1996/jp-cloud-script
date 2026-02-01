export class BaseAndroidModule {
    constructor(connection) {
        this.connection = connection;
    }
    get deviceId() {
        // Assuming single device connection for now, defaulting to 0
        return 0;
    }
}
