
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  magicLinkAuth: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中是否有用户信息
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // 发送登录链接到邮箱
  const login = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 在真实环境中，这里应该调用后端API发送登录链接
      // 为了演示，我们直接模拟一个成功的响应
      
      toast({
        title: "登录链接已发送",
        description: `已向 ${email} 发送登录链接，请查收邮件。`,
      });
      
      // 仅供演示：自动生成一个假的magic link并跳转
      const fakeToken = btoa(email);
      // 自动模拟用户点击了链接
      setTimeout(() => {
        window.location.href = `/?token=${fakeToken}`;
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 验证magic link的token
  const magicLinkAuth = async (token: string): Promise<void> => {
    setIsLoading(true);
    try {
      // 模拟API验证
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 解码token获取email (仅用于演示)
      const email = atob(token);
      const userData = { email, name: email.split('@')[0] };
      
      // 保存用户信息
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: "无效的登录链接",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "已退出登录",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        magicLinkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
