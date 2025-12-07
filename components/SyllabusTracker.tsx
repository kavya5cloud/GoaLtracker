import React, { useState } from 'react';
import { UPSC_SYLLABUS } from '../constants';
import { SyllabusNode } from '../types';
import { ChevronRight, ChevronDown, Check, Folder, Zap } from 'lucide-react';

interface SyllabusTrackerProps {
  completedTopics: string[];
  onToggleTopic: (id: string) => void;
  onSelectTopic: (title: string) => void;
  onOpenFlashcards: (title: string) => void;
}

const SyllabusNodeItem: React.FC<{
  node: SyllabusNode;
  completedTopics: string[];
  onToggleTopic: (id: string) => void;
  onSelectTopic: (title: string) => void;
  onOpenFlashcards: (title: string) => void;
  depth: number;
}> = ({ node, completedTopics, onToggleTopic, onSelectTopic, onOpenFlashcards, depth }) => {
  const [isOpen, setIsOpen] = useState(depth < 1); 
  const isCompleted = completedTopics.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const getProgress = (n: SyllabusNode): number => {
    if (!n.children) return completedTopics.includes(n.id) ? 100 : 0;
    const total = n.children.length;
    const completed = n.children.reduce((acc, child) => {
        return acc + (completedTopics.includes(child.id) || (child.children && getProgress(child) === 100) ? 1 : 0);
    }, 0);
    return Math.round((completed / total) * 100);
  };

  const progress = hasChildren ? getProgress(node) : (isCompleted ? 100 : 0);

  return (
    <div className="select-none animate-fade-in">
      <div 
        className={`flex items-center py-3 px-4 my-1.5 cursor-pointer transition-all duration-200 rounded-xl ${
            depth === 0 
                ? 'bg-white border border-slate-100 shadow-sm mb-4' 
                : 'hover:bg-slate-50 text-slate-600'
        }`}
        style={{ marginLeft: `${depth === 0 ? 0 : 1.5}rem` }}
        onClick={(e) => {
            if(hasChildren) {
                 e.stopPropagation(); 
                 setIsOpen(!isOpen);
            } else {
                 onSelectTopic(node.title)
            }
        }}
      >
        <div className={`mr-3 text-slate-400 ${!hasChildren ? 'invisible' : ''}`}>
          {isOpen ? <ChevronDown size={18} strokeWidth={2} /> : <ChevronRight size={18} strokeWidth={2} />}
        </div>

        <div className="flex-1 flex items-center justify-between">
            <span className={` ${depth === 0 ? 'font-serif font-bold text-lg text-slate-900' : 'font-medium text-sm'}`}>
                {node.title}
            </span>
            
            <div className="flex items-center space-x-3">
                {hasChildren && depth === 0 && (
                    <div className="flex items-center px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-xs font-bold text-slate-600">{progress}%</span>
                    </div>
                )}

                {node.isTopic && isCompleted && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenFlashcards(node.title);
                        }}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Revise with Flashcards"
                    >
                        <Zap size={16} className="fill-current" />
                    </button>
                )}

                {node.isTopic && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleTopic(node.id);
                        }}
                        className={`transition-all hover:scale-105 active:scale-95`}
                    >
                        {isCompleted ? (
                             <div className="bg-green-500 text-white p-1 rounded-md shadow-sm">
                                <Check size={14} strokeWidth={3} />
                             </div>
                        ) : (
                             <div className="bg-white border-2 border-slate-200 rounded-md w-6 h-6 hover:border-slate-400"></div>
                        )}
                    </button>
                )}
            </div>
        </div>
      </div>
      
      {isOpen && hasChildren && (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 ml-[1.5rem]"></div>
          {node.children!.map((child) => (
            <SyllabusNodeItem
              key={child.id}
              node={child}
              completedTopics={completedTopics}
              onToggleTopic={onToggleTopic}
              onSelectTopic={onSelectTopic}
              onOpenFlashcards={onOpenFlashcards}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SyllabusTracker: React.FC<SyllabusTrackerProps> = (props) => {
  return (
    <div className="pb-20 max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
            <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">Master Plan</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Track your coverage across General Studies</p>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-sm font-medium">
                <Folder size={16} /> <span>UPSC CSE 2025</span>
            </div>
        </div>
        <div className="space-y-1">
            {UPSC_SYLLABUS.map((node) => (
                <SyllabusNodeItem key={node.id} node={node} depth={0} {...props} />
            ))}
        </div>
    </div>
  );
};

export default SyllabusTracker;