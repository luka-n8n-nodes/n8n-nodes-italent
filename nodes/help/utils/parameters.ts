import { INodeParameters } from 'n8n-workflow';

/**
 * 配置动态输出
 * 根据参数返回对应的输出配置
 * @param parameters 节点参数
 * @returns 输出配置数组
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const configuredOutputs = (parameters: INodeParameters) => {
	// 默认单输出
	// 如需根据不同操作返回不同输出，可在此处添加逻辑
	// 例如:
	// if (parameters.resource === ResourceType.SomeResource && parameters.operation === OperationType.SomeOperation) {
	//   return [
	//     { type: 'main', displayName: 'Success' },
	//     { type: 'main', displayName: 'Error' },
	//   ];
	// }

	return ['main'];
};

