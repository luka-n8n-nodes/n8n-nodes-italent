import { IExecuteFunctions, IHttpRequestOptions, JsonObject, NodeApiError } from 'n8n-workflow';
import { Credentials } from '../type/enums';

class RequestUtils {
	/**
	 * 处理响应体数据，统一处理业务逻辑
	 * @param context 执行上下文
	 * @param response 原始响应数据
	 * @param isRetry 是否为重试请求（用于错误提示）
	 * @returns 处理后的响应数据
	 */
	private static handleResponse(
		context: IExecuteFunctions,
		response: any,
		isRetry = false,
	): any {
		// 处理二进制数据（如下载资源操作）
		if (response instanceof Buffer || response instanceof ArrayBuffer || response instanceof Uint8Array) {
			return response;
		}

		const { success, message, data, code } = response || {};
		
		// 正常响应（北森API通常使用 success 字段标识成功）
		if (success === true || success === undefined) {
			// 返回 data 字段或原始响应
			return data !== undefined ? data : response;
		}
      
		// 业务错误（北森API返回 200 但 success 为 false）
		const errorPrefix = isRetry ? '刷新凭证后请求北森iTalent API仍然失败' : '请求北森iTalent API错误';
		const errorMsg = `${errorPrefix}: ${message || '未知错误'}`;
		
		throw new NodeApiError(context.getNode(), response as JsonObject, {
			message: errorMsg,
			description: `错误代码: ${code || 'UNKNOWN'}`,
		});
	}

	static async originRequest(
		this: IExecuteFunctions,
		options: IHttpRequestOptions,
		clearAccessToken = false,
	) {
		const authenticationMethod = this.getNodeParameter(
			'authentication',
			0,
			Credentials.ITalentApi,
		) as string;

		const credentials = await this.getCredentials(authenticationMethod);
		options.baseURL = credentials.baseUrl as string;

		if (authenticationMethod === Credentials.ITalentApi) {
			// 如果 clearAccessToken 为 true，则将 accessToken 替换为空字符串，
			// 这样可以触发 preAuthentication 方法获取新的 access token
			const additionalCredentialOptions = {
				credentialsDecrypted: {
					id: Credentials.Id,
					name: Credentials.ITalentApi,
					type: Credentials.Type,
					data: {
						...credentials,
						accessToken: clearAccessToken ? '' : credentials.accessToken,
					},
				},
			};

			return this.helpers.httpRequestWithAuthentication.call(
				this,
				authenticationMethod,
				options,
				additionalCredentialOptions,
			);
		}

		return this.helpers.httpRequestWithAuthentication.call(this, authenticationMethod, options);
	}

	static async request(this: IExecuteFunctions, options: IHttpRequestOptions) {
		try {
			// 首次请求
			const response = await RequestUtils.originRequest.call(this, options);
			const { code } = response || {};

			// 处理 token 过期（北森API通常使用特定的错误代码，如 401 或特定的 code）
			if (code === 'UNAUTHORIZED' || code === 401 || code === '401') {
				// 重新获取 token 后的请求
				const retryResponse = await RequestUtils.originRequest.call(this, options, true);
				// 使用统一的响应处理函数，标记为重试请求
				return RequestUtils.handleResponse(this, retryResponse, true);
			}

			// 使用统一的响应处理函数
			return RequestUtils.handleResponse(this, response);
		} catch (error) {
			// 处理真正的网络错误或其他异常（非200响应）
			throw error;
		}
	}
}

export default RequestUtils;

