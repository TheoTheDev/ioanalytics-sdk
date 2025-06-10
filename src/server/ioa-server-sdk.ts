import request from 'request';

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

    public newEvent ( type: string, name: string, params: any ) : void {

        request({
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

    };

    public newError ( type: ErrorType, message: string ) : void {

        request({
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

    };

};

//

export const ioaServerSDK = new ioaServerSDKCore();
