
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
import { User, createUser, loginUser, getCurrentUser } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';

type AuthProps = {
  onAuthSuccess: (user: User) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function Auth({ onAuthSuccess, open, onOpenChange }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let user: User;
      
      if (isLogin) {
        user = loginUser(values.username, values.password);
        toast({
          title: "Welcome back!",
          description: `You've successfully logged in as ${user.username}`,
        });
      } else {
        user = createUser(values.username, values.password);
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
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
              <Button type="submit">
                {isLogin ? "Log in" : "Create account"}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
