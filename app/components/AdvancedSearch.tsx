"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Star, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Product } from "./CartContext";
import { products, categories } from "./products";
import { ProductCard } from "./ProductCard";

interface Filters {
  category: string | null;
  priceRange: { min: number; max: number } | null;
  rating: number | null;
  inStock: boolean;
  tags: string[];
}

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: null,
    priceRange: null,
    rating: null,
    inStock: true,
    tags: [],
  });

  // Get all unique tags
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && product.category !== filters.category) return false;

    // Price range filter
    if (filters.priceRange) {
      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      )
        return false;
    }

    // Rating filter
    if (filters.rating && product.rating < filters.rating) return false;

    // Stock filter
    if (filters.inStock && !product.inStock) return false;

    // Tags filter
    if (filters.tags.length > 0) {
      if (!filters.tags.some((tag) => product.tags.includes(tag))) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      category: null,
      priceRange: null,
      rating: null,
      inStock: true,
      tags: [],
    });
    setSearchQuery("");
  };

  const activeFiltersCount = [
    filters.category,
    filters.priceRange,
    filters.rating,
    !filters.inStock,
    filters.tags.length > 0,
  ].filter(Boolean).length;

  const priceRanges = [
    { label: "Under $5", min: 0, max: 5 },
    { label: "$5 - $10", min: 5, max: 10 },
    { label: "$10 - $25", min: 10, max: 25 },
    { label: "$25+", min: 25, max: 999 },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search products, ingredients, recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-24 h-14 text-lg"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-primary text-white">{activeFiltersCount}</Badge>
          )}
        </Button>
      </div>

      {/* Quick Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilters({ ...filters, category: null })}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            !filters.category
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilters({ ...filters, category: cat.id })}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              filters.category === cat.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-muted/50 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label
                        key={range.label}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          checked={
                            filters.priceRange?.min === range.min &&
                            filters.priceRange?.max === range.max
                          }
                          onChange={() =>
                            setFilters({
                              ...filters,
                              priceRange: { min: range.min, max: range.max },
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() =>
                            setFilters({ ...filters, rating })
                          }
                          className="rounded border-gray-300"
                        />
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1">& Up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter((t) => t !== tag)
                            : [...filters.tags, tag];
                          setFilters({ ...filters, tags: newTags });
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          filters.tags.includes(tag)
                            ? "bg-primary text-white"
                            : "bg-white border hover:border-primary"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) =>
                        setFilters({ ...filters, inStock: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    In Stock Only
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
        </p>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <div className="flex gap-1 flex-wrap">
              {filters.category && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilters({ ...filters, category: null })}>
                  {categories.find((c) => c.id === filters.category)?.name} <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters.rating && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilters({ ...filters, rating: null })}>
                  {filters.rating}+ Stars <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setFilters({ ...filters, tags: filters.tags.filter((t) => t !== tag) })}>
                  {tag} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
