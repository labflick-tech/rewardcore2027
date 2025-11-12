import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Award, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(
    (searchParams.get("mode") as "login" | "signup") || "login"
  );
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Check for referral code in sessionStorage
    const storedReferralCode = sessionStorage.getItem("referral_code");
    if (storedReferralCode) {
      setReferralCode(storedReferralCode);
    }
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: username || email.split("@")[0],
        },
      },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Handle referral if exists
    if (referralCode && data.user) {
      setTimeout(async () => {
        // Find the referrer profile
        const { data: referrerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", referralCode)
          .single();

        if (referrerProfile) {
          // Update referred user's profile
          await supabase
            .from("profiles")
            .update({ referred_by: referrerProfile.id })
            .eq("id", data.user.id);

          // Create referral record
          await supabase
            .from("referrals")
            .insert({
              referrer_id: referrerProfile.id,
              referred_id: data.user.id,
            });

          // Update referrer's profile
          const { data: currentReferrer } = await supabase
            .from("profiles")
            .select("referral_count, total_balance, total_earned")
            .eq("id", referrerProfile.id)
            .single();

          if (currentReferrer) {
            await supabase
              .from("profiles")
              .update({
                referral_count: currentReferrer.referral_count + 1,
                total_balance: Number(currentReferrer.total_balance) + 0.20,
                total_earned: Number(currentReferrer.total_earned) + 0.20,
              })
              .eq("id", referrerProfile.id);
          }
        }

        // Clear referral code from sessionStorage
        sessionStorage.removeItem("referral_code");
      }, 1000);
    }

    setLoading(false);
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Award className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome Back" : "Join RewardCore"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Login to continue earning rewards"
                : "Create an account and start earning today"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {referralCode && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  🎉 Referral code applied: {referralCode}
                </p>
              </div>
            )}
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
