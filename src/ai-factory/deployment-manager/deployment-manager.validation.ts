export class DeploymentManagerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeploymentManagerValidationError';
  }
}

export interface DeploymentManagerValidationInput {
  organizationId?: unknown;
  strategy?: unknown;
  target?: unknown;
}

export function validateDeploymentManagerInput(input: DeploymentManagerValidationInput) {
  const organizationId = typeof input.organizationId === 'string' && input.organizationId.trim() ? input.organizationId.trim() : 'system';
  const strategy = typeof input.strategy === 'string' && input.strategy.trim() ? input.strategy : 'fresh_install';
  const target = typeof input.target === 'string' && input.target.trim() ? input.target : 'n8n';

  if (!organizationId) {
    throw new DeploymentManagerValidationError('organizationId is required');
  }

  return { organizationId, strategy, target };
}
