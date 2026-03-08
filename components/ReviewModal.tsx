import React, { useState } from 'react';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { Order, Review } from '../types';
import { X, Send } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

type ItemReviewState = {
  rating: number;
  comment: string;
};

// FIX: Changed to a named export to resolve module import errors.
export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, order }) => {
  const { addReview } = useMenu();
  const { user } = useAuth();
  // FIX: Changed state key from number to string. Object.entries doesn't infer value types correctly for numeric keys, causing type errors on `reviewData`.
  const [reviews, setReviews] = useState<Record<string, ItemReviewState>>({});

  const handleReviewChange = (itemId: number, rating?: number, comment?: string) => {
    // FIX: Explicitly convert numeric itemId to string for state key.
    const key = String(itemId);
    setReviews(prev => ({
      ...prev,
      [key]: {
        rating: rating ?? prev[key]?.rating ?? 0,
        comment: comment ?? prev[key]?.comment ?? '',
      }
    }));
  };

  const handleSubmit = () => {
    if (!user) return;
    let reviewCount = 0;
    // FIX: Use Object.keys to iterate, which provides better type inference for the review data than Object.entries in this context.
    Object.keys(reviews).forEach((itemId) => {
      const reviewData = reviews[itemId];
      if (reviewData.rating > 0) {
        addReview(Number(itemId), {
          customerName: user.name,
          rating: reviewData.rating,
          comment: reviewData.comment,
        });
        reviewCount++;
      }
    });
    if (reviewCount > 0) {
        alert(`${reviewCount} review(s) submitted successfully!`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out scale-95 animate-scale-in">
        <header className="flex justify-between items-center p-5 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Leave a Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X className="h-7 w-7" />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto p-5 space-y-6">
            <p className="text-sm text-gray-600">How was your order from {new Date(order.date).toLocaleDateString()}? Rate the items below.</p>
            {order.items.map(item => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <div className="my-2">
                                <StarRating 
                                    rating={reviews[item.id]?.rating || 0}
                                    onRatingChange={(rating) => handleReviewChange(item.id, rating)}
                                    size={24}
                                />
                            </div>
                            <textarea
                                value={reviews[item.id]?.comment || ''}
                                onChange={(e) => handleReviewChange(item.id, undefined, e.target.value)}
                                rows={2}
                                className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
                                placeholder="Tell us more about your experience..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            ))}
        </main>
        
        <footer className="p-5 border-t bg-gray-50 rounded-b-2xl">
            <button 
                onClick={handleSubmit}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
            >
                <Send className="h-5 w-5 mr-2" />
                Submit Reviews
            </button>
        </footer>
       <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
      </div>
    </div>
  );
};

// No default export needed as it is now a named export.
