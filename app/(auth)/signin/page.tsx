import React, { Suspense } from 'react';
import SignInForm from '@/components/auth/signInForm';

const SignInPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}

export default SignInPage