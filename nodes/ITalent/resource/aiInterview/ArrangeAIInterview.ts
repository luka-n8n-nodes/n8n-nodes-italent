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
			displayName: '发起AI面试规则对象',
			name: 'arrangeCriteriaCode',
			type: 'json',
			default: '{}',
			required: true,
			description: '发起AI面试规则对象，JSON格式',
			placeholder: '{"key": "value"}',
		},
	] as INodeProperties[],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject | IDataObject[]> {
		const arrangeCriteriaCodeStr = this.getNodeParameter('arrangeCriteriaCode', index) as string;
		
		let arrangeCriteriaCode: IDataObject;
		try {
			arrangeCriteriaCode = jsonParse(arrangeCriteriaCodeStr);
		} catch (error) {
			throw new Error('发起AI面试规则对象 JSON 格式无效');
		}

		return await RequestUtils.request.call(this, {
			method: 'POST',
			url: '/AIInterview/api/v1/AIInterviewInvite/ArrangeAIInterview',
			body: {
				arrangeCriteriaCode,
			},
			json: true,
		});
	},
};

export default ArrangeAIInterviewOperate;

