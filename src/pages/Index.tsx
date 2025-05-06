
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // 短暂延迟以展示加载动画
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/datasets");
      } else {
        navigate("/login");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">跳转中...</p>
      </div>
    </div>
  );
};

export default Index;
