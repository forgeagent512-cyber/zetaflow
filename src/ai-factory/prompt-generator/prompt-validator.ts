export class PromptValidator {
  validate(prompt: { system_prompt: string; developer_prompt: string; assistant_prompt: string; prompt_json: Record<string, unknown> }): void {
    if (!prompt.system_prompt || prompt.system_prompt.length < 40) {
      throw new Error('System prompt is too short');
    }

    if (!prompt.developer_prompt || prompt.developer_prompt.length < 30) {
      throw new Error('Developer prompt is too short');
    }

    if (!prompt.assistant_prompt || prompt.assistant_prompt.length < 30) {
      throw new Error('Assistant prompt is too short');
    }

    if (!prompt.prompt_json || typeof prompt.prompt_json !== 'object') {
      throw new Error('Prompt JSON payload is invalid');
    }
  }
}
