import { NextResponse } from 'next/server';
import { verifySessionToken } from '../../account-status/token';
import { submitPaymentProof } from '../../firebase/firestore';

const plans = {
  '1month': { title: '1 month', amount: 5, months: 1 },
  '3month': { title: '3 months', amount: 13, months: 3 },
  '6month': { title: '6 months', amount: 24, months: 6 },
  '1year': { title: '1 year', amount: 45, months: 12 }
};

const maxImageLength = 850_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    const planId = typeof body?.planId === 'string' ? body.planId : '';
    const md5 = typeof body?.md5 === 'string' ? body.md5 : '';
    const imageData = typeof body?.imageData === 'string' ? body.imageData : '';
    const fileName = typeof body?.fileName === 'string' ? body.fileName.slice(0, 120) : 'payment-proof.jpg';
    const contentType = typeof body?.contentType === 'string' ? body.contentType : 'image/jpeg';
    const session = verifySessionToken(token);
    const plan = plans[planId as keyof typeof plans];

    if (!session) {
      return NextResponse.json({ error: 'Session is invalid or expired.' }, { status: 401 });
    }

    if (!session.firebaseIdToken) {
      return NextResponse.json({ error: 'Firebase session is missing.' }, { status: 401 });
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan is not valid.' }, { status: 400 });
    }

    if (!md5) {
      return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });
    }

    if (!imageData.startsWith('data:image/') || imageData.length > maxImageLength) {
      return NextResponse.json({ error: 'Please upload a smaller payment image.' }, { status: 400 });
    }

    const result = await submitPaymentProof(session.profileId, session.firebaseIdToken, {
      planId,
      planTitle: plan.title,
      amount: plan.amount,
      months: plan.months,
      md5,
      imageData,
      fileName,
      contentType
    });

    return NextResponse.json({
      status: 'submitted',
      message: 'Payment proof submitted.',
      submittedAt: result.submittedAt
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Unable to submit payment proof.',
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
