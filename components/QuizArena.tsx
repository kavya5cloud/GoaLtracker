import React, { useState } from 'react';
import { generateQuizForTopic } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Check, X, Trophy, AlertCircle, ArrowRight, Brain } from 'lucide-react';

interface QuizArenaProps {
  onFinishQuiz: (score: number) => void;
}

const QuizArena: React.FC<QuizArenaProps> = ({ onFinishQuiz }) => {
  const [topicInput, setTopicInput] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false); 
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = async () => {
    if (!topicInput) return;
    setLoading(true);
    setQuizFinished(false);
    setScore(0);
    setCurrentIndex(0);
    const q = await generateQuizForTopic(topicInput);
    setQuestions(q);
    setLoading(false);
  };

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const submitAnswer = () => {
    setShowResult(true);
    if (selectedOption === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
      onFinishQuiz(score);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-slate-200 border-t-slate-900 rounded-full mb-8"></div>
        <h3 className="text-2xl font-bold text-slate-900">Constructing Paper...</h3>
        <p className="text-slate-400 mt-2 text-sm">Please wait while we generate high-yield questions.</p>
      </div>
    );
  }

  if (questions.length === 0 && !quizFinished) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-10 rounded-3xl border border-slate-100 shadow-soft text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-900 flex items-center justify-center mx-auto mb-8 rounded-2xl shadow-sm">
            <Brain size={32} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-3">Quiz Arena</h2>
        <p className="text-slate-500 mb-8">Enter a topic to generate a high-stakes Prelims mock.</p>
        
        <input
          type="text"
          placeholder="e.g., Fiscal Policy of India"
          className="w-full p-4 border border-slate-200 rounded-xl text-lg text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none mb-4 transition-all"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
        />
        <button
          onClick={startQuiz}
          disabled={!topicInput}
          className="w-full bg-slate-900 text-white py-4 rounded-xl text-lg font-bold hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Generate Questions
        </button>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white p-10 rounded-3xl border border-slate-100 shadow-soft text-center animate-fade-in">
        <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="fill-current" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Session Complete</h2>
        <p className="text-slate-500 mb-8">Here is how you performed</p>
        
        <div className="text-6xl font-black text-slate-900 mb-2">{score}<span className="text-3xl text-slate-300 font-normal">/{questions.length}</span></div>
        
        <div className={`inline-block px-4 py-2 rounded-lg text-sm font-bold mb-10 ${score > questions.length / 2 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {score === questions.length ? "EXCEPTIONAL" : score > questions.length / 2 ? "GOOD PERFORMANCE" : "NEEDS REVISION"}
        </div>

        <button
          onClick={() => { setQuestions([]); setTopicInput(""); }}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          Return to Arena
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="mb-6 flex justify-between items-center">
        <span className="font-bold text-slate-400 text-sm tracking-wider">QUESTION {currentIndex + 1} OF {questions.length}</span>
        <span className="font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">SCORE: {score}</span>
      </div>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-soft">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mb-10 leading-normal">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let itemClass = "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
            if (selectedOption === idx) itemClass = "border-2 border-slate-900 bg-slate-50 text-slate-900";
            if (showResult) {
                if (idx === currentQ.correctIndex) itemClass = "border border-green-200 bg-green-50 text-green-800"; 
                else if (selectedOption === idx) itemClass = "border border-red-200 bg-red-50 text-red-800 line-through opacity-70";
                else itemClass = "border border-slate-100 text-slate-300";
            }

            return (
              <div
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`p-5 rounded-xl cursor-pointer transition-all flex items-center justify-between group font-medium text-base md:text-lg ${itemClass}`}
              >
                <div className="flex items-center">
                    <span className={`mr-4 font-bold text-sm ${showResult && idx === currentQ.correctIndex ? 'text-green-600' : 'text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
                    <span>{opt}</span>
                </div>
                {showResult && idx === currentQ.correctIndex && <Check size={20} className="text-green-600" />}
                {showResult && selectedOption === idx && idx !== currentQ.correctIndex && <X size={20} className="text-red-600" />}
              </div>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-start animate-fade-in">
            <AlertCircle size={20} className="text-slate-900 mr-4 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wide">Explanation</h4>
                <p className="text-slate-600 leading-relaxed text-sm">{currentQ.explanation}</p>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-end">
          {!showResult ? (
            <button
              onClick={submitAnswer}
              disabled={selectedOption === null}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Lock Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center shadow-sm"
            >
              {currentIndex === questions.length - 1 ? "Finish" : "Next Question"} <ArrowRight size={18} className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizArena;