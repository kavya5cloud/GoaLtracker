
import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { UserProgress, SyllabusNode } from '../types';
import { getDailyQuote, getTopicSummary } from '../services/geminiService';
import { Flame, CheckCircle, Clock, Target, ArrowUpRight, Zap, Edit2, Save, BookOpen, Trophy, Activity, Calendar as CalendarIcon, Sparkles, Layers, Loader2, BrainCircuit } from 'lucide-react';
import { UPSC_SYLLABUS } from '../constants';

interface DashboardProps {
  progress: UserProgress;
  onStartStudy: () => void;
  onUpdateGoal: (minutes: number) => void;
  onBulkGenerateFlashcards: () => void;
  isBulkGenerating: boolean;
}

const ActivityHeatmap: React.FC<{ history: Record<string, number> }> = ({ history }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Helper to format date strictly as YYYY-MM-DD locally
    const getLocalYMD = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { weeks } = useMemo(() => {
        const weeksData = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Calculate the end date (Next Saturday)
        const currentDayOfWeek = today.getDay(); // 0 = Sunday
        const daysToSaturday = 6 - currentDayOfWeek;
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + daysToSaturday);
        
        // Generate exactly 53 weeks backwards
        const totalWeeks = 53;
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - (totalWeeks * 7) + 1);

        for (let w = 0; w < totalWeeks; w++) {
            const days = [];
            let monthLabel = null;

            for (let d = 0; d < 7; d++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + (w * 7) + d);
                
                const dateStr = getLocalYMD(date);
                const isToday = date.getTime() === today.getTime();
                const isFuture = date > today;
                
                // Logic for Month Label: Place it on the week that contains the 1st of the month
                if (date.getDate() === 1) {
                    monthLabel = date.toLocaleString('default', { month: 'short' });
                }

                days.push({
                    date,
                    dateStr,
                    count: history[dateStr] || 0,
                    isToday,
                    isFuture
                });
            }
            
            // Fallback: If it's the very first week, label it
            if (w === 0 && !monthLabel) {
                 monthLabel = days[0].date.toLocaleString('default', { month: 'short' });
            }

            weeksData.push({ days, monthLabel });
        }
        return { weeks: weeksData };
    }, [history]);

    // Robust Auto-Scroll to End
    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [weeks]);

    const getColor = (minutes: number, isFuture: boolean, isToday: boolean) => {
        if (isFuture) return 'bg-slate-50 border-transparent opacity-0'; // Invisible future placeholder for grid structure
        if (minutes === 0) return isToday ? 'bg-slate-100 border-slate-300 ring-1 ring-slate-400' : 'bg-slate-100 border-transparent';
        if (minutes < 30) return 'bg-slate-300 border-slate-400';
        if (minutes < 60) return 'bg-slate-400 border-slate-500';
        if (minutes < 120) return 'bg-slate-600 border-slate-700';
        return 'bg-slate-900 border-slate-900';
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-soft w-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center">
                        <Activity className="mr-2 text-slate-600" size={20}/> 
                        Study Consistency
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Visualize your discipline over the last year
                    </p>
                </div>
                <div className="flex items-center text-[10px] text-slate-400 font-medium space-x-2">
                    <span>Rest</span>
                    <div className="w-2.5 h-2.5 bg-slate-100 rounded-[2px] border border-slate-200"></div>
                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-[2px]"></div>
                    <div className="w-2.5 h-2.5 bg-slate-500 rounded-[2px]"></div>
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-[2px]"></div>
                    <span>Deep Work</span>
                </div>
            </div>

            <div 
                className="overflow-x-auto scrollbar-hide pb-4 relative" 
                ref={scrollRef}
            >
                <div className="flex gap-1 min-w-max pb-2">
                    {/* Day Labels (Sticky Left) */}
                    <div className="flex flex-col justify-between pr-2 py-[18px] h-[100px] text-[9px] font-bold text-slate-300 sticky left-0 bg-white z-10">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    {/* Columns (Weeks) */}
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {/* Month Label (Above first square) */}
                            <div className="h-3 relative mb-1">
                                {week.monthLabel && (
                                    <span className="absolute bottom-0 left-0 text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {week.monthLabel}
                                    </span>
                                )}
                            </div>
                            
                            {/* Days */}
                            {week.days.map((day, dIndex) => (
                                <div 
                                    key={day.dateStr}
                                    className={`w-3 h-3 rounded-[2px] border transition-all duration-200 group relative ${getColor(day.count, day.isFuture, day.isToday)}`}
                                >
                                    {!day.isFuture && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                                            {day.count}m on {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ progress, onStartStudy, onUpdateGoal, onBulkGenerateFlashcards, isBulkGenerating }) => {
  const [quote, setQuote] = useState<string>("Loading motivation...");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(progress.dailyGoalMinutes / 60);
  
  // Summary State
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    getDailyQuote().then(setQuote);
  }, []);

  useEffect(() => {
    setTempGoal(progress.dailyGoalMinutes / 60);
  }, [progress.dailyGoalMinutes]);

  // Fetch summary if lastStudiedTopic changes
  useEffect(() => {
    if (progress.lastStudiedTopic) {
        const cachedSummaryKey = `summary_${progress.lastStudiedTopic}`;
        const cached = localStorage.getItem(cachedSummaryKey);
        
        if (cached) {
            setSummary(cached);
        } else {
            setLoadingSummary(true);
            getTopicSummary(progress.lastStudiedTopic).then(text => {
                setSummary(text);
                localStorage.setItem(cachedSummaryKey, text);
                setLoadingSummary(false);
            });
        }
    }
  }, [progress.lastStudiedTopic]);

  const handleSaveGoal = () => {
    onUpdateGoal(tempGoal * 60);
    setIsEditingGoal(false);
  };

  // Helper to find topic title from ID for the missing flashcards count
  const countTopicsMissingFlashcards = useMemo(() => {
    let count = 0;
    
    // Recursive find helper
    const findNodeTitle = (id: string, nodes: SyllabusNode[]): string | null => {
        for (const node of nodes) {
            if (node.id === id) return node.title;
            if (node.children) {
                const found = findNodeTitle(id, node.children);
                if (found) return found;
            }
        }
        return null;
    };

    progress.completedTopics.forEach(id => {
        const title = findNodeTitle(id, UPSC_SYLLABUS);
        if (title && (!progress.flashcards[title] || progress.flashcards[title].length === 0)) {
            count++;
        }
    });
    return count;
  }, [progress.completedTopics, progress.flashcards]);

  // Calculate statistics
  const totalTopics = useMemo(() => {
    let count = 0;
    const traverse = (nodes: any[]) => {
        nodes.forEach(n => {
            if (n.isTopic) count++;
            if (n.children) traverse(n.children);
        });
    };
    traverse(UPSC_SYLLABUS);
    return count;
  }, []);

  const totalHours = (progress.totalStudyMinutes / 60);
  const nextMilestone = Math.ceil((totalHours + 0.1) / 10) * 10;
  const dailyProgressPercent = Math.min((progress.dailyStudyMinutes / progress.dailyGoalMinutes) * 100, 100);

  const StatCard = ({ icon: Icon, title, value, subtext }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-slate-50 text-slate-900 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
            <Icon size={20} strokeWidth={2} />
        </div>
        {subtext && <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-full">{subtext}</span>}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">{title}</p>
        <p className="text-2xl font-serif font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-slate-200 relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
                <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur rounded-full mb-4 border border-white/10">
                    <Zap size={12} className="mr-2 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold tracking-wider uppercase text-white/90">Daily Briefing</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 leading-tight">
                    Start your shift,<br/>
                    <span className="text-slate-400">Future Officer.</span>
                </h2>
                <p className="text-slate-300 text-sm md:text-base italic border-l-2 border-white/20 pl-4 mb-6 font-light opacity-90">
                    "{quote}"
                </p>
            </div>
            <div className="flex justify-start md:justify-end">
                 <button 
                    onClick={onStartStudy}
                    className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 transition-all flex items-center group"
                >
                    <span className="flex flex-col items-start text-left mr-3">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ready?</span>
                        <span className="text-base font-black">Enter Study Mode</span>
                    </span>
                    <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={24} />
                </button>
            </div>
        </div>
        
        {/* Abstract Pattern */}
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
            <div className="w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main Grid: Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <StatCard 
            icon={Flame} 
            title="Current Streak" 
            value={`${progress.streak} Days`} 
            subtext={progress.streak > 3 ? "On Fire" : undefined}
          />
          <StatCard 
            icon={CheckCircle} 
            title="Topics Covered" 
            value={`${progress.completedTopics.length}/${totalTopics}`} 
          />
          <StatCard 
            icon={Clock} 
            title="Hours Invested" 
            value={totalHours.toFixed(1)} 
          />
           <StatCard 
            icon={ArrowUpRight} 
            title="Quizzes Taken" 
            value={progress.quizzesTaken} 
          />
      </div>

      {/* Smart Recap Section */}
      {progress.lastStudiedTopic && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8 animate-fade-in relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles size={100} />
               </div>
               
               <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles size={24} className="fill-current" />
               </div>
               
               <div className="flex-1 relative z-10">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Smart Recap</span>
                        <h4 className="font-serif font-bold text-slate-900">{progress.lastStudiedTopic}</h4>
                    </div>
                    {loadingSummary ? (
                        <div className="flex space-x-1 items-center h-6">
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                        </div>
                    ) : (
                        <p className="text-slate-600 text-sm leading-relaxed italic">
                             "{summary}"
                        </p>
                    )}
               </div>
               
               <div className="flex-shrink-0">
                    <button 
                        onClick={onStartStudy}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 underline decoration-2 underline-offset-4 transition-colors"
                    >
                        Continue Studying
                    </button>
               </div>
          </div>
      )}

      {/* Full Width Heatmap */}
      <ActivityHeatmap history={progress.studyHistory || {}} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Goal & Suggestions */}
        <div className="lg:col-span-2 space-y-6">
             {/* Daily Goal Tracker */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif font-bold text-slate-900">Daily Target</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{Math.round(dailyProgressPercent)}% Achieved</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsEditingGoal(!isEditingGoal)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>

                {isEditingGoal ? (
                    <div className="flex items-center space-x-4 mb-4 animate-fade-in bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <input 
                        type="number" 
                        value={tempGoal} 
                        onChange={(e) => setTempGoal(Number(e.target.value))}
                        className="w-24 p-2 border border-slate-200 rounded-lg font-bold text-lg text-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none"
                        min="0.5"
                        step="0.5"
                        />
                        <span className="text-slate-500 font-medium">Hours</span>
                        <button 
                        onClick={handleSaveGoal}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-slate-800"
                        >
                        <Save size={14} className="mr-2" /> Save
                        </button>
                    </div>
                ) : (
                    <div className="mb-4">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {Math.floor(progress.dailyStudyMinutes / 60)}<span className="text-xl text-slate-400 font-medium">h</span> 
                                {' '}{progress.dailyStudyMinutes % 60}<span className="text-xl text-slate-400 font-medium">m</span>
                            </span>
                            <span className="text-sm font-medium text-slate-500">Goal: {progress.dailyGoalMinutes / 60} hrs</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${dailyProgressPercent >= 100 ? 'bg-green-500' : 'bg-slate-900'}`}
                                style={{ width: `${dailyProgressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Revision Center */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -right-10 -bottom-10 opacity-5">
                    <Layers size={150} />
                </div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center">
                        <Layers className="mr-3 text-amber-500" size={20} /> 
                        Revision Center
                    </h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-amber-50 rounded-2xl border border-amber-100 relative z-10">
                     <div className="mb-4 md:mb-0">
                        <p className="text-sm font-bold text-slate-900 flex items-center">
                            <BrainCircuit size={16} className="mr-2 text-amber-600" />
                            Flashcard Ecosystem
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-sm">
                            {countTopicsMissingFlashcards > 0 
                                ? <span className="text-amber-700 font-semibold">{countTopicsMissingFlashcards} completed topics</span>
                                : "All completed topics"} have generated flashcards.
                            {countTopicsMissingFlashcards > 0 && " are waiting for deck generation."}
                        </p>
                     </div>
                     
                     <button 
                        onClick={onBulkGenerateFlashcards}
                        disabled={countTopicsMissingFlashcards === 0 || isBulkGenerating}
                        className="w-full md:w-auto px-6 py-3 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center disabled:cursor-not-allowed group"
                     >
                        {isBulkGenerating ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" /> Generating Decks...
                            </>
                        ) : (
                            <>
                                <Zap size={16} className="mr-2 group-hover:scale-110 transition-transform" /> 
                                {countTopicsMissingFlashcards > 0 ? "Generate Missing Decks" : "All Decks Ready"}
                            </>
                        )}
                     </button>
                </div>
            </div>

            {/* Suggested Topics */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-8">
                <h3 className="text-lg font-serif font-bold text-slate-900 mb-6 flex items-center">
                    <BookOpen className="mr-3 text-slate-400" size={20} /> 
                    Recommended for You
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group" onClick={onStartStudy}>
                        <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 font-bold text-sm mr-4 rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">1</div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Polity: Basic Structure</h4>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">GS II • High Yield</p>
                            </div>
                        </div>
                        <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group" onClick={onStartStudy}>
                        <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 font-bold text-sm mr-4 rounded-xl shadow-sm border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">2</div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Economy: Banking Sector</h4>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">GS III • Conceptual</p>
                            </div>
                        </div>
                         <ArrowUpRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Progress & Tips */}
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-soft h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Trophy size={32} />
                </div>
                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-2">Next Milestone</p>
                <p className="text-3xl font-serif font-bold text-slate-900 mb-1">{nextMilestone} Hours</p>
                <p className="text-sm text-slate-400 font-medium mb-6">{(nextMilestone - totalHours).toFixed(1)} hours remaining</p>
                
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                     <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(totalHours / nextMilestone) * 100}%` }}></div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <p className="text-xs text-slate-500 italic">"The more you sweat in peace, the less you bleed in war."</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
