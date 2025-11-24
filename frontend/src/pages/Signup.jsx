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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("bank");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== repassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name, organization);
      toast.success("Account created successfully!");
      // you can change this to "/login" if you want them to log in manually
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
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
            <UserPlus className="h-8 w-8 text-[#2563eb]" />
          </div>
          <CardTitle className="text-2xl font-semibold text-slate-900">
            Create Account
          </CardTitle>
          <CardDescription className="mt-1 text-[15px] text-slate-500">
            Sign up to get started with Complaint Manager
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="mt-4 space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="
                  h-11 rounded-xl border border-slate-200
                  bg-slate-50 text-sm placeholder:text-slate-400
                  focus:bg-white transition-all duration-300 focus:scale-[1.02]
                "
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
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
                  focus:bg-white transition-all duration-300 focus:scale-[1.02]
                "
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
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
                  focus:bg-white transition-all duration-300 focus:scale-[1.02]
                "
              />
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor="repassword"
                className="text-sm font-medium text-slate-700"
              >
                Confirm Password
              </Label>
              <Input
                id="repassword"
                type="password"
                placeholder="••••••••"
                value={repassword}
                onChange={(e) => setRepassword(e.target.value)}
                required
                className="
                  h-11 rounded-xl border border-slate-200
                  bg-slate-50 text-sm placeholder:text-slate-400
                  focus:bg-white transition-all duration-300 focus:scale-[1.02]
                "
              />
            </div>

            {/* Organization */}
            <div className="space-y-1.5 text-left">
              <Label className="text-sm font-medium text-slate-700">
                Organization
              </Label>
              <Select
                value={organization}
                onValueChange={setOrganization}
              >
                <SelectTrigger
                  className="
                    h-11 rounded-xl border border-slate-200
                    bg-slate-50 text-sm text-slate-900
                    placeholder:text-slate-400
                    focus:bg-white transition-all duration-300 focus:scale-[1.02]
                  "
                >
                  <SelectValue placeholder="Select your organization" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    value="bank"
                    className="text-slate-800 hover:bg-slate-100 rounded-md"
                  >
                    Bank
                  </SelectItem>
                  <SelectItem
                    value="airline"
                    className="text-slate-800 hover:bg-slate-100 rounded-md"
                  >
                    Airline
                  </SelectItem>
                  <SelectItem
                    value="telecom"
                    className="text-slate-800 hover:bg-slate-100 rounded-md"
                  >
                    Telecom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="
                h-11 w-full rounded-xl
                bg-[#2563eb]
                text-sm font-medium text-white
                hover:bg-[#1d4ed8]
                transition-colors
                hover-lift
              "
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#2563eb] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
