import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useOffline } from "@/contexts/OfflineContext";
import { Recycle, Bell, Menu } from "lucide-react";

const Header = () => {
  const [_, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { isOnline, pendingChanges, syncNow } = useOffline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToDashboard = () => {
    if (user?.role) {
      setLocation(`/${user.role}`);
    } else {
      setLocation("/");
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={navigateToDashboard}
            >
              <Recycle className="h-6 w-6 text-green-700 mr-2" />
              <span className="font-inter font-bold text-xl text-green-700">Project Bolt</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link href={`/${user?.role || ''}`} className="text-gray-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                Marketplace
              </Link>
              <Link href="/reports" className="text-gray-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                Reports
              </Link>
              <Link href="/support" className="text-gray-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium">
                Support
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-1 rounded-full text-gray-600 hover:text-green-700 focus:outline-none">
              <Bell className="h-6 w-6" />
              {pendingChanges > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.name || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-gray-500">
                  {isOnline ? (
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></span>
                      Offline
                    </span>
                  )}
                </div>
                {pendingChanges > 0 && (
                  <DropdownMenuItem className="cursor-pointer" onClick={syncNow}>
                    <span className="flex items-center">
                      <span className="text-yellow-600 mr-1">↑</span>
                      Sync ({pendingChanges}) changes
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden rounded-md p-2 text-gray-600 hover:text-green-700 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 space-y-1">
            <Link href={`/${user?.role || ''}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50">
              Dashboard
            </Link>
            <Link href="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50">
              Marketplace
            </Link>
            <Link href="/reports" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50">
              Reports
            </Link>
            <Link href="/support" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50">
              Support
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
