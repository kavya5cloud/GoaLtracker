import React, { useState, useEffect } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { StoredFlashcard } from '../types';
import { Layers, ArrowLeft, Loader2, CheckCircle2, RotateCcw, ThumbsUp, Brain, TrendingUp } from 'lucide-react';

interface FlashcardViewerProps {
  topic: string;
  existingCards: StoredFlashcard[];
  onSaveProgress: (cards: StoredFlashcard[]) => void;
  onBack: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ topic, existingCards, onSaveProgress, onBack }) => {
  const [sessionCards, setSessionCards] = useState<StoredFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  // SRS Algorithm Constants
  const DAY_MS = 86400000;

  useEffect(() => {
    const initializeSession = async () => {
      setLoading(true);
      
      let cardsToReview: StoredFlashcard[] = [];
      let allCards = [...existingCards];

      if (allCards.length === 0) {
        // Generate new cards if none exist
        const newRawCards = await generateFlashcards(topic);
        allCards = newRawCards.map((c, i) => ({
            ...c,
            id: `${Date.now()}-${i}`,
            nextReviewDate: Date.now(), // Due immediately
            interval: 0,
            easeFactor: 2.5,
            reps: 0
        }));
        onSaveProgress(allCards);
        cardsToReview = allCards;
      } else {
        // Filter cards due for review
        const now = Date.now();
        cardsToReview = allCards.filter(c => c.nextReviewDate <= now);
      }

      setSessionCards(cardsToReview);
      setLoading(false);
    };

    initializeSession();
  }, [topic]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to calculate next state without mutating
  const calculateNextState = (card: StoredFlashcard, rating: 'hard' | 'good' | 'easy') => {
      let newInterval = 0;
      let newEaseFactor = card.easeFactor;
      let newReps = card.reps;

      if (rating === 'hard') {
          // Forgot: Reset progress
          newInterval = 1; 
          newEaseFactor = Math.max(1.3, card.easeFactor - 0.2); 
          newReps = 0;
      } else if (rating === 'good') {
          // Recalled: Standard progression
          if (card.reps === 0) {
              newInterval = 1;
          } else if (card.reps === 1) {
              newInterval = 3;
          } else {
              newInterval = Math.round(card.interval * card.easeFactor);
          }
          newReps = card.reps + 1;
      } else if (rating === 'easy') {
          // Mastered: Bonus progression
          if (card.reps === 0) {
              newInterval = 4;
          } else {
              newInterval = Math.round(card.interval * card.easeFactor * 1.5);
          }
          newEaseFactor = card.easeFactor + 0.15;
          newReps = card.reps + 1;
      }
      
      return { newInterval, newEaseFactor, newReps };
  };

  const handleRate = (rating: 'hard' | 'good' | 'easy') => {
    const currentCard = sessionCards[currentIndex];
    const now = Date.now();
    
    const { newInterval, newEaseFactor, newReps } = calculateNextState(currentCard, rating);

    // Update Card
    const updatedCard: StoredFlashcard = {
        ...currentCard,
        interval: newInterval,
        easeFactor: newEaseFactor,
        reps: newReps,
        nextReviewDate: now + (newInterval * DAY_MS)
    };

    // Update in permanent storage (replace in existingCards list)
    const allCardsCopy = [...existingCards];
    const cardIndexInStorage = allCardsCopy.findIndex(c => c.id === currentCard.id);
    
    if (cardIndexInStorage !== -1) {
        allCardsCopy[cardIndexInStorage] = updatedCard;
    } else {
        allCardsCopy.push(updatedCard);
    }
    
    onSaveProgress(allCardsCopy);

    // Move to next card
    if (currentIndex < sessionCards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
    } else {
        setSessionComplete(true);
    }
  };

  const reviewAll = () => {
    setSessionCards([...existingCards]);
    setCurrentIndex(0);
    setSessionComplete(false);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 text-slate-900 animate-spin mb-6" />
        <h3 className="text-xl font-serif font-bold text-slate-900">Retrieving Deck...</h3>
        <p className="text-slate-500 mt-2 text-sm">Accessing long-term memory storage for {topic}</p>
      </div>
    );
  }

  // No cards scheduled case
  if (sessionCards.length === 0 && !sessionComplete) {
    return (
        <div className="max-w-xl mx-auto mt-12 bg-white p-10 rounded-3xl border border-slate-100 shadow-soft text-center animate-fade-in">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">All Caught Up!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
                You have no flashcards due for review today. <br/>
                The algorithm has optimized your schedule for maximum retention.
            </p>
            <div className="flex flex-col space-y-3">
                <button
                    onClick={reviewAll}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    Review All Cards Anyway
                </button>
                <button
                    onClick={onBack}
                    className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                    Return to Syllabus
                </button>
            </div>
        </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-10 rounded-3xl border border-slate-100 shadow-soft text-center animate-fade-in">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Brain size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Session Complete</h2>
        <p className="text-slate-500 mb-8">You've reviewed {sessionCards.length} cards. Neural pathways strengthened.</p>
        <div className="flex space-x-4 justify-center">
            <button
            onClick={onBack}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
            Back to Syllabus
            </button>
        </div>
      </div>
    );
  }

  const currentCard = sessionCards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-wider mb-2 flex items-center">
                <ArrowLeft size={14} className="mr-1" /> Back to Syllabus
            </button>
            <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
                {topic}
            </h2>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400">Due Today</span>
            <div className="bg-slate-900 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                {currentIndex + 1} / {sessionCards.length}
            </div>
        </div>
      </div>

      <div className="relative h-96 w-full perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div 
            className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
            {/* Front */}
            <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-slate-200 shadow-soft flex flex-col items-center justify-center p-10 [backface-visibility:hidden]">
                <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                    <Layers size={32} />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-slate-900 text-center leading-tight">
                    {currentCard.term}
                </h3>
                <p className="mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center bg-slate-50 px-3 py-1 rounded-full">
                    Tap to reveal
                </p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 [backface-visibility:hidden] [transform:rotateY(180deg)] text-center border border-slate-700">
                <div className="overflow-y-auto max-h-full scrollbar-hide">
                    <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-serif">
                        {currentCard.definition}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* SRS Controls */}
      <div className="mt-8">
        {!isFlipped ? (
            <button 
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
                Show Answer
            </button>
        ) : (
            <div className="grid grid-cols-3 gap-4 animate-fade-in">
                <button 
                    onClick={() => handleRate('hard')}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all group shadow-sm active:scale-95"
                >
                    <span className="flex items-center text-red-600 font-bold text-sm mb-1">
                        <RotateCcw size={14} className="mr-1.5" /> Forgot
                    </span>
                    <span className="text-red-400 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-md group-hover:bg-white">
                        1 day
                    </span>
                </button>
                
                <button 
                    onClick={() => handleRate('good')}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group shadow-sm active:scale-95"
                >
                    <span className="flex items-center text-blue-600 font-bold text-sm mb-1">
                        <TrendingUp size={14} className="mr-1.5" /> Recalled
                    </span>
                    <span className="text-blue-400 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-md group-hover:bg-white">
                        {calculateNextState(currentCard, 'good').newInterval} days
                    </span>
                </button>
                
                <button 
                    onClick={() => handleRate('easy')}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-emerald-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group shadow-sm active:scale-95"
                >
                    <span className="flex items-center text-emerald-600 font-bold text-sm mb-1">
                        <ThumbsUp size={14} className="mr-1.5" /> Easy
                    </span>
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-white">
                         {calculateNextState(currentCard, 'easy').newInterval} days
                    </span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardViewer;