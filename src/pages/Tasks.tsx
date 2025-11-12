import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileText, Share2, HelpCircle, CheckCircle2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  task_type: string;
  task_url: string;
  is_active: boolean;
}

interface CompletedTask {
  task_id: string;
}

const Tasks = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

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
      fetchTasks();
      fetchCompletedTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_active", true)
      .order("reward_amount", { ascending: false });

    if (error) {
      toast.error("Failed to load tasks");
    } else {
      setTasks(data || []);
    }
  };

  const fetchCompletedTasks = async () => {
    const { data, error } = await supabase
      .from("user_tasks")
      .select("task_id")
      .eq("user_id", session?.user.id);

    if (error) {
      console.error("Failed to load completed tasks");
    } else {
      setCompletedTasks(new Set(data?.map((t: CompletedTask) => t.task_id) || []));
    }
  };

  const completeTask = async (taskId: string, rewardAmount: number) => {
    if (!session?.user.id) return;

    // Insert completed task
    const { error: taskError } = await supabase
      .from("user_tasks")
      .insert({ user_id: session.user.id, task_id: taskId, earnings: rewardAmount });

    if (taskError) {
      toast.error("Failed to complete task");
      return;
    }

    // Update user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_balance, total_earned")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({
          total_balance: Number(profile.total_balance) + rewardAmount,
          total_earned: Number(profile.total_earned) + rewardAmount,
        })
        .eq("id", session.user.id);
    }

    toast.success(`Task completed! You earned $${rewardAmount.toFixed(2)}`);
    fetchCompletedTasks();
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "quiz":
        return HelpCircle;
      case "survey":
        return FileText;
      case "social":
        return Share2;
      default:
        return FileText;
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
              <h1 className="text-2xl font-bold">Tasks</h1>
            </div>
          </header>

          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <p className="text-muted-foreground">Complete tasks to earn money instantly</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => {
                const Icon = getTaskIcon(task.task_type);
                const isCompleted = completedTasks.has(task.id);

                return (
                  <Card key={task.id} className={`border-2 hover:shadow-lg transition-all ${isCompleted ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-success">
                            ${task.reward_amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">{task.task_type}</div>
                        </div>
                      </div>
                      <CardTitle className="mt-4">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isCompleted ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => {
                            window.open(task.task_url, "_blank");
                            completeTask(task.id, task.reward_amount);
                          }}
                        >
                          Start Task
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tasks available at the moment</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Tasks;
