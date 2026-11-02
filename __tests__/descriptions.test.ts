import { dealOperations, dealFields } from '../nodes/DealFlow/descriptions/DealDescription';
import { noteOperations, noteFields } from '../nodes/DealFlow/descriptions/NoteDescription';
import { taskOperations, taskFields } from '../nodes/DealFlow/descriptions/TaskDescription';
import { contactOperations, contactFields } from '../nodes/DealFlow/descriptions/ContactDescription';
import { timelineOperations, timelineFields } from '../nodes/DealFlow/descriptions/TimelineDescription';
import { INodeProperties } from 'n8n-workflow';

/**
 * Helper: verify every INodeProperties entry has required base fields.
 */
function expectValidNodeProperties(props: INodeProperties[]) {
	for (const prop of props) {
		expect(prop.name).toBeDefined();
		expect(typeof prop.name).toBe('string');
		expect(prop.displayName).toBeDefined();
		expect(typeof prop.displayName).toBe('string');
		expect(prop.type).toBeDefined();
		expect(prop.default).not.toBeUndefined(); // default can be '' or 0 but must exist
	}
}

describe('DealDescription', () => {
	it('exports valid INodeProperties for operations', () => {
		expectValidNodeProperties(dealOperations);
	});

	it('exports valid INodeProperties for fields', () => {
		expectValidNodeProperties(dealFields);
	});

	it('defines all 5 operations: create, get, getAll, update, moveStage', () => {
		const ops = dealOperations[0];
		expect(ops.name).toBe('operation');
		expect(ops.displayOptions?.show?.resource).toEqual(['deal']);

		const values = (ops as any).options.map((o: any) => o.value);
		expect(values).toEqual(['create', 'get', 'getAll', 'update', 'moveStage']);
	});

	it('has required title field for create operation', () => {
		const title = dealFields.find(
			(f) =>
				f.name === 'title' &&
				f.displayOptions?.show?.operation?.includes('create'),
		);
		expect(title).toBeDefined();
		expect(title!.required).toBe(true);
	});

	it('has dealId field for get, update, and moveStage operations', () => {
		const dealIdFields = dealFields.filter((f) => f.name === 'dealId');
		expect(dealIdFields.length).toBeGreaterThanOrEqual(3);

		const ops = dealIdFields.flatMap(
			(f) => f.displayOptions?.show?.operation || [],
		);
		expect(ops).toContain('get');
		expect(ops).toContain('update');
		expect(ops).toContain('moveStage');
	});

	it('has status filter with open/won/lost options', () => {
		const filters = dealFields.find((f) => f.name === 'filters');
		expect(filters).toBeDefined();

		const statusOption = (filters as any).options.find(
			(o: any) => o.name === 'status',
		);
		expect(statusOption).toBeDefined();

		const statusValues = statusOption.options.map((o: any) => o.value);
		expect(statusValues).toEqual(['open', 'won', 'lost']);
	});

	it('has returnAll and limit fields for getAll', () => {
		const returnAll = dealFields.find((f) => f.name === 'returnAll');
		expect(returnAll).toBeDefined();
		expect(returnAll!.displayOptions?.show?.operation).toEqual(['getAll']);

		const limit = dealFields.find((f) => f.name === 'limit');
		expect(limit).toBeDefined();
		expect(limit!.displayOptions?.show?.returnAll).toEqual([false]);
	});

	it('has stageId field with loadOptionsMethod for moveStage', () => {
		const stageId = dealFields.find(
			(f) =>
				f.name === 'stageId' &&
				f.displayOptions?.show?.operation?.includes('moveStage'),
		);
		expect(stageId).toBeDefined();
		expect(stageId!.required).toBe(true);
		expect((stageId as any).typeOptions?.loadOptionsMethod).toBe('getStages');
	});

	it('additionalFields for create includes pipeline_id and stage_id with loadOptions', () => {
		const additional = dealFields.find(
			(f) =>
				f.name === 'additionalFields' &&
				f.displayOptions?.show?.operation?.includes('create'),
		);
		expect(additional).toBeDefined();

		const pipelineOpt = (additional as any).options.find(
			(o: any) => o.name === 'pipeline_id',
		);
		expect(pipelineOpt).toBeDefined();
		expect(pipelineOpt.typeOptions.loadOptionsMethod).toBe('getPipelines');

		const stageOpt = (additional as any).options.find(
			(o: any) => o.name === 'stage_id',
		);
		expect(stageOpt).toBeDefined();
		expect(stageOpt.typeOptions.loadOptionsMethod).toBe('getStages');
	});
});

