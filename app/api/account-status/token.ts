import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type AccountSession = {
  profileId: string;
  email: string;
  subscriptionExpiry: string;
  firebaseIdToken?: string;
  encryptedFirebaseIdToken?: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

export const getSigningKey = () => process.env.ACCOUNT_STATUS_TOKEN_SECRET || 'local-dev-account-status-secret';

export const base64Url = (value: Buffer | string) => Buffer.from(value).toString('base64url');

export const signPayload = (encodedPayload: string) =>
  createHmac('sha256', getSigningKey()).update(encodedPayload).digest('base64url');

const getEncryptionKey = () => createHash('sha256').update(getSigningKey()).digest();

export const encryptSecret = (value: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
};

export const decryptSecret = (value: string) => {
  const [ivValue, tagValue, encryptedValue] = value.split('.');

  if (!ivValue || !tagValue || !encryptedValue) return '';

  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final()
  ]).toString('utf8');
};

export const verifySessionToken = (token: string): AccountSession | null => {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AccountSession;
  const now = Math.floor(Date.now() / 1000);

  if (!payload.profileId || payload.expiresAt < now) return null;

  if (payload.encryptedFirebaseIdToken && !payload.firebaseIdToken) {
    payload.firebaseIdToken = decryptSecret(payload.encryptedFirebaseIdToken);
  }

  return payload;
};
