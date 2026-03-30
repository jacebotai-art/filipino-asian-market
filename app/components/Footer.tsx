"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, ShoppingBasket, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Fresh Produce", href: "/products?category=produce" },
    { label: "Pantry Items", href: "/products?category=pantry" },
    { label: "Frozen Foods", href: "/products?category=frozen" },
    { label: "Seafood", href: "/products?category=seafood" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Location", href: "/location" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "FAQ", href: "/contact#faq" },
    { label: "Shipping Info", href: "/contact#shipping" },
    { label: "Returns", href: "/contact#returns" },
    { label: "Catering", href: "/contact#catering" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingBasket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-primary">Manila</span>
                <span className="text-lg sm:text-xl font-bold text-foreground">Mart</span>
              </div>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm sm:text-base">
              Your neighborhood Filipino Asian Market in Oklahoma City. Fresh produce, authentic ingredients, 
              and a taste of home since 1995.
            </p>
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <a 
                href="https://maps.google.com/?q=1234+Mabuhay+Street+Oklahoma+City+OK+73102"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>1234 Mabuhay Street, Oklahoma City, OK 73102</span>
              </a>
              <a 
                href="tel:+14055556278"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>(405) 555-MART</span>
              </a>
              <a 
                href="mailto:hello@manilamart.com"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@manilamart.com</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:block">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Stay Updated</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Get notified about new products and special offers.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Manila Mart. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
