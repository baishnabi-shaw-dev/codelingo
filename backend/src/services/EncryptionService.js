import crypto from 'crypto';

class EncryptionService {
  constructor(secretKey) {
    this.secretKey = secretKey || process.env.JWT_SECRET || 'default-secret';
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(text) {
    if (!text) return null;

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encrypted) {
    if (!encrypted) return null;

    try {
      if (encrypted.startsWith('v1:')) {
        const [, ivHex, authTagHex, encryptedHex] = encrypted.split(':');
        const decipher = crypto.createDecipheriv(
          this.algorithm,
          this.getKey(),
          Buffer.from(ivHex, 'hex')
        );

        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        return Buffer.concat([
          decipher.update(Buffer.from(encryptedHex, 'hex')),
          decipher.final(),
        ]).toString('utf8');
      }

      const decipher = crypto.createDecipher('aes192', this.secretKey);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Unable to decrypt stored API key');
      return null;
    }
  }

  getKey() {
    return crypto.createHash('sha256').update(this.secretKey).digest();
  }
}

export default EncryptionService;
