export class CredentialBuilder {
    build(requiredCredentials) {
        return requiredCredentials.map((credential) => ({
            name: credential,
            type: credential.toLowerCase().replace(/\s+/g, '_')
        }));
    }
}
