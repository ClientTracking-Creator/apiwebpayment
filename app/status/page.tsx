'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);

function StatusContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const expiresParam = searchParams.get('expires');
  const [loadedAt] = useState(() => Date.now());
  const [email, setEmail] = useState('');
  const [verifiedExpiry, setVerifiedExpiry] = useState('');
  const [accountError, setAccountError] = useState('');

  const status = useMemo(() => {
    const expirySource = expiresParam || verifiedExpiry;

    if (!expirySource) {
      return {
        active: false,
        daysLeft: 0,
        endDate: 'មិនទាន់មាន'
      };
    }

    const safeEndDate = new Date(expirySource);
    const isValidDate = !Number.isNaN(safeEndDate.getTime());

    if (!isValidDate) {
      return {
        active: false,
        daysLeft: 0,
        endDate: 'កាលបរិច្ឆេទមិនត្រឹមត្រូវ'
      };
    }

    const daysLeft = Math.ceil((safeEndDate.getTime() - loadedAt) / (24 * 60 * 60 * 1000));
    const active = daysLeft >= 0;

    return {
      active,
      daysLeft: Math.max(daysLeft, 0),
      endDate: formatDate(safeEndDate)
    };
  }, [expiresParam, loadedAt, verifiedExpiry]);

  useEffect(() => {
    if (!token) {
      return;
    }

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
        setEmail(data.email || 'Email not available');
        setVerifiedExpiry(data.subscriptionExpiry || '');
      })
      .catch(() => setAccountError('Session ផុតកំណត់ ឬមិនត្រឹមត្រូវ។ សូមបើកម្ដងទៀតពីកម្មវិធី។'))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-[#111315] px-4 py-6 text-white sm:px-6">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-lime-300">Account Status</p>
          <h1 className="text-3xl font-black sm:text-4xl">ឆែកមើលគម្រោង(ចំនួនដែលមាន)</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-400">
            {email || accountError || (token ? 'កំពុងផ្ទៀងផ្ទាត់គណនី...' : 'សូមបើកតាមរយៈកម្មវិធីទូរស័ព្ទ។')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-white/10 bg-[#1d2024] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black">ស្ថានភាពគម្រោង</h2>
              <span
                className={`rounded-full px-3 py-1 text-sm font-black ${
                  status.active ? 'bg-lime-300 text-black' : 'bg-red-500/20 text-red-200'
                }`}
              >
                {status.active ? 'Active' : 'Expired'}
              </span>
            </div>

            <div className="rounded-lg bg-[#14171a] p-5">
              <p className="text-sm font-bold text-zinc-400">ចំនួនថ្ងៃដែលនៅសល់</p>
              <p className="mt-2 text-5xl font-black text-lime-300">{status.daysLeft}</p>
              <p className="mt-1 text-sm font-bold text-zinc-400">ថ្ងៃ</p>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#1d2024] p-5 shadow-2xl">
            <h2 className="mb-5 text-xl font-black">ថ្ងៃផុតកំណត់</h2>
            <div className="rounded-lg bg-[#14171a] p-5">
              <p className="text-sm font-bold text-zinc-400">កាលបរិច្ឆេទចុងក្រោយ</p>
              <p className="mt-2 text-2xl font-black">{status.endDate}</p>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-6 text-zinc-300">
                ប្រសិនបើគម្រោងផុតកំណត់ សូមត្រឡប់ទៅទំព័រសមាជិក ដើម្បីជ្រើសរើសគម្រោងថ្មី។
              </p>
            </div>
          </section>
        </div>

        <a
          className="mt-4 block rounded-lg bg-lime-300 px-5 py-4 text-center text-base font-black text-black transition hover:bg-lime-200"
          href={`/member${token ? `?token=${encodeURIComponent(token)}` : ''}`}
        >
          ទៅទំព័រសមាជិក
        </a>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#111315] px-4 py-6 text-white">
      <section className="mx-auto max-w-md rounded-lg border border-white/10 bg-[#1d2024] p-5">
        <p className="text-sm font-bold text-zinc-300">កំពុងពិនិត្យ...</p>
      </section>
    </main>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StatusContent />
    </Suspense>
  );
}
