import type {
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {};
const parser = new N8NPropertiesBuilder(doc, config);
const properties = parser.build();

async function makeBinary(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (Buffer.isBuffer(response.body)) {
		let filename: string | undefined = undefined;
		const contentDisposition = response.headers['content-disposition'];
		if (contentDisposition && typeof contentDisposition === 'string') {
			const filenameMatch = contentDisposition.match(/filename\s*=\s*"?([^;"]+)"?/i);
			if (filenameMatch && filenameMatch[1]) {
				filename = filenameMatch[1];
			}
		}
		const binary = await this.helpers.prepareBinaryData(
			response.body,
			filename,
			(response.headers['content-type'] as string) || 'application/octet-stream',
		);

		return await items.map((item) => {
			item.binary = { data: binary };
			return item;
		});
	} else {
		return items;
	}
}

for (const prop of properties) {
	if (prop.name === 'additionalFields' && prop.routing?.send) {
		prop.default = '[]';
		prop.routing.send.preSend = [
			async (reqOpts) => {
				reqOpts.qs = {
					additionalFields: JSON.parse(reqOpts.qs?.additionalFields as string),
				};
				reqOpts.arrayFormat = 'repeat';
				return reqOpts;
			},
		];
	} else if (prop.options) {
		for (const opt of prop.options) {
			if (
				(opt as INodePropertyOptions).routing?.request?.method === 'GET' &&
				((opt as INodePropertyOptions).routing?.request?.url?.endsWith('/report') ||
					(opt as INodePropertyOptions).routing?.request?.url?.endsWith('/documentFile'))
			) {
				(opt as INodePropertyOptions).routing!.request!.returnFullResponse = true;
				(opt as INodePropertyOptions).routing!.request!.encoding = 'arraybuffer';
				(opt as INodePropertyOptions).routing!.output = {
					postReceive: [makeBinary],
				};
			}
		}
	}
}

//console.log(JSON.stringify(properties));

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
