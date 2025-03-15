
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, createUser, loginUser, isTemporaryPassword } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';
import { PasswordReminder } from './PasswordReminder';
import { AlertCircle } from 'lucide-react';

type AuthProps = {
  onAuthSuccess: (user: User) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function Auth({ onAuthSuccess, open, onOpenChange }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordReminderOpen, setIsPasswordReminderOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
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
              
              <Form {...changePasswordForm}>
                <form onSubmit={changePasswordForm.handleSubmit(onChangePassword)} className="space-y-4 pt-4">
                  <FormField
                    control={changePasswordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Your temporary password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={changePasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choose a new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={changePasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-700">
                        For your security, choose a strong password that you don't use elsewhere.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Changing password..." : "Set New Password"}
                    </Button>
                  </div>
                </form>
              </Form>
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
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting 
                        ? "Processing..." 
                        : isLogin 
                          ? "Log in" 
                          : "Create account"}
                    </Button>
                    
                    <div className="flex justify-between items-center mt-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsLogin(!isLogin)}
                        disabled={isSubmitting}
                        className="text-sm p-0 h-auto"
                      >
                        {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
                      </Button>
                      
                      {isLogin && (
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleOpenPasswordReminder}
                          disabled={isSubmitting}
                          className="text-sm p-0 h-auto"
                        >
                          Forgot password?
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
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
