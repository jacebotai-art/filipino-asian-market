"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const hours = [
  { day: "Monday", hours: "8:00 AM - 9:00 PM" },
  { day: "Tuesday", hours: "8:00 AM - 9:00 PM" },
  { day: "Wednesday", hours: "8:00 AM - 9:00 PM" },
  { day: "Thursday", hours: "8:00 AM - 9:00 PM" },
  { day: "Friday", hours: "8:00 AM - 9:00 PM" },
  { day: "Saturday", hours: "7:00 AM - 10:00 PM" },
  { day: "Sunday", hours: "8:00 AM - 8:00 PM" },
];

export default function LocationPage() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=1234+Mabuhay+Street+Oklahoma+City+OK+73102";
  const phoneNumber = "+14055556278";
  const formattedPhone = "(405) 555-MART";

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-0">
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
                Visit Us
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6"
            >
              Location & <span className="text-primary">Hours</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground"
            >
              Stop by to pick up your order or shop in person. We can&apos;t wait to
              see you!
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
            {/* Info Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-4 sm:space-y-6"
            >
              {/* Address */}
              <motion.div variants={fadeInUp}>
                <Card className="border-border/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                          Address
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          1234 Mabuhay Street
                          <br />
                          Oklahoma City, OK 73102
                          <br />
                          United States
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Hours */}
              <motion.div variants={fadeInUp}>
                <Card className="border-border/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
                          Store Hours
                        </h3>
                        <div className="space-y-2">
                          {hours.map((item) => (
                            <div
                              key={item.day}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {item.day}
                              </span>
                              <span className="font-medium text-foreground">
                                {item.hours}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact with Click-to-Call */}
              <motion.div variants={fadeInUp}>
                <Card className="border-border/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                          Contact
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {/* Click-to-Call Phone Number */}
                          <a
                            href={`tel:${phoneNumber}`}
                            className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
                          >
                            <Phone className="w-5 h-5" />
                            {formattedPhone}
                          </a>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            (405) 555-6278
                          </p>
                          <a
                            href="mailto:hello@filipinoasianmarket.com"
                            className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            hello@filipinoasianmarket.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons - Desktop */}
              <motion.div variants={fadeInUp} className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-base"
                  asChild
                >
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="mr-2 w-5 h-5" />
                    Get Directions
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 text-base" 
                  asChild
                >
                  <a href={`tel:${phoneNumber}`}>
                    <Phone className="mr-2 w-5 h-5" />
                    Call Store
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-br from-secondary to-muted rounded-2xl sm:rounded-3xl h-full min-h-[300px] sm:min-h-[500px] flex items-center justify-center border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="text-center p-6 sm:p-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Filipino Asian Market
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    1234 Mabuhay Street
                    <br />
                    Filipino Town, CA 90026
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Open in Google Maps
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-accent/20 text-foreground hover:bg-accent/30 border-accent">
                What to Expect
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              When You Visit
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              {
                emoji: "🅿️",
                title: "Free Parking",
                description: "Plenty of parking available in front of the store.",
              },
              {
                emoji: "♿",
                title: "Accessible",
                description: "Wheelchair accessible entrance and aisles.",
              },
              {
                emoji: "🛒",
                title: "Online Pickup",
                description: "Order online and pick up at our dedicated counter.",
              },
              {
                emoji: "💳",
                title: "Payment Options",
                description: "We accept cash, credit cards, and mobile payments.",
              },
              {
                emoji: "🎁",
                title: "Gift Cards",
                description: "Gift cards available for your loved ones.",
              },
              {
                emoji: "🗣️",
                title: "Bilingual Staff",
                description: "Our staff speaks English and Tagalog.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white shadow-sm"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-4">{feature.emoji}</div>
                <h3 className="text-sm sm:text-lg font-bold text-foreground mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 sm:hidden safe-bottom z-40">
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold"
            asChild
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="mr-2 w-5 h-5" />
              Get Directions
            </a>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 text-base font-semibold"
            asChild
          >
            <a href={`tel:${phoneNumber}`}>
              <Phone className="mr-2 w-5 h-5" />
              Call
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
