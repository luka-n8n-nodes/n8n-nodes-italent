import { INodePropertyOptions, IDataObject, type IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { OutputType } from './enums';

/**
 * 操作返回结果类型
 * 支持单输出、多输出和自定义输出
 */
export type OperationResult = IDataObject | IDataObject[] | {
	outputType: OutputType;
	outputData?: INodeExecutionData[][];
};

export type ResourceOperations = INodePropertyOptions & {
	options: INodeProperties[];
	call?: (this: IExecuteFunctions, index: number) => Promise<OperationResult>;
	// 默认100
	order?: number;
};

export type ResourceOptions = INodePropertyOptions & {
	// 默认100
	order?: number;
};

export interface IResource extends INodePropertyOptions {
	operations: ResourceOperations[];
}

