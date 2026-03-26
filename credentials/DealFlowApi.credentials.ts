import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DealFlowApi implements ICredentialType {
	name = 'dealFlowApi';
	displayName = 'Deal Flow API';
	documentationUrl = 'https://dealflowplugin.com/docs/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Mautic URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://mautic.example.com',
			required: true,
			description: 'The base URL of your Mautic instance (no trailing slash)',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/dealflow/pipelines',
			method: 'GET',
		},
	};
}
