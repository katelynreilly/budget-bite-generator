
import React from 'react';
import { cn } from '@/lib/utils';
import { LogIn, UserPlus } from 'lucide-react';

type AuthTabsProps = {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
};

export function AuthTabs({ isLogin, setIsLogin }: AuthTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 my-4 border rounded-lg overflow-hidden">
      <button
        type="button"
        className={cn(
          "flex-1 px-4 py-3 flex justify-center items-center gap-2 text-sm font-medium transition-colors",
          isLogin 
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
        onClick={() => setIsLogin(true)}
      >
        <LogIn className="h-4 w-4" />
        <span>Log in</span>
      </button>
      
      <button
        type="button"
        className={cn(
          "flex-1 px-4 py-3 flex justify-center items-center gap-2 text-sm font-medium transition-colors",
          !isLogin 
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )}
        onClick={() => setIsLogin(false)}
      >
        <UserPlus className="h-4 w-4" />
        <span>Create Account</span>
      </button>
    </div>
  );
}
