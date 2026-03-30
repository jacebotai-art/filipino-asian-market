"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Send, User, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product, Review, useCart } from "./CartContext";

interface ProductReviewsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductReviews({ product, isOpen, onClose }: ProductReviewsProps) {
  const { state, dispatch } = useCart();
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSubmitReview = () => {
    if (!state.isLoggedIn) {
      dispatch({ type: "TOGGLE_LOGIN_MODAL" });
      return;
    }

    if (!newReview.comment.trim()) return;

    const review: Review = {
      id: `review-${Date.now()}`,
      userId: state.user?.id || "",
      userName: `${state.user?.firstName} ${state.user?.lastName}`,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString(),
    };

    // Add review to product
    product.reviews.unshift(review);
    product.reviewCount += 1;
    
    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = totalRating / product.reviews.length;

    // Award loyalty points for review
    dispatch({ type: "ADD_LOYALTY_POINTS", payload: 10 });
    
    setNewReview({ rating: 5, comment: "" });
    setShowReviewForm(false);
  };

  const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{product.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(product.rating)}
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Summary */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{product.rating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">out of 5</p>
              </div>
              <div className="flex-1 mx-6">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = product.reviews.filter((r) => r.rating === stars).length;
                  const percentage = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Write Review Button */}
          {!showReviewForm && (
            <Button
              onClick={() => {
                if (!state.isLoggedIn) {
                  dispatch({ type: "TOGGLE_LOGIN_MODAL" });
                  return;
                }
                setShowReviewForm(true);
              }}
              className="w-full"
              variant="outline"
            >
              <Star className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          )}

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Write Your Review</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                  {renderStars(newReview.rating, true, (r) => setNewReview({ ...newReview, rating: r }))}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Review</p>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={!newReview.comment.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Earn 10 loyalty points for each review!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Reviews</h3>
            {product.reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              product.reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground pl-10">
                    {review.comment}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
