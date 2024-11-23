import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { monocleApiRequest, loadMetrics, loadWorkspaces } from './GenericFunctions';

export class Monocle implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Monocle',
		name: 'monocle',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:monocle.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Monocle API',
		defaults: {
			name: 'Monocle',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'monocleApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://demo.changemetrics.io',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},

		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Metric',
						value: 'metric',
					},
					{
						name: 'Group',
						value: 'group',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
				default: 'metric',
			},

			// Metric Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,

				displayOptions: {
					show: {
						resource: ['metric'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get metric',
						routing: {
							request: {
								url: '/api/2/metric/get',
							},
						},
						action: 'Get a metric',
					},
					{
						name: 'Info',
						value: 'info',
						description: 'Info on metric',
						routing: {
							request: {
								url: '/api/2/metric/info',
							},
						},
						action: 'Info a metric',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List a metrics',
						routing: {
							request: {
								url: '/api/2/metric/list',
							},
						},
						action: 'List a metric',
					},
				],
				default: 'get',
			},

			// Search Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,

				displayOptions: {
					show: {
						resource: ['search'],
					},
				},
				options: [
					{
						name: 'Query',
						value: 'query',
						description: 'Run query',
						action: 'Run a predefined query',
					},
					{
						name: 'Author',
						value: 'author',
						description: 'Search author',
						action: 'Search author',
					},
				],
				default: 'query',
			},

			// Group Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,

				displayOptions: {
					show: {
						resource: ['group'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'get_groups',
						action: 'List groups',
					},
					{
						name: 'Get Members',
						value: 'get_members',
						action: 'Get group members',
					},
				],
				default: 'get_groups',
			},

			// Project Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,

				displayOptions: {
					show: {
						resource: ['project'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'get_projects',
						action: 'List projects',
					},
				],
				default: 'get_projects',
			},

			// Common fields
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Index',
				name: 'index',
				type: 'options',
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
				description: 'Choose from the list, or specify a string',
				displayOptions: {
					show: {
						resource: ['metric', 'search', 'group', 'project'],
						operation: ['get', 'query', 'get_members', 'get_groups', 'get_projects', 'author'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'loadWorkspaces',
				},
				default: '',
			},

			// Metric fields
			{
				displayName: 'Metric Name or ID',
				name: 'metric',
				type: 'options',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['get', 'info'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'loadMetrics',
				},
				default: '',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				description: 'Query string, just like you would use in the Monocle URL',
				displayOptions: {
					show: {
						resource: ['metric', 'search'],
						operation: ['get', 'query', 'author'],
					},
				},
				default: 'from:now-3weeks',
			},
			// username API parameter does not seem to be doing anything??
			// {
			// 	displayName: 'Username',
			// 	name: 'username',
			// 	type: 'string',
			// 	displayOptions: {
			// 		show: {
			// 			resource: ['metric', 'search'],
			// 			operation: ['get', 'query'],
			// 		},
			// 	},
			// 	default: '',
			// },
			{
				displayName: 'Trend Interval',
				name: 'trend',
				description: 'Should we return a time series or just the current value?',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['metric'],
						operation: ['get'],
					},
				},
				options: [
					{
						name: '0 - None',
						value: 'none',
					},
					{
						name: '1 - Auto',
						value: '',
					},
					{
						name: '2 - Hourly',
						value: 'hour',
					},
					{
						name: '3 - Daily',
						value: 'day',
					},
					{
						name: '4 - Weekly',
						value: 'week',
					},
					{
						name: '5 - Monthly',
						value: 'month',
					},
					{
						name: '6 - Yearly',
						value: 'year',
					},
				],
				default: 'none',
			},

			// query fields
			{
				displayName: 'Query Type',
				name: 'query_type',
				description: 'Type of pre-defined query to run',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['query'],
					},
				},
				// From https://github.com/change-metrics/monocle/blob/master/schemas/monocle/protob/search.proto
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{
						name: 'Change',
						value: 'QUERY_CHANGE',
					},
					{
						name: 'Repos Summary',
						value: 'QUERY_REPOS_SUMMARY',
					},
					{
						name: 'Top Authors Changes Created',
						value: 'QUERY_TOP_AUTHORS_CHANGES_CREATED',
					},
					{
						name: 'Top Authors Changes Merged',
						value: 'QUERY_TOP_AUTHORS_CHANGES_MERGED',
					},
					{
						name: 'Top Authors Changes Reviewed',
						value: 'QUERY_TOP_AUTHORS_CHANGES_REVIEWED',
					},
					{
						name: 'Top Authors Changes Commented',
						value: 'QUERY_TOP_AUTHORS_CHANGES_COMMENTED',
					},
					{
						name: 'Top Reviewed Authors',
						value: 'QUERY_TOP_REVIEWED_AUTHORS',
					},
					{
						name: 'Top Commented Authors',
						value: 'QUERY_TOP_COMMENTED_AUTHORS',
					},
					{
						name: 'Top Authors Peers',
						value: 'QUERY_TOP_AUTHORS_PEERS',
					},
					{
						name: 'New Changes Authors',
						value: 'QUERY_NEW_CHANGES_AUTHORS',
					},
					// Activity page
					{
						name: 'Changes Review Stats',
						value: 'QUERY_CHANGES_REVIEW_STATS',
					},
					{
						name: 'Changes Lifecycle Stats',
						value: 'QUERY_CHANGES_LIFECYCLE_STATS',
					},
					{
						name: 'Active Authors Stats',
						value: 'QUERY_ACTIVE_AUTHORS_STATS',
					},
					// Change page
					{
						name: 'Change And Events',
						value: 'QUERY_CHANGE_AND_EVENTS',
					},
					{
						name: 'Changes Tops',
						value: 'QUERY_CHANGES_TOPS',
					},
					// Ratio
					{
						name: 'Ratio Commits Vs Reviews',
						value: 'QUERY_RATIO_COMMITS_VS_REVIEWS',
					},
					// Histo
					{
						name: 'Histo Commits',
						value: 'QUERY_HISTO_COMMITS',
					},
					{
						name: 'Histo Reviews And Comments',
						value: 'QUERY_HISTO_REVIEWS_AND_COMMENTS',
					},
				],
				default: 'QUERY_CHANGE',
			},

			// group fields
			{
				displayName: 'Group',
				name: 'group',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['group'],
						operation: ['get_members'],
					},
				},
				default: '',
			},
		],
	};

	methods = {
		loadOptions: {
			loadMetrics,
			loadWorkspaces,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				item = items[itemIndex];

				if (resource === 'metric') {
					if (operation === 'list') {
						const response = await monocleApiRequest.call(this, '/api/2/metric/list');

						return [this.helpers.returnJsonArray(response.metrics)];
					}

					if (operation === 'info') {
						const metric = this.getNodeParameter('metric', itemIndex) as string;
						const response = await monocleApiRequest.call(this, '/api/2/metric/info', { metric });
						item.json = response?.info;
					}

					if (operation === 'get') {
						const index = this.getNodeParameter('index', itemIndex) as string;
						// const username = this.getNodeParameter('username', itemIndex) as string;
						const metric = this.getNodeParameter('metric', itemIndex) as string;
						const query = this.getNodeParameter('query', itemIndex) as string;
						const trend = this.getNodeParameter('trend', itemIndex) as string;

						const response = await monocleApiRequest.call(this, '/api/2/metric/get', {
							index,
							// username,
							query,
							metric,
							...(trend !== 'none' && { trend: { interval: trend } }),
						});

						item.json = response;
					}
				}

				if (resource === 'group') {
					if (operation === 'get_groups') {
						const index = this.getNodeParameter('index', itemIndex) as string;

						const response = await monocleApiRequest.call(this, '/api/2/get_groups', {
							index,
						});

						return [this.helpers.returnJsonArray(response?.items)];
					}

					if (operation === 'get_members') {
						const index = this.getNodeParameter('index', itemIndex) as string;
						const group = this.getNodeParameter('group', itemIndex) as string;

						const response = await monocleApiRequest.call(this, '/api/2/get_group_members', {
							index,
							group,
						});

						item.json = response?.members;
					}
				}

				if (resource === 'project') {
					if (operation === 'get_projects') {
						const index = this.getNodeParameter('index', itemIndex) as string;

						const response = await monocleApiRequest.call(this, '/api/2/get_projects', {
							index,
						});

						return [this.helpers.returnJsonArray(response?.projects)];
					}
				}

				if (resource === 'search') {
					if (operation === 'query') {
						const index = this.getNodeParameter('index', itemIndex) as string;
						// const username = this.getNodeParameter('username', itemIndex) as string;
						const query_type = this.getNodeParameter('query_type', itemIndex) as string;
						const query = this.getNodeParameter('query', itemIndex) as string;

						const response = await monocleApiRequest.call(this, '/api/2/search/query', {
							index,
							// username,
							query,
							query_type,
							// order: {
							// 	field: 'string',
							// 	direction: 0,
							// },
							// limit: 0,
							// change_id: 'string',
						});

						item.json = response;
					}

					if (operation === 'author') {
						const index = this.getNodeParameter('index', itemIndex) as string;
						const query = this.getNodeParameter('query', itemIndex) as string;

						const response = await monocleApiRequest.call(this, '/api/2/search/author', {
							index,
							query,
						});

						return [this.helpers.returnJsonArray(response?.authors)];
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
