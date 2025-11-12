import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ListTodo, Gift, User, LogOut, Award, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-60"}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-glow group-hover:shadow-glow-secondary transition-all">
            <Award className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-hero bg-clip-text text-transparent">
              RewardCore
            </span>
          )}
        </Link>
        {!collapsed && <SidebarTrigger className="ml-auto" />}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
