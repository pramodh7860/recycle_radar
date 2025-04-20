import React, { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ThreeBackground from "@/components/ui/three-background";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().refine(value => ["vendor", "factory", "entrepreneur"].includes(value), {
    message: "Please select a valid role"
  }),
  language: z.string().default("en"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "",
      language: "en",
    },
  });

  const onLoginSubmit = async (data: LoginValues) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const onRegisterSubmit = async (data: RegisterValues) => {
    try {
      await registerMutation.mutateAsync(data);
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* 3D background for the entire page */}
      <div className="fixed inset-0 z-0">
        <ThreeBackground />
      </div>
      
      {/* Glass effect overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-0"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl w-full shadow-2xl rounded-xl overflow-hidden z-10 backdrop-blur-md border border-gray-700">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-red-900/80 to-black/90 p-8 flex flex-col justify-between text-white hidden md:flex backdrop-blur-md">
          <div>
            <div className="mb-6 flex items-center">
              <svg className="w-12 h-12 mr-3 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 14L12 18L3 14M12 6L3 10L12 14L21 10L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14L12 18L21 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-4xl font-bold tracking-tight">RecycleRadar</h1>
            </div>
            
            <p className="text-xl opacity-90 mb-8 text-gray-200 leading-relaxed">
              Connect waste collectors, processing factories, and entrepreneurs in one seamless recycling ecosystem.
            </p>
            
            <div className="space-y-5 mt-8">
              <div className="flex items-start space-x-3">
                <div className="bg-red-600 p-2 rounded-full mt-1 shadow-glow">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                </div>
                <p className="text-lg">Interactive 3D maps for waste collection and tracking</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-red-600 p-2 rounded-full mt-1 shadow-glow">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                </div>
                <p className="text-lg">Specialized dashboards for vendors, factories, and entrepreneurs</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-red-600 p-2 rounded-full mt-1 shadow-glow">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                  </svg>
                </div>
                <p className="text-lg">Offline-capable platform with real-time synchronization</p>
              </div>
            </div>
          </div>
          <p className="text-base opacity-80 mt-8 bg-black/20 p-4 rounded-lg border border-red-600/40">
            Join thousands of users who are already making a positive environmental impact through RecycleRadar.
          </p>
        </div>

        {/* Auth Forms */}
        <div className="bg-gray-900/80 backdrop-blur-md p-8 border-l border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-red-800">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-red-800">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Log in to access your RecycleRadar dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Log in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center px-0 pt-4">
                  <p className="text-sm text-muted-foreground mt-6">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      Register now
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Join RecycleRadar and start making an impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name / Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name or business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your account type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vendor">Waste Vendor</SelectItem>
                                <SelectItem value="factory">Factory Owner</SelectItem>
                                <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mt-6" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center px-0 pt-4">
                  <p className="text-sm text-muted-foreground mt-6">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      Log in
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}