describe('NoteDescription', () => {
	it('exports valid INodeProperties for operations', () => {
		expectValidNodeProperties(noteOperations);
	});

	it('exports valid INodeProperties for fields', () => {
		expectValidNodeProperties(noteFields);
	});

	it('defines create operation only', () => {
		const ops = noteOperations[0];
		const values = (ops as any).options.map((o: any) => o.value);
		expect(values).toEqual(['create']);
		expect(ops.displayOptions?.show?.resource).toEqual(['note']);
	});

	it('has required dealId and body fields for create', () => {
		const dealId = noteFields.find((f) => f.name === 'dealId');
		expect(dealId).toBeDefined();
		expect(dealId!.required).toBe(true);

		const body = noteFields.find((f) => f.name === 'body');
		expect(body).toBeDefined();
		expect(body!.required).toBe(true);
	});

	it('has additionalFields with source_type and source_ref', () => {
		const additional = noteFields.find((f) => f.name === 'additionalFields');
		expect(additional).toBeDefined();

		const optNames = (additional as any).options.map((o: any) => o.name);
		expect(optNames).toContain('source_type');
		expect(optNames).toContain('source_ref');
	});
});

describe('TaskDescription', () => {
	it('exports valid INodeProperties for operations', () => {
		expectValidNodeProperties(taskOperations);
	});

	it('exports valid INodeProperties for fields', () => {
		expectValidNodeProperties(taskFields);
	});

	it('defines create and update operations', () => {
		const values = (taskOperations[0] as any).options.map((o: any) => o.value);
		expect(values).toEqual(['create', 'update']);
	});

	it('has priority option with low/normal/high/urgent values', () => {
		const additional = taskFields.find(
			(f) =>
				f.name === 'additionalFields' &&
				f.displayOptions?.show?.operation?.includes('create'),
		);
		expect(additional).toBeDefined();

		const priority = (additional as any).options.find(
			(o: any) => o.name === 'priority',
		);
		expect(priority).toBeDefined();

		const values = priority.options.map((o: any) => o.value);
		expect(values).toEqual(['low', 'normal', 'high', 'urgent']);
	});

	it('update has taskId field (required)', () => {
		const taskId = taskFields.find(
			(f) =>
				f.name === 'taskId' &&
				f.displayOptions?.show?.operation?.includes('update'),
		);
		expect(taskId).toBeDefined();
		expect(taskId!.required).toBe(true);
	});

	it('update fields include status with open/completed options', () => {
		const updateFields = taskFields.find(
			(f) =>
				f.name === 'updateFields' &&
				f.displayOptions?.show?.operation?.includes('update'),
		);
		expect(updateFields).toBeDefined();

		const status = (updateFields as any).options.find(
			(o: any) => o.name === 'status',
		);
		expect(status).toBeDefined();

		const values = status.options.map((o: any) => o.value);
		expect(values).toEqual(['open', 'completed']);
	});
});

describe('ContactDescription', () => {
	it('exports valid INodeProperties for operations', () => {
		expectValidNodeProperties(contactOperations);
	});

	it('exports valid INodeProperties for fields', () => {
		expectValidNodeProperties(contactFields);
	});

	it('defines add operation only', () => {
		const values = (contactOperations[0] as any).options.map(
			(o: any) => o.value,
		);
		expect(values).toEqual(['add']);
		expect(contactOperations[0].displayOptions?.show?.resource).toEqual([
			'contact',
		]);
	});

	it('has required dealId and contactId fields', () => {
		const dealId = contactFields.find((f) => f.name === 'dealId');
		expect(dealId).toBeDefined();
		expect(dealId!.required).toBe(true);

		const contactId = contactFields.find((f) => f.name === 'contactId');
		expect(contactId).toBeDefined();
		expect(contactId!.required).toBe(true);
	});

	it('has optional label field', () => {
		const label = contactFields.find((f) => f.name === 'label');
		expect(label).toBeDefined();
		expect(label!.required).toBeFalsy();
	});
});

describe('TimelineDescription', () => {
	it('exports valid INodeProperties for operations', () => {
		expectValidNodeProperties(timelineOperations);
	});

	it('exports valid INodeProperties for fields', () => {
		expectValidNodeProperties(timelineFields);
	});

	it('defines get operation only', () => {
		const values = (timelineOperations[0] as any).options.map(
			(o: any) => o.value,
		);
		expect(values).toEqual(['get']);
		expect(timelineOperations[0].displayOptions?.show?.resource).toEqual([
			'timeline',
		]);
	});

	it('has required dealId field', () => {
		const dealId = timelineFields.find((f) => f.name === 'dealId');
		expect(dealId).toBeDefined();
		expect(dealId!.required).toBe(true);
	});
});
