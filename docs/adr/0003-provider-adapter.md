# ADR-003 Provider 适配器
ProviderAdapter {submit, poll, cancel?} 统一接口；mock（默认，demo/E2E 底座）/ dashscope（百炼图像模型异步任务）/ comfyui（预留，接本机 ComfyUI）。
模型注册表（contracts.ModelInfo）驱动 UI 与计费展示；能力约束 capabilities.supportsPrompt / requiresInputs 供 P3 工作流连线校验。
