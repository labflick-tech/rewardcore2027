import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Share2, TrendingUp, Shield, Zap, Gift, CheckCircle2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-rewards.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-semibold text-primary">🇰🇪 Made for Kenya</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Earn Real Money from{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Simple Tasks
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Complete tasks, refer friends, and unlock rewards. Get paid directly to your PayPal account with as little as $2.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth?mode=signup">
                    Start Earning Now
                    <Award className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="#how-it-works">How It Works</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-2xl font-bold text-primary">$2</div>
                  <div className="text-sm text-muted-foreground">Min Payout</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold text-secondary">$0.20</div>
                  <div className="text-sm text-muted-foreground">Per Referral</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold text-success">Free</div>
                  <div className="text-sm text-muted-foreground">To Join</div>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Rewards and earnings visualization"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Start earning in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                step: "01",
                title: "Sign Up Free",
                description: "Create your account in seconds with just your email. No payment required.",
              },
              {
                icon: Zap,
                step: "02",
                title: "Complete Tasks",
                description: "Watch ads, take quizzes, refer friends, and earn money for each task.",
              },
              {
                icon: Gift,
                step: "03",
                title: "Get Paid",
                description: "Cash out to PayPal once you reach $2. It's that simple!",
              },
            ].map((item, index) => (
              <Card key={index} className="border-2 hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:shadow-glow transition-all">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-muted/20 mb-2">{item.step}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RewardCore?</h2>
            <p className="text-lg text-muted-foreground">
              The most rewarding platform for Kenyan users
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Multiple Earning Methods",
                description: "Tasks, quizzes, referrals, and exclusive luckbox rewards.",
                color: "text-primary",
              },
              {
                icon: Shield,
                title: "Secure & Trusted",
                description: "Your data is protected with industry-standard encryption.",
                color: "text-success",
              },
              {
                icon: Share2,
                title: "Viral Referral System",
                description: "Earn $0.20 + 5 entries for every friend who joins.",
                color: "text-secondary",
              },
              {
                icon: Award,
                title: "Gamified Progress",
                description: "Track your progress with visual rewards and achievements.",
                color: "text-primary",
              },
              {
                icon: Zap,
                title: "Instant Payouts",
                description: "Withdraw to PayPal starting from just $2.",
                color: "text-success",
              },
              {
                icon: Gift,
                title: "Luckbox Rewards",
                description: "Unlock mystery prizes every 3 hours with 5 referrals.",
                color: "text-secondary",
              },
            ].map((feature, index) => (
              <Card key={index} className="border hover:shadow-lg transition-all">
                <CardHeader>
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-3`} />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Earning?</h2>
            <p className="text-lg md:text-xl opacity-90">
              Join thousands of Kenyans already earning real money on RewardCore
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="secondary" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Create Free Account
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm opacity-75">No credit card required • Free forever • Payout in 24 hours</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 RewardCore. Made with ❤️ for Kenya.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
