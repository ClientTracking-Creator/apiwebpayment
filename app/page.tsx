'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

type ProfileStatus = {
  state: 'Active' | 'Expired';
  expirationDate: string;
  profileReference: string;
};

const getReadableDate = (date: Date) =>
  new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);

const getTokenPreview = (token: string) => {
  if (token.length <= 12) return token;
  return `${token.slice(0, 6)}...${token.slice(-6)}`;
};

function SecureProfileCenterContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const profileStatus = useMemo<ProfileStatus>(() => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 28);

    return {
      state: 'Active',
      expirationDate: getReadableDate(expiresAt),
      profileReference: token ? getTokenPreview(token) : 'Pending'
    };
  }, [token]);

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
        <section className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
          <div className="w-full rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              Access Denied
            </div>
            <p className="text-base font-semibold leading-7 text-slate-900">
              Access Denied. Please return to your mobile app and click the notification link to access this secure
              section.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">Secure Profile Center</p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Account Status</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Your profile link was verified. Review the current status and end date below.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-950">Validity Status</h2>
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${
                  profileStatus.state === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {profileStatus.state}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Profile reference <span className="font-semibold text-slate-900">{profileStatus.profileReference}</span>
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-950">Expiration Details</h2>
            <p className="text-sm font-medium text-slate-500">Current end date</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{profileStatus.expirationDate}</p>
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Profile Update</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Secure profile actions can be connected here after the server-side token verification endpoint is available.
          </p>
        </section>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Checking secure profile link...</p>
        </div>
      </section>
    </main>
  );
}

export default function SecureProfileCenterPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SecureProfileCenterContent />
    </Suspense>
  );
}
