
import React, { useState, useEffect } from 'react';
import { generateTopicContent } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Play, Pause, RotateCcw, ArrowRight, Save, BookOpen, Clock, ChevronUp, ChevronDown, PenTool, CheckCircle, Coffee } from 'lucide-react';
import { UPSC_SYLLABUS } from '../constants';

const SESSION_DURATION = 3600; // 1 hour in seconds

interface StudySessionProps {
  initialTopic?: string;
  onComplete: (topic: string, stay?: boolean) => void;
  onExit: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ initialTopic, onComplete, onExit }) => {
  const [topic, setTopic] = useState(initialTopic || "Indian Constitution: Historical Underpinnings");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(SESSION_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Helper to find a topic title in the syllabus tree
  const allTopics = React.useMemo(() => {
    const topics: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach(n => {
        if(n.isTopic) topics.push(n.title);
        if(n.children) traverse(n.children);
      })
    }
    traverse(UPSC_SYLLABUS);
    return topics;
  }, []);

  // Load notes for the specific topic
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${topic}`);
    if (savedNotes) {
        setNotes(savedNotes);
    } else {
        setNotes("");
    }
  }, [topic]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((time) => time - 1);
      }, 1000);
    } else if (timer === 0 && isActive) {
      setIsActive(false);
      onComplete(topic, true); // Auto-log and stay
      setShowCompletionModal(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timer, topic, onComplete]);

  const fetchContent = async () => {
    if (!topic) return;
    setLoading(true);
    const data = await generateTopicContent(topic);
    setContent(data);
    setLoading(false);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newNotes = e.target.value;
      setNotes(newNotes);
      localStorage.setItem(`notes_${topic}`, newNotes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    if (!content) fetchContent();
    setIsActive(true);
  };

  const handleStartAnother = () => {
    setTimer(SESSION_DURATION);
    setShowCompletionModal(false);
    setIsActive(false); // User needs to click start again or we can auto start. Let's wait for user.
  };

  // Calculate progress percentage
  const progressPercentage = ((SESSION_DURATION - timer) / SESSION_DURATION) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] relative">
      
      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-3xl animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/20">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Session Complete!</h3>
            <p className="text-slate-500 mb-6">You've successfully logged <span className="font-bold text-slate-900">60 minutes</span> of focused study. The topic has been marked as covered.</p>
            
            <div className="bg-amber-50 p-4 rounded-xl mb-8 flex items-start text-left border border-amber-100">
               <Coffee className="text-amber-600 flex-shrink-0 mt-1 mr-3" size={20} />
               <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Recommendation</p>
                  <p className="text-sm text-slate-700">Take a 5-10 minute break to consolidate memory before starting the next block.</p>
               </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleStartAnother}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
              >
                Start Another Session
              </button>
              <button 
                onClick={onExit}
                className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel: Controls */}
      <div className="lg:col-span-4 space-y-6 flex flex-col">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Matter</label>
          <div className="relative">
            <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3.5 border border-slate-200 bg-slate-50 text-slate-900 font-medium mb-6 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none appearance-none"
            >
                {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="absolute right-3 top-4 pointer-events-none text-slate-400">
                <ArrowRight size={16} className="rotate-90" />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-10 bg-slate-900 text-white rounded-2xl mb-6 relative overflow-hidden shadow-lg shadow-slate-200 group">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px]"></div>
            
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800">
               <div 
                 className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-linear"
                 style={{ width: `${progressPercentage}%` }}
               />
            </div>

            <Clock size={24} className={`mb-2 text-slate-400 transition-transform duration-700 ${isActive ? 'animate-pulse' : ''}`} />
            <span className="text-5xl font-mono font-bold tracking-tight relative z-10 tabular-nums">
              {formatTime(timer)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-slate-400 relative z-10">Focus Timer</span>
            
          </div>

          <div className="flex space-x-3 mb-6">
            {!isActive ? (
              <button 
                onClick={handleStartSession}
                className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-200 active:scale-95"
              >
                <Play size={18} className="mr-2 fill-current" /> {timer < SESSION_DURATION && timer > 0 ? "Resume" : "Begin"}
              </button>
            ) : (
              <button 
                onClick={() => setIsActive(false)}
                className="flex-1 bg-white text-slate-900 border border-slate-200 py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95"
              >
                <Pause size={18} className="mr-2 fill-current" /> Pause
              </button>
            )}
            <button 
                onClick={() => {
                  setTimer(SESSION_DURATION);
                  setIsActive(false);
                }}
                className="px-4 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                title="Reset Timer"
            >
                <RotateCcw size={18} />
            </button>
          </div>

          <button 
              onClick={() => onComplete(topic, false)}
              className="w-full bg-white border-2 border-slate-900 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center group"
          >
              <CheckCircle size={18} className="mr-2 group-hover:scale-110 transition-transform" /> 
              Mark Topic as Completed
          </button>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 border-dashed flex-1">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center"><BookOpen className="mr-2" size={16}/> Mentor's Note</h4>
            <p className="text-sm font-serif italic text-slate-600 leading-relaxed border-l-2 border-slate-300 pl-4">
                "Keep a notebook handy. The AI provides the skeleton; your understanding provides the flesh. Write down keywords, not sentences."
            </p>
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col h-full overflow-hidden relative">
        <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur sticky top-0 z-10">
            <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Study Material
            </h3>
            <button onClick={fetchContent} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">REGENERATE</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 prose prose-slate prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:leading-relaxed max-w-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="animate-spin h-10 w-10 border-2 border-slate-200 border-t-slate-900 rounded-full"></div>
                <p className="text-slate-400 text-sm font-medium animate-pulse">Retrieving insights from knowledge base...</p>
            </div>
          ) : content ? (
            <ReactMarkdown components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-black text-slate-900 mb-6" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 marker:text-slate-300" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900 bg-slate-100 px-1 rounded" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-600" {...props} />
            }}>{content}</ReactMarkdown>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-slate-200" />
                </div>
                <p className="font-medium text-lg text-slate-400">Select a topic to generate your lesson.</p>
            </div>
          )}
        </div>
        
        {content && (
             <>
                 {/* Notes Section - Accordion Style */}
                 <div className="border-t border-slate-100 bg-white">
                    {/* Header / Toggle */}
                    <button 
                        onClick={() => setShowNotes(!showNotes)}
                        className={`w-full flex items-center justify-between px-8 py-4 transition-all duration-300 ${
                            showNotes ? 'bg-amber-50 border-b border-amber-100 text-amber-900' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        aria-expanded={showNotes}
                    >
                        <div className="flex items-center font-bold text-sm">
                            <PenTool size={16} className={`mr-3 ${showNotes ? 'text-amber-600' : 'text-slate-400'}`} />
                            <span>Personal Notes</span>
                            {notes && notes.length > 0 && !showNotes && (
                                <span className="ml-3 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                    Saved
                                </span>
                            )}
                        </div>
                        {showNotes ? <ChevronDown size={18} className="text-amber-600" /> : <ChevronUp size={18} className="text-slate-400" />}
                    </button>
                    
                    {/* Collapsible Content */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-amber-50/30 ${showNotes ? 'h-48 opacity-100' : 'h-0 opacity-0'}`}>
                         <div className="px-8 pb-8 pt-4 h-full">
                            <textarea 
                                value={notes}
                                onChange={handleNotesChange}
                                placeholder="Jot down your key insights, mnemonic devices, or questions here..."
                                className="w-full h-full bg-white border border-amber-100 rounded-xl p-4 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200/50 transition-shadow shadow-sm"
                            />
                         </div>
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="p-6 border-t border-slate-100 bg-white flex justify-end items-center relative z-20">
                    <button 
                        onClick={() => onComplete(topic, false)}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 hover:shadow-lg transition-all flex items-center"
                    >
                        <Save size={18} className="mr-2" /> Mark as Completed
                    </button>
                 </div>
             </>
        )}
      </div>
    </div>
  );
};

export default StudySession;
