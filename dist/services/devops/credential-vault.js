import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY ?? process.env.SECRET_KEY;
    if (!key)
        throw new Error('Encryption key not configured');
    return crypto.scryptSync(key, 'vault-salt', 32);
}
function encrypt(value) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { ciphertext: `${encrypted}:${authTag}`, iv: iv.toString('hex') };
}
function decrypt(ciphertext, iv) {
    const [encrypted, authTag] = ciphertext.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag ?? '', 'hex'));
    let decrypted = decipher.update(encrypted ?? '', 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
export class CredentialVault {
    async storeCredential(orgId, name, provider, value) {
        const supabase = getSupabase();
        const id = crypto.randomUUID();
        const { ciphertext, iv } = encrypt(value);
        const { data, error } = await supabase.from('credential_vault').insert({
            id,
            organization_id: orgId,
            name,
            provider,
            encrypted_value: ciphertext,
            encryption_iv: iv,
            created_at: new Date().toISOString(),
        }).select().single();
        if (error)
            throw new Error(error.message);
        return this.mapRow(data);
    }
    async getCredential(id) {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('credential_vault').select('*').eq('id', id).single();
        if (error)
            throw new Error(error.message);
        if (!data)
            throw new Error('Credential not found');
        const decrypted = decrypt(data.encrypted_value, data.encryption_iv);
        return { record: this.mapRow(data), value: decrypted };
    }
    async getCredentials(orgId) {
        const supabase = getSupabase();
        const { data } = await supabase.from('credential_vault').select('id, organization_id, name, provider, created_at, updated_at').eq('organization_id', orgId).order('created_at', { ascending: false });
        return (data ?? []).map(this.mapRow);
    }
    async deleteCredential(id) {
        const supabase = getSupabase();
        const { error } = await supabase.from('credential_vault').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async rotateCredential(id, newValue) {
        const supabase = getSupabase();
        const { data: existing } = await supabase.from('credential_vault').select('*').eq('id', id).single();
        if (!existing)
            throw new Error('Credential not found');
        const { ciphertext, iv } = encrypt(newValue);
        const { data, error } = await supabase.from('credential_vault').update({
            encrypted_value: ciphertext,
            encryption_iv: iv,
            updated_at: new Date().toISOString(),
        }).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        return this.mapRow(data);
    }
    mapRow(row) {
        return {
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            provider: row.provider,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
