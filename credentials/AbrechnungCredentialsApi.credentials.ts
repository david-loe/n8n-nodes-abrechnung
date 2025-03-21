import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AbrechnungCredentialsApi implements ICredentialType {
	name = 'abrechnungApi';
	displayName = 'abrechnung 🧾 API';
	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Instance API URL (Backend)',
			name: 'url',
			type: 'string',
			default: 'https://demo.reiseabrechner.de/backend',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	// This credential is currently not used by any node directly
	// but the HTTP Request node can use it to make requests.
	// The credential is also testable due to the `test` property below
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiKey}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.url}}',
			url: '/auth/authenticated',
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 204,
					message: 'Expected response code to be 204',
				},
			},
		],
	};
}
