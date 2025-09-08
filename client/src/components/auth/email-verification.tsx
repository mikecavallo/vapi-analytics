import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerification() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyEmail } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          setLocation('/login');
        }, 3000);
      } else {
        setError(result.error || 'Email verification failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-600 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-400">
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now log in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Redirecting you to login in a few seconds...
            </p>
            <Button 
              onClick={() => setLocation('/login')}
              className="w-full"
              data-testid="button-go-to-login"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            Enter the verification token from your email to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" data-testid="error-message">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Token</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter verification token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="text-center font-mono"
                data-testid="input-verification-token"
              />
              <p className="text-xs text-gray-500">
                Check your email for the verification token
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !token.trim()}
              data-testid="button-verify"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive an email?{' '}
              <button className="text-blue-600 hover:underline font-medium">
                Resend verification
              </button>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}