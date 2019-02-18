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
