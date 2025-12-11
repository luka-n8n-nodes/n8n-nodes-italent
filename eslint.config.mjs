import { config } from '@n8n/node-cli/eslint';

export default [
	...config,
	{
		rules: {
			// 禁用 n8n 社区节点限制规则，本插件需要这些依赖才能正常运行
			'@n8n/community-nodes/no-restricted-imports': 'off',
			'@n8n/community-nodes/no-restricted-globals': 'off',
			'@n8n/community-nodes/credential-test-required': 'off',
			'@n8n/community-nodes/credential-password-field': 'off',
			// 暂时禁用一些严格规则，后续可逐步修复
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'prefer-const': 'warn',
		},
	},
];

