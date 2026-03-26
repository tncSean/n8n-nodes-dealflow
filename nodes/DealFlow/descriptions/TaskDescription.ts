import { INodeProperties } from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['task'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a task on a deal',
				action: 'Create a task',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing task',
				action: 'Update a task',
			},
		],
		default: 'create',
	},
];

export const taskFields: INodeProperties[] = [
	// ----------------------------------
	//         task:create
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		description: 'The ID of the deal to add the task to',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		description: 'The title of the task',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'A description of the task',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Normal', value: 'normal' },
					{ name: 'High', value: 'high' },
					{ name: 'Urgent', value: 'urgent' },
				],
				default: 'normal',
				description: 'The priority level of the task',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'number',
				default: 0,
				description: 'The Mautic user ID assigned to this task',
			},
			{
				displayName: 'Due At',
				name: 'due_at',
				type: 'string',
				default: '',
				placeholder: '2026-06-01T09:00:00+00:00',
				description: 'The due date/time in ISO 8601 format',
			},
			{
				displayName: 'Reminder At',
				name: 'reminder_at',
				type: 'string',
				default: '',
				placeholder: '2026-05-31T09:00:00+00:00',
				description: 'When to send a reminder, in ISO 8601 format',
			},
		],
	},

	// ----------------------------------
	//         task:update
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		description: 'The ID of the deal the task belongs to',
	},
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		description: 'The ID of the task to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the task',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'A description of the task',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Normal', value: 'normal' },
					{ name: 'High', value: 'high' },
					{ name: 'Urgent', value: 'urgent' },
				],
				default: 'normal',
				description: 'The priority level of the task',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'number',
				default: 0,
				description: 'The Mautic user ID assigned to this task',
			},
			{
				displayName: 'Due At',
				name: 'due_at',
				type: 'string',
				default: '',
				placeholder: '2026-06-01T09:00:00+00:00',
				description: 'The due date/time in ISO 8601 format',
			},
			{
				displayName: 'Reminder At',
				name: 'reminder_at',
				type: 'string',
				default: '',
				placeholder: '2026-05-31T09:00:00+00:00',
				description: 'When to send a reminder, in ISO 8601 format',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Completed', value: 'completed' },
				],
				default: 'open',
				description: 'The status of the task',
			},
		],
	},
];
