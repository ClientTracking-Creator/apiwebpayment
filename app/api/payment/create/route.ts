import { NextResponse } from 'next/server';
import { KHQR, CURRENCY, TAG, COUNTRY } from 'ts-khqr';
import md5 from 'md5';
import { verifySessionToken } from '../../account-status/token';

const plans = {
  '1month': { amount: 5, months: 1 },
  '3month': { amount: 13, months: 3 },
  '6month': { amount: 24, months: 6 },
  '1year': { amount: 45, months: 12 }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = typeof body?.planId === 'string' ? body.planId : '';
    const token = typeof body?.token === 'string' ? body.token : '';
    const session = verifySessionToken(token);
    const plan = plans[planId as keyof typeof plans];

    if (!session) {
      return NextResponse.json({ error: 'Session is invalid or expired.' }, { status: 401 });
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan is not valid.' }, { status: 400 });
    }

    const khqrData = {
      tag: TAG.INDIVIDUAL,
      accountID: process.env.BAKONG_ACCOUNT_ID || 'engreaksmey_kimreach@bkrt',
      merchantName: process.env.BAKONG_MERCHANT_NAME || 'Client Tracking App',
      merchantCity: 'Phnom Penh',
      currency: CURRENCY.USD,
      amount: plan.amount,
      countryCode: COUNTRY.KH,
      storeLabel: 'Client Tracking App',
      terminalLabel: 'Web App',
      billNumber: `${session.profileId.slice(0, 8)}-${Date.now()}`,
      expirationTimestamp: Date.now() + 5 * 60 * 1000
    };

    const response = KHQR.generate(khqrData);
    const qrString = response?.data?.qr || '';

    return NextResponse.json({
      qrString,
      md5: response?.data?.md5 || md5(qrString),
      amount: plan.amount,
      months: plan.months,
      expiresAt: Date.now() + 5 * 60 * 1000
    });
  } catch {
    return NextResponse.json({ error: 'Unable to create payment request.' }, { status: 500 });
  }
}
