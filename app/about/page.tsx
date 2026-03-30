"use client";

import { motion } from "framer-motion";
import { Heart, Star, ShoppingBasket, Award, Users, Leaf } from "lucide-react";
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

const values = [
  {
    icon: Heart,
    title: "Family First",
    description:
      "We treat every customer like family. Your satisfaction is our top priority.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description:
      "We carefully select every product to ensure authenticity and freshness.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Leaf,
    title: "Fresh Daily",
    description:
      "Our produce arrives fresh every morning, straight from trusted suppliers.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Users,
    title: "Community Focused",
    description:
      "We're more than a store - we're a gathering place for the community.",
    color: "bg-blue-100 text-blue-600",
  },
];

const milestones = [
  { year: "1995", event: "Santos family opens first store" },
  { year: "2005", event: "Expanded to current location" },
  { year: "2015", event: "Celebrated 20 years in business" },
  { year: "2024", event: "Launched online ordering" },
];

export default function AboutPage() {
  return (
    <div className="pt-20 sm:pt-24 pb-16">
      {/* Hero Section */}
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
              <Badge className="mb-4 bg-accent/20 text-foreground hover:bg-accent/30 border-accent">
                Our Story
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6"
            >
              A Family Legacy of{" "}
              <span className="text-primary">Bringing Flavors Home</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground"
            >
              For over 25 years, we&apos;ve been more than just a grocery store – we&apos;re
              a gathering place where families reconnect with their heritage.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6"
              >
                How It All Started
              </motion.h2>
              <motion.div
                variants={fadeInUp}
                className="space-y-3 sm:space-y-4 text-muted-foreground text-sm sm:text-base"
              >
                <p>
                  Filipino Asian Market began in 1995 when the Santos family opened
                  a small grocery store with a simple mission: to bring a taste of
                  home to Filipino families in the community.
                </p>
                <p>
                  What started as a modest shop with just a few shelves of imported
                  goods quickly grew into a beloved community institution. Parents
                  would bring their children to find the same snacks they enjoyed
                  back home. Grandparents would share recipes with newcomers.
                </p>
                <p>
                  Today, we continue that tradition while embracing modern
                  convenience. Our online ordering system makes it easier than ever
                  to get your favorite Filipino and Asian groceries.
                </p>
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
                <p className="font-semibold text-foreground text-sm sm:text-base">Family Owned</p>
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

      {/* Timeline */}
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
                Our Journey
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Milestones
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"
          >
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {milestone.year.slice(-2)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">
                  {milestone.year}
                </h3>
                <p className="text-sm text-muted-foreground">{milestone.event}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-white">
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
                What We Stand For
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Our Values
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              These principles guide everything we do.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 ${value.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                >
                  <value.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90" />
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center"
          >
            <motion.div variants={fadeInUp}>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">25+</p>
              <p className="text-sm sm:text-base text-white/80">Years in Business</p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">5K+</p>
              <p className="text-sm sm:text-base text-white/80">Products</p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">10K+</p>
              <p className="text-sm sm:text-base text-white/80">Happy Customers</p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">3</p>
              <p className="text-sm sm:text-base text-white/80">Generations</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
