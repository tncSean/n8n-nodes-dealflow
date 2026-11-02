import { dealFlowApiRequest } from '../nodes/DealFlow/GenericFunctions';
import { NodeApiError } from 'n8n-workflow';

describe('dealFlowApiRequest', () => {
	const mockGetNode = jest.fn().mockReturnValue({
		name: 'DealFlow',
		type: 'n8n-nodes-dealflow.dealFlow',
	});

	const createMockContext = (overrides: Record<string, any> = {}) => ({
		getCredentials: jest.fn().mockResolvedValue({
			baseUrl: 'https://mautic.example.com',
			username: 'user',
			password: 'pass',
		}),
		helpers: {
			requestWithAuthentication: jest.fn().mockResolvedValue({ success: true }),
		},
		getNode: mockGetNode,
		...overrides,
	});

	it('constructs the correct URL from credentials baseUrl + endpoint', async () => {
		const ctx = createMockContext();
		await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals');

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.objectContaining({
				uri: 'https://mautic.example.com/api/dealflow/deals',
			}),
		);
	});

	it('strips trailing slash from baseUrl', async () => {
		const ctx = createMockContext({
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://mautic.example.com/',
				username: 'user',
				password: 'pass',
			}),
		});

		await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/pipelines');

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.objectContaining({
				uri: 'https://mautic.example.com/api/dealflow/pipelines',
			}),
		);
	});

	it('passes auth credential name to requestWithAuthentication', async () => {
		const ctx = createMockContext();
		await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals');

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.anything(),
		);
	});

	it('sends body for POST requests', async () => {
		const ctx = createMockContext();
		const body = { title: 'Test Deal', amount: 5000 };

		await dealFlowApiRequest.call(ctx as any, 'POST', '/dealflow/deals', body);

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.objectContaining({
				method: 'POST',
				body: { title: 'Test Deal', amount: 5000 },
			}),
		);
	});

	it('sends body for PATCH requests', async () => {
		const ctx = createMockContext();
		const body = { title: 'Updated Deal' };

		await dealFlowApiRequest.call(ctx as any, 'PATCH', '/dealflow/deals/1', body);

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.objectContaining({
				method: 'PATCH',
				body: { title: 'Updated Deal' },
			}),
		);
	});

	it('omits body for GET requests', async () => {
		const ctx = createMockContext();
		await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals');

		const callArgs = ctx.helpers.requestWithAuthentication.mock.calls[0][1];
		expect(callArgs.body).toBeUndefined();
	});

	it('omits body when body is empty object', async () => {
		const ctx = createMockContext();
		await dealFlowApiRequest.call(ctx as any, 'POST', '/dealflow/deals', {});

		const callArgs = ctx.helpers.requestWithAuthentication.mock.calls[0][1];
		expect(callArgs.body).toBeUndefined();
	});

	it('passes query string parameters', async () => {
		const ctx = createMockContext();
		const qs = { limit: 10, status: 'open' };

		await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals', {}, qs);

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.objectContaining({
				qs: { limit: 10, status: 'open' },
			}),
		);
	});

	it('sets json: true on request options', async () => {
		const ctx = createMockContext();
		await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals');

		expect(ctx.helpers.requestWithAuthentication).toHaveBeenCalledWith(
			'dealFlowApi',
			expect.objectContaining({ json: true }),
		);
	});

	it('throws NodeApiError on API errors', async () => {
		const apiError = new Error('Request failed with status 500');
		const ctx = createMockContext({
			helpers: {
				requestWithAuthentication: jest.fn().mockRejectedValue(apiError),
			},
		});

		await expect(
			dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals'),
		).rejects.toThrow(NodeApiError);
	});

	it('returns the API response data', async () => {
		const responseData = { id: 1, title: 'Test Deal' };
		const ctx = createMockContext({
			helpers: {
				requestWithAuthentication: jest.fn().mockResolvedValue(responseData),
			},
		});

		const result = await dealFlowApiRequest.call(ctx as any, 'GET', '/dealflow/deals/1');
		expect(result).toEqual(responseData);
	});
});
