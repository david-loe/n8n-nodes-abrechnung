import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {};
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build();

export class Abrechnung implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'abrechnung 🧾',
		name: 'abrechnung',
		group: ['transform'],
		icon: 'file:receipt.svg',
		version: 1,
		description: 'Interact with abrechnung 🧾 API',
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		defaults: {
			name: 'abrechnung 🧾',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'abrechnungApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.url}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: properties,
	};
}
