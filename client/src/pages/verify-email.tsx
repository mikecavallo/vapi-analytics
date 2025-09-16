import React from 'react';
import EmailVerification from '@/components/auth/email-verification';
import { SiteHeader } from '@/components/layout/site-header';

export default function VerifyEmailPage() {
  return (
    <>
      <SiteHeader />
      <EmailVerification />
    </>
  );
}