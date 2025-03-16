
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { User, createUser, loginUser, isTemporaryPassword } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';
import { PasswordReminder } from './PasswordReminder';
import { LoginForm, loginFormSchema } from './auth/LoginForm';
import { ChangePasswordForm, changePasswordSchema } from './auth/ChangePasswordForm';
import { AuthTabs } from './auth/AuthTabs';
import { z } from 'zod';

type AuthProps = {
  onAuthSuccess: (user: User) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function Auth({ onAuthSuccess, open, onOpenChange }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordReminderOpen, setIsPasswordReminderOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const { toast } = useToast();
  
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let user: User;
      
      if (isLogin) {
        user = await loginUser(values.username, values.password);
        
        // Check if the user logged in with a temporary password
        const isTemp = await isTemporaryPassword(values.username, values.password);
        if (isTemp) {
          setCurrentUsername(values.username);
          setShowChangePassword(true);
          return;
        }
        
        toast({
          title: "Welcome back!",
          description: `You've successfully logged in as ${user.username}`,
        });
      } else {
        user = await createUser(values.username, values.password);
        toast({
          title: "Account created",
          description: `Your account has been created and you're now logged in`,
        });
      }
      
      onAuthSuccess(user);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function onChangePassword(values: z.infer<typeof changePasswordSchema>) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // First verify the current password
      await loginUser(currentUsername, values.currentPassword);
      
      // Then update to the new password
      const user = await loginUser(currentUsername, values.currentPassword, values.newPassword);
      
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated. You are now logged in.",
      });
      
      onAuthSuccess(user);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Password change failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleOpenPasswordReminder = () => {
    setIsPasswordReminderOpen(true);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          {showChangePassword ? (
            <>
              <DialogHeader>
                <DialogTitle>Change Temporary Password</DialogTitle>
                <DialogDescription>
                  You've logged in with a temporary password. For security reasons, please set a new password now.
                </DialogDescription>
              </DialogHeader>
              
              <ChangePasswordForm 
                onSubmit={onChangePassword} 
                isSubmitting={isSubmitting} 
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{isLogin ? "Log in" : "Create an account"}</DialogTitle>
                <DialogDescription>
                  {isLogin 
                    ? "Enter your username and password to access your meal plans" 
                    : "Create a new account to start planning your meals"}
                </DialogDescription>
              </DialogHeader>
              
              <AuthTabs isLogin={isLogin} setIsLogin={setIsLogin} />
              
              <LoginForm 
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
                onForgotPassword={handleOpenPasswordReminder} 
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <PasswordReminder 
        open={isPasswordReminderOpen} 
        onOpenChange={setIsPasswordReminderOpen} 
      />
    </>
  );
}
