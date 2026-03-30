"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Lock, Mail, Phone, Eye, EyeOff, Gift, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "./CartContext";
import { 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword,
  isSupabaseConfigured 
} from "@/app/lib/supabase-auth";

export function LoginModal() {
  const { state, dispatch } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      // Fallback to demo mode for quick testing
      setError(
        "⚠️ Supabase not configured. Using demo mode for testing.\n\n" +
        "To enable real authentication:\n" +
        "1. Create a Supabase project at https://supabase.com\n" +
        "2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local\n" +
        "3. Run the database setup SQL"
      );
      
      // Demo login for testing
      setTimeout(() => {
        const demoUser = {
          id: "demo-user-" + Date.now(),
          firstName: "Demo",
          lastName: "User",
          email: loginData.email,
          phone: "(213) 555-1234",
          loyaltyPoints: 150,
          tier: "silver" as const,
          wishlist: [],
          addresses: [],
          orderHistory: [],
          referralCode: "MM" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          emailSubscribed: true,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "LOGIN", payload: demoUser });
        setIsLoading(false);
      }, 1000);
      return;
    }

    const result = await loginWithEmail({
      email: loginData.email,
      password: loginData.password,
    });

    if (result.success && result.user) {
      dispatch({ type: "LOGIN", payload: result.user });
    } else {
      setError(result.error || "Login failed. Please try again.");
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      setError(
        "⚠️ Supabase not configured. Using demo mode for testing.\n\n" +
        "To enable real authentication:\n" +
        "1. Create a Supabase project at https://supabase.com\n" +
        "2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
      );
      
      // Demo registration for testing
      setTimeout(() => {
        const demoUser = {
          id: "demo-user-" + Date.now(),
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          phone: registerData.phone,
          loyaltyPoints: 50,
          tier: "bronze" as const,
          wishlist: [],
          addresses: [],
          orderHistory: [],
          referralCode: "MM" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          referredBy: registerData.referralCode || undefined,
          emailSubscribed: true,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "LOGIN", payload: demoUser });
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            id: Date.now().toString(),
            type: "success",
            message: "Welcome! You received 50 bonus points for signing up!",
            timestamp: new Date().toISOString(),
          },
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

    const result = await registerWithEmail({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      phone: registerData.phone,
      referralCode: registerData.referralCode || undefined,
    });

    if (result.success && result.user) {
      dispatch({ type: "LOGIN", payload: result.user });
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: {
          id: Date.now().toString(),
          type: "success",
          message: "Welcome! You received 50 bonus points for signing up!",
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      setError("Please enter your email address first");
      return;
    }

    setIsLoading(true);
    setError("");

    if (!isSupabaseConfigured) {
      setError("Password reset requires Supabase configuration.");
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(loginData.email);
    
    if (result.success) {
      setSuccessMessage("Password reset email sent! Check your inbox.");
    } else {
      setError(result.error || "Failed to send reset email.");
    }
    
    setIsLoading(false);
  };

  if (!state.showLoginModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="login-modal-title" className="text-xl font-bold">Welcome to Manila Mart</h2>
                  <p className="text-white/80 text-sm">Sign in or create an account</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}
                className="text-white hover:bg-white/20"
                aria-label="Close login modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6" aria-label="Login or Register tabs">
                <TabsTrigger value="login" aria-label="Sign in to your account">Sign In</TabsTrigger>
                <TabsTrigger value="register" aria-label="Create a new account">Register</TabsTrigger>
              </TabsList>

              {error && (
                <div 
                  className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-start gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="whitespace-pre-line">{error}</span>
                </div>
              )}

              {successMessage && (
                <div 
                  className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4"
                  role="status"
                  aria-live="polite"
                >
                  {successMessage}
                </div>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                        autoComplete="email"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        autoComplete="current-password"
                        aria-required="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" aria-label="Remember me on this device" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading}
                    aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        required
                        autoComplete="given-name"
                        aria-required="true"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Dela Cruz"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                        autoComplete="family-name"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                        required
                        autoComplete="email"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(213) 555-1234"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="pl-10"
                        required
                        autoComplete="tel"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        aria-required="true"
                        aria-describedby="password-help"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>
                    <p id="password-help" className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                      autoComplete="new-password"
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="flex items-center gap-2">
                      <Gift className="w-4 h-4" aria-hidden="true" />
                      Referral Code (Optional)
                    </Label>
                    <Input
                      id="referralCode"
                      placeholder="Enter referral code"
                      value={registerData.referralCode}
                      onChange={(e) => setRegisterData({ ...registerData, referralCode: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Have a referral code? Enter it for bonus points!
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="rounded mt-1" 
                      required 
                      id="terms"
                      aria-required="true"
                    />
                    <label htmlFor="terms" className="text-muted-foreground">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading}
                    aria-label={isLoading ? "Creating account..." : "Create new account"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    🎁 New members get 50 bonus loyalty points!
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
