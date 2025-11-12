import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Share2, Gift, TrendingUp, DollarSign } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const username = session.user.user_metadata?.username || session.user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={true} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-hero bg-clip-text text-transparent">{username}</span>! 🎉
          </h1>
          <p className="text-muted-foreground">Here's your earnings overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">$0.00</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$0.00</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Luckbox Entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">0/5</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Share & Earn */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Share & Earn Entries
              </CardTitle>
              <CardDescription>
                Earn 5 entries for each friend who joins using your link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono break-all">
                  https://rewardcore.site/ref/{session.user.id.slice(0, 8)}
                </p>
              </div>
              <Button variant="hero" className="w-full" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share with Friends
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Each referral = 5 entries + $0.20
              </p>
            </CardContent>
          </Card>

          {/* Luckbox */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-secondary" />
                Luckbox Draw
              </CardTitle>
              <CardDescription>
                Get 5 referrals to unlock a prize draw every 3 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="text-6xl mb-2">🎁</div>
                <p className="text-lg font-semibold">0/5 Invites</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Invite 5 friends to unlock your first Luckbox
                </p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Locked - Need 5 Referrals
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Button variant="default" size="lg" className="w-full" onClick={() => navigate("/tasks")}>
            <Award className="w-4 h-4 mr-2" />
            Browse Tasks
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/rewards")}>
            View Rewards Progress
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/payout")}>
            Request Payout
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
