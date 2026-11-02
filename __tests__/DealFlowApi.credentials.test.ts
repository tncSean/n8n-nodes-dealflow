import { DealFlowApi } from '../credentials/DealFlowApi.credentials';

describe('DealFlowApi Credentials', () => {
	let credentials: DealFlowApi;

	beforeEach(() => {
		credentials = new DealFlowApi();
	});

	it('has the correct name', () => {
		expect(credentials.name).toBe('dealFlowApi');
	});

	it('has the correct displayName', () => {
		expect(credentials.displayName).toBe('Deal Flow API');
	});

	it('has a baseUrl property', () => {
		const baseUrl = credentials.properties.find((p) => p.name === 'baseUrl');
		expect(baseUrl).toBeDefined();
		expect(baseUrl!.type).toBe('string');
		expect(baseUrl!.required).toBe(true);
	});

	it('has a username property', () => {
		const username = credentials.properties.find((p) => p.name === 'username');
		expect(username).toBeDefined();
		expect(username!.type).toBe('string');
		expect(username!.required).toBe(true);
	});

	it('has a password property with password type options', () => {
		const password = credentials.properties.find((p) => p.name === 'password');
		expect(password).toBeDefined();
		expect(password!.type).toBe('string');
		expect(password!.required).toBe(true);
		expect(password!.typeOptions).toEqual({ password: true });
	});

	it('uses generic basic auth for authentication', () => {
		expect(credentials.authenticate).toEqual({
			type: 'generic',
			properties: {
				auth: {
					username: '={{$credentials.username}}',
					password: '={{$credentials.password}}',
				},
			},
		});
	});

	it('test config hits /api/dealflow/pipelines', () => {
		expect(credentials.test).toEqual({
			request: {
				baseURL: '={{$credentials.baseUrl}}',
				url: '/api/dealflow/pipelines',
				method: 'GET',
			},
		});
	});

	it('has exactly 3 properties', () => {
		expect(credentials.properties).toHaveLength(3);
	});
});
