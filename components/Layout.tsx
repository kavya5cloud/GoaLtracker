
import React, { ReactNode } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, BookOpen, BrainCircuit, MessageSquareText, GraduationCap, Book } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'study', label: 'Study Room', icon: GraduationCap },
    { id: 'quiz', label: 'Quiz Arena', icon: BrainCircuit },
    { id: 'mentor', label: 'Mentor Chat', icon: MessageSquareText },
  ];

  const getPageTitle = () => {
    switch (currentView) {
        case 'syllabus': return 'Syllabus Tracker';
        case 'flashcards': return 'Quick Revision';
        case 'study': return 'Focus Mode';
        case 'quiz': return 'Quiz Arena';
        case 'mentor': return 'Mentor Chat';
        default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white flex-shrink-0 flex flex-col border-r border-slate-100 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div 
            className="p-8 flex items-center justify-center lg:justify-start cursor-pointer group" 
            onClick={() => setView('dashboard')}
            role="button"
            aria-label="LBSNAA Navigator Home"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    setView('dashboard');
                }
            }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 relative overflow-hidden transition-all duration-300 group-hover:shadow-slate-300 group-hover:scale-105">
             <div className="absolute top-0 right-0 -mr-2 -mt-2 w-6 h-6 bg-white opacity-10 rounded-full blur-sm"></div>
             <Book size={24} strokeWidth={2} className="relative z-10" />
          </div>
          <div className="ml-3 hidden lg:flex flex-col justify-center">
            <span className="font-serif font-bold text-lg tracking-tight text-slate-900 leading-none">
              LBSNAA
            </span>
            <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase leading-none mt-1 group-hover:text-slate-600 transition-colors">
              Navigator
            </span>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} strokeWidth={2} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="ml-3 font-medium text-sm hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 hidden lg:block">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-serif italic text-center leading-relaxed">
              "Arise, awake, and stop not till the goal is reached."
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-8 justify-between z-10 sticky top-0">
          <div className="flex items-center">
             <div className="mr-4 lg:hidden">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white" aria-label="LBSNAA Navigator Logo">
                  <Book size={18} />
                </div>
             </div>
             <h1 className="text-2xl font-serif font-bold text-slate-900 capitalize tracking-tight flex items-center">
                {getPageTitle()}
                {(currentView === 'study' || currentView === 'flashcards') && <span className="ml-3 text-xs bg-slate-100 text-slate-600 px-2 py-1 font-sans font-bold rounded-lg border border-slate-200">ACTIVE</span>}
             </h1>
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Prelims in ~May</span>
             </div>
             <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shadow-slate-200 cursor-pointer hover:bg-slate-800 transition-colors">
               AS
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
