
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Toaster, toast } from "sonner";
import { Shield } from "lucide-react";



const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);

      toast.success("Login successful!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);

      if (error?.code === "INVALID_CREDENTIALS") {
        toast.error("Invalid email or password.");
      } else if (error?.code === "ACCOUNT_PENDING") {
        toast.info("Your account is pending approval. Please contact your administrator.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <Card
        className="
          w-full max-w-md
          rounded-[28px]
          border border-slate-100
          bg-white
          shadow-[0_24px_80px_rgba(15,23,42,0.12)]
          transition-transform duration-300
          hover:scale-[1.02] hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]
        "
      >
        
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5ecff]">
            <Shield className="h-8 w-8 text-[#2563eb]" />
          </div>

          <CardTitle className="mt-1 text-[15px] text-slate-500">
            Complaint Management System
          </CardTitle>

          <CardDescription className="mt-1 text-[15px] text-slate-500">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
      
        <form onSubmit={handleSubmit}>
          <CardContent className="mt-4 space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  h-11 rounded-xl border border-slate-200
                  bg-slate-50 text-sm placeholder:text-slate-400
                  focus:bg-white
                "
              />
            </div>

            <div className="space-y-1.5 text-left">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  h-11 rounded-xl border border-slate-200
                  bg-slate-50 text-sm placeholder:text-slate-400
                  focus:bg-white
                "
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button
              type="submit"
              disabled={submitting}
              className="
                h-11 w-full rounded-xl
                bg-[#2563eb]
                text-sm font-medium text-white
                hover:bg-[#1d4ed8]
                transition-colors
              "
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-[#2563eb] hover:underline">
                Sign up
              </Link>
            </p>
            
          </CardFooter>
        </form>
      </Card>
      
    </div>
  );
};

export default LoginPage;
