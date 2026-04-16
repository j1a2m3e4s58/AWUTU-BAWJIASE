import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound } from 'lucide-react';
import { useAdminAccess } from '@/lib/AdminAccessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function HiddenAdminAccessDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const { unlock, resetPassword } = useAdminAccess();
  const [mode, setMode] = useState('unlock');
  const [password, setPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setMode('unlock');
      setPassword('');
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setMessage('');
    }
  }, [open]);

  const handleUnlock = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!unlock(password)) {
      setError('That password did not open admin.');
      return;
    }

    onOpenChange(false);
    navigate('/admin');
  };

  const handleReset = (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.');
      return;
    }

    const result = resetPassword(recoveryCode, newPassword);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage('Password updated. Long-press the logo again and use the new password.');
    setMode('unlock');
    setPassword('');
    setRecoveryCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[22rem] border-border/60 bg-background/72 backdrop-blur-2xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'unlock' ? <Shield className="w-5 h-5 text-primary" /> : <KeyRound className="w-5 h-5 text-primary" />}
            Hidden Admin Access
          </DialogTitle>
          <DialogDescription>
            {mode === 'unlock'
              ? 'Enter the hidden admin password to open the admin area.'
              : 'Use the recovery code to set a new admin password.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'unlock' ? (
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-secret">Admin password</Label>
              <Input
                id="admin-secret"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter hidden password"
                autoFocus
                className="bg-background/70"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="link" className="px-0" onClick={() => { setMode('reset'); setError(''); }}>
                Forgot password?
              </Button>
              <Button type="submit">Open Admin</Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-code">Recovery code</Label>
              <Input
                id="recovery-code"
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value)}
                placeholder="Enter recovery code"
                autoFocus
                className="bg-background/70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-admin-password">New password</Label>
              <Input
                id="new-admin-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Set new password"
                className="bg-background/70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-admin-password">Confirm new password</Label>
              <Input
                id="confirm-admin-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                className="bg-background/70"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="link" className="px-0" onClick={() => { setMode('unlock'); setError(''); }}>
                Back to unlock
              </Button>
              <Button type="submit">Save New Password</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
