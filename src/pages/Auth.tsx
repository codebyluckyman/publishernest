
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Logged in successfully");
        navigate("/");
      } else {
        // Handle signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Sign up successful! Please check your email for verification.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Login" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Enter your credentials below to login to your account"
              : "Enter your information below to create your account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Create account"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
