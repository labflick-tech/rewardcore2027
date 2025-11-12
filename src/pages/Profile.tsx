import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Link as LinkIcon, Copy, TrendingUp, Users } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Profile {
  username: string;
  email: string;
  referral_code: string;
  total_balance: number;
  total_earned: number;
  referral_count: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

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
      setUsername(data.username);
    }
  };

  const updateUsername = async () => {
    if (!session?.user.id || !username) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Failed to update username");
    } else {
      toast.success("Username updated successfully");
      fetchProfile();
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
              <h1 className="text-2xl font-bold">Profile</h1>
            </div>
          </header>

          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total Earned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    ${profile.total_earned.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Referrals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {profile.referral_count}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Current Balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${profile.total_balance.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Info */}
            <Card className="border-2 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button onClick={updateUsername}>Update</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Link */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link to earn $0.20 per referral
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly />
                  <Button onClick={copyReferralLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    <strong>Referral Code:</strong> {profile.referral_code}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    You earn $0.20 for each friend who signs up using your link
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
