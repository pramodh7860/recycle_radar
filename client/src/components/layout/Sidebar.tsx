import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, 
  ShoppingCart, 
  BarChart2, 
  HelpCircle, 
  Settings, 
  User, 
  ChevronRight, 
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRoleColor } from "@/lib/theme";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const roleColors = getRoleColor(user?.role);

  const isActive = (path: string) => {
    return location === path;
  };

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center py-2 px-4 rounded-md transition-colors",
          isActive(href)
            ? `${roleColors.bgLight} text-gray-900`
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        <Icon className="h-5 w-5 mr-3" />
        {!collapsed && <span>{label}</span>}
      </a>
    </Link>
  );

  return (
    <aside
      className={cn(
        "bg-white shadow-md transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="p-4 flex justify-between items-center border-b">
        {!collapsed && (
          <h2 className="font-semibold text-gray-800">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Navigation"}
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="p-2 space-y-1">
        <NavItem href={`/${user?.role || ''}`} icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/marketplace" icon={ShoppingCart} label="Marketplace" />
        <NavItem href="/reports" icon={BarChart2} label="Reports" />
        <NavItem href="/support" icon={HelpCircle} label="Support" />
        <NavItem href="/profile" icon={User} label="Profile" />
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </nav>
    </aside>
  );
};

export default Sidebar;
