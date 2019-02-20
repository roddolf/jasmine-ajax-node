/**
 * The data to be used as the mock response of a fake request.
 * 
 * @public
 */
export interface Response {
    status?: number;
    statusText?: string;
    responseText?: string;
    response?: string;
    contentType?: string;
    responseHeaders?: {
        [key: string]: string;
    };
}
