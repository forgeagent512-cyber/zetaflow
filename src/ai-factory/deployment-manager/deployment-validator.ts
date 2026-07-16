export class DeploymentValidator {
  validate(input: { organizationId: string; target: string; strategy: string }): void {
    if (!input.organizationId) {
      throw new Error('organizationId is required');
    }
    if (!['n8n', 'supabase', 'railway', 'client_workspace', 'marketplace'].includes(input.target)) {
      throw new Error(`Unsupported target: ${input.target}`);
    }
  }
}
