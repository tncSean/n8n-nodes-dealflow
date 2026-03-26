import { INodeProperties } from 'n8n-workflow';

export const timelineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['timeline'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get the timeline for a deal',
				action: 'Get a deal timeline',
			},
		],
		default: 'get',
	},
];

export const timelineFields: INodeProperties[] = [
	// ----------------------------------
	//         timeline:get
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['timeline'],
				operation: ['get'],
			},
		},
		description: 'The ID of the deal to get the timeline for',
	},
];
