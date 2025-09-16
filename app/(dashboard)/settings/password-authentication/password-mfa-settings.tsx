'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Smartphone, Shield, Key, QrCode, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  changePassword, 
  getMFAAuthenticators, 
  addTOTPAuthenticator, 
  activateTOTPAuthenticator, 
  deactivateAuthenticator 
} from '@/api/auth';
import { AllauthMFAAuthenticator } from '@/types/api';



export default function PasswordMfaSettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // MFA State
  const [authenticators, setAuthenticators] = useState<AllauthMFAAuthenticator[]>([]);
  const [isLoadingAuthenticators, setIsLoadingAuthenticators] = useState(true);
  const [isAddingTOTP, setIsAddingTOTP] = useState(false);
  const [newTOTPAuthenticator, setNewTOTPAuthenticator] = useState<AllauthMFAAuthenticator | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isActivatingTOTP, setIsActivatingTOTP] = useState(false);

  // Load MFA authenticators on component mount
  useEffect(() => {
    loadAuthenticators();
  }, []);

  const loadAuthenticators = async () => {
    try {
      setIsLoadingAuthenticators(true);
      const response = await getMFAAuthenticators();
      setAuthenticators(response.data || []);
    } catch (error) {
      console.error('Failed to load authenticators:', error);
      toast.error('Failed to load MFA settings');
    } finally {
      setIsLoadingAuthenticators(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddTOTP = async () => {
    try {
      setIsAddingTOTP(true);
      const response = await addTOTPAuthenticator();
      setNewTOTPAuthenticator(response.data);
      toast.success('TOTP authenticator created. Please scan the QR code and enter the verification code.');
    } catch (error) {
      console.error('Failed to add TOTP authenticator:', error);
      toast.error('Failed to create TOTP authenticator');
    } finally {
      setIsAddingTOTP(false);
    }
  };

  const handleActivateTOTP = async () => {
    if (!newTOTPAuthenticator || !verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }
    
    try {
      setIsActivatingTOTP(true);
      await activateTOTPAuthenticator({
        code: verificationCode
      });
      toast.success('TOTP authenticator activated successfully');
      setNewTOTPAuthenticator(null);
      setVerificationCode('');
      await loadAuthenticators();
    } catch (error) {
      console.error('Failed to activate TOTP:', error);
      toast.error('Failed to activate TOTP. Please check your verification code.');
    } finally {
      setIsActivatingTOTP(false);
    }
  };

  const handleDeactivateAuthenticator = async (authenticatorId: string) => {
    try {
      await deactivateAuthenticator(authenticatorId);
      toast.success('Authenticator removed successfully');
      await loadAuthenticators();
    } catch (error) {
      console.error('Failed to deactivate authenticator:', error);
      toast.error('Failed to remove authenticator');
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isChangingPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isChangingPassword}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isChangingPassword}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isChangingPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isChangingPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handlePasswordChange} 
            className="w-full" 
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      {/* MFA Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Authenticators */}
          {isLoadingAuthenticators ? (
            <div className="text-center py-4">Loading MFA settings...</div>
          ) : authenticators.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No authenticators configured.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium">Active Authenticators:</p>
              {authenticators.map((auth) => (
                <div key={auth.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{auth.type.toUpperCase()} Authenticator</div>
                      <div className="text-sm text-muted-foreground">
                        Added on {new Date(auth.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Active</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivateAuthenticator(auth.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Separator />
          
          {/* Add New TOTP Authenticator */}
          {!newTOTPAuthenticator ? (
            <Button 
              onClick={handleAddTOTP} 
              className="w-full"
              disabled={isAddingTOTP}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              {isAddingTOTP ? 'Setting up...' : 'Add TOTP Authenticator'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Scan this QR code with your authenticator app:</p>
                <div className="flex justify-center">
                  {newTOTPAuthenticator.qr_code_url ? (
                    <img 
                      src={newTOTPAuthenticator.qr_code_url} 
                      alt="QR Code" 
                      className="border rounded-lg" 
                    />
                  ) : (
                    <div className="p-8 border rounded-lg bg-muted">
                      <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">QR Code not available</p>
                    </div>
                  )}
                </div>
                {newTOTPAuthenticator.secret && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Manual entry key:</p>
                    <code className="text-sm font-mono">{newTOTPAuthenticator.secret}</code>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  disabled={isActivatingTOTP}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleActivateTOTP} 
                  className="flex-1"
                  disabled={isActivatingTOTP || !verificationCode}
                >
                  <Key className="mr-2 h-4 w-4" />
                  {isActivatingTOTP ? 'Activating...' : 'Verify and Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewTOTPAuthenticator(null);
                    setVerificationCode('');
                  }}
                  disabled={isActivatingTOTP}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
