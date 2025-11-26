import {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
    IHttpRequestHelper,
    ICredentialDataDecryptedObject
} from 'n8n-workflow';

export class ITalentApi implements ICredentialType {
    name = 'iTalentApi';
    displayName = '北森 iTalent API';
    documentationUrl = 'https://open.italent.cn/';
    // @ts-ignore
    icon = 'file:icon.svg';
    properties: INodeProperties[] = [
        {
            displayName: '请求地址',
            name: 'baseUrl',
            type: 'string',
            default: 'https://openapi.italent.cn',
            required: true,
            description: '北森 API 基础地址（默认：https://openapi.italent.cn）',
        },
        {
            displayName: 'App Key',
            name: 'app_key',
            type: 'string',
            default: '',
            required: true,
            description: '应用的 App Key，从北森开放平台获取',
        },
        {
            displayName: 'App Secret',
            name: 'app_secret',
            type: 'string',
            typeOptions: {
                password: true
            },
            default: '',
            required: true,
            description: '应用的 App Secret，从北森开放平台获取',
        },
        {
            displayName: 'Access Token',
            name: 'accessToken',
            type: 'hidden',
            default: '',
            typeOptions: {
                expirable: true,
            },
        },
    ];

    // 认证配置 - 在实际请求中自动添加必要的头部信息
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'Authorization': '={{$credentials.accessToken}}',
            }
        },
    };

	// 在认证前处理 token
	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		// 调用北森接口获取 accessToken
		const res = (await this.helpers.httpRequest({
			method: 'POST',
			baseURL: `${credentials.baseUrl}`,
			url: '/token',
			body: {
				grant_type: 'client_credentials',
				app_key: credentials.app_key,
				app_secret: credentials.app_secret,
			},
			json: true,
		})) as any;

		if (!res?.access_token) {
			const errorMsg = `获取 access_token 失败：${res?.error_description || res?.error || '未知错误'}`;
			throw new Error(errorMsg);
		}

		// 北森API返回的token_type是bearer，access_token需要加上Bearer前缀
		// expires_in 是秒数，需要转换为毫秒时间戳
		const expiresIn = res.expires_in || 7200; // 默认7200秒（2小时）
		const expirationTime = Date.now() + expiresIn * 1000;

		return {
			accessToken: `Bearer ${res.access_token}`,
			expiresIn: expirationTime,
		};
	}

    // 测试连接配置 - 使用一个简单的API端点来验证凭证
    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/token',
            method: 'POST',
            body: {
                grant_type: 'client_credentials',
                app_key: '={{$credentials.app_key}}',
                app_secret: '={{$credentials.app_secret}}',
            },
        },
        rules: [
            {
                type: 'responseSuccessBody',
                properties: {
                    key: 'access_token',
                    value: undefined,
                    message: '凭证验证失败：无法获取 access_token',
                },
            },
        ],
    };
}


