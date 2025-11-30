
// util functions

const generateUid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const detectBrowser = () : string => {
    const ua = navigator.userAgent;
    if (/Edge\/\d+/.test(ua))       return 'Microsoft Edge';
    if (/OPR\/\d+/.test(ua))        return 'Opera';
    if (/CriOS\/\d+/.test(ua))      return 'Chrome';  // Chrome on iOS
    if (/Chrome\/\d+/.test(ua))     return 'Chrome';  // Chrome on other platforms
    if (/Safari\/\d+/.test(ua))     return 'Safari';
    if (/Firefox\/\d+/.test(ua))    return 'Firefox';
    if (/MSIE \d+/.test(ua) || /Trident\/\d+/.test(ua)) return 'Internet Explorer';
    return 'Unknown';
};

const detectOS = () : string => {
    const platform = navigator.platform.toLowerCase();
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua))         return 'Android';
    if (/iphone|ipad|ipod/.test(ua))return 'iOS';
    if (platform.includes('win'))   return 'Windows';
    if (platform.includes('mac'))   return 'macOS';
    if (platform.includes('linux') && !(/android/.test(ua))) return 'Linux';
    return 'Unknown';
};

// types and interfaces

interface IDeviceParams {
    os:             string;
    resolution:     string;
    pixelRatio:     number;
    browser:        string;
};

interface IEventMessage {
    type:           string;
    event:          string;
    date:           Date;
};

export type ErrorType = 'critical' | 'major' | 'minor' | 'warning';

interface IErrorMessage {
    type:           ErrorType;
    error:          string;
    date:           Date;
};

interface IStatsMessage {
    type:           string;
    value:          number;
    date:           Date;
};

interface IUser {
    uid:            string;
    sessionId:      string;
    state:          string;
};

interface IStagePerformance {
    name:           string;
    avgFps:         number;
    minFps:         number;
};

interface IPerformance {
    stages:             IStagePerformance[];
    loadTime:           number;
    matchmakingTime:    number;
    avgPing:            number;
    maxPing:            number;
};

// SDK core

class ioaClientSDKCore {

    private analyticsURL: string = '';
    private projectId: string = '';

    public user: IUser = {
        uid:            '',
        state:          '',
        sessionId:      ''
    };

    public device: IDeviceParams = {
        os:             '',
        resolution:     '',
        pixelRatio:     0,
        browser:        ''
    };

    public performance: IPerformance = {
        stages:             [],
        loadTime:           0,
        matchmakingTime:    0,
        avgPing:            0,
        maxPing:            0
    };

    private eventsQueue: IEventMessage[] = [];
    private errorsQueue: IErrorMessage[] = [];
    private statsQueue: IStatsMessage[] = [];

    private updateIntervalId: any = null;
    private updateIntervalDuration: number = 2000;

    private lastPingTime: number = 0;
    private pingDelay: number = 30000;

    //

    constructor () {

        const uid = localStorage.getItem('nwa-uid');

        if ( ! uid ) {

            this.user.uid = generateUid();
            localStorage.setItem( 'nwa-uid', this.user.uid );

        } else {

            this.user.uid = uid;

        }

        //

        window.addEventListener( 'beforeunload', this.beforeUnload );

    };

    public init ( projectId: string, analyticsURL: string = 'https://ioanalytics.dev' ) : void {

        this.projectId = projectId;
        this.analyticsURL = analyticsURL;

        this.lastPingTime = Date.now();

        this.detectDevice();
        this.updateIntervalId = setInterval( this.update, this.updateIntervalDuration );
        this.sendInitialData();

    };

    public setFPS ( stageName: string, avgFps: number, lowFps: number ) : void {

        const stage = this.performance.stages.find( ( stage ) => stage.name === stageName );

        if ( stage ) {

            stage.avgFps = avgFps;
            stage.minFps = lowFps;

        } else {

            this.performance.stages.push({
                name:       stageName,
                avgFps:     avgFps,
                minFps:     lowFps
            });

        }

    };

    public setState ( state: string ) : void {

        this.user.state = state;

    };

    public newEvent ( type: string, event: string ) : void {

        this.eventsQueue.push({
            type:       type,
            event:      event,
            date:       new Date()
        });

    };

    public newError ( type: ErrorType, error: string ) : void {

        this.errorsQueue.push({
            type:       type,
            error:      error,
            date:       new Date()
        });

    };

    public newStat ( type: string, value: number ) : void {

        this.statsQueue.push({
            type:       type,
            value:      value,
            date:       new Date()
        });

    };

    //

    private update = () : void =>{

        if ( this.eventsQueue.length > 0 || this.errorsQueue.length > 0 || this.statsQueue.length > 0 ) {

            this.sendData();

        }

        if ( this.lastPingTime + this.pingDelay < Date.now() ) {

            this.sendPingData();
            this.lastPingTime = Date.now();

        }

    };

    private sendInitialData = () : void => {

        fetch( this.analyticsURL + '/api/stats/start', {
            method: 'POST',
            // headers: {
            //     'Accept':       'application/json',
            //     'Content-Type': 'application/json'
            // },
            body: JSON.stringify({
                uid:        this.user.uid,
                projectId:  this.projectId,
                device:     this.device
            })
        }).then( async ( response ) => {

            if ( response.ok ) {

                const data = await response.json();
                this.user.sessionId = data.sessionId;

            }

        });

    };

    private sendData = () : void => {

        fetch( this.analyticsURL + '/api/stats/collect', {
            method: 'POST',
            // headers: {
            //     'Accept':       'application/json',
            //     'Content-Type': 'application/json'
            // },
            body: JSON.stringify({
                uid:        this.user.uid,
                sessionId:  this.user.sessionId,
                events:     this.eventsQueue,
                errors:     this.errorsQueue,
                stats:      this.statsQueue,
                projectId:  this.projectId
            })
        });

        this.eventsQueue = [];
        this.errorsQueue = [];
        this.statsQueue = [];

    };

    private sendPingData = () : void => {

        fetch( this.analyticsURL + '/api/stats/ping', {
            method: 'POST',
            // headers: {
            //     'Accept':       'application/json',
            //     'Content-Type': 'application/json'
            // },
            body: JSON.stringify({
                uid:            this.user.uid,
                sessionId:      this.user.sessionId,
                performance:    this.performance,
                state:          this.user.state,
                projectId:      this.projectId
            })
        });

    };

    private beforeUnload = () : void => {

        fetch( `${this.analyticsURL}/api/stats/end?uid=${this.user.uid}&sessionId=${this.user.sessionId}&playerLeftState=${this.user.state}&projectId=${this.projectId}`, {
            method: 'GET'
        });

    };

    private detectDevice () : void {

        const browser = detectBrowser();
        const os = detectOS();

        this.device.browser = `${browser} (${os})`;
        this.device.os = detectOS();

        this.device.resolution = `${ window.innerWidth }x${ window.innerHeight }`;
        this.device.pixelRatio = window.devicePixelRatio;

    };

    public dispose () : void {

        clearInterval( this.updateIntervalId );
        this.updateIntervalId = null;

        this.eventsQueue = [];
        this.errorsQueue = [];
        this.statsQueue = [];

        this.performance = {
            stages:             [],
            loadTime:           0,
            matchmakingTime:    0,
            avgPing:            0,
            maxPing:            0
        };

        this.device = {
            os:             '',
            resolution:     '',
            pixelRatio:     0,
            browser:        ''
        };

    };

};

export const ioaClientSDK = new ioaClientSDKCore();
