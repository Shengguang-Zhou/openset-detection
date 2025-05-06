
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Mail } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, magicLinkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 检查URL中是否有token参数
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    
    if (token) {
      magicLinkAuth(token);
    }
  }, [magicLinkAuth]);

  // 如果用户已登录，重定向到之前尝试访问的页面或默认页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/datasets";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    
    setIsSubmitting(true);
    try {
      await login(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">镜像标注助手</CardTitle>
          </div>
          <div className="border-t border-gray-200" />
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">发送中</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : "发送登录链接"}
            </Button>
          </CardFooter>
        </form>
        <div className="px-6 pb-4 text-center text-sm text-gray-500">
          © 2025 镜像标注助手
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
