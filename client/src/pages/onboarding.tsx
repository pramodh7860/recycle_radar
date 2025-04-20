import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import RoleSelector from "@/components/ui/role-selector";
import LanguageSelector from "@/components/ui/language-selector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ThreeBackground from "@/components/ui/three-background";
import { Recycle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const OnboardingScreen = () => {
  const [_, setLocation] = useLocation();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [name, setName] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);

  // Animation to fade in the content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleGetStarted = async () => {
    if (!selectedRole) {
      toast({
        title: "Role selection required",
        description: "Please select your role to continue",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a simple username from name (in a real app, we'd check for uniqueness)
      const username = `${name.toLowerCase().replace(/\s+/g, ".")}_${Math.floor(Math.random() * 1000)}`;
      const password = `pwd_${Math.floor(Math.random() * 10000000)}`;
      
      await register({
        username,
        password,
        name,
        role: selectedRole,
        language: selectedLanguage
      });
      
      // Navigate to the appropriate dashboard based on role
      setLocation(`/${selectedRole}`);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary-dark z-50 flex flex-col items-center justify-center text-white p-6">
      {/* Animated background */}
      <ThreeBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden relative z-10"
      >
        <div className="bg-eco-pattern p-6 flex flex-col items-center">
          <motion.div 
            className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Recycle className="h-12 w-12 text-green-700" />
          </motion.div>
          <h1 className="font-inter font-bold text-2xl mb-2">Project Bolt</h1>
          <p className="text-center opacity-90">Revolutionizing Waste Management</p>
        </div>
        
        <div className="p-6">
          <h2 className="font-inter font-medium text-xl text-gray-900 mb-4">Get Started</h2>
          
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Your Name
            </label>
            <input 
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your name"
            />
          </div>
          
          {/* Role Selection */}
          <h2 className="font-inter font-medium text-xl text-gray-900 mb-4">Select Your Role</h2>
          <RoleSelector onRoleSelect={handleRoleSelect} selectedRole={selectedRole} />
          
          {/* Language Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" htmlFor="language">
              Preferred Language
            </label>
            <LanguageSelector 
              value={selectedLanguage} 
              onChange={handleLanguageChange} 
            />
          </div>
          
          {/* Get Started Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleGetStarted}
              disabled={isLoading}
              className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 flex items-center"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Processing</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingScreen;
