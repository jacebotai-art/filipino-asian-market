"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Heart, Package, MapPin, CreditCard, Crown, 
  LogOut, ChevronRight, Star, Gift, History, Plus, Trash2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart, formatPrice, getTierBenefits } from "./CartContext";
import { getProductById } from "./products";
import { CompactProductCard } from "./ProductCard";
import { logoutUser } from "@/app/lib/supabase-auth";

export function UserAccountPanel() {
  const { state, dispatch } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = state.user;

  if (!user) return null;

  const tierBenefits = getTierBenefits(user.tier);
  const tierColors = {
    bronze: "bg-amber-700",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    platinum: "bg-purple-500",
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    // Call Supabase logout
    await logoutUser();
    
    // Update local state
    dispatch({ type: "LOGOUT" });
    setIsLoggingOut(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* User Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <div className={`w-8 h-8 ${tierColors[user.tier]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
          {user.firstName[0]}{user.lastName[0]}
        </div>
        {user.loyaltyPoints > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center">
            {user.tier[0].toUpperCase()}
          </span>
        )}
      </Button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-full sm:max-w-lg bg-white shadow-2xl z-50 flex flex-col"
              role="dialog"
              aria-label="User account panel"
              aria-modal="true"
            >
              {/* Header */}
              <div className="bg-primary p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${tierColors[user.tier]} rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white/30`}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                      <p className="text-white/80 text-sm">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${tierColors[user.tier]} text-white border-0`}>
                          <Crown className="w-3 h-3 mr-1" />
                          {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Loyalty Points */}
                <div className="mt-6 bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                      <span className="font-semibold">{user.loyaltyPoints} Points</span>
                    </div>
                    <span className="text-sm text-white/80">
                      {tierBenefits.discount > 0 && `${(tierBenefits.discount * 100).toFixed(0)}% off`}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((user.loyaltyPoints / 5000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-1">
                    {user.tier === "platinum" 
                      ? "You've reached the highest tier!" 
                      : `${5000 - user.loyaltyPoints} points to Platinum`}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <Tabs defaultValue="orders" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="orders">
                      <History className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="wishlist">
                      <Heart className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="addresses">
                      <MapPin className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="referral">
                      <Gift className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="orders" className="mt-4 space-y-4">
                    <h3 className="font-semibold text-lg">Order History</h3>
                    {user.orderHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No orders yet</p>
                        <Button 
                          variant="outline" 
                          className="mt-3"
                          onClick={() => {
                            setIsOpen(false);
                            document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      user.orderHistory.map((order) => (
                        <Card key={order.id} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={
                                order.status === "delivered" ? "bg-green-100 text-green-800" :
                                order.status === "cancelled" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                              }>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm">{order.items.length} items • {formatPrice(order.total)}</p>
                            <Button variant="ghost" size="sm" className="mt-2 text-primary">
                              View Details <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="wishlist" className="mt-4 space-y-4">
                    <h3 className="font-semibold text-lg">My Wishlist ({user.wishlist.length})</h3>
                    {user.wishlist.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Your wishlist is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {user.wishlist.map((productId) => {
                          const product = getProductById(productId);
                          if (!product) return null;
                          return (
                            <div key={productId} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <span className="text-2xl">{product.emoji}</span>
                              <div className="flex-1">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-primary">{formatPrice(product.price)}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
                              >
                                Add to Cart
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId })}
                                className="text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="addresses" className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Saved Addresses</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        Add New
                      </Button>
                    </div>
                    {user.addresses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No saved addresses</p>
                      </div>
                    ) : (
                      user.addresses.map((address) => (
                        <Card key={address.id} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{address.name}</p>
                                <p className="text-sm text-muted-foreground">{address.street}</p>
                                <p className="text-sm text-muted-foreground">
                                  {address.city}, {address.state} {address.zip}
                                </p>
                                <p className="text-sm text-muted-foreground">{address.phone}</p>
                              </div>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="referral" className="mt-4 space-y-4">
                    <h3 className="font-semibold text-lg">Referral Program</h3>
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardContent className="p-6 text-center">
                        <Gift className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                        <h4 className="font-bold text-lg mb-2">Share & Earn!</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Give friends 50 points, get 100 points when they make their first order!
                        </p>
                        <div className="bg-white rounded-lg p-3 border-2 border-dashed border-purple-300">
                          <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
                          <p className="text-2xl font-bold text-purple-600 tracking-wider">{user.referralCode}</p>
                        </div>
                        <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                          Copy Code
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Sign out of your account"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
