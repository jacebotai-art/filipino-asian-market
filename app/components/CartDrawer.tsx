"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, Tag, Crown, Percent, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart, formatPrice, CartItem, getTierBenefits } from "./CartContext";
import Link from "next/link";

export function CartDrawer() {
  const { state, dispatch, itemCount, subtotal, total, wholesaleSubtotal, isWholesaleEligible } = useCart();
  const user = state.user;

  const handleClose = () => dispatch({ type: "CLOSE_CART" });
  const handleCheckout = () => {
    dispatch({ type: "CLOSE_CART" });
  };

  const tierBenefits = user ? getTierBenefits(user.tier) : { discount: 0, freeDeliveryThreshold: 75 };
  const discountAmount = subtotal * tierBenefits.discount;
  const finalTotal = total - discountAmount;

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer - Mobile: slide up from bottom, Desktop: slide from right */}
          <motion.div
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 w-full sm:w-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col rounded-t-2xl sm:rounded-none max-h-[85vh] sm:max-h-none"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Handle bar for mobile */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Your Cart
                  </h2>
                  <p className="text-sm text-muted-foreground">{itemCount} items</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Close cart"
                className="hover:bg-muted h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Content */}
            {state.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
                >
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-primary/50" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Looks like you haven&apos;t added anything yet.
                </p>
                <Button onClick={handleClose} className="bg-primary hover:bg-primary/90 text-white px-8 h-12">
                  Start Shopping
                </Button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  {state.items.map((item) => (
                    <CartItemRow key={`${item.product.id}-${item.variantId}`} item={item} />
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4 sm:p-6 bg-muted/30 safe-bottom">
                  {/* Loyalty Banner */}
                  {user && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">
                          {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Member
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 mt-1">
                        {(tierBenefits.discount * 100).toFixed(0)}% discount applied
                      </p>
                    </div>
                  )}

                  {/* Wholesale Banner */}
                  {isWholesaleEligible && wholesaleSubtotal < subtotal && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Wholesale Pricing Applied
                        </span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        You saved {formatPrice(subtotal - wholesaleSubtotal)}
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    
                    {isWholesaleEligible && wholesaleSubtotal < subtotal && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Wholesale Savings
                        </span>
                        <span>-{formatPrice(subtotal - wholesaleSubtotal)}</span>
                      </div>
                    )}
                    
                    {tierBenefits.discount > 0 && (
                      <div className="flex justify-between text-sm text-purple-600">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {user?.tier} Discount ({(tierBenefits.discount * 100).toFixed(0)}%)
                        </span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Pickup Fee</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-foreground">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>
                    
                    {user && (
                      <p className="text-xs text-muted-foreground text-center">
                        You&apos;ll earn {Math.floor(finalTotal)} loyalty points with this order!
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Link href="/checkout" onClick={handleClose}>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white h-12 sm:h-14 text-base sm:text-lg font-semibold"
                      >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => dispatch({ type: "CLEAR_CART" })}
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10 h-11"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 h-11"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =====================
// CART ITEM ROW
// =====================

function CartItemRow({ item }: { item: CartItem }) {
  const { dispatch, isWholesaleEligible } = useCart();
  const { product, quantity, variantId } = item;
  
  const variant = product.variants?.find(v => v.id === variantId);
  const displayPrice = isWholesaleEligible && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-3 p-3 bg-white rounded-xl border border-border/50 shadow-sm"
    >
      {/* Product Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary to-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
        {product.emoji}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground text-sm truncate">
          {product.name}
        </h3>
        {variant && (
          <p className="text-xs text-muted-foreground">{variant.name}</p>
        )}
        <p className="text-xs text-muted-foreground">{product.unit}</p>
        <p className="text-primary font-semibold text-sm mt-1">
          {formatPrice(displayPrice)}
          {isWholesaleEligible && product.wholesalePrice && (
            <span className="text-xs text-muted-foreground line-through ml-2">
              {formatPrice(product.price)}
            </span>
          )}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full"
              onClick={() =>
                dispatch({
                  type: "UPDATE_QUANTITY",
                  payload: { id: variantId ? `${product.id}:${variantId}` : product.id, quantity: quantity - 1 },
                })
              }
              aria-label={`Decrease quantity of ${product.name}`}
            >
              <Minus className="w-3 h-3" aria-hidden="true" />
            </Button>
            <span className="w-8 text-center font-semibold text-sm" aria-live="polite">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full"
              onClick={() =>
                dispatch({
                  type: "UPDATE_QUANTITY",
                  payload: { id: variantId ? `${product.id}:${variantId}` : product.id, quantity: quantity + 1 },
                })
              }
              aria-label={`Increase quantity of ${product.name}`}
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "REMOVE_ITEM", payload: variantId ? `${product.id}:${variantId}` : product.id })}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
            aria-label={`Remove ${product.name} from cart`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right hidden sm:block">
        <p className="font-bold text-foreground text-sm">
          {formatPrice(displayPrice * quantity)}
        </p>
      </div>
    </motion.div>
  );
}
