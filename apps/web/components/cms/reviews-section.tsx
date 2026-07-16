"use client";

import { useState } from "react";
import { Star, MessageSquare, CheckCircle2, User, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useReviewsStore } from "@/store/use-reviews-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const { reviews, addReview, getAverageRating, getRatingDistribution } = useReviewsStore();
  const productReviews = reviews.filter((r) => r.productId === productId);
  const avgRating = getAverageRating(productId);
  const distribution = getRatingDistribution(productId);
  const totalReviews = productReviews.length;

  const handleSubmit = () => {
    if (!comment.trim()) return;
    addReview({
      id: `r-${Date.now()}`,
      productId,
      userId: "current-user",
      userName: "You",
      rating,
      comment: comment.trim(),
      verified: true,
      createdAt: new Date().toISOString(),
    });
    setComment("");
    setShowForm(false);
    toast.success("Review submitted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6 p-6 rounded-xl glass">
        <div className="text-center">
          <p className="text-4xl font-bold">{avgRating}</p>
          <div className="flex items-center gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn("h-3.5 w-3.5", star <= Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30")}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-muted-foreground">{star} star</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-muted-foreground text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showForm ? (
        <div className="p-4 rounded-xl glass space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-all",
                    (hoverRating || rating) >= star ? "fill-amber-500 text-amber-500 scale-110" : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">Click to rate</span>
          </div>
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="glass"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={!comment.trim()}>
              Submit Review
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowForm(true)}>
          <MessageSquare className="h-3.5 w-3.5" /> Write a Review
        </Button>
      )}

      <div className="space-y-4">
        {productReviews.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No reviews yet. Be the first to review this product.
          </div>
        ) : (
          productReviews.map((review) => (
            <div key={review.id} className="p-4 rounded-xl glass space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.userName}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn("h-3 w-3", star <= review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30")}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.verified && (
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              {review.adminReply && (
                <div className="ml-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">Admin Response</p>
                  <p className="text-sm text-muted-foreground">{review.adminReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
