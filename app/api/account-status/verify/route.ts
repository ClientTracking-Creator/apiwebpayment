import { NextResponse } from 'next/server';
import { verifySessionToken } from '../token';
import { getAppSettings } from '../../firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ error: 'Session is invalid or expired.' }, { status: 401 });
    }

    if (!session.firebaseIdToken) {
      return NextResponse.json({ error: 'Firebase session is missing.' }, { status: 401 });
    }

    const settings = await getAppSettings(session.profileId, session.firebaseIdToken);

    return NextResponse.json({
      profileId: session.profileId,
      email: session.email || 'Email not available',
      subscriptionExpiry: settings.subscriptionExpiry || '',
      trialStartedAt: settings.trialStartedAt || '',
      expiresAt: session.expiresAt
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Unable to verify account session.',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
