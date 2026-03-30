"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, TrendingUp, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, useCart, formatPrice } from "./CartContext";
import { products } from "./products";

interface FeaturedCarouselProps {
  type?: "popular" | "new" | "sale" | "trending";
  title?: string;
}

export function FeaturedCarousel({ type = "popular", title }: FeaturedCarouselProps) {
  const { dispatch } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Filter products based on type
  const featuredProducts = products.filter((p) => {
    switch (type) {
      case "popular":
        return p.isPopular;
      case "new":
        return p.isNew;
      case "sale":
        return p.isOnSale;
      case "trending":
        return p.rating >= 4.7;
      default:
        return p.isPopular;
    }
  });

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 768) setItemsPerView(2);
      else if (window.innerWidth < 1024) setItemsPerView(3);
      else setItemsPerView(4);
    };
    
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const getIcon = () => {
    switch (type) {
      case "popular":
        return <Star className="w-5 h-5" />;
      case "new":
        return <Sparkles className="w-5 h-5" />;
      case "sale":
        return <TrendingUp className="w-5 h-5" />;
      case "trending":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "popular":
        return "Customer Favorites";
      case "new":
        return "New Arrivals";
      case "sale":
        return "On Sale";
      case "trending":
        return "Trending Now";
      default:
        return "Featured Products";
    }
  };

  if (featuredProducts.length === 0) return null;

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full"
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: -currentIndex * (100 / itemsPerView + 2) + "%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: `${100 / itemsPerView - 2}%` }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border/50">
                {/* Image */}
                <div className="aspect-square bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
                  <span className="text-6xl">{product.emoji}</span>
                  
                  {product.stockLevel === "low" && (
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white animate-pulse">
                      <Clock className="w-3 h-3 mr-1" />
                      Low Stock
                    </Badge>
                  )}
                  
                  {product.isPopular && (
                    <Badge className="absolute top-3 right-3 bg-primary text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.unit}</p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">({product.reviewCount})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? "bg-primary w-6" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
