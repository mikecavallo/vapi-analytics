import React from 'react';
import LoginForm from '@/components/auth/login-form';
import { SiteHeader } from '@/components/layout/site-header';

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <LoginForm />
    </>
  );
}