"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioaServerSDK = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = require("url");
const httpAgent = new http_1.default.Agent({ keepAlive: true });
const httpsAgent = new https_1.default.Agent({ keepAlive: true });
//
class ioaServerSDKCore {
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
        Object.defineProperty(this, "ioaKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
    }
    //
    init(projectId, ioaKey, analyticsURL = 'https://ioanalytics.dev') {
        this.projectId = projectId;
        this.analyticsURL = analyticsURL;
        this.ioaKey = ioaKey;
    }
    ;
    makeRequest(endpoint, payload) {
        const fullUrl = this.analyticsURL + endpoint;
        const url = new url_1.URL(fullUrl);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https_1.default : http_1.default;
        const agent = isHttps ? httpsAgent : httpAgent;
        const opts = {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: 'POST',
            agent,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };
        const req = httpModule.request(opts, res => {
            res.on('data', () => { });
            res.on('end', () => { });
        });
        req.setTimeout(5000, () => req.destroy());
        req.on('error', () => {
            req.destroy();
        });
        req.on('timeout', () => req.abort());
        req.on('error', () => { });
        req.write(payload);
        req.end();
    }
    ;
    newEvent(type, name, params = {}) {
        const payload = JSON.stringify({
            projectId: this.projectId,
            key: this.ioaKey,
            name,
            type,
            params
        });
        this.makeRequest('/api/stats/server-event', payload);
    }
    ;
    newError(type, message) {
        const payload = JSON.stringify({
            projectId: this.projectId,
            key: this.ioaKey,
            type,
            message
        });
        this.makeRequest('/api/stats/server-error', payload);
    }
    ;
}
;
//
exports.ioaServerSDK = new ioaServerSDKCore();
//# sourceMappingURL=ioa-server-sdk.js.map