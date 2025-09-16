import React from 'react';
import SignupForm from '@/components/auth/signup-form';
import { SiteHeader } from '@/components/layout/site-header';

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <SignupForm />
    </>
  );
}