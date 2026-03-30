"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Calendar, Users, Phone, Mail, Send, Check, Loader2, Package, ChefHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CateringFormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: string;
  budget: string;
  dietaryRestrictions: string;
  specialRequests: string;
}

export function CateringRequestForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<CateringFormData>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    budget: "",
    dietaryRestrictions: "",
    specialRequests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const eventTypes = [
    "Birthday Party",
    "Wedding Reception",
    "Corporate Event",
    "Family Gathering",
    "Baptism/Christening",
    "Graduation Party",
    "Holiday Celebration",
    "Other",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
          <ChefHat className="w-4 h-4 mr-2" />
          Request Catering Quote
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>
            Catering Request
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground mb-4">
              Thank you {formData.name}! Our catering team will contact you within 24 hours.
            </p>
            <Button onClick={() => { setIsOpen(false); setIsSubmitted(false); }}>
              Close
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cater-name">Full Name *</Label>
                <Input
                  id="cater-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cater-phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cater-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cater-email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cater-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type *</Label>
                <select
                  id="event-type"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Event Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="event-date"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest-count">Number of Guests *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="guest-count"
                    type="number"
                    min="10"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                    className="pl-10"
                    placeholder="Minimum 10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <select
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select budget</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2000">$1,000 - $2,000</option>
                  <option value="2000-5000">$2,000 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary Restrictions</Label>
              <Input
                id="dietary"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                placeholder="e.g., Vegetarian, No pork, Allergies, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requests">Special Requests</Label>
              <Textarea
                id="requests"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Tell us more about your event and any special requests..."
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Request Quote
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Our catering specialist will contact you within 24 hours
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Wholesale Portal Component
export function WholesalePortal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");

  const wholesaleBenefits = [
    { icon: Package, title: "Bulk Discounts", desc: "Up to 20% off on bulk orders" },
    { icon: Truck, title: "Free Delivery", desc: "On orders over $500" },
    { icon: ChefHat, title: "Restaurant Pricing", desc: "Special rates for restaurants" },
  ];

  const wholesaleProducts = products.filter(p => p.wholesalePrice);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50">
          <Package className="w-4 h-4 mr-2" />
          Wholesale Portal
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            Restaurant & Wholesale Portal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-4">
            {wholesaleBenefits.map((benefit) => (
              <Card key={benefit.title} className="bg-purple-50 border-purple-100">
                <CardContent className="p-4 text-center">
                  <benefit.icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900">{benefit.title}</h4>
                  <p className="text-sm text-purple-700">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Table */}
          <div>
            <h3 className="font-semibold mb-4">Wholesale Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-right">Retail</th>
                    <th className="p-3 text-right">Wholesale</th>
                    <th className="p-3 text-center">Min. Order</th>
                    <th className="p-3 text-right">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {wholesaleProducts.slice(0, 6).map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-3 flex items-center gap-2">
                        <span className="text-xl">{product.emoji}</span>
                        <span className="truncate max-w-[150px]">{product.name}</span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-semibold text-purple-600">
                        ${product.wholesalePrice?.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary">{product.bulkThreshold || 5}+</Badge>
                      </td>
                      <td className="p-3 text-right text-green-600">
                        {product.wholesalePrice && ((1 - product.wholesalePrice / product.price) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Apply for Wholesale Account</h3>
            <p className="mb-4">Get instant access to wholesale pricing and exclusive benefits</p>
            <div className="flex gap-3 justify-center">
              <Button className="bg-white text-purple-600 hover:bg-white/90">
                Apply Now
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/20">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Subscription Box Component
export function SubscriptionBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("standard");

  const plans = [
    {
      id: "starter",
      name: "Taste of Home",
      price: 29.99,
      items: ["5-7 curated Filipino snacks", "1 surprise item", "Recipe card"],
      popular: false,
    },
    {
      id: "standard",
      name: "Pinoy Pantry",
      price: 49.99,
      items: ["8-10 pantry staples", "2 specialty items", "Recipe cards", "Exclusive discounts"],
      popular: true,
    },
    {
      id: "premium",
      name: "Barkada Box",
      price: 79.99,
      items: ["12-15 premium items", "Fresh produce included", "Recipe booklet", "Free shipping", "Priority support"],
      popular: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
          <Package className="w-4 h-4 mr-2" />
          Subscription Box
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-pink-600" />
            </div>
            Monthly Filipino Goods Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground text-center">
            Get a curated box of authentic Filipino products delivered to your door every month!
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id 
                    ? "border-pink-500 ring-2 ring-pink-500" 
                    : "hover:border-pink-300"
                } ${plan.popular ? "relative" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-pink-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-center mb-2">{plan.name}</h3>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-pink-600">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-pink-50 rounded-xl p-6">
            <h4 className="font-semibold mb-4">What&apos;s in this month&apos;s box?</h4>
            <div className="grid grid-cols-4 gap-4">
              {["🥭 Dried Mangoes", "🍫 Choc Nut", "🍜 Pancit Canton", "🍶 Soy Sauce", "🥥 Coconut Milk", "🌭 Longanisa", "🫔 Lumpia Wrapper", "🍪 Polvoron"].map((item) => (
                <div key={item} className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl mb-1">{item.split(" ")[0]}</div>
                  <div className="text-xs">{item.split(" ").slice(1).join(" ")}</div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full bg-pink-500 hover:bg-pink-600">
            Subscribe Now - ${plans.find(p => p.id === selectedPlan)?.price}/month
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Skip or cancel anytime. Free shipping on all subscription boxes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { products } from "./products";
