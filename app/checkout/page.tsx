"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Checkout } from "../components/Checkout";
import { useCart } from "../components/CartContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function CheckoutPage() {
  const { itemCount } = useCart();

  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-8 sm:mb-12"
        >
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-4">
            <Link href="/products" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div variants={fadeInUp}>
                <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  <Lock className="w-3 h-3 mr-1" />
                  Secure Checkout
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
              >
                Complete Your Order
              </motion.h1>
            </div>
            
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm sm:text-base">{itemCount} item{itemCount !== 1 ? "s" : ""} in cart</span>
            </motion.div>
          </div>
          
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-muted-foreground mt-3 sm:mt-4 max-w-2xl"
          >
            Review your cart and provide your details for pickup. We&apos;ll have your
            order ready!
          </motion.p>
        </motion.div>

        {/* Checkout Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Checkout />
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Pickup Only - No Shipping</span>
          </div>
        </motion.div>

        {/* Mobile Back Button */}
        <div className="mt-8 sm:hidden">
          <Link href="/products">
            <Button variant="outline" className="w-full h-12">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
