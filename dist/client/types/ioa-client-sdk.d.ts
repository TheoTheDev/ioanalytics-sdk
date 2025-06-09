interface IDeviceParams {
    os: string;
    resolution: string;
    pixelRatio: number;
    browser: string;
}
export type ErrorType = 'critical' | 'major' | 'minor' | 'warning';
interface IUser {
    uid: string;
    sessionId: string;
    state: string;
}
interface IStagePerformance {
    name: string;
    avgFps: number;
    minFps: number;
}
interface IPerformance {
    stages: IStagePerformance[];
    loadTime: number;
    matchmakingTime: number;
    avgPing: number;
    maxPing: number;
}
declare class ioaClientSDKCore {
    private analyticsURL;
    private projectId;
    user: IUser;
    device: IDeviceParams;
    performance: IPerformance;
    private eventsQueue;
    private errorsQueue;
    private updateIntervalId;
    private updateIntervalDuration;
    private lastPingTime;
    private pingDelay;
    constructor();
    init(projectId: string, analyticsURL: string): void;
    setFPS(stageName: string, avgFps: number, lowFps: number): void;
    setState(state: string): void;
    newEvent(type: string, event: string): void;
    newError(type: ErrorType, error: string): void;
    private update;
    private sendInitialData;
    private sendData;
    private sendPingData;
    private beforeUnload;
    private detectDevice;
    dispose(): void;
}
export declare const ioaClientSDK: ioaClientSDKCore;
export {};
