import { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contact'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Add a contact to a deal',
				action: 'Add a contact to a deal',
			},
		],
		default: 'add',
	},
];

export const contactFields: INodeProperties[] = [
	// ----------------------------------
	//         contact:add
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['add'],
			},
		},
		description: 'The ID of the deal to add the contact to',
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['add'],
			},
		},
		description: 'The Mautic contact ID to associate with the deal',
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['add'],
			},
		},
		placeholder: 'Decision Maker',
		description: 'The role label for this contact on the deal (e.g., "Decision Maker", "Champion", "End User")',
	},
];
