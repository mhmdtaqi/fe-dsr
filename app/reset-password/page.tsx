"use client";

import dynamic from 'next/dynamic';

const ResetPasswordPage = dynamic(() => import('./ResetPasswordClient'), {
  ssr: false,
});

export default function Page() {
  return <ResetPasswordPage />;
}