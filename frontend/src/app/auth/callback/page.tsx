'use client';

// Imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Function once a user completes Google login
export default function AuthCallback() {

  // Router to redirect user 
  const router = useRouter();

  // Get user Auth Status
  const { checkAuthStatus } = useAuth();

  // Hook to keep track of state of users
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');


  useEffect(() => {

    const handleCallback = async () => {
      try {
        // Check if user is authenticated 
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
          setStatus('success');
          
          // Redirect user back to home page
          const redirectTo = localStorage.getItem('auth_redirect') || '/';
          localStorage.removeItem('auth_redirect');
          
          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
          
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
        console.error('Auth callback error:', err);
      }
    };

    handleCallback();
  }, [checkAuthStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Completing sign in...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your account
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Sign in successful!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Redirecting you now...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Sign in failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Authentication was not successful. Please try again.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 