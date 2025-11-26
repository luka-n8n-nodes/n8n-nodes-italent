import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
	sleep,
} from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

interface RequestOptions {
	batching?: { batch?: { batchSize?: number; batchInterval?: number } };
	timeout?: number;
}

const CancelAIInterviewOperate: ResourceOperations = {
	name: '取消AI面试',
	value: 'cancelAIInterview',
	action: '取消AI面试',
	options: [
		{
			displayName: 'Invite IDs',
			name: 'inviteIds',
			type: 'string',
			default: '',
			description: 'Array of invite IDs (max 100). Can be a JSON string or an expression that returns an array.',
			placeholder: '["id1", "id2"] or {{ $json.inviteIds }}',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add option',
			default: {},
			options: [
				{
					displayName: 'Batching',
					name: 'batching',
					placeholder: 'Add Batching',
					type: 'fixedCollection',
					typeOptions: {
						multipleValues: false,
					},
					default: {
						batch: {},
					},
					options: [
						{
							displayName: 'Batching',
							name: 'batch',
							values: [
								{
									displayName: 'Items per Batch',
									name: 'batchSize',
									type: 'number',
									typeOptions: {
										minValue: -1,
									},
									default: 50,
									description:
										'输入将被分批处理以限制请求。 -1 表示禁用。0 将被视为 1。',
								},
								{
									displayName: 'Batch Interval (Ms)',
									name: 'batchInterval',
									type: 'number',
									typeOptions: {
										minValue: 0,
									},
									default: 1000,
									description: '每批请求之间的时间（毫秒）。0 表示禁用。',
								},
							],
						},
					],
				},
				{
					displayName: 'Timeout',
					name: 'timeout',
					type: 'number',
					typeOptions: {
						minValue: 1,
					},
					default: 300000,
					description:
						'等待服务器发送响应头（并开始响应体）的时间（毫秒），超过此时间将中止请求',
				},
			],
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const inviteIdsInput = this.getNodeParameter('inviteIds', index, '') as string | string[];
		const options = this.getNodeParameter('options', index, {}) as RequestOptions;
		
		let inviteIds: string[] = [];

		// 处理 inviteIds 输入
		if (Array.isArray(inviteIdsInput)) {
			inviteIds = inviteIdsInput;
		} else if (typeof inviteIdsInput === 'string') {
			const trimmed = inviteIdsInput.trim();
			if (trimmed !== '') {
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed)) {
						inviteIds = parsed;
					} else {
						throw new Error('Parsed value is not an array');
					}
				} catch (error) {
					throw new Error('Invalid input for inviteIds. Expected a JSON array string or an expression that returns an array.');
				}
			}
		} else if (inviteIdsInput) {
			throw new Error('Invalid input type for inviteIds. Expected a string or array.');
		}

		// 过滤空值并确保都是字符串
		inviteIds = inviteIds
			.filter(id => id != null && id !== '')
			.map(id => String(id).trim())
			.filter(id => id.length > 0);

		// 验证 inviteIds（可以为空）
		if (inviteIds.length > 100) {
			throw new Error(`邀请ID集合不能超过100个，您提供了${inviteIds.length}个，请减少ID数量`);
		}

		// 处理批次延迟
		const handleBatchDelay = async (): Promise<void> => {
			const batchSize = options.batching?.batch?.batchSize ?? -1;
			const batchInterval = options.batching?.batch?.batchInterval ?? 0;

			if (index > 0 && batchSize >= 0 && batchInterval > 0) {
				const effectiveBatchSize = batchSize > 0 ? batchSize : 1;
				if (index % effectiveBatchSize === 0) {
					await sleep(batchInterval);
				}
			}
		};

		await handleBatchDelay();

		// 构建请求选项
		const requestOptions: any = {
			method: 'POST',
			url: '/AIInterview/api/v1/AIInterviewInvite/CancelAIInterview',
			body: {
				inviteIds,
			},
			json: true,
		};

		// 添加超时配置
		if (options.timeout) {
			requestOptions.timeout = options.timeout;
		}

		return await RequestUtils.request.call(this, requestOptions);
	},
};

export default CancelAIInterviewOperate;

