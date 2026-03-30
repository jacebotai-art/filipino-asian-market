"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Check, Star, Heart, AlertTriangle, Package, TrendingDown, Info, ChefHat, Leaf, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Product, useCart, formatPrice } from "./CartContext";
import { ProductReviews } from "./ProductReviews";

interface ProductCardProps {
  product: Product;
  showAddButton?: boolean;
}

export function ProductCard({ product, showAddButton = true }: ProductCardProps) {
  const { dispatch, state, isWholesaleEligible } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [showDetails, setShowDetails] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  
  const isInWishlist = state.user?.wishlist?.includes(product.id);
  const displayPrice = isWholesaleEligible && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.price;
  const isBulkEligible = !!(product.bulkThreshold && quantity >= product.bulkThreshold);
  const bulkPrice = product.bulkPrice || product.wholesalePrice;
  
  const handleAddToCart = () => {
    const finalPrice = isBulkEligible && bulkPrice ? bulkPrice : displayPrice;
    dispatch({
      type: "ADD_ITEM_WITH_QUANTITY",
      payload: { 
        product: { ...product, price: finalPrice }, 
        quantity,
        variantId: selectedVariant?.id 
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setQuantity(1);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.isLoggedIn) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" });
      return;
    }
    if (isInWishlist) {
      dispatch({ type: "REMOVE_FROM_WISHLIST", payload: product.id });
    } else {
      dispatch({ type: "ADD_TO_WISHLIST", payload: product.id });
    }
  };

  const getStockBadge = () => {
    switch (product.stockLevel) {
      case "low":
        return (
          <Badge className="bg-orange-500 text-white border-0 animate-pulse text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
            Low
          </Badge>
        );
      case "out":
        return (
          <Badge variant="secondary" className="bg-gray-500 text-white border-0 text-xs">
            Out
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-green-500 text-white border-0 text-xs">
            <Package className="w-3 h-3 mr-1" aria-hidden="true" />
            In Stock
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500 text-white border-0 text-xs">
            In Stock
          </Badge>
        );
    }
  };

  const renderStars = (rating: number, showCount = true) => {
    return (
      <div 
        className="flex items-center gap-0.5 cursor-pointer hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation();
          setShowReviews(true);
        }}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.reviewCount} reviews for ${product.name}`}
        onKeyDown={(e) => e.key === 'Enter' && setShowReviews(true)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            aria-hidden="true"
          />
        ))}
        {showCount && (
          <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <Card 
          className="group h-full hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden bg-white"
          role="article"
          aria-label={`${product.name} - ${formatPrice(displayPrice)}`}
        >
          {/* Product Image Area */}
          <div className="relative">
            <div 
              className="aspect-square bg-gradient-to-br from-secondary to-muted flex items-center justify-center cursor-pointer" 
              onClick={() => setShowDetails(true)}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${product.name}`}
              onKeyDown={(e) => e.key === 'Enter' && setShowDetails(true)}
            >
              <span className="text-5xl sm:text-7xl group-hover:scale-110 transition-transform duration-300" role="img" aria-label={product.name}>
                {product.emoji}
              </span>
            </div>
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1" aria-label="Product badges">
              {product.isPopular && (
                <Badge className="bg-primary text-white border-0 text-xs">
                  <TrendingDown className="w-3 h-3 mr-1" aria-hidden="true" />
                  Hot
                </Badge>
              )}
              {product.isNew && (
                <Badge className="bg-green-500 text-white border-0 text-xs">New</Badge>
              )}
              {getStockBadge()}
              {isWholesaleEligible && product.wholesalePrice && (
                <Badge className="bg-purple-500 text-white border-0 text-xs">
                  Wholesale
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={toggleWishlist}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={isInWishlist}
            >
              <Heart 
                className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} 
                aria-hidden="true"
              />
            </button>

            {/* Bulk Indicator */}
            {product.bulkThreshold && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute bottom-2 left-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <Package className="w-3 h-3" aria-hidden="true" />
                    Bulk: {product.bulkThreshold}+
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Order {product.bulkThreshold}+ for bulk pricing at ${product.bulkPrice?.toFixed(2)}/unit</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Product Info */}
          <CardContent className="p-3 sm:p-5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide truncate max-w-[60%]">
                {product.category.replace("-", " ")}
              </span>
              {renderStars(product.rating)}
            </div>
            
            <h3 
              className="font-bold text-sm sm:text-lg text-foreground mb-1 line-clamp-1 cursor-pointer hover:text-primary transition-colors" 
              onClick={() => setShowDetails(true)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowDetails(true)}
              aria-label={`${product.name}. Click to view details`}
            >
              {product.name}
            </h3>
            
            <p className="text-xs text-muted-foreground mb-1">{product.unit}</p>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
              {product.description}
            </p>

            {/* Tags - hidden on mobile */}
            <div className="hidden sm:flex flex-wrap gap-1 mb-3" aria-label="Product tags">
              {product.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            {/* Price Display */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex flex-col">
                {isWholesaleEligible && product.wholesalePrice ? (
                  <>
                    <span className="text-base sm:text-lg font-bold text-purple-600" aria-label={`Wholesale price ${formatPrice(product.wholesalePrice)}`}>
                      {formatPrice(product.wholesalePrice)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through" aria-label={`Regular price ${formatPrice(product.price)}`}>
                      Reg: {formatPrice(product.price)}
                    </span>
                  </>
                ) : isBulkEligible && bulkPrice ? (
                  <>
                    <span className="text-base sm:text-lg font-bold text-amber-600" aria-label={`Bulk price ${formatPrice(bulkPrice)}`}>
                      {formatPrice(bulkPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through" aria-label={`Regular price ${formatPrice(product.price)}`}>
                      Reg: {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-primary" aria-label={`Price ${formatPrice(product.price)}`}>
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              {/* Variant Selector - desktop only */}
              {product.variants && product.variants.length > 0 && (
                <select
                  value={selectedVariant?.id}
                  onChange={(e) => setSelectedVariant(product.variants?.find(v => v.id === e.target.value))}
                  className="hidden sm:block text-xs border rounded px-2 py-1"
                  aria-label={`Select variant for ${product.name}`}
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name} - {formatPrice(variant.price)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {showAddButton && (
              <div className="space-y-2 sm:space-y-3">
                {/* Quantity Selector */}
                <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="Quantity selector">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-8 sm:h-8 rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.inStock}
                    aria-label={`Decrease quantity. Current quantity: ${quantity}`}
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-sm sm:text-base" aria-live="polite" aria-atomic="true">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-8 sm:h-8 rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock || quantity >= product.stockCount}
                    aria-label={`Increase quantity. Current quantity: ${quantity}`}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || added}
                  className={`w-full transition-all duration-300 h-10 sm:h-11 text-sm sm:text-base ${
                    added
                      ? "bg-green-500 hover:bg-green-500"
                      : isWholesaleEligible && product.wholesalePrice
                      ? "bg-purple-600 hover:bg-purple-700"
                      : isBulkEligible
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-primary hover:bg-primary/90"
                  } text-white`}
                  aria-label={added ? `Added ${product.name} to cart` : `Add ${product.name} to cart`}
                  aria-live="polite"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
                      Added!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details Dialog - Desktop */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="hidden sm:block max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-4xl" role="img" aria-label={product.name}>{product.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(product.rating)}
                    <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <ProductDetailsContent 
              product={product} 
              displayPrice={displayPrice} 
              isWholesaleEligible={isWholesaleEligible}
              isBulkEligible={isBulkEligible}
              bulkPrice={bulkPrice}
            />
          </DialogContent>
        </Dialog>

        {/* Product Details Sheet - Mobile (slides up from bottom) */}
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent side="bottom" className="sm:hidden h-[85vh] rounded-t-2xl p-0">
            <div className="flex flex-col h-full">
              {/* Handle bar */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              
              <SheetHeader className="px-4 pb-4">
                <SheetTitle className="flex items-center gap-3">
                  <span className="text-4xl" role="img" aria-label={product.name}>{product.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(product.rating)}
                      <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto px-4 pb-24">
                <ProductDetailsContent 
                  product={product} 
                  displayPrice={displayPrice} 
                  isWholesaleEligible={isWholesaleEligible}
                  isBulkEligible={isBulkEligible}
                  bulkPrice={bulkPrice}
                />
              </div>
              
              {/* Sticky Add to Cart Button for Mobile */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-4 safe-bottom">
                <Button
                  onClick={() => {
                    handleAddToCart();
                    setShowDetails(false);
                  }}
                  disabled={!product.inStock}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Cart • {formatPrice(displayPrice)}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Product Reviews Dialog */}
        <ProductReviews
          product={product}
          isOpen={showReviews}
          onClose={() => setShowReviews(false)}
        />
      </motion.div>
    </TooltipProvider>
  );
}

// Product Details Content Component
function ProductDetailsContent({ 
  product, 
  displayPrice, 
  isWholesaleEligible,
  isBulkEligible,
  bulkPrice
}: { 
  product: Product; 
  displayPrice: number; 
  isWholesaleEligible: boolean;
  isBulkEligible: boolean;
  bulkPrice: number | undefined;
}) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-muted-foreground">{product.description}</p>
      
      {/* Price */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
        {product.wholesalePrice && (
          <Badge className="bg-purple-100 text-purple-800">
            Wholesale: {formatPrice(product.wholesalePrice)}
          </Badge>
        )}
        {product.bulkPrice && (
          <Badge className="bg-amber-100 text-amber-800">
            Bulk {product.bulkThreshold}+: {formatPrice(product.bulkPrice)}
          </Badge>
        )}
      </div>

      {/* Nutritional Info */}
      {product.nutritionalInfo && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-500" aria-hidden="true" />
            Nutritional Information
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Calories</span>
              <p className="font-semibold">{product.nutritionalInfo.calories}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Protein</span>
              <p className="font-semibold">{product.nutritionalInfo.protein}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Carbs</span>
              <p className="font-semibold">{product.nutritionalInfo.carbs}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fat</span>
              <p className="font-semibold">{product.nutritionalInfo.fat}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sodium</span>
              <p className="font-semibold">{product.nutritionalInfo.sodium}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Serving</span>
              <p className="font-semibold">{product.nutritionalInfo.servingSize}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipes */}
      {product.recipes && product.recipes.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-orange-500" aria-hidden="true" />
            Recipe Suggestions
          </h4>
          <div className="space-y-3">
            {product.recipes.map((recipe) => (
              <div key={recipe.id} className="bg-orange-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={recipe.name}>{recipe.image}</span>
                  <div>
                    <h5 className="font-semibold">{recipe.name}</h5>
                    <p className="text-sm text-muted-foreground">{recipe.description}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      <span>⏱️ {recipe.prepTime}</span>
                      <span>🔥 {recipe.cookTime}</span>
                      <span>🍽️ {recipe.servings} servings</span>
                      <span className="capitalize">📊 {recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Status */}
      <div className="flex items-center gap-2 text-sm">
        <Package className="w-4 h-4" aria-hidden="true" />
        <span>Stock Level:</span>
        <Badge className={
          product.stockLevel === "high" ? "bg-green-100 text-green-800" :
          product.stockLevel === "medium" ? "bg-yellow-100 text-yellow-800" :
          product.stockLevel === "low" ? "bg-orange-100 text-orange-800" :
          "bg-gray-100 text-gray-800"
        }>
          {product.stockCount} units available
        </Badge>
      </div>
    </div>
  );
}

// Compact card for related products
export function CompactProductCard({ product }: { product: Product }) {
  const { dispatch, state, isWholesaleEligible } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const displayPrice = isWholesaleEligible && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.price;

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card 
        className="overflow-hidden border-border/50"
        role="article"
        aria-label={`${product.name} - ${formatPrice(displayPrice)}`}
      >
        <div className="flex items-center p-2 sm:p-3 gap-2 sm:gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary to-muted rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            <span role="img" aria-label={product.name}>{product.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-xs sm:text-sm truncate">
              {product.name}
            </h4>
            <p className="text-xs text-muted-foreground">{product.unit}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">{product.rating}</span>
            </div>
            <p className="text-primary font-bold text-sm">
              {formatPrice(displayPrice)}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock || added}
            className={`flex-shrink-0 h-9 w-9 p-0 ${
              added ? "bg-green-500" : isWholesaleEligible && product.wholesalePrice ? "bg-purple-600" : "bg-primary"
            } text-white hover:opacity-90`}
            aria-label={added ? `Added ${product.name} to cart` : `Add ${product.name} to cart`}
            aria-live="polite"
          >
            {added ? <Check className="w-4 h-4" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
