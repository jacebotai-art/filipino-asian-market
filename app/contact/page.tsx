"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ContactForm } from "../components/ContactForm";
import Link from "next/link";

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

const contactMethods = [
  {
    icon: Phone,
    title: "Phone",
    value: "(405) 555-6278",
    description: "Mon-Sun during store hours",
    action: "tel:+14055556278",
    actionText: "Call Now",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@filipinoasianmarket.com",
    description: "We reply within 24 hours",
    action: "mailto:hello@filipinoasianmarket.com",
    actionText: "Send Email",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "1234 Mabuhay Street",
    description: "Oklahoma City, OK 73102",
    action: "/location",
    actionText: "Get Directions",
    color: "bg-red-100 text-red-600",
    isInternal: true,
  },
];

const faqs = [
  {
    question: "Do you offer delivery?",
    answer:
      "Currently, we offer in-store pickup for online orders. Delivery may be available in the future.",
  },
  {
    question: "Can I place a special order?",
    answer:
      "Yes! Contact us for special orders. We can often source specific items with advance notice.",
  },
  {
    question: "Do you offer wholesale pricing?",
    answer:
      "Yes, we offer wholesale accounts for restaurants and businesses. Contact us for details.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, all major credit cards, and mobile payments like Apple Pay and Google Pay.",
  },
];

export default function ContactPage() {
  return (
    <div className="pt-20 sm:pt-24 pb-16">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-accent/10 to-background overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                Get in Touch
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6"
            >
              Contact <span className="text-primary">Us</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground"
            >
              Have questions? We&apos;d love to hear from you. Send us a message and
              we&apos;ll respond as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16"
          >
            {contactMethods.map((method) => (
              <motion.div key={method.title} variants={fadeInUp}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 ${method.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                    >
                      <method.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                      {method.title}
                    </h3>
                    <p className="text-primary font-medium mb-1 text-sm sm:text-base">
                      {method.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      {method.description}
                    </p>
                    {method.isInternal ? (
                      <Link href={method.action} className="w-full">
                        <Button variant="outline" className="w-full h-11">
                          {method.actionText}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full h-11" asChild>
                        <a href={method.action}>{method.actionText}</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form Section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ContactForm />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Why Choose Us */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">
                  Why Choose Filipino Asian Market?
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "Authentic Filipino and Asian products",
                    "Fresh produce delivered daily",
                    "Family-owned for 25+ years",
                    "Easy online ordering for pickup",
                    "Friendly, knowledgeable staff",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <p className="text-muted-foreground text-sm sm:text-base">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Special Orders */}
              <div className="bg-secondary/50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                  Special Orders
                </h3>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                  Looking for something specific? We accept special orders for
                  hard-to-find items!
                </p>
                <a
                  href="mailto:orders@manilamart.com"
                  className="flex items-center space-x-2 text-primary hover:underline text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>orders@manilamart.com</span>
                </a>
              </div>

              {/* Business Hours Reminder */}
              <div className="bg-muted rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Store Hours
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mon - Fri</span>
                    <span className="font-medium">8:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">7:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">8:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-accent/20 text-foreground hover:bg-accent/30 border-accent">
                FAQ
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground"
            >
              Quick answers to common questions.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-3 sm:space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
              >
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
