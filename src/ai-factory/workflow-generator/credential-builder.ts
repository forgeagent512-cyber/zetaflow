export class CredentialBuilder {
  build(requiredCredentials: string[]): Array<{ name: string; type: string }> {
    return requiredCredentials.map((credential) => ({
      name: credential,
      type: credential.toLowerCase().replace(/\s+/g, '_')
    }));
  }
}
