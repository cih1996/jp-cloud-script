export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
/**
 * Abstract Connection Class
 */
export class Conn {
    constructor() {
        this.isClosed = false;
        this.isOpen = false;
        this.readDeadline = -1;
        this.writeDeadline = -1;
        this.closeEventListener = [];
        this.openEventListener = [];
        this.maxBufferSize = 100 * 1024 * 1024; // 100MB
        this.messageQueue = Promise.resolve();
        this.sendBufQueue = Promise.resolve();
        this._onData = (arrayBuffer) => {
            if (this.readBuffer.length + arrayBuffer.length > this.maxBufferSize) {
                console.error("Buffer full");
                this.close();
                throw new Error("Buffer full");
            }
            this.messageQueue = this.messageQueue.then(async () => {
                const newBuf = new Uint8Array(this.readBuffer.length + arrayBuffer.length);
                newBuf.set(this.readBuffer);
                newBuf.set(arrayBuffer, this.readBuffer.length);
                this.readBuffer = newBuf;
                if (this.readResolve) {
                    this.readResolve();
                }
            });
        };
        this.readBuffer = new Uint8Array(0);
        this.isClosed = false;
        this.readLock = false;
        this.readResolve = null;
    }
    open() {
        this.isOpen = true;
        for (const listener of this.openEventListener) {
            listener();
        }
    }
    addOpenEventListener(listener) {
        this.openEventListener.push(listener);
    }
    addCloseEventListener(listener) {
        this.closeEventListener.push(listener);
    }
    read(readBuf) {
        if (this.isClosed) {
            throw new Error("Connection closed");
        }
        if (this.readLock) {
            throw new Error("Concurrent read not allowed");
        }
        this.readLock = true;
        return new Promise((resolve, reject) => {
            if (this.readBuffer.length > 0) {
                const copyLength = Math.min(readBuf.length, this.readBuffer.length);
                readBuf.set(this.readBuffer.subarray(0, copyLength));
                this.readBuffer = this.readBuffer.subarray(copyLength);
                this.readLock = false;
                resolve(copyLength);
                return;
            }
            let timeoutId; // Node.js timeout type
            if (this.readDeadline > 0) {
                timeoutId = setTimeout(() => {
                    console.error("Read timeout");
                    this.close();
                    reject(new Error("Read timeout"));
                }, this.readDeadline);
            }
            this.readResolve = () => {
                this.readResolve = null;
                if (timeoutId)
                    clearTimeout(timeoutId);
                const copyLength = Math.min(readBuf.length, this.readBuffer.length);
                readBuf.set(this.readBuffer.subarray(0, copyLength));
                this.readBuffer = this.readBuffer.subarray(copyLength);
                this.readLock = false;
                resolve(copyLength);
            };
        });
    }
    async readFull(readBuf) {
        let offset = 0;
        while (offset < readBuf.length) {
            const n = await this.read(readBuf.subarray(offset));
            if (n === 0) {
                throw new Error("Unexpected EOF");
            }
            offset += n;
        }
    }
    write(buf) {
        if (this.isClosed) {
            throw new Error("Connection closed");
        }
        this._writeQueue(buf).then(r => { });
        return buf.length;
    }
    _writeQueue(buf) {
        this.sendBufQueue = this.sendBufQueue.then(async () => {
            while (!this.isOpen) {
                if (this.isClosed) {
                    throw new Error("Connection closed during send");
                }
                await sleep(10);
            }
            let offset = 0;
            while (offset < buf.length) {
                while (this.getBufferedAmount() > 500 * 1024) {
                    if (this.isClosed) {
                        return;
                    }
                    await sleep(0);
                }
                const chunkSize = Math.min(50 * 1024, buf.length - offset);
                const chunk = buf.subarray(offset, offset + chunkSize);
                try {
                    this._write(chunk);
                }
                catch (err) {
                    console.warn("Send error", err);
                    this.close();
                }
                offset += chunkSize;
            }
        });
        return this.sendBufQueue;
    }
    close() {
        if (this.isClosed)
            return;
        this.isClosed = true;
        this.isOpen = false;
        this._close();
        for (const listener of this.closeEventListener) {
            listener();
        }
    }
    getBufferedAmount() {
        return this._getBufferedAmount();
    }
    localAddr() {
        return this._localAddr();
    }
    remoteAddr() {
        return this._remoteAddr();
    }
}
