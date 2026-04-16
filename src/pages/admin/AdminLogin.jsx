import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { firebaseApi, firebaseServices } from '@/api/firebaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminLogin() {
  const { isAuthenticated, isAdmin, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = new URLSearchParams(location.search).get('from') || '/admin';

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await firebaseApi.auth.signIn(email, password);
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError.message || 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-background to-stone-200 flex items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-[22rem] border-border/60 bg-background/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:max-w-md">
        <CardHeader className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary grid place-items-center border border-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-display">Admin Sign In</CardTitle>
            <CardDescription>
              Sign in with your Firebase admin account to manage the royal heritage archive.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!firebaseServices.auth && (
            <Alert variant="destructive">
              <AlertTitle>Firebase Auth is not configured</AlertTitle>
              <AlertDescription>
                Add your `VITE_FIREBASE_*` environment values before using admin sign-in.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
                className="bg-background/70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                required
                className="bg-background/70"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !firebaseServices.auth}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Admin access still requires your Firebase user to have an admin profile or `admin` custom claim.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
