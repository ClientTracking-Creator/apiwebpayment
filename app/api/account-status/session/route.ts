import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { base64Url, encryptSecret, signPayload } from '../token';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileId = typeof body?.profileId === 'string' ? body.profileId.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const subscriptionExpiry = typeof body?.subscriptionExpiry === 'string' ? body.subscriptionExpiry.trim() : '';
    const firebaseIdToken = typeof body?.firebaseIdToken === 'string' ? body.firebaseIdToken.trim() : '';

    if (!profileId || !firebaseIdToken) {
      return NextResponse.json({ error: 'Profile ID and Firebase token are required.' }, { status: 400 });
    }

    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 5 * 60;
    const payload = {
      profileId,
      email,
      subscriptionExpiry,
      encryptedFirebaseIdToken: encryptSecret(firebaseIdToken),
      issuedAt,
      expiresAt,
      nonce: randomBytes(12).toString('base64url')
    };

    const encodedPayload = base64Url(JSON.stringify(payload));
    const signature = signPayload(encodedPayload);

    return NextResponse.json({
      sessionToken: `${encodedPayload}.${signature}`,
      expiresAt
    });
  } catch {
    return NextResponse.json({ error: 'Unable to create account status session.' }, { status: 500 });
  }
}
