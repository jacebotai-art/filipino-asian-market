"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "./CartContext";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

export function ChatWidget() {
  const { state, dispatch } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Mabuhay! Welcome to Manila Mart! 🇵🇭 I'm your virtual assistant. How can I help you today?",
      timestamp: new Date(),
      quickReplies: ["Store Hours", "Current Promotions", "Track Order", "Speak to Human"],
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): { text: string; quickReplies?: string[] } => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes("hour") || lowerMsg.includes("open") || lowerMsg.includes("time")) {
      return {
        text: "Our store hours are:\n\nMonday-Friday: 8:00 AM - 9:00 PM\nSaturday: 7:00 AM - 10:00 PM\nSunday: 8:00 AM - 8:00 PM\n\nOnline orders can be placed 24/7!",
        quickReplies: ["Place Order", "Contact Us", "Location"],
      };
    }
    
    if (lowerMsg.includes("promo") || lowerMsg.includes("sale") || lowerMsg.includes("discount")) {
      return {
        text: "🎉 Current Promotions:\n\n• 10% off for Silver members\n• 15% off for Gold/Platinum members\n• Buy 10+ items for bulk pricing\n• New members get 50 bonus points!\n\nCheck our loyalty program for more perks!",
        quickReplies: ["Join Loyalty Program", "View Products", "Store Hours"],
      };
    }
    
    if (lowerMsg.includes("track") || lowerMsg.includes("order") || lowerMsg.includes("status")) {
      if (state.user?.orderHistory.length === 0) {
        return {
          text: "You don't have any orders yet. Place your first order and track it here!",
          quickReplies: ["Browse Products", "How to Order"],
        };
      }
      return {
        text: `You have ${state.user?.orderHistory.length} order(s). Your most recent order is being prepared and will be ready for pickup soon!`,
        quickReplies: ["View All Orders", "Pickup Info", "Cancel Order"],
      };
    }
    
    if (lowerMsg.includes("deliver") || lowerMsg.includes("shipping")) {
      return {
        text: "We currently offer in-store pickup only. This helps us keep prices low and ensure product freshness!\n\nPickup is FREE and available at:\n1234 Mabuhay Street, Filipino Town, CA 90026",
        quickReplies: ["Place Order", "Store Location", "Pickup Times"],
      };
    }
    
    if (lowerMsg.includes("payment") || lowerMsg.includes("pay")) {
      return {
        text: "We accept:\n• Credit/Debit cards\n• Cash on pickup\n• GCash (Filipino e-wallet)\n\nPayment is processed securely when you place your order.",
        quickReplies: ["Place Order", "Cancel Order"],
      };
    }
    
    if (lowerMsg.includes("catering") || lowerMsg.includes("bulk") || lowerMsg.includes("wholesale")) {
      return {
        text: "We offer special pricing for bulk orders and catering!\n\n• Restaurants: Up to 20% off wholesale\n• Events: Custom packages available\n• Bulk: Discounts on 10+ items\n\nContact us for a custom quote!",
        quickReplies: ["Catering Form", "Wholesale Info", "Contact Sales"],
      };
    }
    
    if (lowerMsg.includes("human") || lowerMsg.includes("agent") || lowerMsg.includes("speak")) {
      return {
        text: "I'll connect you with a human agent. Please call us at (213) 555-MART or leave your number and we'll call you back within 30 minutes.",
        quickReplies: ["Call Now", "Leave Number", "Email Us"],
      };
    }
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("mabuhay")) {
      return {
        text: "Mabuhay! Welcome to Manila Mart! 🇵🇭\n\nI can help you with:\n• Product information\n• Order tracking\n• Store hours & location\n• Promotions & loyalty program\n• Catering & wholesale\n\nWhat would you like to know?",
        quickReplies: ["Store Hours", "Current Promotions", "Track Order", "Browse Products"],
      };
    }
    
    return {
      text: "I'm not sure I understand. I can help you with:\n• Store hours and location\n• Current promotions\n• Order tracking\n• Payment methods\n• Catering & wholesale\n\nOr type 'human' to speak with a representative!",
      quickReplies: ["Store Hours", "Promotions", "Speak to Human"],
    };
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const response = getBotResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response.text,
        timestamp: new Date(),
        quickReplies: response.quickReplies,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-primary p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Manila Mart Assistant</h3>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-primary text-white rounded-2xl rounded-tr-sm"
                          : "bg-white border rounded-2xl rounded-tl-sm"
                      } p-3 shadow-sm`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === "bot" ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      
                      {/* Quick Replies */}
                      {message.quickReplies && message.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.quickReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => handleQuickReply(reply)}
                              className="text-xs px-3 py-1.5 bg-white border border-primary/30 text-primary rounded-full hover:bg-primary/10 transition-colors"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl rounded-tl-sm p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon" className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>Press Enter to send</span>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 hover:text-primary">
                      <Phone className="w-3 h-3" />
                      Call
                    </button>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Avg response: 1 min
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
