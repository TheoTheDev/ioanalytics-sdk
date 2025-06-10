"use strict";
// util functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioaClientSDK = void 0;
const generateUid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
const detectBrowser = () => {
    const ua = navigator.userAgent;
    if (/Edge\/\d+/.test(ua))
        return 'Microsoft Edge';
    if (/OPR\/\d+/.test(ua))
        return 'Opera';
    if (/CriOS\/\d+/.test(ua))
        return 'Chrome'; // Chrome on iOS
    if (/Chrome\/\d+/.test(ua))
        return 'Chrome'; // Chrome on other platforms
    if (/Safari\/\d+/.test(ua))
        return 'Safari';
    if (/Firefox\/\d+/.test(ua))
        return 'Firefox';
    if (/MSIE \d+/.test(ua) || /Trident\/\d+/.test(ua))
        return 'Internet Explorer';
    return 'Unknown';
};
const detectOS = () => {
    const platform = navigator.platform.toLowerCase();
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua))
        return 'Android';
    if (/iphone|ipad|ipod/.test(ua))
        return 'iOS';
    if (platform.includes('win'))
        return 'Windows';
    if (platform.includes('mac'))
        return 'macOS';
    if (platform.includes('linux') && !(/android/.test(ua)))
        return 'Linux';
    return 'Unknown';
};
;
;
;
;
;
;
// SDK core
class ioaClientSDKCore {
    //
    constructor() {
        Object.defineProperty(this, "analyticsURL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "projectId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "user", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                uid: '',
                state: '',
                sessionId: ''
            }
        });
        Object.defineProperty(this, "device", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                os: '',
                resolution: '',
                pixelRatio: 0,
                browser: ''
            }
        });
        Object.defineProperty(this, "performance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                stages: [],
                loadTime: 0,
                matchmakingTime: 0,
                avgPing: 0,
                maxPing: 0
            }
        });
        Object.defineProperty(this, "eventsQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "errorsQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "updateIntervalId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "updateIntervalDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2000
        });
        Object.defineProperty(this, "lastPingTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "pingDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 30000
        });
        //
        Object.defineProperty(this, "update", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (this.eventsQueue.length > 0 || this.errorsQueue.length > 0) {
                    this.sendData();
                }
                if (this.lastPingTime + this.pingDelay < Date.now()) {
                    this.sendPingData();
                    this.lastPingTime = Date.now();
                }
            }
        });
        Object.defineProperty(this, "sendInitialData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                fetch(this.analyticsURL + '/api/stats/start', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid: this.user.uid,
                        projectId: this.projectId,
                        device: this.device
                    })
                }).then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        this.user.sessionId = data.sessionId;
                    }
                });
            }
        });
        Object.defineProperty(this, "sendData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                fetch(this.analyticsURL + '/api/stats/collect', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid: this.user.uid,
                        sessionId: this.user.sessionId,
                        events: this.eventsQueue,
                        errors: this.errorsQueue,
                        projectId: this.projectId
                    })
                });
                this.eventsQueue = [];
                this.errorsQueue = [];
            }
        });
        Object.defineProperty(this, "sendPingData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                fetch(this.analyticsURL + '/api/stats/ping', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uid: this.user.uid,
                        sessionId: this.user.sessionId,
                        performance: this.performance,
                        state: this.user.state,
                        projectId: this.projectId
                    })
                });
            }
        });
        Object.defineProperty(this, "beforeUnload", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                fetch(`${this.analyticsURL}/api/stats/end?uid=${this.user.uid}&sessionId=${this.user.sessionId}&playerLeftState=${this.user.state}&projectId=${this.projectId}`, {
                    method: 'GET'
                });
            }
        });
        const uid = localStorage.getItem('nwa-uid');
        if (!uid) {
            this.user.uid = generateUid();
            localStorage.setItem('nwa-uid', this.user.uid);
        }
        else {
            this.user.uid = uid;
        }
        //
        window.addEventListener('beforeunload', this.beforeUnload);
    }
    ;
    init(projectId, analyticsURL = 'https://ioanalytics.dev') {
        this.projectId = projectId;
        this.analyticsURL = analyticsURL;
        this.lastPingTime = Date.now();
        this.detectDevice();
        this.updateIntervalId = setInterval(this.update, this.updateIntervalDuration);
        this.sendInitialData();
    }
    ;
    setFPS(stageName, avgFps, lowFps) {
        const stage = this.performance.stages.find((stage) => stage.name === stageName);
        if (stage) {
            stage.avgFps = avgFps;
            stage.minFps = lowFps;
        }
        else {
            this.performance.stages.push({
                name: stageName,
                avgFps: avgFps,
                minFps: lowFps
            });
        }
    }
    ;
    setState(state) {
        this.user.state = state;
    }
    ;
    newEvent(type, event) {
        this.eventsQueue.push({
            type: type,
            event: event,
            date: new Date()
        });
    }
    ;
    newError(type, error) {
        this.errorsQueue.push({
            type: type,
            error: error,
            date: new Date()
        });
    }
    ;
    detectDevice() {
        const browser = detectBrowser();
        const os = detectOS();
        this.device.browser = `${browser} (${os})`;
        this.device.os = detectOS();
        this.device.resolution = `${window.innerWidth}x${window.innerHeight}`;
        this.device.pixelRatio = window.devicePixelRatio;
    }
    ;
    dispose() {
        clearInterval(this.updateIntervalId);
        this.updateIntervalId = null;
        this.eventsQueue = [];
        this.errorsQueue = [];
        this.performance = {
            stages: [],
            loadTime: 0,
            matchmakingTime: 0,
            avgPing: 0,
            maxPing: 0
        };
        this.device = {
            os: '',
            resolution: '',
            pixelRatio: 0,
            browser: ''
        };
    }
    ;
}
;
exports.ioaClientSDK = new ioaClientSDKCore();
//# sourceMappingURL=ioa-client-sdk.js.map