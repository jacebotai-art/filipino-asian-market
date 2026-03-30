"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone, CheckCircle, Truck, Package, Store, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Store Hours Countdown Component
export function StoreHoursCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [nextOpenTime, setNextOpenTime] = useState<string>("");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Store hours: Mon-Fri 8-21, Sat 7-22, Sun 8-20
      let openingHour = 8;
      let closingHour = 21;
      
      if (day === 6) { // Saturday
        openingHour = 7;
        closingHour = 22;
      } else if (day === 0) { // Sunday
        openingHour = 8;
        closingHour = 20;
      }

      const currentTimeInMinutes = hour * 60 + minute;
      const openingTimeInMinutes = openingHour * 60;
      const closingTimeInMinutes = closingHour * 60;

      if (currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes < closingTimeInMinutes) {
        setIsOpen(true);
        const minutesUntilClose = closingTimeInMinutes - currentTimeInMinutes;
        setTimeLeft({
          hours: Math.floor(minutesUntilClose / 60),
          minutes: minutesUntilClose % 60,
          seconds: 60 - now.getSeconds(),
        });
      } else {
        setIsOpen(false);
        let nextOpen = "";
        if (currentTimeInMinutes >= closingTimeInMinutes) {
          // Closed for today, opens tomorrow
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowDay = tomorrow.getDay();
          let tomorrowOpening = tomorrowDay === 6 ? 7 : 8;
          nextOpen = `Tomorrow at ${tomorrowOpening}:00 AM`;
        } else {
          // Before opening
          nextOpen = `Today at ${openingHour}:00 AM`;
        }
        setNextOpenTime(nextOpen);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className={`${isOpen ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOpen ? "bg-green-100" : "bg-orange-100"}`}>
              <Clock className={`w-5 h-5 ${isOpen ? "text-green-600" : "text-orange-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Store Status</h3>
                <Badge className={isOpen ? "bg-green-500" : "bg-orange-500"}>
                  {isOpen ? "OPEN" : "CLOSED"}
                </Badge>
              </div>
              {isOpen && timeLeft ? (
                <p className="text-sm text-muted-foreground">
                  Closes in {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Opens {nextOpenTime}
                </p>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Mon-Fri: 8AM-9PM</p>
            <p>Sat: 7AM-10PM</p>
            <p>Sun: 8AM-8PM</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Delivery Tracking Component
interface TrackingProps {
  orderId?: string;
  status?: "pending" | "preparing" | "ready" | "picked-up" | "delivered";
}

export function DeliveryTracking({ orderId = "MM-12345678", status = "preparing" }: TrackingProps) {
  const steps = [
    { id: "pending", label: "Order Received", icon: CheckCircle },
    { id: "preparing", label: "Preparing", icon: Package },
    { id: "ready", label: "Ready for Pickup", icon: Store },
    { id: "picked-up", label: "Picked Up", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === status);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg">Order #{orderId}</h3>
            <p className="text-sm text-muted-foreground">Track your order status</p>
          </div>
          <Badge className="bg-primary text-white">
            {steps[currentStepIndex]?.label}
          </Badge>
        </div>

        <Progress value={progress} className="h-2 mb-6" />

        <div className="relative">
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.2 : 1,
                      backgroundColor: isCompleted ? "#C41E3A" : "#e5e7eb",
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? "text-white" : "text-gray-400"
                    } ${isCurrent ? "ring-4 ring-primary/30" : ""}`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-xs mt-2 text-center max-w-[80px] ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {status === "ready" && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Ready for Pickup!</h4>
                <p className="text-sm text-green-700">
                  Your order is ready! Please pick it up at 1234 Mabuhay Street. 
                  Show your order confirmation at the counter.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Social Proof Component - Recent Orders
export function SocialProof() {
  const recentOrders = [
    { name: "Maria L.", location: "Los Angeles, CA", product: "Fresh Manila Mangoes", time: "2 min ago", avatar: "👩" },
    { name: "Juan D.", location: "San Diego, CA", product: "Pork Longanisa", time: "5 min ago", avatar: "👨" },
    { name: "Ana R.", location: "Long Beach, CA", product: "Premium Jasmine Rice", time: "8 min ago", avatar: "👩" },
    { name: "Carlos M.", location: "Pasadena, CA", product: "Lumpia Shanghai", time: "12 min ago", avatar: "👨" },
    { name: "Lisa T.", location: "Glendale, CA", product: "Ube Ice Cream", time: "15 min ago", avatar: "👩" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Recent Orders
      </h3>
      <div className="space-y-3">
        {recentOrders.map((order, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-border/50"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
              {order.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{order.name} from {order.location}</p>
              <p className="text-xs text-muted-foreground truncate">
                ordered {order.product}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{order.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Email Signup with Discount
export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/90 text-white border-0">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">Get 10% Off Your First Order!</h3>
        <p className="text-white/80 mb-6">
          Subscribe to our newsletter for exclusive deals, new arrivals, and Filipino recipes!
        </p>
        
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/20 rounded-lg p-4"
          >
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Thank you for subscribing!</p>
            <p className="text-sm text-white/80">Check your email for your 10% discount code.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground bg-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
        
        <p className="text-xs text-white/60 mt-4">
          By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
        </p>
      </CardContent>
    </Card>
  );
}

// Pickup Scheduler Component
export function PickupScheduler() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      });
    }
    return dates;
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Schedule Your Pickup
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {generateDates().map((date) => (
                <button
                  key={date.value}
                  onClick={() => setSelectedDate(date.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm ${
                    selectedDate === date.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-200 hover:border-primary"
                  }`}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Time</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    selectedTime === time
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-200 hover:border-primary"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && selectedTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800">Pickup Scheduled!</h4>
                  <p className="text-sm text-green-700">
                    {new Date(selectedDate).toLocaleDateString("en-US", { 
                      weekday: "long", 
                      month: "long", 
                      day: "numeric" 
                    })} at {selectedTime}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
