import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Withdrawal {
  id: string;
  amount: number;
  paypal_email: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

const Rewards = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

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
      fetchBalance();
      fetchWithdrawals();
    }
  }, [session]);

  const fetchBalance = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("total_balance")
      .eq("id", session?.user.id)
      .single();

    if (data) {
      setBalance(Number(data.total_balance));
    }
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", session?.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setWithdrawals(data);
    }
  };

  const handleWithdraw = async () => {
    if (!session?.user.id) return;
    
    const amount = parseFloat(withdrawAmount);
    
    if (!paypalEmail || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (amount < 2) {
      toast.error("Minimum withdrawal is $2.00");
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const { error } = await supabase
      .from("withdrawals")
      .insert({
        user_id: session.user.id,
        amount,
        paypal_email: paypalEmail,
      });

    if (error) {
      toast.error("Failed to request withdrawal");
      return;
    }

    // Update balance
    await supabase
      .from("profiles")
      .update({ total_balance: balance - amount })
      .eq("id", session.user.id);

    toast.success("Withdrawal requested successfully!");
    setPaypalEmail("");
    setWithdrawAmount("");
    fetchBalance();
    fetchWithdrawals();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "rejected":
        return "text-destructive";
      default:
        return "text-warning";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Rewards</h1>
            </div>
          </header>

          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Balance Card */}
            <Card className="border-2 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-success" />
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-success mb-2">
                  ${balance.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum withdrawal: $2.00
                </p>
              </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <Card className="border-2 mb-8">
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>
                  Withdraw your earnings to PayPal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal">PayPal Email</Label>
                  <Input
                    id="paypal"
                    type="email"
                    placeholder="your@email.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="2.00"
                    min="2"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleWithdraw}
                  disabled={balance < 2}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Track your withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No withdrawal requests yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {withdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(withdrawal.status)}
                          <div>
                            <div className="font-semibold">
                              ${withdrawal.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(withdrawal.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Rewards;
