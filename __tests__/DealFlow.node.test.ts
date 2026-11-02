import { DealFlow } from '../nodes/DealFlow/DealFlow.node';
import { dealFlowApiRequest } from '../nodes/DealFlow/GenericFunctions';
import { NodeOperationError } from 'n8n-workflow';

// Mock GenericFunctions so we can intercept API calls
jest.mock('../nodes/DealFlow/GenericFunctions', () => ({
	dealFlowApiRequest: jest.fn(),
}));

const mockedApiRequest = dealFlowApiRequest as jest.MockedFunction<
	typeof dealFlowApiRequest
>;

describe('DealFlow Node', () => {
	let node: DealFlow;

	beforeEach(() => {
		node = new DealFlow();
		jest.clearAllMocks();
	});

	// =========================================================================
	// Node description
	// =========================================================================

	describe('description', () => {
		it('has correct name', () => {
			expect(node.description.name).toBe('dealFlow');
		});

		it('has correct displayName', () => {
			expect(node.description.displayName).toBe('Deal Flow');
		});

		it('requires dealFlowApi credentials', () => {
			expect(node.description.credentials).toEqual([
				{ name: 'dealFlowApi', required: true },
			]);
		});

		it('has main inputs and outputs', () => {
			expect(node.description.inputs).toEqual(['main']);
			expect(node.description.outputs).toEqual(['main']);
		});

		it('has version 1', () => {
			expect(node.description.version).toBe(1);
		});

		it('defines all 5 resources', () => {
			const resourceProp = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			expect(resourceProp).toBeDefined();

			const values = (resourceProp as any).options.map((o: any) => o.value);
			expect(values).toEqual(['deal', 'note', 'task', 'contact', 'timeline']);
		});
	});

	// =========================================================================
	// loadOptions
	// =========================================================================

	describe('loadOptions', () => {
		describe('getPipelines', () => {
			it('calls correct endpoint and maps response with items', async () => {
				const mockContext = {} as any;
				const apiResponse = {
					items: [
						{ id: 1, name: 'Sales' },
						{ id: 2, name: 'Enterprise' },
					],
				};

				mockedApiRequest.mockResolvedValue(apiResponse);

				const result = await node.methods.loadOptions.getPipelines.call(
					mockContext,
				);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/pipelines',
				);
				expect(result).toEqual([
					{ name: 'Sales', value: 1 },
					{ name: 'Enterprise', value: 2 },
				]);
			});

			it('handles response with pipelines key', async () => {
				const mockContext = {} as any;
				mockedApiRequest.mockResolvedValue({
					pipelines: [{ id: 1, name: 'Default' }],
				});

				const result = await node.methods.loadOptions.getPipelines.call(
					mockContext,
				);
				expect(result).toEqual([{ name: 'Default', value: 1 }]);
			});

			it('handles empty response', async () => {
				const mockContext = {} as any;
				mockedApiRequest.mockResolvedValue({ items: [] });

				const result = await node.methods.loadOptions.getPipelines.call(
					mockContext,
				);
				expect(result).toEqual([]);
			});
		});

		describe('getStages', () => {
			it('fetches stages for a specific pipeline when pipeline_id is set via additionalFields', async () => {
				const mockContext = {
					getCurrentNodeParameter: jest.fn().mockImplementation((name: string) => {
						if (name === 'additionalFields.pipeline_id') return 5;
						throw new Error('not found');
					}),
				} as any;

				mockedApiRequest.mockResolvedValue({
					items: [
						{ id: 10, name: 'Qualification' },
						{ id: 11, name: 'Proposal' },
					],
				});

				const result = await node.methods.loadOptions.getStages.call(
					mockContext,
				);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/pipelines/5/stages',
				);
				expect(result).toEqual([
					{ name: 'Qualification', value: 10 },
					{ name: 'Proposal', value: 11 },
				]);
			});

			it('fetches stages for a specific pipeline when pipeline_id is set via updateFields', async () => {
				const mockContext = {
					getCurrentNodeParameter: jest.fn().mockImplementation((name: string) => {
						if (name === 'additionalFields.pipeline_id') return undefined;
						if (name === 'updateFields.pipeline_id') return 3;
						throw new Error('not found');
					}),
				} as any;

				mockedApiRequest.mockResolvedValue({
					stages: [{ id: 20, name: 'Closed Won' }],
				});

				const result = await node.methods.loadOptions.getStages.call(
					mockContext,
				);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/pipelines/3/stages',
				);
				expect(result).toEqual([{ name: 'Closed Won', value: 20 }]);
			});

			it('fetches all stages from all pipelines when no pipeline_id is set', async () => {
				const mockContext = {
					getCurrentNodeParameter: jest.fn().mockImplementation(() => {
						throw new Error('not found');
					}),
				} as any;

				// First call: get pipelines
				mockedApiRequest.mockResolvedValueOnce({
					items: [
						{ id: 1, name: 'Sales' },
						{ id: 2, name: 'Enterprise' },
					],
				});
				// Second call: stages for pipeline 1
				mockedApiRequest.mockResolvedValueOnce({
					items: [{ id: 10, name: 'Lead' }],
				});
				// Third call: stages for pipeline 2
				mockedApiRequest.mockResolvedValueOnce({
					items: [{ id: 20, name: 'Discovery' }],
				});

				const result = await node.methods.loadOptions.getStages.call(
					mockContext,
				);

				expect(mockedApiRequest).toHaveBeenCalledTimes(3);
				expect(result).toEqual([
					{ name: 'Sales > Lead', value: 10 },
					{ name: 'Enterprise > Discovery', value: 20 },
				]);
			});
		});
	});

	// =========================================================================
	// execute()
	// =========================================================================

	describe('execute()', () => {
		/**
		 * Creates a mock IExecuteFunctions context for testing execute().
		 */
		function createExecuteContext(params: Record<string, any>) {
			return {
				getInputData: jest.fn().mockReturnValue([{ json: {} }]),
				getNodeParameter: jest.fn().mockImplementation((name: string, _itemIndex: number, defaultValue?: any) => {
					if (name in params) return params[name];
					if (defaultValue !== undefined) return defaultValue;
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue({
					baseUrl: 'https://mautic.example.com',
					username: 'user',
					password: 'pass',
				}),
				helpers: {
					requestWithAuthentication: jest.fn(),
					returnJsonArray: jest.fn((data: any) =>
						data.map((d: any) => ({ json: d })),
					),
					constructExecutionMetaData: jest.fn((items: any) => items),
				},
				getNode: jest.fn().mockReturnValue({
					name: 'DealFlow',
					type: 'n8n-nodes-dealflow.dealFlow',
				}),
				continueOnFail: jest.fn().mockReturnValue(false),
			} as any;
		}

		// ----- deal operations -----

		describe('deal/create', () => {
			it('sends POST /dealflow/deals with title and additional fields', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'create',
					title: 'Big Deal',
					additionalFields: { amount: 50000, currency: 'USD' },
					contactsUi: {},
				});

				const created = { id: 1, title: 'Big Deal', amount: 50000 };
				mockedApiRequest.mockResolvedValue({ deal: created });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals',
					{ title: 'Big Deal', amount: 50000, currency: 'USD' },
				);
				expect(result[0]).toEqual([
					{ json: created, pairedItem: { item: 0 } },
				]);
			});

			it('includes contacts when provided', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'create',
					title: 'Deal with contacts',
					additionalFields: {},
					contactsUi: {
						contactValues: [
							{ contact_id: 10, label: 'Decision Maker' },
							{ contact_id: 20, label: '' },
						],
					},
				});

				mockedApiRequest.mockResolvedValue({ deal: { id: 1 } });

				await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals',
					{
						title: 'Deal with contacts',
						contacts: [
							{ contact_id: 10, label: 'Decision Maker' },
							{ contact_id: 20 },
						],
					},
				);
			});

			it('skips additional fields with empty/zero/undefined values', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'create',
					title: 'Minimal Deal',
					additionalFields: {
						amount: 0,
						currency: '',
						description: undefined,
						confidence: 75,
					},
					contactsUi: {},
				});

				mockedApiRequest.mockResolvedValue({ deal: { id: 2 } });

				await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals',
					{ title: 'Minimal Deal', confidence: 75 },
				);
			});
		});

		describe('deal/get', () => {
			it('sends GET /dealflow/deals/{id}', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'get',
					dealId: 42,
				});

				const deal = { id: 42, title: 'Found Deal' };
				mockedApiRequest.mockResolvedValue({ deal });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/deals/42',
				);
				expect(result[0][0].json).toEqual(deal);
			});
		});

		describe('deal/getAll', () => {
			it('sends GET /dealflow/deals with query params', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'getAll',
					returnAll: true,
					filters: { status: 'open', pipeline_id: 1 },
				});

				const deals = [
					{ id: 1, title: 'Deal A' },
					{ id: 2, title: 'Deal B' },
				];
				mockedApiRequest.mockResolvedValue({ items: deals });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/deals',
					{},
					{ status: 'open', pipeline_id: 1 },
				);
				expect(result[0]).toHaveLength(2);
				expect(result[0][0].json).toEqual({ id: 1, title: 'Deal A' });
			});

			it('respects limit when returnAll is false', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'getAll',
					returnAll: false,
					limit: 1,
					filters: {},
				});

				mockedApiRequest.mockResolvedValue({
					items: [
						{ id: 1, title: 'A' },
						{ id: 2, title: 'B' },
						{ id: 3, title: 'C' },
					],
				});

				const result = await node.execute.call(ctx);

				expect(result[0]).toHaveLength(1);
				expect(result[0][0].json).toEqual({ id: 1, title: 'A' });
			});

			it('sends limit in query string when returnAll is false', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'getAll',
					returnAll: false,
					limit: 5,
					filters: {},
				});

				mockedApiRequest.mockResolvedValue({ items: [] });

				await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/deals',
					{},
					{ limit: 5 },
				);
			});
		});

		describe('deal/update', () => {
			it('sends PATCH /dealflow/deals/{id} with update fields', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'update',
					dealId: 10,
					updateFields: { title: 'Updated', amount: 99000 },
				});

				const updated = { id: 10, title: 'Updated', amount: 99000 };
				mockedApiRequest.mockResolvedValue({ deal: updated });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'PATCH',
					'/dealflow/deals/10',
					{ title: 'Updated', amount: 99000 },
				);
				expect(result[0][0].json).toEqual(updated);
			});
		});

		describe('deal/moveStage', () => {
			it('sends POST /dealflow/deals/{id}/stage with stage_id', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'moveStage',
					dealId: 7,
					stageId: 3,
				});

				mockedApiRequest.mockResolvedValue({ deal: { id: 7, stage_id: 3 } });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals/7/stage',
					{ stage_id: 3 },
				);
				expect(result[0][0].json).toEqual({ id: 7, stage_id: 3 });
			});
		});

		// ----- note operations -----

		describe('note/create', () => {
			it('sends POST /dealflow/deals/{id}/notes with body', async () => {
				const ctx = createExecuteContext({
					resource: 'note',
					operation: 'create',
					dealId: 5,
					body: 'This is a note',
					additionalFields: { source_type: 'n8n', source_ref: 'exec-123' },
				});

				const note = { id: 1, body: 'This is a note' };
				mockedApiRequest.mockResolvedValue({ note });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals/5/notes',
					{ body: 'This is a note', source_type: 'n8n', source_ref: 'exec-123' },
				);
				expect(result[0][0].json).toEqual(note);
			});

			it('omits empty additionalFields', async () => {
				const ctx = createExecuteContext({
					resource: 'note',
					operation: 'create',
					dealId: 5,
					body: 'Plain note',
					additionalFields: { source_type: '', source_ref: '' },
				});

				mockedApiRequest.mockResolvedValue({ note: { id: 2 } });

				await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals/5/notes',
					{ body: 'Plain note' },
				);
			});
		});

		// ----- task operations -----

		describe('task/create', () => {
			it('sends POST /dealflow/deals/{id}/tasks with body', async () => {
				const ctx = createExecuteContext({
					resource: 'task',
					operation: 'create',
					dealId: 8,
					title: 'Follow up call',
					additionalFields: { priority: 'high', description: 'Call at 3pm' },
				});

				const task = { id: 1, title: 'Follow up call' };
				mockedApiRequest.mockResolvedValue({ task });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals/8/tasks',
					{ title: 'Follow up call', priority: 'high', description: 'Call at 3pm' },
				);
				expect(result[0][0].json).toEqual(task);
			});
		});

		describe('task/update', () => {
			it('sends PATCH /dealflow/deals/{id}/tasks/{taskId} with update fields', async () => {
				const ctx = createExecuteContext({
					resource: 'task',
					operation: 'update',
					dealId: 8,
					taskId: 15,
					updateFields: { status: 'completed', priority: 'low' },
				});

				const task = { id: 15, status: 'completed' };
				mockedApiRequest.mockResolvedValue({ task });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'PATCH',
					'/dealflow/deals/8/tasks/15',
					{ status: 'completed', priority: 'low' },
				);
				expect(result[0][0].json).toEqual(task);
			});
		});

		// ----- contact operations -----

		describe('contact/add', () => {
			it('sends POST /dealflow/deals/{id}/contacts with contacts array', async () => {
				const ctx = createExecuteContext({
					resource: 'contact',
					operation: 'add',
					dealId: 3,
					contactId: 100,
					label: 'Champion',
				});

				mockedApiRequest.mockResolvedValue({ contact: { id: 100 } });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals/3/contacts',
					{ contacts: [{ contact_id: 100, label: 'Champion' }] },
				);
				expect(result[0][0].json).toEqual({ id: 100 });
			});

			it('omits label when empty', async () => {
				const ctx = createExecuteContext({
					resource: 'contact',
					operation: 'add',
					dealId: 3,
					contactId: 200,
					label: '',
				});

				mockedApiRequest.mockResolvedValue({ contact: { id: 200 } });

				await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'POST',
					'/dealflow/deals/3/contacts',
					{ contacts: [{ contact_id: 200 }] },
				);
			});
		});

		// ----- timeline operations -----

		describe('timeline/get', () => {
			it('sends GET /dealflow/deals/{id}/timeline', async () => {
				const ctx = createExecuteContext({
					resource: 'timeline',
					operation: 'get',
					dealId: 11,
				});

				const timeline = { events: [{ type: 'stage_change' }] };
				mockedApiRequest.mockResolvedValue({ timeline });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledWith(
					'GET',
					'/dealflow/deals/11/timeline',
				);
				expect(result[0][0].json).toEqual(timeline);
			});
		});

		// ----- multi-item processing -----

		describe('multi-item processing', () => {
			it('processes multiple input items', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'get',
					dealId: 1,
				});

				// Override getInputData to return 3 items
				ctx.getInputData.mockReturnValue([
					{ json: {} },
					{ json: {} },
					{ json: {} },
				]);

				// Override getNodeParameter to return different dealIds per item
				ctx.getNodeParameter.mockImplementation((name: string, itemIndex: number) => {
					if (name === 'resource') return 'deal';
					if (name === 'operation') return 'get';
					if (name === 'dealId') return itemIndex + 1;
					return undefined;
				});

				mockedApiRequest
					.mockResolvedValueOnce({ deal: { id: 1, title: 'A' } })
					.mockResolvedValueOnce({ deal: { id: 2, title: 'B' } })
					.mockResolvedValueOnce({ deal: { id: 3, title: 'C' } });

				const result = await node.execute.call(ctx);

				expect(mockedApiRequest).toHaveBeenCalledTimes(3);
				expect(result[0]).toHaveLength(3);
				expect(result[0][0].pairedItem).toEqual({ item: 0 });
				expect(result[0][1].pairedItem).toEqual({ item: 1 });
				expect(result[0][2].pairedItem).toEqual({ item: 2 });
			});
		});

		// ----- error handling -----

		describe('error handling', () => {
			it('throws NodeOperationError for unsupported resource/operation combo', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'delete', // does not exist
				});

				await expect(node.execute.call(ctx)).rejects.toThrow(
					NodeOperationError,
				);
			});

			it('continues on fail and returns error json', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'get',
					dealId: 999,
				});

				ctx.continueOnFail.mockReturnValue(true);
				mockedApiRequest.mockRejectedValue(new Error('Not found'));

				const result = await node.execute.call(ctx);

				expect(result[0]).toHaveLength(1);
				expect(result[0][0].json).toEqual({ error: 'Not found' });
				expect(result[0][0].pairedItem).toEqual({ item: 0 });
			});

			it('throws error when continueOnFail is false', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'get',
					dealId: 999,
				});

				ctx.continueOnFail.mockReturnValue(false);
				mockedApiRequest.mockRejectedValue(new Error('Server error'));

				await expect(node.execute.call(ctx)).rejects.toThrow('Server error');
			});
		});

		// ----- response unwrapping -----

		describe('response unwrapping', () => {
			it('unwraps deal key from response', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'get',
					dealId: 1,
				});

				mockedApiRequest.mockResolvedValue({
					deal: { id: 1, title: 'Unwrapped' },
				});

				const result = await node.execute.call(ctx);
				expect(result[0][0].json).toEqual({ id: 1, title: 'Unwrapped' });
			});

			it('unwraps note key from response', async () => {
				const ctx = createExecuteContext({
					resource: 'note',
					operation: 'create',
					dealId: 1,
					body: 'Test',
					additionalFields: {},
				});

				mockedApiRequest.mockResolvedValue({
					note: { id: 5, body: 'Test' },
				});

				const result = await node.execute.call(ctx);
				expect(result[0][0].json).toEqual({ id: 5, body: 'Test' });
			});

			it('returns raw response when no wrapper key present', async () => {
				const ctx = createExecuteContext({
					resource: 'deal',
					operation: 'get',
					dealId: 1,
				});

				const raw = { id: 1, title: 'Raw' };
				mockedApiRequest.mockResolvedValue(raw);

				const result = await node.execute.call(ctx);
				expect(result[0][0].json).toEqual(raw);
			});
		});
	});
});
