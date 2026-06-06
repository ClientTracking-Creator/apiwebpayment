import { NextResponse } from 'next/server';
import { verifySessionToken } from '../../account-status/token';
import { getAppSettings, updateSubscriptionExpiry } from '../../firebase/firestore';

const plans = {
  '1month': { months: 1 },
  '3month': { months: 3 },
  '6month': { months: 6 },
  '1year': { months: 12 }
};

const getNextExpiry = (currentExpiry: string, months: number) => {
  const parsedExpiry = currentExpiry ? new Date(currentExpiry) : new Date();
  const baseDate = parsedExpiry > new Date() ? parsedExpiry : new Date();
  const nextExpiry = new Date(baseDate);
  nextExpiry.setMonth(nextExpiry.getMonth() + months);
  return nextExpiry.toISOString();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    const md5Hash = typeof body?.md5 === 'string' ? body.md5 : '';
    const planId = typeof body?.planId === 'string' ? body.planId : '';
    const session = verifySessionToken(token);
    const plan = plans[planId as keyof typeof plans];

    if (!session) {
      return NextResponse.json({ error: 'Session is invalid or expired.' }, { status: 401 });
    }

    if (!session.firebaseIdToken) {
      return NextResponse.json({ error: 'Firebase session is missing.' }, { status: 401 });
    }

    if (!md5Hash) {
      return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan is not valid.' }, { status: 400 });
    }

    if (!process.env.BAKONG_TOKEN) {
      return NextResponse.json({
        status: 'config_missing',
        message: 'Payment status token is not configured.'
      });
    }

    const response = await fetch('https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BAKONG_TOKEN}`
      },
      body: JSON.stringify({ md5: md5Hash })
    });
    const data = await response.json();
    const paid = data?.responseCode === 0 || Boolean(data?.data);
    let subscriptionExpiry = '';

    if (paid) {
      const settings = await getAppSettings(session.profileId, session.firebaseIdToken);
      subscriptionExpiry = getNextExpiry(settings.subscriptionExpiry, plan.months);
      await updateSubscriptionExpiry(session.profileId, session.firebaseIdToken, subscriptionExpiry);
    }

    return NextResponse.json({
      status: paid ? 'paid' : 'pending',
      message: paid ? 'Payment confirmed.' : data?.responseMessage || data?.message || 'Payment is still pending.',
      subscriptionExpiry,
      data
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Unable to check payment status.',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
