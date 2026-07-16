export class DeploymentPlanner {
    plan(requiredIntegrations) {
        if (requiredIntegrations.includes('Stripe') || requiredIntegrations.includes('Twilio') || requiredIntegrations.includes('WhatsApp Cloud')) {
            return 'cloud';
        }
        if (requiredIntegrations.includes('Postgres') || requiredIntegrations.includes('Redis')) {
            return 'hybrid';
        }
        return 'self_hosted';
    }
}
