export class PromptSerializer {
    serialize(prompt) {
        return {
            prompt_name: prompt.prompt_name,
            prompt_type: prompt.prompt_type,
            system_prompt: prompt.system_prompt,
            developer_prompt: prompt.developer_prompt,
            assistant_prompt: prompt.assistant_prompt,
            prompt_json: prompt.prompt_json,
            version: prompt.version,
            status: prompt.status
        };
    }
}
