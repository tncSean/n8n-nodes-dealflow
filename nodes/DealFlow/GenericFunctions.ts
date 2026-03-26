import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	JsonObject,
	NodeApiError,
} from 'n8n-workflow';

export async function dealFlowApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('dealFlowApi');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options = {
		method,
		uri: `${baseUrl}/api${endpoint}`,
		qs,
		body,
		json: true,
	} as any;

	if (method === 'GET' || Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.requestWithAuthentication.call(this, 'dealFlowApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
