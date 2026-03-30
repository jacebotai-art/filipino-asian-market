"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Star, Check, ShoppingBasket, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const featuredCategories = [
  { name: "Fresh Produce", emoji: "🥬", description: "Daily fresh vegetables and fruits", color: "bg-green-100" },
  { name: "Pantry Staples", emoji: "🍚", description: "Rice, sauces, and essentials", color: "bg-amber-100" },
  { name: "Frozen Foods", emoji: "🥟", description: "Ready-to-cook favorites", color: "bg-blue-100" },
  { name: "Seafood", emoji: "🐟", description: "Fresh fish and seafood", color: "bg-cyan-100" },
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-background z-0" />
        <div className="absolute top-20 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-4 bg-accent/20 text-foreground hover:bg-accent/30 border-accent text-xs sm:text-sm">
                  <Star className="w-3 h-3 mr-1 fill-accent text-accent" />
                  Family Owned Since 1995
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6"
              >
                Taste of Home at{" "}
                <span className="text-primary">Filipino Asian Market</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Your neighborhood Filipino Asian Market. Fresh produce, authentic
                ingredients, and all the flavors that remind you of home. Now with
                online ordering for pickup!
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <Link href="/products" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 w-full sm:w-auto h-12 sm:h-14 text-base">
                    Shop Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/location" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto h-12 sm:h-14 text-base"
                  >
                    <MapPin className="mr-2 w-4 h-4" />
                    Find Us
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>Fresh Daily</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>Easy Pickup</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>Authentic Products</span>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 sm:mt-12 flex items-center justify-center lg:justify-start space-x-6 sm:space-x-8"
              >
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">25+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Years Serving</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">5K+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Products</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">10K+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Happy Customers</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl transform rotate-3" />
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-8xl mb-4">🏪</div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        Welcome to Filipino Asian Market
                      </h3>
                      <p className="text-muted-foreground">
                        Order online, pick up in store!
                      </p>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      🥭
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Fresh Mangoes</p>
                      <p className="text-sm text-muted-foreground">Just arrived!</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                      🛒
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Easy Pickup</p>
                      <p className="text-sm text-muted-foreground">Order online</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
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
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                Shop by Category
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Browse Our Selection
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              From fresh produce to pantry staples, we have everything you need.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {featuredCategories.map((category) => (
              <motion.div key={category.name} variants={fadeInUp}>
                <Link href={`/products?category=${category.name.toLowerCase().replace(" ", "-")}`}>
                  <div className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow border border-border/50 hover:border-primary/30 h-full">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${category.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                      {category.emoji}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">
                      {category.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 h-12"
              >
                View All Products <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick About Preview */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-4 bg-accent/20 text-foreground hover:bg-accent/30 border-accent">
                  Our Story
                </Badge>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6"
              >
                A Family Legacy of{" "}
                <span className="text-primary">Bringing Flavors Home</span>
              </motion.h2>
              <motion.div variants={fadeInUp} className="space-y-3 sm:space-y-4 text-muted-foreground text-sm sm:text-base">
                <p>
                  Filipino Asian Market began in 1995 when the Santos family opened
                  a small grocery store with a simple mission: to bring a taste of
                  home to Filipino families in the community.
                </p>
                <p>
                  For over 25 years, we have been more than just a grocery store –
                  we are a gathering place where families reconnect with their
                  heritage.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="mt-6 sm:mt-8">
                <Link href="/about">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 h-12">
                    Read Our Full Story <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-3 sm:gap-4"
            >
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 aspect-square flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">👨‍👩‍👧‍👦</span>
                <p className="font-semibold text-foreground text-sm sm:text-base">Family First</p>
              </div>
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 aspect-square flex flex-col items-center justify-center text-center mt-4 sm:mt-8">
                <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">🇵🇭</span>
                <p className="font-semibold text-foreground text-sm sm:text-base">Authentic Heritage</p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 aspect-square flex flex-col items-center justify-center text-center -mt-4 sm:-mt-8">
                <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">🌾</span>
                <p className="font-semibold text-foreground text-sm sm:text-base">Farm Fresh</p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 aspect-square flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">🛒</span>
                <p className="font-semibold text-foreground text-sm sm:text-base">Easy Pickup</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Preview */}
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
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                Visit Us
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Come See Us
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Stop by to pick up your order or shop in person.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden"
          >
            <div className="grid lg:grid-cols-2">
              <div className="p-6 sm:p-8 lg:p-12">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                        Address
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        1234 Mabuhay Street
                        <br />
                        Filipino Town, CA 90026
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl sm:text-2xl">🕐</span>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                        Hours
                      </h3>
                      <div className="text-sm sm:text-base text-muted-foreground space-y-1">
                        <p>Mon-Fri: 8:00 AM - 9:00 PM</p>
                        <p>Sat: 7:00 AM - 10:00 PM</p>
                        <p>Sun: 8:00 AM - 8:00 PM</p>
                      </div>
                    </div>
                  </div>

                  {/* Click-to-Call Phone */}
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                        Phone
                      </h3>
                      <a 
                        href="tel:+12135556278" 
                        className="text-sm sm:text-base text-primary font-medium hover:underline"
                      >
                        (213) 555-MART
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3">
                    <Link href="/location" className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12">
                        Get Directions <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                    <a href="tel:+12135556278" className="flex-1 sm:flex-initial">
                      <Button variant="outline" className="w-full sm:w-auto h-12">
                        <Phone className="mr-2 w-4 h-4" />
                        Call Now
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-secondary to-muted min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                    Filipino Asian Market
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">1234 Mabuhay Street</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
