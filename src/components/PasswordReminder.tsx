
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
import { requestPasswordReminder } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Check, ArrowRight } from 'lucide-react';

type PasswordReminderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export function PasswordReminder({ open, onOpenChange }: PasswordReminderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newPassword = await requestPasswordReminder(values.username);
      setTempPassword(newPassword);
      
      toast({
        title: "Password reset successful",
        description: "A temporary password has been generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function handleClose() {
    setTempPassword(null);
    form.reset();
    onOpenChange(false);
  }
  
  function handleLoginWithTemp() {
    // Close this dialog and allow user to log in with temp password
    handleClose();
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Password Reminder</DialogTitle>
          <DialogDescription>
            Enter your username to reset your password
          </DialogDescription>
        </DialogHeader>
        
        {tempPassword ? (
          <div className="space-y-4 pt-4">
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Password Reset Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Your temporary password has been generated. Please use it to log in.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Your temporary password:</div>
              <div className="flex">
                <Input 
                  value={tempPassword} 
                  readOnly 
                  className="font-mono bg-secondary/40 text-center"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Remember to change your password after logging in. You'll be prompted to update it on your next login.
              </p>
            </div>
            
            <Button className="w-full" onClick={handleLoginWithTemp}>
              Log in with temporary password
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
