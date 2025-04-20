import { useState } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import MapBox from "@/components/ui/map-box";
import ThreeBackground from "@/components/ui/three-background";
import { ProtectedRoute } from "@/lib/protected-route";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, AuthProvider } from "./hooks/use-auth";
import DarkLayout from "@/components/layout/DarkLayout";

// Import pages
import VendorDashboard from "./pages/vendor-dashboard";
import FactoryDashboard from "./pages/factory-dashboard";
import EntrepreneurDashboard from "./pages/entrepreneur-dashboard";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";

// Component shown on the main dashboard after login
const OnboardingScreen = () => {
  const { user } = useAuth();

  return (
    <div className="relative py-10">  
      {/* Content */}
      <div className="relative z-10 p-8 bg-gray-900/70 rounded-lg shadow-2xl backdrop-blur-md max-w-md mx-auto border border-gray-700">
        <div className="flex items-center mb-6">
          <svg className="w-10 h-10 mr-3 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 14L12 18L3 14M12 6L3 10L12 14L21 10L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 14L12 18L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl font-bold text-white">Welcome to RecycleRadar</h1>
        </div>

        <p className="mb-8 text-gray-300">
          {user ? `Hello, ${user.name}! ` : ''}
          Please select your dashboard:
        </p>

        <div className="flex flex-col space-y-4">
          {user?.role === 'vendor' || !user?.role ? (
            <Link href="/vendor" className="p-4 bg-red-800/80 hover:bg-red-700 text-white rounded-md text-center transition-all backdrop-blur-sm border border-red-700/50 shadow-lg hover:shadow-red-700/20">
              Vendor Dashboard
            </Link>
          ) : null}

          {user?.role === 'factory' || !user?.role ? (
            <Link href="/factory" className="p-4 bg-red-900/80 hover:bg-red-800 text-white rounded-md text-center transition-all backdrop-blur-sm border border-red-800/50 shadow-lg hover:shadow-red-700/20">
              Factory Owner Dashboard
            </Link>
          ) : null}

          {user?.role === 'entrepreneur' || !user?.role ? (
            <Link href="/entrepreneur" className="p-4 bg-red-950/80 hover:bg-red-900 text-white rounded-md text-center transition-all backdrop-blur-sm border border-red-900/50 shadow-lg hover:shadow-red-700/20">
              Entrepreneur Dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Header with navigation links
const AppHeader = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  // Don't show header on auth page
  if (location === '/auth') return null;

  return (
    <header className="bg-black/40 backdrop-blur-md text-white p-4 shadow-lg border-b border-red-800/30 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 mr-2 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 14L12 18L3 14M12 6L3 10L12 14L21 10L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 14L12 18L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl font-bold tracking-tight">RecycleRadar</h1>
        </div>

        <nav className="flex items-center">
          <ul className="flex space-x-6 mr-6">
            <li>
              <Link href="/" className="hover:text-red-400 transition-colors duration-200 flex items-center">
                <span className="relative group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full"></span>
                </span>
              </Link>
            </li>
            {user?.role === 'vendor' && (
              <li>
                <Link href="/vendor" className="hover:text-red-400 transition-colors duration-200 flex items-center">
                  <span className="relative group">
                    Vendor
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full"></span>
                  </span>
                </Link>
              </li>
            )}
            {user?.role === 'factory' && (
              <li>
                <Link href="/factory" className="hover:text-red-400 transition-colors duration-200 flex items-center">
                  <span className="relative group">
                    Factory
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full"></span>
                  </span>
                </Link>
              </li>
            )}
            {user?.role === 'entrepreneur' && (
              <li>
                <Link href="/entrepreneur" className="hover:text-red-400 transition-colors duration-200 flex items-center">
                  <span className="relative group">
                    Entrepreneur
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full"></span>
                  </span>
                </Link>
              </li>
            )}
          </ul>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

// Main App component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <DarkLayout>
        <div className="min-h-screen flex flex-col">
          <AppHeader />

          <main className="flex-1 container mx-auto px-4 py-6">
            <Switch>
              <ProtectedRoute path="/" component={OnboardingScreen} />
              <ProtectedRoute path="/vendor" component={VendorDashboard} />
              <ProtectedRoute path="/factory" component={FactoryDashboard} />
              <ProtectedRoute path="/entrepreneur" component={EntrepreneurDashboard} />
              <Route path="/auth" component={AuthPage} />
              <Route component={NotFound} />
            </Switch>
          </main>

          <footer className="bg-red-900/80 backdrop-blur-sm text-white p-3 text-center text-sm border-t border-red-800">
            RecycleRadar &copy; 2025
          </footer>
          <Toaster />
        </div>
      </DarkLayout>
    </AuthProvider>
  );
}

export default App;