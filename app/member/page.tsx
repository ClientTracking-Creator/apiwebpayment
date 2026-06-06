'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

type Plan = {
  id: string;
  title: string;
  price: string;
  amount: number;
  months: number;
};

type AccountSession = {
  email: string;
  profileId: string;
  subscriptionExpiry?: string;
};

type PaymentRequest = {
  qrString: string;
  md5: string;
  amount: number;
  months: number;
  expiresAt: number;
};

const plans: Plan[] = [
  { id: '1month', title: '1 ខែ', price: '$5', amount: 5, months: 1 },
  { id: '3month', title: '3 ខែ', price: '$13', amount: 13, months: 3 },
  { id: '6month', title: '6 ខែ', price: '$24', amount: 24, months: 6 },
  { id: '1year', title: '1 ឆ្នាំ', price: '$45', amount: 45, months: 12 }
];

const telegramUrl = 'https://t.me/kimhunsellmotor';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatPaymentAmount = (amount: number) =>
  Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);

function KHQRPaymentCard({ qrString, amount }: { qrString: string; amount: number }) {
  return (
    <div className="relative h-[422px] w-[300px] text-black">
      <svg
        className="absolute inset-0 h-full w-full"
        fill="none"
        viewBox="0 0 442 622"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#khqr-card-shadow)">
          <path d="M421 21H21V601H421V21Z" fill="white" />
          <path
            clipRule="evenodd"
            d="M21 21H421V90V90.6V123.5L388.1 90.6H21V21Z"
            fill="#E21A1A"
            fillRule="evenodd"
          />
          <path d="M233.525 53.8332V60.4999H226.972C226.316 60.4999 225.825 59.9999 225.825 59.3332V53.8332C225.825 53.1665 226.316 52.6665 226.972 52.6665H232.215C233.034 52.4999 233.525 53.1665 233.525 53.8332Z" fill="white" />
          <path d="M264 56.5H260.723C260.723 52.5 257.61 49.3333 253.678 49.3333C250.565 49.3333 247.944 51.3333 246.96 54.3333C246.797 55 246.633 55.8333 246.633 56.5V67H246.469C244.667 67 243.356 65.5 243.356 63.8333V56.5C243.356 53.6667 244.503 50.8333 246.633 48.8333C248.599 47 251.057 46 253.678 46C259.412 46 264 50.6667 264 56.5Z" fill="white" />
          <path d="M264 66.9999H259.412L258.265 65.8333L255.808 63.3333L252.367 59.8333H256.955L264 66.9999Z" fill="white" />
          <path d="M234.672 63.6667H224.842C223.695 63.6667 222.712 62.6667 222.712 61.5V51.5C222.712 50.3333 223.695 49.3333 224.842 49.3333H234.672C235.819 49.3333 236.802 50.3333 236.802 51.5V61.5L240.079 64.8333V49.1667C240.079 47.3333 238.604 46 236.966 46H222.712C220.909 46 219.599 47.5 219.599 49.1667V63.6667C219.599 65.5 221.073 66.8333 222.712 66.8333H237.949L234.672 63.6667Z" fill="white" />
          <path d="M194.859 67H190.271L180.768 57.1667V67H177V46H180.768V55.3333L189.944 46H194.367L184.537 56L194.859 67Z" fill="white" />
          <path d="M212.062 46H215.667V67H212.062V57.8333H201.576V67H197.808V46H201.576V54.8333H212.062V46Z" fill="white" />
          <path d="M21 218.5H421" stroke="black" strokeDasharray="8 8" strokeOpacity="0.5" />
        </g>
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="622"
            id="khqr-card-shadow"
            width="442"
            x="0"
            y="0"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="10.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"
            />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_322_2" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_322_2" mode="normal" result="shape" />
          </filter>
        </defs>
      </svg>

      <div className="absolute left-[42px] top-[85px] w-[220px]">
        <p className="mb-1 text-left text-sm font-black tracking-normal text-black">Client Tracking App</p>
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-black leading-none text-[#e21a1a]">{formatPaymentAmount(amount)}</span>
          <span className="text-sm font-black text-[#e21a1a]">USD</span>
        </div>
      </div>

      <div className="absolute left-1/2 top-[172px] -translate-x-1/2">
        <QRCodeSVG value={qrString} size={210} bgColor="transparent" fgColor="#000000" />
      </div>
    </div>
  );
}

function MemberContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showSubscription, setShowSubscription] = useState(false);
  const [account, setAccount] = useState<AccountSession | null>(null);
  const [accountError, setAccountError] = useState('');
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('ស្កេន QR ដើម្បីបង់ប្រាក់');
  const [timeLeft, setTimeLeft] = useState(300);
  const [successExpiry, setSuccessExpiry] = useState('');

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    fetch('/api/account-status/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: controller.signal
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Unable to verify session.');
        setAccount(data);
      })
      .catch(() => setAccountError('Session ផុតកំណត់ ឬមិនត្រឹមត្រូវ។ សូមបើកម្ដងទៀតពីកម្មវិធី។'))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [token]);

  const accessStatus = useMemo(() => {
    if (!account?.subscriptionExpiry) {
      return { active: false, label: 'Expired', days: 0 };
    }

    const expiry = new Date(account.subscriptionExpiry);
    const days = Math.ceil((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    return {
      active: days >= 0,
      label: days >= 0 ? 'Active' : 'Expired',
      days: Math.max(days, 0)
    };
  }, [account]);

  const getNextExpiryIso = useCallback(() => {
    const currentExpiry = account?.subscriptionExpiry ? new Date(account.subscriptionExpiry) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const nextExpiry = new Date(baseDate);
    nextExpiry.setMonth(nextExpiry.getMonth() + (selectedPlan?.months || 1));
    return nextExpiry.toISOString();
  }, [account, selectedPlan]);

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentVisible(true);
    setPaymentSuccess(false);
    setPayment(null);
    setPaymentStatus('កំពុងបង្កើត QR...');
    setTimeLeft(300);

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, planId: plan.id })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || 'Unable to create payment.');

      setPayment(data);
      setPaymentStatus('កំពុងរង់ចាំការបង់ប្រាក់...');
    } catch {
      setPaymentStatus('មិនអាចបង្កើត QR បានទេ។ សូមព្យាយាមម្ដងទៀត។');
    }
  };

  const checkPayment = useCallback(async () => {
    if (!payment?.md5 || paymentSuccess) return;

    try {
      const response = await fetch('/api/payment/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, md5: payment.md5, planId: selectedPlan?.id })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data?.error || 'Unable to check payment.');

      if (data.status === 'paid') {
        const nextExpiry = data.subscriptionExpiry || getNextExpiryIso();
        setSuccessExpiry(nextExpiry);
        setPaymentSuccess(true);
        setPaymentStatus('បានបង់ប្រាក់ជោគជ័យ');
      } else if (data.status === 'config_missing') {
        setPaymentStatus('Server មិនទាន់មាន Bakong Token សម្រាប់ពិនិត្យការបង់ប្រាក់។');
      } else {
        setPaymentStatus(data.message || 'កំពុងរង់ចាំការបង់ប្រាក់...');
      }
    } catch {
      setPaymentStatus('មិនអាចពិនិត្យការបង់ប្រាក់បានទេ។');
    }
  }, [getNextExpiryIso, payment, paymentSuccess, selectedPlan?.id, token]);

  const openStatusPage = useCallback(() => {
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    if (successExpiry) params.set('expires', successExpiry);
    window.location.href = `/status?${params.toString()}`;
  }, [successExpiry, token]);

  useEffect(() => {
    if (!paymentVisible || !payment || paymentSuccess) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    const polling = window.setInterval(checkPayment, 5000);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(polling);
    };
  }, [checkPayment, payment, paymentSuccess, paymentVisible]);

  useEffect(() => {
    if (!successExpiry) return;

    const timeout = window.setTimeout(openStatusPage, 1800);
    return () => window.clearTimeout(timeout);
  }, [openStatusPage, successExpiry]);

  if (!showSubscription) {
    if (!token) {
      return (
        <main className="min-h-screen bg-[#121212] px-6 py-10 text-white">
          <section className="mx-auto flex min-h-[70vh] max-w-xl items-center">
            <div className="w-full rounded-3xl border border-[#3a3a3c] bg-[#1e1e1e] p-6 shadow-2xl shadow-black/30">
              <p className="mb-3 text-sm font-black uppercase text-[#ccff00]">Web server is running</p>
              <h2 className="text-2xl font-black text-white">Open this page from the app notification.</h2>
              <p className="mt-3 text-base leading-7 text-zinc-300">
                This member page needs a secure session token, so direct browser links are blocked. Go back to the
                mobile app, tap the notification, and it will open this page with the token attached.
              </p>
            </div>
          </section>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#121212] text-white">
        <section className="mx-auto max-w-xl px-6 pb-28 pt-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-[#3a3a3c] bg-[#1e1e1e] text-3xl leading-none text-white active:bg-[#2c2c2e]"
              onClick={() => history.back()}
              type="button"
            >
              ‹
            </button>
            <div className="text-right">
              <p className="text-sm font-bold text-[#ccff00]">Client Tracking</p>
              <p className="text-xs font-semibold text-zinc-400">Member Center</p>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between rounded-2xl border border-[#3a3a3c] bg-[#1e1e1e] p-3 text-sm font-bold text-zinc-300">
            <span className="rounded-xl bg-[#ccff00] px-4 py-3 text-black">⌂ ទំព័រដើម</span>
            <span className="px-3 py-3 text-right">◴ ប្តូរលេខសំខាត់</span>
          </div>

          <div className="mb-7">
            <p className="mb-2 break-all text-base font-semibold text-zinc-400">
              សួស្តី {account?.email || 'កំពុងផ្ទៀងផ្ទាត់គណនី...'}
            </p>
            <h1 className="text-4xl font-black leading-tight">គ្រប់គ្រងសមាជិកភាពរបស់អ្នក</h1>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#3a3a3c] bg-[#1e1e1e] shadow-2xl shadow-black/30">
            <div className="border-b border-[#3a3a3c] bg-[#2c2c2e] px-6 py-5">
              <p className="text-sm font-bold uppercase text-zinc-400">អាណត្តិកាល</p>
              <p className="mt-2 text-3xl font-black text-[#ff453a]">អ្នកមិនមានគម្រោងទេ</p>
            </div>

            <div className="px-6 py-6">
              <p className="max-w-sm text-base leading-7 text-zinc-300">
                សូមជ្រើសរើសគម្រោង ដើម្បីបន្តប្រើប្រាស់មុខងារសមាជិក និងរក្សាសិទ្ធិចូលប្រើប្រាស់។
              </p>

              <button
                className="mt-6 w-full rounded-2xl bg-[#ccff00] px-6 py-4 text-lg font-black text-black shadow-lg shadow-[#ccff00]/20 active:bg-[#b9e800]"
                onClick={() => setShowSubscription(true)}
                type="button"
              >
                ទិញគម្រោង
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-[#3a3a3c] bg-[#1e1e1e] px-3 py-4">
              <p className="text-xs font-semibold text-zinc-400">ការបង់ប្រាក់</p>
            </div>
            <div className="rounded-2xl border border-[#3a3a3c] bg-[#1e1e1e] px-3 py-4">
              <p className="text-xs font-semibold text-zinc-400">គម្រោង</p>
            </div>
            <div className="rounded-2xl border border-[#3a3a3c] bg-[#1e1e1e] px-3 py-4">
              <p className="text-xs font-semibold text-zinc-400">ស្ថានភាព</p>
            </div>
          </div>

          <a
            aria-label="Open Telegram"
            className="fixed bottom-7 right-7 grid h-14 w-14 place-items-center rounded-full bg-[#229ED9] text-2xl font-black text-white shadow-xl shadow-sky-500/30 active:bg-[#168ac0]"
            href={telegramUrl}
            rel="noreferrer"
          >
            <svg aria-hidden="true" className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.9 4.3 18.6 20c-.2 1-.9 1.2-1.7.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6.1 13.4l-5-1.6c-1-.3-1.1-1 0-1.5l19.4-7.5c.9-.3 1.7.2 1.4 1.5Z" />
            </svg>
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <section className="mx-auto max-w-xl px-6 py-14">
        <div className="mb-6 flex items-center gap-4">
          <button className="text-4xl leading-none text-white" onClick={() => setShowSubscription(false)} type="button">
            ‹
          </button>
          <h1 className="text-4xl font-black">Subscription</h1>
        </div>

        <p className="mb-5 text-sm font-semibold text-zinc-400">
          {account?.email || accountError || (token ? 'កំពុងផ្ទៀងផ្ទាត់គណនី...' : 'សូមបើកតាមរយៈកម្មវិធីទូរស័ព្ទ។')}
        </p>

        <div className="mb-8 rounded-[20px] border border-[#3a3a3c] bg-[#1e1e1e] p-6">
          <div className="flex items-center gap-4">
            <span className={`text-4xl ${accessStatus.active ? 'text-[#ccff00]' : 'text-zinc-500'}`}>
              {accessStatus.active ? '●' : '!'}
            </span>
            <div>
              <p className="text-2xl font-black">{accessStatus.label}</p>
              {accessStatus.active && (
                <p className="mt-1 text-base font-semibold text-[#ccff00]">{accessStatus.days} days remaining</p>
              )}
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-black">Select Plan</h2>

        <div className="grid gap-4">
          {plans.map((plan) => (
            <button
              className="flex items-center justify-between rounded-2xl border border-[#3a3a3c] bg-[#1e1e1e] p-5 text-left"
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              type="button"
            >
              <div>
                <p className="text-lg font-black">{plan.title}</p>
                <p className="mt-1 text-2xl font-black text-[#ccff00]">{plan.price}</p>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-[#ccff00] px-4 py-3 text-sm font-black text-black">
                Subscribe Now <span>›</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2 rounded-xl bg-[#2c2c2e] p-4 text-sm text-zinc-400">
          <span>ⓘ</span>
          <span>Choose a plan and scan the QR to continue.</span>
        </div>
      </section>

      {paymentVisible && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/90">
          <div className="h-[95%] w-full overflow-y-auto rounded-t-[32px] bg-[#1e1e1e] p-6">
            {!paymentSuccess ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#ccff00]">Bakong KHQR</p>
                    <h2 className="text-2xl font-black">Payment</h2>
                  </div>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-[#2c2c2e] text-3xl leading-none" onClick={() => setPaymentVisible(false)} type="button">
                    ×
                  </button>
                </div>

                <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-zinc-400">
                  <span>◷</span>
                  <span className={timeLeft < 60 ? 'text-red-500' : ''}>Session expires: {formatTime(timeLeft)}</span>
                </div>

                <div className="mb-5 flex justify-center">
                  {payment?.qrString ? (
                    <KHQRPaymentCard qrString={payment.qrString} amount={payment.amount || selectedPlan?.amount || 0} />
                  ) : (
                    <div className="grid h-[422px] w-[300px] place-items-center rounded-3xl bg-[#2c2c2e] text-white">
                      Loading...
                    </div>
                  )}
                </div>

                <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-[#2c2c2e] px-4 py-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#ccff00] border-t-transparent" />
                  <span className="text-sm font-medium text-zinc-400">{paymentStatus}</span>
                </div>

                <p className="mb-6 text-center text-lg font-semibold">Scan QR Code to Pay</p>

                <button
                  className="w-full rounded-2xl bg-[#ccff00] p-4 text-lg font-black text-black"
                  disabled={!payment?.md5}
                  onClick={checkPayment}
                  type="button"
                >
                  Check Payment
                </button>
              </>
            ) : (
              <div className="flex min-h-full flex-col items-center justify-center pb-10 text-center">
                <div className="mb-6 text-8xl text-[#ccff00]">●</div>
                <h2 className="mb-3 text-3xl font-black">Payment Success</h2>
                <p className="mb-8 px-5 text-base text-zinc-400">
                  Subscription updated. Expiry: {successExpiry ? formatDate(new Date(successExpiry)) : ''}
                </p>
                <button className="w-full rounded-2xl bg-[#ccff00] p-5 text-lg font-black text-black" onClick={openStatusPage} type="button">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#121212] px-6 py-10 text-white">
      <p>Loading...</p>
    </main>
  );
}

export default function MemberPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MemberContent />
    </Suspense>
  );
}
