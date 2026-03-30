"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, ShoppingBag, User, Phone, Clock, Calendar, ExternalLink, CreditCard, Lock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart, formatPrice } from "./CartContext";
import { useForm, ValidationError } from "@formspree/react";
import { FORMSPREE_CONFIG, formatOrderEmail } from "./EmailService";
import { saveOrder, OrderItem } from "@/app/lib/supabase";
import { StripePaymentWrapper } from "./StripePayment";
import { isStripeConfigured } from "@/app/lib/stripe-client";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
}

type PaymentMethod = "pickup" | "online";

export function Checkout() {
  const { state, dispatch, subtotal, total, itemCount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pickup");
  const [showPayment, setShowPayment] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    pickupDate: "",
    pickupTime: "",
    specialInstructions: "",
  });

  const [formspreeState, handleFormspreeSubmit] = useForm(FORMSPREE_CONFIG.orderFormId);
  const isFormspreeConfigured = FORMSPREE_CONFIG.orderFormId !== "YOUR_ORDER_FORM_ID";

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const newOrderNumber = `MM-${Date.now().toString(36).toUpperCase()}`;
    setOrderNumber(newOrderNumber);
    
    const orderDate = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const orderData = {
      customer: formData,
      items: state.items,
      total: total,
      orderNumber: newOrderNumber,
      orderDate: orderDate,
    };

    const { formData: emailData } = formatOrderEmail(orderData);

    const supabaseItems: OrderItem[] = state.items.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      emoji: item.product.emoji,
      price: item.product.price,
      quantity: item.quantity
    }));

    try {
      await saveOrder({
        order_number: newOrderNumber,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: supabaseItems,
        subtotal: subtotal,
        total: total,
        item_count: itemCount,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        special_instructions: formData.specialInstructions,
        status: 'pending'
      });
    } catch (error) {
      console.error("Failed to save to analytics:", error);
    }

    if (isFormspreeConfigured) {
      try {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `https://formspree.io/f/${FORMSPREE_CONFIG.orderFormId}`;
        
        const fields = {
          ...emailData,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
        };
        
        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    dispatch({ type: "CLEAR_CART" });
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "online" && isStripeConfigured) {
      setShowPayment(true);
    } else {
      handleSubmitOrder();
    }
  };

  const handlePaymentSuccess = () => {
    handleSubmitOrder();
  };

  if (state.items.length === 0 && !isSubmitted) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h3>
        <p className="text-muted-foreground mb-6">
          Add some items to your cart before checking out.
        </p>
        <Button
          onClick={() => window.location.href = "/products"}
          className="bg-primary hover:bg-primary/90 text-white px-8 h-12"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 sm:py-16 max-w-2xl mx-auto px-4"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Order Placed Successfully!
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-6">
          Thank you for your order, {formData.firstName}! We&apos;ve sent a confirmation
          to {formData.email}.
        </p>
        <div className="bg-muted rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <p className="text-sm text-muted-foreground mb-2">Order Number</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">
            {orderNumber}
          </p>
        </div>
        <p className="text-muted-foreground mb-6">
          We&apos;ll prepare your order for pickup on{" "}
          <strong>
            {new Date(formData.pickupDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </strong>{" "}
          at <strong>{formData.pickupTime}</strong>.
        </p>
        
        {paymentMethod === "pickup" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💳 Payment at Pickup</strong>
              <br />
              Please bring payment when you pick up your order. We accept cash, credit/debit cards, and mobile payments.
            </p>
          </div>
        )}
        
        <Button
          onClick={() => window.location.href = "/products"}
          className="bg-primary hover:bg-primary/90 text-white px-8 h-12"
        >
          Continue Shopping
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
      {/* Order Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-32 lg:pb-0"
      >
        {!isFormspreeConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-yellow-800">
              <strong>📧 Email Setup Required</strong>
              <br />
              To enable email notifications, please configure Formspree. 
              <a 
                href="https://formspree.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1 inline-flex items-center"
              >
                Get started here <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showPayment ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button
                variant="ghost"
                onClick={() => setShowPayment(false)}
                className="mb-4"
              >
                ← Back to order details
              </Button>
              <StripePaymentWrapper
                total={total}
                orderNumber={orderNumber || `MM-${Date.now().toString(36).toUpperCase()}`}
                customerEmail={formData.email}
                customerName={`${formData.firstName} ${formData.lastName}`}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
              />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleProceedToPayment}
              className="space-y-4 sm:space-y-6"
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Juan"
                        className="h-12 text-base"
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Dela Cruz"
                        className="h-12 text-base"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="(213) 555-1234"
                          className="h-12 pl-10 text-base"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="juan@example.com"
                        className="h-12 text-base"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      Pickup Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupDate" className="text-sm">
                        Pickup Date <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <select
                          id="pickupDate"
                          name="pickupDate"
                          value={formData.pickupDate}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                        >
                          <option value="">Select a date</option>
                          {availableDates.map((date) => (
                            <option key={date.value} value={date.value}>
                              {date.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupTime" className="text-sm">
                        Pickup Time <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <select
                          id="pickupTime"
                          name="pickupTime"
                          value={formData.pickupTime}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                        >
                          <option value="">Select a time</option>
                          {["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"].map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      <strong>Pickup Location:</strong> Manila Mart, 1234 Mabuhay Street, Filipino Town, CA 90026
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                    Special Instructions (Optional)
                  </h3>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any special requests or notes about your order..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-base"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      Payment Method
                    </h3>
                  </div>

                  <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="pickup" className="flex items-center gap-2 text-sm">
                        <ShoppingBag className="w-4 h-4" />
                        Pay at Pickup
                      </TabsTrigger>
                      <TabsTrigger value="online" className="flex items-center gap-2 text-sm" disabled={!isStripeConfigured}>
                        <Lock className="w-4 h-4" />
                        Pay Online
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pickup" className="mt-3 sm:mt-4">
                      <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs sm:text-sm text-green-800">
                          <strong>✓ Pay at Pickup</strong>
                          <br />
                          Pay with cash, credit/debit card, or mobile payment when you pick up your order.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="online" className="mt-3 sm:mt-4">
                      {isStripeConfigured ? (
                        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs sm:text-sm text-blue-800">
                            <strong>🔒 Secure Online Payment</strong>
                            <br />
                            Pay securely with your credit/debit card.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-xs sm:text-sm text-yellow-800">
                            <strong>⚠️ Stripe Not Configured</strong>
                            <br />
                            To enable online payments, add your Stripe keys.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Desktop Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || formspreeState.submitting}
                className="hidden sm:flex w-full bg-primary hover:bg-primary/90 text-white h-14 text-lg font-semibold"
              >
                {isSubmitting || formspreeState.submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : paymentMethod === "online" && isStripeConfigured ? (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Continue to Payment • {formatPrice(total)}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Place Order • {formatPrice(total)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our pickup policy. Orders must be picked up within 24 hours.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Order Summary - Desktop */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden lg:block"
      >
        <Card className="sticky top-24">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Order Summary ({itemCount} items)
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">
              {state.items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variantId || 'default'}`}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-xl">
                    {item.product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Pickup Fee</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>✓ In-Store Pickup</strong>
                <br />
                Pick up your order at our store. We&apos;ll send you a confirmation email when it&apos;s ready!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mobile Sticky Summary Bar */}
      {!showPayment && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border lg:hidden safe-bottom z-40">
          <div className="p-4">
            <button
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Order Summary ({itemCount} items)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">{formatPrice(total)}</span>
                {showMobileSummary ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
            </button>
            
            <AnimatePresence>
              {showMobileSummary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                    {state.items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.variantId || 'default'}`}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg">
                          {item.product.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-xs truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground text-sm">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pickup Fee</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Mobile Submit Button */}
            <Button
              type="button"
              onClick={handleProceedToPayment}
              disabled={isSubmitting || formspreeState.submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold"
            >
              {isSubmitting || formspreeState.submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : paymentMethod === "online" && isStripeConfigured ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Continue to Payment • {formatPrice(total)}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Place Order • {formatPrice(total)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
