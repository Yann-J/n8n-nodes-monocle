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
						action: 'Get a metric',
					},
				],
				default: 'query',
			},

			// Metric fields
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Index',
				name: 'index',
				type: 'options',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: {
					show: {
						resource: ['metric', 'search'],
						operation: ['get', 'query'],
					},
				},
				typeOptions: {
					loadOptionsMethod: 'loadWorkspaces',
				},
				default: '',
			},
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
				displayOptions: {
					show: {
						resource: ['metric', 'search'],
						operation: ['get', 'query'],
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
				type: 'options',
				displayOptions: {
					show: {
						resource: ['search'],
						operation: ['query'],
					},
				},
				// From https://github.com/change-metrics/monocle/blob/master/schemas/monocle/protob/search.proto
				options: [
					{
						name: 'QUERY_CHANGE',
						value: 0,
					},
					{
						name: 'QUERY_REPOS_SUMMARY',
						value: 2,
					},
					{
						name: 'QUERY_TOP_AUTHORS_CHANGES_CREATED',
						value: 3,
					},
					{
						name: 'QUERY_TOP_AUTHORS_CHANGES_MERGED',
						value: 4,
					},
					{
						name: 'QUERY_TOP_AUTHORS_CHANGES_REVIEWED',
						value: 5,
					},
					{
						name: 'QUERY_TOP_AUTHORS_CHANGES_COMMENTED',
						value: 6,
					},
					{
						name: 'QUERY_TOP_REVIEWED_AUTHORS',
						value: 7,
					},
					{
						name: 'QUERY_TOP_COMMENTED_AUTHORS',
						value: 8,
					},
					{
						name: 'QUERY_TOP_AUTHORS_PEERS',
						value: 9,
					},
					{
						name: 'QUERY_NEW_CHANGES_AUTHORS',
						value: 10,
					},
					// Activity page
					{
						name: 'QUERY_CHANGES_REVIEW_STATS',
						value: 20,
					},
					{
						name: 'QUERY_CHANGES_LIFECYCLE_STATS',
						value: 21,
					},
					{
						name: 'QUERY_ACTIVE_AUTHORS_STATS',
						value: 22,
					},
					// Change page
					{
						name: 'QUERY_CHANGE_AND_EVENTS',
						value: 30,
					},
					{
						name: 'QUERY_CHANGES_TOPS',
						value: 31,
					},
					// Ratio
					{
						name: 'QUERY_RATIO_COMMITS_VS_REVIEWS',
						value: 40,
					},
					// Histo
					{
						name: 'QUERY_HISTO_COMMITS',
						value: 50,
					},
					{
						name: 'QUERY_HISTO_REVIEWS_AND_COMMENTS',
						value: 51,
					},
				],
				default: 0,
			},
		],
	};

	methods = {
		loadOptions: {
			loadMetrics,
			loadWorkspaces,
		},
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
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
