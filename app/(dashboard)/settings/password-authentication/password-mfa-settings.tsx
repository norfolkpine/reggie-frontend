'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Mock function to generate QR code URL (replace with actual API call in production)
const generateQRCode = () => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    'otpauth://totp/SaaSApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SaaSApp'
  )}`;
};

export default function PasswordMfaSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupInProgress, setMfaSetupInProgress] = useState(false);
  const [mfaVerificationCode, setMfaVerificationCode] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    // Here you would typically call an API to update the password
    console.log('Password change requested');
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
  };

  const handleMfaToggle = () => {
    if (!mfaEnabled) {
      setMfaSetupInProgress(true);
    } else {
      // Here you would typically call an API to disable MFA
      setMfaEnabled(false);
      console.log('MFA disabled');
    }
  };

  const handleMfaVerification = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to verify the MFA code
    if (mfaVerificationCode === '123456') {
      // Replace with actual verification
      setMfaEnabled(true);
      setMfaSetupInProgress(false);
      setMfaError('');
      console.log('MFA enabled');
    } else {
      setMfaError('Invalid verification code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-l font-semibold">Change Password</h3>
          <Button onClick={() => setIsChangingPassword((prev) => !prev)}>
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </Button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && (
              <div className="flex items-center text-red-500">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center text-green-500">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Password changed successfully</span>
              </div>
            )}
            <Button type="submit">Update Password</Button>
          </form>
        )}
      </div>

      {/* Two-Factor Authentication Section */}
      <div>
        <h3 className="text-l font-semibold mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {mfaEnabled ? 'Two-factor authentication is enabled' : 'Enable two-factor authentication'}
            </p>
            <p className="text-sm text-muted-foreground">
              {mfaEnabled
                ? 'Your account is protected by two-factor authentication.'
                : 'Protect your account with an extra layer of security.'}
            </p>
          </div>
          <Switch
            checked={mfaEnabled}
            onCheckedChange={handleMfaToggle}
            aria-label="Toggle two-factor authentication"
          />
        </div>
        {mfaSetupInProgress && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Set up Google Authenticator</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Install Google Authenticator on your mobile device</li>
                <li>Open Google Authenticator and tap the + icon</li>
                <li>Select "Scan a QR code" and scan the image below</li>
              </ol>
            </div>
            <div className="flex justify-center">
              <img src={generateQRCode()} alt="QR Code for Google Authenticator" className="w-40 h-40" />
            </div>
            <form onSubmit={handleMfaVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Enter the 6-digit code from Google Authenticator</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={mfaVerificationCode}
                  onChange={(e) => setMfaVerificationCode(e.target.value)}
                  required
                />
              </div>
              {mfaError && (
                <div className="flex items-center text-red-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>{mfaError}</span>
                </div>
              )}
              <Button type="submit">Verify and Enable</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
