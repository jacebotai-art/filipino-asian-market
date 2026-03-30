"use client";

import { motion } from "framer-motion";
import { Search, X, ArrowRight, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  products,
  categories,
  getPopularProducts,
  searchProducts,
} from "../components/products";
import { ProductCard } from "../components/ProductCard";
import { useCart } from "../components/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const { itemCount } = useCart();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Update selected category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      // Map URL-friendly names back to category IDs
      const categoryMap: { [key: string]: string } = {
        "fresh-produce": "fresh-produce",
        "produce": "fresh-produce",
        "meat-seafood": "meat-seafood",
        "seafood": "meat-seafood",
        "pantry": "pantry",
        "pantry-staples": "pantry",
        "frozen": "frozen",
        "frozen-foods": "frozen",
        "snacks": "snacks",
        "snacks-candy": "snacks",
      };
      setSelectedCategory(categoryMap[categoryParam] || categoryParam);
    }
  }, [categoryParam]);

  const popularProducts = getPopularProducts();
  const filteredProducts = searchQuery
    ? searchProducts(searchQuery)
    : selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const currentCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null;

  return (
    <div className="pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mb-8 sm:mb-12"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Our Selection
            </Badge>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
          >
            {currentCategory ? currentCategory.name : "All Products"}
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl"
          >
            {currentCategory
              ? currentCategory.description
              : "Browse our full selection of authentic Filipino and Asian groceries."}
          </motion.p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search - Desktop */}
            <div className="relative w-full sm:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <div className="flex gap-2 sm:hidden">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="w-4 h-4 mr-2" />
                {searchQuery ? searchQuery : "Search..."}
              </Button>
              
              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                  <SheetHeader>
                    <SheetTitle>Filter by Category</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-3">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="lg"
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full justify-start h-14 text-base ${
                        selectedCategory === null ? "bg-primary text-white" : ""
                      }`}
                    >
                      All Products
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        size="lg"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full justify-start h-14 text-base ${
                          selectedCategory === cat.id ? "bg-primary text-white" : ""
                        }`}
                      >
                        <span className="text-xl mr-3">{cat.emoji}</span>
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Cart Button - Desktop */}
            <Link href="/checkout" className="hidden sm:block">
              <Button variant="outline" className="h-12">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart ({itemCount})
              </Button>
            </Link>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 sm:hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Category Filters - Desktop */}
          <div className="hidden sm:flex flex-wrap gap-2 mt-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-primary text-white" : ""}
            >
              All Products
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={
                  selectedCategory === cat.id ? "bg-primary text-white" : ""
                }
              >
                {cat.emoji} {cat.name}
              </Button>
            ))}
          </div>

          {/* Active Category Display - Mobile */}
          {selectedCategory && (
            <div className="flex items-center gap-2 mt-4 sm:hidden">
              <Badge variant="secondary" className="text-sm py-2 px-3">
                {categories.find(c => c.id === selectedCategory)?.emoji} {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-8 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-muted-foreground">
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or category filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Back to Home */}
        {!searchQuery && !selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 sm:mt-16"
          >
            <Link href="/">
              <Button variant="outline" className="h-12">
                ← Back to Home
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Mobile Sticky Cart Button */}
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 sm:hidden safe-bottom z-30"
          >
            <Link href="/checkout">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold">
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Cart ({itemCount} items)
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
