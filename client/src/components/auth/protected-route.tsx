import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSuperAdmin = false,
  fallbackPath = '/login'
}) => {
  const { user, isLoading, isAuthenticated, isSuperAdmin } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    setLocation(fallbackPath);
    return null;
  }

  // Check if email is verified
  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please verify your email address to access the dashboard.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => setLocation('/verify-email')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify Email
            </button>
            <button 
              onClick={() => setLocation('/login')}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9V6a2 2 0 00-2-2H5a2 2 0 00-2 2v1m16 0V7a2 2 0 00-2 2v4a2 2 0 01-2 2h-1m-4 0V9a2 2 0 012-2h1M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need super admin privileges to access this area.
          </p>
          <button 
            onClick={() => setLocation('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};