import {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
	jsonParse,
} from 'n8n-workflow';
import RequestUtils from '../../../help/utils/RequestUtils';
import { ResourceOperations } from '../../../help/type/IResource';

const ArrangeAIInterviewOperate: ResourceOperations = {
	name: '发起AI面试',
	value: 'arrangeAIInterview',
	action: '发起AI面试',
	options: [
		{
			displayName: '发起AI面试信息',
			name: 'arrangeInterviewInfo',
			type: 'json',
			default: '{}',
			required: true,
			description: '发起AI面试信息，支持JSON字符串或对象格式',
			placeholder: '{"key": "value"}',
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const arrangeInterviewInfoParam = this.getNodeParameter('arrangeInterviewInfo', index);
		
		let arrangeInterviewInfo: IDataObject;
		
		// 支持两种输入方式：JSON字符串或对象
		if (typeof arrangeInterviewInfoParam === 'string') {
			// 如果是字符串，尝试解析JSON
			try {
				arrangeInterviewInfo = jsonParse(arrangeInterviewInfoParam);
			} catch (error) {
				throw new Error('发起AI面试信息 JSON 格式无效: ' + (error as Error).message);
			}
		} else if (typeof arrangeInterviewInfoParam === 'object' && arrangeInterviewInfoParam !== null) {
			// 如果已经是对象，直接使用
			arrangeInterviewInfo = arrangeInterviewInfoParam as IDataObject;
		} else {
			throw new Error('发起AI面试信息必须是JSON字符串或对象格式');
		}

		return await RequestUtils.request.call(this, {
			method: 'POST',
			url: '/AIInterview/api/v1/AIInterviewInvite/ArrangeAIInterview',
			body: {
				arrangeInterviewInfo,
			},
			json: true,
		});
	},
};

export default ArrangeAIInterviewOperate;

