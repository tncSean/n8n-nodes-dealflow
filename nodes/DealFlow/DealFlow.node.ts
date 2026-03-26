import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { dealFlowApiRequest } from './GenericFunctions';

import { dealOperations, dealFields } from './descriptions/DealDescription';
import { noteOperations, noteFields } from './descriptions/NoteDescription';
import { taskOperations, taskFields } from './descriptions/TaskDescription';
import { contactOperations, contactFields } from './descriptions/ContactDescription';
import { timelineOperations, timelineFields } from './descriptions/TimelineDescription';

export class DealFlow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Deal Flow',
		name: 'dealFlow',
		icon: 'file:dealflow.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Deal Flow plugin for Mautic',
		defaults: {
			name: 'Deal Flow',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dealFlowApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Note',
						value: 'note',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Timeline',
						value: 'timeline',
					},
				],
				default: 'deal',
			},
			...dealOperations,
			...dealFields,
			...noteOperations,
			...noteFields,
			...taskOperations,
			...taskFields,
			...contactOperations,
			...contactFields,
			...timelineOperations,
			...timelineFields,
		],
	};

	methods = {
		loadOptions: {
			async getPipelines(this: ILoadOptionsFunctions) {
				const response = await dealFlowApiRequest.call(this, 'GET', '/dealflow/pipelines');
				const pipelines = response.items || response.pipelines || response.data || response || [];
				const pipelineList = Array.isArray(pipelines) ? pipelines : [];
				return pipelineList.map((pipeline: { id: number; name: string }) => ({
					name: pipeline.name,
					value: pipeline.id,
				}));
			},

			async getStages(this: ILoadOptionsFunctions) {
				// Try to get pipeline ID from the current parameter context
				let pipelineId: number | string | undefined;

				// Check multiple possible parameter paths for the pipeline ID
				try {
					pipelineId = this.getCurrentNodeParameter('additionalFields.pipeline_id') as number;
				} catch {
					// ignore
				}
				if (!pipelineId) {
					try {
						pipelineId = this.getCurrentNodeParameter('updateFields.pipeline_id') as number;
					} catch {
						// ignore
					}
				}

				if (!pipelineId) {
					// If no pipeline selected, fetch all stages from all pipelines
					const response = await dealFlowApiRequest.call(this, 'GET', '/dealflow/pipelines');
					const pipelines = response.items || response.pipelines || response.data || response || [];
					const pipelineList = Array.isArray(pipelines) ? pipelines : [];
					const stages: Array<{ name: string; value: number }> = [];

					for (const pipeline of pipelineList) {
						const stageResponse = await dealFlowApiRequest.call(
							this,
							'GET',
							`/dealflow/pipelines/${pipeline.id}/stages`,
						);
						const stageList = stageResponse.items || stageResponse.stages || stageResponse.data || stageResponse || [];
						const stageArray = Array.isArray(stageList) ? stageList : [];
						for (const stage of stageArray) {
							stages.push({
								name: `${pipeline.name} > ${stage.name}`,
								value: stage.id,
							});
						}
					}
					return stages;
				}

				const response = await dealFlowApiRequest.call(
					this,
					'GET',
					`/dealflow/pipelines/${pipelineId}/stages`,
				);
				const stages = response.items || response.stages || response.data || response || [];
				const stageList = Array.isArray(stages) ? stages : [];
				return stageList.map((stage: { id: number; name: string }) => ({
					name: stage.name,
					value: stage.id,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'deal') {
					// ----------------------------------------
					//             deal operations
					// ----------------------------------------

					if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							pipeline_id?: number;
							stage_id?: number;
							amount?: number;
							currency?: string;
							confidence?: number;
							company_id?: number;
							owner_id?: number;
							expected_close_date?: string;
							description?: string;
							external_ref?: string;
						};
						const contactsUi = this.getNodeParameter('contactsUi', i, {}) as {
							contactValues?: Array<{ contact_id: number; label: string }>;
						};

						const body: Record<string, any> = { title };

						// Add all non-empty additional fields
						for (const [key, value] of Object.entries(additionalFields)) {
							if (value !== '' && value !== 0 && value !== undefined) {
								body[key] = value;
							}
						}

						// Add contacts if provided
						if (contactsUi.contactValues && contactsUi.contactValues.length > 0) {
							body.contacts = contactsUi.contactValues.map((contact) => {
								const c: Record<string, any> = { contact_id: contact.contact_id };
								if (contact.label) {
									c.label = contact.label;
								}
								return c;
							});
						}

						responseData = await dealFlowApiRequest.call(this, 'POST', '/dealflow/deals', body);
					}

					if (operation === 'get') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						responseData = await dealFlowApiRequest.call(this, 'GET', `/dealflow/deals/${dealId}`);
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as {
							pipeline_id?: number;
							status?: string;
							search?: string;
							owner_id?: number;
							company_id?: number;
						};

						const qs: Record<string, any> = {};

						// Add non-empty filters
						for (const [key, value] of Object.entries(filters)) {
							if (value !== '' && value !== 0 && value !== undefined) {
								qs[key] = value;
							}
						}

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
						}

						responseData = await dealFlowApiRequest.call(this, 'GET', '/dealflow/deals', {}, qs);

						// Extract the deals array from the response (API returns { total, items })
						const deals = responseData.items || responseData.deals || responseData.data || responseData || [];
						responseData = Array.isArray(deals) ? deals : [deals];

						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = responseData.slice(0, limit);
						}
					}

					if (operation === 'update') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

						const body: Record<string, any> = {};
						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== '' && value !== 0 && value !== undefined) {
								body[key] = value;
							}
						}

						responseData = await dealFlowApiRequest.call(
							this,
							'PATCH',
							`/dealflow/deals/${dealId}`,
							body,
						);
					}

					if (operation === 'moveStage') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						const stageId = this.getNodeParameter('stageId', i) as number;

						responseData = await dealFlowApiRequest.call(
							this,
							'POST',
							`/dealflow/deals/${dealId}/stage`,
							{ stage_id: stageId },
						);
					}
				}

				if (resource === 'note') {
					// ----------------------------------------
					//             note operations
					// ----------------------------------------

					if (operation === 'create') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						const bodyText = this.getNodeParameter('body', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							source_type?: string;
							source_ref?: string;
						};

						const body: Record<string, any> = { body: bodyText };

						if (additionalFields.source_type) {
							body.source_type = additionalFields.source_type;
						}
						if (additionalFields.source_ref) {
							body.source_ref = additionalFields.source_ref;
						}

						responseData = await dealFlowApiRequest.call(
							this,
							'POST',
							`/dealflow/deals/${dealId}/notes`,
							body,
						);
					}
				}

				if (resource === 'task') {
					// ----------------------------------------
					//             task operations
					// ----------------------------------------

					if (operation === 'create') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						const title = this.getNodeParameter('title', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							description?: string;
							priority?: string;
							owner_id?: number;
							due_at?: string;
							reminder_at?: string;
						};

						const body: Record<string, any> = { title };

						for (const [key, value] of Object.entries(additionalFields)) {
							if (value !== '' && value !== 0 && value !== undefined) {
								body[key] = value;
							}
						}

						responseData = await dealFlowApiRequest.call(
							this,
							'POST',
							`/dealflow/deals/${dealId}/tasks`,
							body,
						);
					}

					if (operation === 'update') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						const taskId = this.getNodeParameter('taskId', i) as number;
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

						const body: Record<string, any> = {};
						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== '' && value !== 0 && value !== undefined) {
								body[key] = value;
							}
						}

						responseData = await dealFlowApiRequest.call(
							this,
							'PATCH',
							`/dealflow/deals/${dealId}/tasks/${taskId}`,
							body,
						);
					}
				}

				if (resource === 'contact') {
					// ----------------------------------------
					//           contact operations
					// ----------------------------------------

					if (operation === 'add') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						const contactId = this.getNodeParameter('contactId', i) as number;
						const label = this.getNodeParameter('label', i, '') as string;

						const contact: Record<string, any> = { contact_id: contactId };
						if (label) {
							contact.label = label;
						}

						responseData = await dealFlowApiRequest.call(
							this,
							'POST',
							`/dealflow/deals/${dealId}/contacts`,
							{ contacts: [contact] },
						);
					}
				}

				if (resource === 'timeline') {
					// ----------------------------------------
					//           timeline operations
					// ----------------------------------------

					if (operation === 'get') {
						const dealId = this.getNodeParameter('dealId', i) as number;
						responseData = await dealFlowApiRequest.call(
							this,
							'GET',
							`/dealflow/deals/${dealId}/timeline`,
						);
					}
				}

				// Normalize output
				if (responseData === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				// Handle array responses (getAll) vs single object responses
				if (Array.isArray(responseData)) {
					returnData.push(
						...responseData.map((item: any) => ({
							json: item,
							pairedItem: { item: i },
						})),
					);
				} else {
					// Extract the entity from wrapper if present
					const data =
						responseData.deal ||
						responseData.note ||
						responseData.task ||
						responseData.contact ||
						responseData.timeline ||
						responseData.data ||
						responseData;

					returnData.push({
						json: data,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
