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
      navigate("/dashboard"); // or /login if you prefer
    } catch (error) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="          
            w-full max-w-md
          rounded-[28px]
          border border-slate-100
          bg-white
          shadow-[0_24px_80px_rgba(15,23,42,0.12)]
          transition-transform duration-300
          hover:scale-[1.02] hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]">

        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5ecff]">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to get started with Complaint Manager
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repassword">Confirm Password</Label>
              <Input
                id="repassword"
                type="password"
                placeholder="••••••••"
                value={repassword}
                onChange={(e) => setRepassword(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            <div className="space-y-2">
              <Label>Organization</Label>
              <Select
                value={organization}
                onValueChange={setOrganization}
              >
                <SelectTrigger className="transition-all duration-300 focus:scale-[1.02]">
                  <SelectValue placeholder="Select your organization" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="airline">Airline</SelectItem>
                  <SelectItem value="telecom">Telecom</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full hover-lift"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
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
