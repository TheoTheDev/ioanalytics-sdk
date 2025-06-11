import http from 'http';
import https from 'https';
import { URL } from 'url';
const httpAgent  = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

//

export type ErrorType = 'critical' | 'major' | 'minor' | 'warning';

//

class ioaServerSDKCore {

    private analyticsURL: string = '';
    private projectId: string = '';
    private ioaKey: string = '';

    //

    public init ( projectId: string, ioaKey: string, analyticsURL: string = 'https://ioanalytics.dev' ) : void {

        this.projectId = projectId;
        this.analyticsURL = analyticsURL;
        this.ioaKey = ioaKey;

    };

    private makeRequest ( endpoint: string, payload: string ) : void {

        const fullUrl = this.analyticsURL + endpoint;
        const url = new URL(fullUrl);
        const isHttps = url.protocol === 'https:';
        const httpModule = isHttps ? https : http;
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
            res.on('data', () => {});
            res.on('end', () => {});
        });

        req.setTimeout(5_000, () => req.destroy());

        req.on('error', () => {
            req.destroy();
        });

        req.on('timeout', () => req.abort());
        req.on('error', () => {/* swallow or log */});
        req.write(payload);
        req.end();

    };

    public newEvent ( type: string, name: string, params: any = {} ) : void {

        const payload = JSON.stringify({
            projectId: this.projectId,
            key:       this.ioaKey,
            name,
            type,
            params
        });

        this.makeRequest('/api/stats/server-event', payload);

    };

    public newError ( type: ErrorType, message: string ) : void {

        const payload = JSON.stringify({
            projectId: this.projectId,
            key:       this.ioaKey,
            type,
            message
        });

        this.makeRequest('/api/stats/server-error', payload);

    };

};

//

export const ioaServerSDK = new ioaServerSDKCore();
