import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Share2, Gift, TrendingUp, DollarSign, ListTodo, Users } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Profile {
  username: string;
  total_balance: number;
  total_earned: number;
  referral_count: number;
  referral_code: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth?mode=login");
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session?.user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/ref/${profile?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session || !profile) return null;

  const referralLink = `${window.location.origin}/ref/${profile.referral_code}`;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
          </header>

          <div className="container mx-auto px-6 py-8">
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, <span className="bg-gradient-hero bg-clip-text text-transparent">{profile.username}</span>! 👋
              </h2>
              <p className="text-muted-foreground">Here's your earnings overview</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-2 bg-gradient-to-br from-success/10 to-success/5">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Available Balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-success">${profile.total_balance.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total Earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">${profile.total_earned.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="border-2 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Referrals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-secondary">{profile.referral_count}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Referral Card */}
              <Card className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    Share & Earn
                  </CardTitle>
                  <CardDescription>
                    Earn $0.20 for each friend who joins using your link
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-mono break-all">{referralLink}</p>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full" 
                    size="lg"
                    onClick={copyReferralLink}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Referral Link
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Your code: <strong>{profile.referral_code}</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Tasks Card */}
              <Card className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-success" />
                    Available Tasks
                  </CardTitle>
                  <CardDescription>
                    Complete tasks to earn money instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-6">
                    <div className="text-6xl mb-2">📋</div>
                    <p className="text-lg font-semibold">Ready to Earn?</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete simple tasks and get paid
                    </p>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate("/tasks")}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Browse Tasks
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/rewards")}
              >
                <Gift className="w-4 h-4 mr-2" />
                View Rewards & Withdraw
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
