export type ErrorType = 'critical' | 'major' | 'minor' | 'warning';
declare class ioaServerSDKCore {
    private analyticsURL;
    private projectId;
    private ioaKey;
    init(projectId: string, ioaKey: string, analyticsURL?: string): void;
    newEvent(type: string, name: string, params: any): void;
    newError(type: ErrorType, message: string): void;
}
export declare const ioaServerSDK: ioaServerSDKCore;
export {};
