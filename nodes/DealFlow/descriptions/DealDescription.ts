import { INodeProperties } from 'n8n-workflow';

export const dealOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['deal'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new deal',
				action: 'Create a deal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a deal by ID',
				action: 'Get a deal',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many deals',
				action: 'Get many deals',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing deal',
				action: 'Update a deal',
			},
			{
				name: 'Move Stage',
				value: 'moveStage',
				description: 'Move a deal to a different stage',
				action: 'Move a deal to a different stage',
			},
		],
		default: 'create',
	},
];

export const dealFields: INodeProperties[] = [
	// ----------------------------------
	//         deal:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		description: 'The title of the deal',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Pipeline Name or ID',
				name: 'pipeline_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelines',
				},
				default: '',
				description: 'The pipeline for this deal. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Stage Name or ID',
				name: 'stage_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStages',
					loadOptionsDependsOn: ['additionalFields.pipeline_id'],
				},
				default: '',
				description: 'The stage within the selected pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 0,
				description: 'The monetary value of the deal',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Three-letter ISO currency code',
			},
			{
				displayName: 'Confidence',
				name: 'confidence',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 50,
				description: 'Win probability percentage (0-100)',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'The Mautic company ID to associate with this deal',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'number',
				default: 0,
				description: 'The Mautic user ID who owns this deal',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expected_close_date',
				type: 'string',
				default: '',
				placeholder: '2026-06-01',
				description: 'Expected close date in YYYY-MM-DD format',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'A description of the deal',
			},
			{
				displayName: 'External Reference',
				name: 'external_ref',
				type: 'string',
				default: '',
				description: 'An external reference ID (e.g., from another CRM)',
			},
		],
	},
	{
		displayName: 'Contacts',
		name: 'contactsUi',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Contact',
		default: {},
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'contactValues',
				displayName: 'Contact',
				values: [
					{
						displayName: 'Contact ID',
						name: 'contact_id',
						type: 'number',
						default: 0,
						description: 'The Mautic contact ID',
					},
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						placeholder: 'Decision Maker',
						description: 'The role label for this contact on the deal',
					},
				],
			},
		],
		description: 'Contacts to associate with the deal',
	},

	// ----------------------------------
	//         deal:get
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['get'],
			},
		},
		description: 'The ID of the deal to retrieve',
	},

	// ----------------------------------
	//         deal:getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Pipeline Name or ID',
				name: 'pipeline_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelines',
				},
				default: '',
				description: 'Filter by pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Open', value: 'open' },
					{ name: 'Won', value: 'won' },
					{ name: 'Lost', value: 'lost' },
				],
				default: 'open',
				description: 'Filter by deal status',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search deals by title or description',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'number',
				default: 0,
				description: 'Filter by owner user ID',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'Filter by company ID',
			},
		],
	},

	// ----------------------------------
	//         deal:update
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['update'],
			},
		},
		description: 'The ID of the deal to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the deal',
			},
			{
				displayName: 'Pipeline Name or ID',
				name: 'pipeline_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelines',
				},
				default: '',
				description: 'The pipeline for this deal. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Stage Name or ID',
				name: 'stage_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getStages',
					loadOptionsDependsOn: ['updateFields.pipeline_id'],
				},
				default: '',
				description: 'The stage within the selected pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 0,
				description: 'The monetary value of the deal',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Three-letter ISO currency code',
			},
			{
				displayName: 'Confidence',
				name: 'confidence',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 50,
				description: 'Win probability percentage (0-100)',
			},
			{
				displayName: 'Company ID',
				name: 'company_id',
				type: 'number',
				default: 0,
				description: 'The Mautic company ID to associate with this deal',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'number',
				default: 0,
				description: 'The Mautic user ID who owns this deal',
			},
			{
				displayName: 'Expected Close Date',
				name: 'expected_close_date',
				type: 'string',
				default: '',
				placeholder: '2026-06-01',
				description: 'Expected close date in YYYY-MM-DD format',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'A description of the deal',
			},
			{
				displayName: 'External Reference',
				name: 'external_ref',
				type: 'string',
				default: '',
				description: 'An external reference ID (e.g., from another CRM)',
			},
		],
	},

	// ----------------------------------
	//         deal:moveStage
	// ----------------------------------
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['moveStage'],
			},
		},
		description: 'The ID of the deal to move',
	},
	{
		displayName: 'Stage Name or ID',
		name: 'stageId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStages',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['deal'],
				operation: ['moveStage'],
			},
		},
		description: 'The target stage. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
