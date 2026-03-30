"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Loader2, Mail, User, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm, ValidationError } from "@formspree/react";
import { FORMSPREE_CONFIG, formatContactEmail } from "./EmailService";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  // Formspree hook for contact form
  const [formspreeState, handleFormspreeSubmit] = useForm(FORMSPREE_CONFIG.contactFormId);

  // Check if Formspree is configured
  const isFormspreeConfigured = FORMSPREE_CONFIG.contactFormId !== "YOUR_CONTACT_FORM_ID";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isFormspreeConfigured) {
      // Submit to Formspree
      await handleFormspreeSubmit(e);
    } else {
      // Simulate submission for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // Log for debugging
    console.log("Contact form submitted:", formData);
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    });
  };

  // Show success state
  if (formspreeState.succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
              Message Sent Successfully!
            </h3>
            <p className="text-green-700 mb-6 text-sm sm:text-base">
              Thank you for reaching out, {formData.firstName}! We&apos;ll get back to you at {formData.email} soon.
            </p>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-100"
            >
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-8">
          {!isFormspreeConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-yellow-800">
                <strong>📧 Email Setup Required</strong>
                <br />
                To receive contact form submissions via email, please configure Formspree. 
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

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Hidden fields for Formspree */}
            <input 
              type="hidden" 
              name="_subject" 
              value={`New Contact Message from ${formData.firstName} ${formData.lastName}`} 
            />
            <input type="hidden" name="_replyto" value={formData.email} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  First Name
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
                <ValidationError 
                  prefix="First Name" 
                  field="firstName"
                  errors={formspreeState.errors}
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Last Name
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
                <ValidationError 
                  prefix="Last Name" 
                  field="lastName"
                  errors={formspreeState.errors}
                  className="text-red-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
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
              <ValidationError 
                prefix="Email" 
                field="email"
                errors={formspreeState.errors}
                className="text-red-500 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Your Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="How can we help you? Tell us about your question or feedback..."
                rows={5}
                className="resize-none text-base"
              />
              <ValidationError 
                prefix="Message" 
                field="message"
                errors={formspreeState.errors}
                className="text-red-500 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={formspreeState.submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 sm:h-14 text-base sm:text-lg font-semibold"
            >
              {formspreeState.submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>

            {formspreeState.errors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-800">
                  There was an error sending your message. Please try again or email us directly at jacebotai@gmail.com
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
