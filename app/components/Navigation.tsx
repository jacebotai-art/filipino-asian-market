"use client";

import { motion } from "framer-motion";
import { ShoppingBasket, Menu, ShoppingCart, X, Home, Package, Info, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { UserAccountPanel } from "./UserAccountPanel";
import { CartDrawer } from "./CartDrawer";
import { LoginModal } from "./LoginModal";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/about", label: "About", icon: Info },
  { href: "/location", label: "Location", icon: MapPin },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { state, itemCount, dispatch } = useCart();

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm safe-top"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingBasket className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-primary">Manila</span>
                  <span className="text-xl font-bold text-foreground">Mart</span>
                </div>
                <span className="text-lg font-bold text-primary sm:hidden">MM</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full transition-all font-medium text-sm ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* User Account / Login */}
              {state.isLoggedIn ? (
                <UserAccountPanel />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch({ type: "TOGGLE_LOGIN_MODAL" })}
                  className="relative h-10 w-10"
                  aria-label="Sign in"
                >
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">👤</span>
                  </div>
                </Button>
              )}

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch({ type: "TOGGLE_CART" })}
                className="relative h-10 w-10"
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96 p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <ShoppingBasket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-primary">Manila</span>
                          <span className="text-lg font-bold text-foreground">Mart</span>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex-1 py-4">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-4 px-6 py-4 text-base font-medium transition-colors ${
                              pathname === item.href
                                ? "bg-primary/10 text-primary border-r-4 border-primary"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Mobile Menu Footer */}
                    <div className="border-t border-border p-4 safe-bottom">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">
                          {itemCount} item(s) in cart
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            dispatch({ type: "TOGGLE_CART" });
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View Cart
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        © 2024 Manila Mart. All rights reserved.
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Login Modal */}
      <LoginModal />
    </>
  );
}
