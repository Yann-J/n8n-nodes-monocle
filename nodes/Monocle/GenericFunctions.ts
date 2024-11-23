import {
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IWebhookFunctions,
	NodeOperationError,
} from 'n8n-workflow';

export async function monocleApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	uri: string,
	body: any = { void: '' },
): Promise<any> {
	const credentials = await this.getCredentials('monocleApi');
	if (credentials === undefined) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	const options = {
		json: true,
		headers: {
			Authorization: 'Bearer ' + credentials.token,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		baseURL: credentials.domain as string,
		method: 'POST' as IHttpRequestMethods,
		uri,
		body,
	};

	return this.helpers.request(options);
}

export async function loadMetrics(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const responseData = await monocleApiRequest.call(this, '/api/2/metric/list');

	return (
		responseData?.metrics?.map((metric: any) => ({ name: metric.name, value: metric.metric })) || []
	);
}

export async function loadWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const responseData = await monocleApiRequest.call(this, '/api/2/get_workspaces');

	return (
		responseData?.workspaces?.map((workspace: any) => ({
			name: workspace.name,
			value: workspace.name,
		})) || []
	);
}
