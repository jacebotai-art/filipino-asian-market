"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, ValidationError } from "@formspree/react";
import { FORMSPREE_CONFIG } from "./EmailService";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  // Formspree hook for newsletter
  const [formspreeState, handleFormspreeSubmit] = useForm(FORMSPREE_CONFIG.newsletterFormId);

  // Check if Formspree is configured
  const isFormspreeConfigured = FORMSPREE_CONFIG.newsletterFormId !== "YOUR_NEWSLETTER_FORM_ID";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFormspreeConfigured) {
      await handleFormspreeSubmit(e);
    } else {
      // Simulate submission for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Newsletter subscription:", email);
  };

  const handleReset = () => {
    setEmail("");
  };

  // Show success state
  if (formspreeState.succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-xl mx-auto"
      >
        <div className="flex items-center gap-3 bg-green-500/20 border border-green-400/30 rounded-lg px-6 py-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">You&apos;re Subscribed!</p>
            <p className="text-white/80 text-sm">Check your inbox for a welcome email</p>
          </div>
        </div>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          Subscribe Another Email
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
      {!isFormspreeConfigured && (
        <input type="hidden" name="_subject" value="New Newsletter Subscription - Manila Mart" />
      )}
      
      <div className="flex-1 relative">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12 flex-1"
        />
        <ValidationError 
          prefix="Email" 
          field="email"
          errors={formspreeState.errors}
          className="absolute -bottom-6 left-0 text-red-300 text-sm"
        />
      </div>
      
      <Button
        type="submit"
        disabled={formspreeState.submitting}
        className="bg-white text-primary hover:bg-white/90 h-12 px-8 font-semibold"
      >
        {formspreeState.submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            <Send className="mr-2 w-4 h-4" />
            Subscribe
          </>
        )}
      </Button>

      {formspreeState.errors && (
        <div className="w-full bg-red-500/20 border border-red-400/30 rounded-lg p-3">
          <p className="text-sm text-white">
            There was an error. Please try again or email us directly.
          </p>
        </div>
      )}
    </form>
  );
}
