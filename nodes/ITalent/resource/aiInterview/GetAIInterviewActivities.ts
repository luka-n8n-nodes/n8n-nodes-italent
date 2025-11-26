import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
	sleep,
} from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

// 内置分页配置
const DEFAULT_MAX_PAGES = 1000;
const DEFAULT_PAGINATION_INTERVAL = 100; // 100ms间隔避免频控
const DEFAULT_DATA_PATH = 'items';
const DEFAULT_NEXT_BATCH_ID_PATH = 'nextBatchId';

const GetAIInterviewActivitiesOperate: ResourceOperations = {
	name: '获取所有启用的AI面试活动数据',
	value: 'getAIInterviewActivities',
	action: '获取所有启用的AI面试活动数据',
	options: [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;

		const getValueByPath = (obj: any, path: string): any => {
			if (!path) return obj;
			return path.split('.').reduce((current, key) => current?.[key], obj);
		};

		const fetchPage = async (batchId: string = ""): Promise<any> => {
			const body: IDataObject = {};
			
			body.batchId = batchId ?? "";

			return await RequestUtils.request.call(this, {
				method: 'POST',
				url: '/AIInterview/api/v1/AIInterviewActivity/GetAIInterviewActivities',
				body,
				json: true,
			});
		};

		if (!returnAll) {
			const response = await fetchPage();
			const data = getValueByPath(response, DEFAULT_DATA_PATH);
			// 如果存在 items 字段，返回 items 数组，否则返回原始响应
			return data !== undefined ? data : response;
		}

		// 获取所有分页数据（使用内置配置）
		const dataPath = DEFAULT_DATA_PATH;
		const nextBatchIdPath = DEFAULT_NEXT_BATCH_ID_PATH;
		const maxPages = DEFAULT_MAX_PAGES;
		const paginationInterval = DEFAULT_PAGINATION_INTERVAL;

		const allResults: any[] = [];
		let currentPage = 1;
		let batchId: string = "";

		// 第一页请求
		const response = await fetchPage(batchId);
		const data = getValueByPath(response, dataPath);
		let nextBatchId = getValueByPath(response, nextBatchIdPath);

		if (data === undefined) {
			this.logger.info('响应数据不包含指定的数据路径，返回原始响应数据');
			return Array.isArray(response) ? response : [response];
		}

		if (Array.isArray(data)) {
			allResults.push(...data);
		} else {
			allResults.push(data);
		}

		if (!nextBatchId || (Array.isArray(data) && data.length === 0)) {
			return allResults;
		}

		// 继续获取后续页
		while (nextBatchId && currentPage < maxPages) {
			if (paginationInterval > 0) {
				await sleep(paginationInterval);
			}

			currentPage++;
			batchId = nextBatchId;

			const nextResponse = await fetchPage(batchId);
			const nextData = getValueByPath(nextResponse, dataPath);
			nextBatchId = getValueByPath(nextResponse, nextBatchIdPath);

			if (nextData === undefined) {
				this.logger.warn('后续页响应数据不包含指定的数据路径，停止分页');
				break;
			}

			if (Array.isArray(nextData)) {
				if (nextData.length === 0) {
					this.logger.info('后续页返回空数组，停止分页');
					break;
				}
				allResults.push(...nextData);
			} else {
				allResults.push(nextData);
			}

			if (!nextBatchId) {
				this.logger.info('已获取所有数据（无更多 nextBatchId）');
				break;
			}
		}

		if (currentPage >= maxPages) {
			this.logger.warn(`已达到最大分页数限制(${maxPages}页)，停止获取`);
		}

		return allResults;
	},
};

export default GetAIInterviewActivitiesOperate;

