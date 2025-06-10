"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioaServerSDK = void 0;
const request_1 = __importDefault(require("request"));
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
    newEvent(type, name, params) {
        (0, request_1.default)({
            url: this.analyticsURL + '/api/stats/server-event',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            json: {
                projectId: this.projectId,
                key: this.ioaKey,
                name: name,
                type: type,
                params: params
            }
        }, () => {
            // nothing to do here
        });
    }
    ;
    newError(type, message) {
        (0, request_1.default)({
            url: this.analyticsURL + '/api/stats/server-error',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            json: {
                projectId: this.projectId,
                key: this.ioaKey,
                type: type,
                message: message
            }
        }, () => {
            // nothing to do here
        });
    }
    ;
}
;
//
exports.ioaServerSDK = new ioaServerSDKCore();
//# sourceMappingURL=ioa-server-sdk.js.map