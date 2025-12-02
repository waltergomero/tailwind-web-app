import React, { Suspense } from 'react';
import SignUpForm from '@/components/auth/signUpForm';

const SignUpPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>    
  )
}

export default SignUpPage