import { INodeProperties } from 'n8n-workflow';

export const noteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a note on a deal',
				action: 'Create a note',
			},
		],
		default: 'create',
	},
];

export const noteFields: INodeProperties[] = [
	// ----------------------------------
	//         note:create
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		description: 'The ID of the deal to add the note to',
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		description: 'The content of the note',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Source Type',
				name: 'source_type',
				type: 'string',
				default: '',
				placeholder: 'n8n',
				description: 'The source system that created this note',
			},
			{
				displayName: 'Source Reference',
				name: 'source_ref',
				type: 'string',
				default: '',
				description: 'A reference ID from the source system',
			},
		],
	},
];
