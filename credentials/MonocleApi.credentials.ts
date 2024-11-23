import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MonocleApi implements ICredentialType {
	name = 'monocleApi';
	displayName = 'Monocle API';
	documentationUrl = 'https://github.com/change-metrics/monocle?tab=readme-ov-file#service-tokens';
	properties: INodeProperties[] = [
		{
			displayName: 'JWT Token',
			name: 'token',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'Domain',
			name: 'domain',
			type: 'string',
			default: 'https://demo.changemetrics.io',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.domain}}',
			method: 'POST',
			url: '/auth/whoami',
			body: { void: '' },
		},
	};
}
