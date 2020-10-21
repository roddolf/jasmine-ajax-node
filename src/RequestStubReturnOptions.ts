/**
 * The options to mock when a retrieving fake request.
 * 
 * @public
 */
export interface RequestStubReturnOptions {
  status?: number;
  contentType?: string;
  response?: string;
  responseText: string;
  responseHeaders?: {
    [key: string]: string;
  };
}