
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SyllabusTracker from './components/SyllabusTracker';
import StudySession from './components/StudySession';
import QuizArena from './components/QuizArena';
import MentorChat from './components/MentorChat';
import FlashcardViewer from './components/FlashcardViewer';
import { ViewState, UserProgress, StoredFlashcard, SyllabusNode } from './types';
import { UPSC_SYLLABUS } from './constants';
import { generateFlashcards } from './services/geminiService';

const INITIAL_PROGRESS: UserProgress = {
  completedTopics: [],
  streak: 0,
  lastLoginDate: '',
  totalStudyMinutes: 0,
  dailyGoalMinutes: 120, // Default 2 hours
  dailyStudyMinutes: 0,
  studyHistory: {},
  quizzesTaken: 0,
  averageScore: 0,
  name: 'Aspirant',
  targetYear: 2025,
  flashcards: {}
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [userProgress, setUserProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [selectedStudyTopic, setSelectedStudyTopic] = useState<string | undefined>(undefined);
  const [selectedFlashcardTopic, setSelectedFlashcardTopic] = useState<string | undefined>(undefined);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const saved = localStorage.getItem('upsc_navigator_progress');
    const todayStr = getLocalDateString();
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist for existing users
      if (typeof parsed.dailyGoalMinutes === 'undefined') parsed.dailyGoalMinutes = 120;
      if (typeof parsed.dailyStudyMinutes === 'undefined') parsed.dailyStudyMinutes = 0;
      if (typeof parsed.studyHistory === 'undefined') parsed.studyHistory = {};
      if (typeof parsed.flashcards === 'undefined') parsed.flashcards = {};

      let lastLoginStr = parsed.lastLoginDate;
      // Handle legacy full ISO strings if they exist by taking only the date part
      if (lastLoginStr && lastLoginStr.includes('T')) {
          lastLoginStr = lastLoginStr.split('T')[0];
      }
      
      // If lastLoginStr is invalid or missing, assume today (new user or corruption)
      if (!lastLoginStr || isNaN(Date.parse(lastLoginStr))) {
          lastLoginStr = todayStr;
      }

      // Calculate days difference safely using UTC timestamps to avoid timezone issues
      const getDaysDiff = (start: string, end: string) => {
        const [y1, m1, d1] = start.split('-').map(Number);
        const [y2, m2, d2] = end.split('-').map(Number);
        // Date.UTC(year, monthIndex, day)
        const utc1 = Date.UTC(y1, m1 - 1, d1);
        const utc2 = Date.UTC(y2, m2 - 1, d2);
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.floor((utc2 - utc1) / msPerDay);
      };

      // If last login was not today, update streak/daily stats
      if (lastLoginStr !== todayStr) {
        const diffDays = getDaysDiff(lastLoginStr, todayStr);

        if (diffDays === 1) {
           // Consecutive day login: Increment streak
           parsed.streak = (parsed.streak || 0) + 1;
        } else if (diffDays > 1) {
           // Gap > 1 day: Streak broken, reset to 1 (starting today)
           parsed.streak = 1;
        } else if (diffDays < 0) {
           // Negative difference (time travel?): Reset to 1 to be safe
           parsed.streak = 1;
        }
        
        // Reset daily stats for the new day
        parsed.dailyStudyMinutes = 0;
        parsed.lastLoginDate = todayStr;
        
        // Save updated state immediately
        localStorage.setItem('upsc_navigator_progress', JSON.stringify(parsed));
      }
      
      setUserProgress(parsed);
    } else {
        // New user
        const newProgress = {
            ...INITIAL_PROGRESS,
            lastLoginDate: todayStr,
            streak: 1
        };
        setUserProgress(newProgress);
        localStorage.setItem('upsc_navigator_progress', JSON.stringify(newProgress));
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem('upsc_navigator_progress', JSON.stringify(newProgress));
  };

  const handleToggleTopic = (topicId: string) => {
    const isCompleted = userProgress.completedTopics.includes(topicId);
    let newCompleted = [...userProgress.completedTopics];
    if (isCompleted) {
      newCompleted = newCompleted.filter(id => id !== topicId);
    } else {
      newCompleted.push(topicId);
    }
    saveProgress({ ...userProgress, completedTopics: newCompleted });
  };

  const handleSelectTopicForStudy = (title: string) => {
    setSelectedStudyTopic(title);
    setCurrentView('study');
  };

  const handleOpenFlashcards = (title: string) => {
    setSelectedFlashcardTopic(title);
    setCurrentView('flashcards');
  };

  const handleFinishStudy = (completedTopic: string, stay: boolean = false) => {
    const minutesToAdd = 60;
    const todayStr = getLocalDateString();
    
    // Update history
    const currentHistory = userProgress.studyHistory || {};
    const todayMinutes = (currentHistory[todayStr] || 0) + minutesToAdd;
    const newHistory = { ...currentHistory, [todayStr]: todayMinutes };

    saveProgress({
        ...userProgress,
        totalStudyMinutes: userProgress.totalStudyMinutes + minutesToAdd,
        dailyStudyMinutes: userProgress.dailyStudyMinutes + minutesToAdd,
        studyHistory: newHistory,
        lastStudiedTopic: completedTopic
    });
    // Return to dashboard or syllabus if not staying
    if (!stay) {
        setCurrentView('dashboard');
    }
  };

  const handleFinishQuiz = (score: number) => {
    // Rolling average calculation
    const currentTotal = userProgress.averageScore * userProgress.quizzesTaken;
    // Assuming score is out of 5 (based on current implementation), normalize to % (score/5 * 100 = score * 20)
    const newScorePercent = score * 20; 
    const newCount = userProgress.quizzesTaken + 1;
    const newAvg = Math.round((currentTotal + newScorePercent) / newCount);
    
    saveProgress({
        ...userProgress,
        quizzesTaken: newCount,
        averageScore: newAvg
    });
  };

  const handleUpdateGoal = (minutes: number) => {
    saveProgress({
      ...userProgress,
      dailyGoalMinutes: minutes
    });
  };

  const handleSaveFlashcards = (topic: string, updatedCards: StoredFlashcard[]) => {
      const newFlashcards = { ...userProgress.flashcards, [topic]: updatedCards };
      saveProgress({
          ...userProgress,
          flashcards: newFlashcards
      });
  };

  // Recursively find a node by ID
  const findNodeById = (id: string, nodes: SyllabusNode[]): SyllabusNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleBulkGenerateFlashcards = async () => {
    setIsBulkGenerating(true);
    
    // 1. Identify completed topics that don't have flashcards yet
    const topicsNeedingCards: string[] = [];
    
    userProgress.completedTopics.forEach(topicId => {
      const node = findNodeById(topicId, UPSC_SYLLABUS);
      if (node && node.isTopic) {
        // Check if cards already exist for this title
        if (!userProgress.flashcards[node.title] || userProgress.flashcards[node.title].length === 0) {
          topicsNeedingCards.push(node.title);
        }
      }
    });

    if (topicsNeedingCards.length === 0) {
      setIsBulkGenerating(false);
      return;
    }

    const newFlashcardsMap: Record<string, StoredFlashcard[]> = {};

    // 2. Generate cards for each topic
    // We do this sequentially to avoid overwhelming the API rate limits
    for (const title of topicsNeedingCards) {
      try {
        const generated = await generateFlashcards(title);
        const storedCards: StoredFlashcard[] = generated.map((c, i) => ({
          ...c,
          id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          nextReviewDate: Date.now(), // Due immediately
          interval: 0,
          easeFactor: 2.5,
          reps: 0
        }));
        newFlashcardsMap[title] = storedCards;
      } catch (e) {
        console.error(`Failed to generate bulk cards for ${title}`, e);
      }
    }

    // 3. Save
    saveProgress({
      ...userProgress,
      flashcards: { ...userProgress.flashcards, ...newFlashcardsMap }
    });

    setIsBulkGenerating(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            progress={userProgress} 
            onStartStudy={() => setCurrentView('study')} 
            onUpdateGoal={handleUpdateGoal}
            onBulkGenerateFlashcards={handleBulkGenerateFlashcards}
            isBulkGenerating={isBulkGenerating}
          />
        );
      case 'syllabus':
        return (
          <SyllabusTracker 
            completedTopics={userProgress.completedTopics}
            onToggleTopic={handleToggleTopic}
            onSelectTopic={handleSelectTopicForStudy}
            onOpenFlashcards={handleOpenFlashcards}
          />
        );
      case 'study':
        return (
            <StudySession 
                initialTopic={selectedStudyTopic} 
                onComplete={handleFinishStudy} 
                onExit={() => setCurrentView('dashboard')}
            />
        );
      case 'flashcards':
        return selectedFlashcardTopic ? (
          <FlashcardViewer 
            topic={selectedFlashcardTopic} 
            existingCards={userProgress.flashcards[selectedFlashcardTopic] || []}
            onSaveProgress={(cards) => handleSaveFlashcards(selectedFlashcardTopic, cards)}
            onBack={() => setCurrentView('syllabus')} 
          />
        ) : <SyllabusTracker 
              completedTopics={userProgress.completedTopics}
              onToggleTopic={handleToggleTopic}
              onSelectTopic={handleSelectTopicForStudy}
              onOpenFlashcards={handleOpenFlashcards}
            />;
      case 'quiz':
        return <QuizArena onFinishQuiz={handleFinishQuiz} />;
      case 'mentor':
        return <MentorChat />;
      default:
        return <Dashboard 
                  progress={userProgress} 
                  onStartStudy={() => setCurrentView('study')} 
                  onUpdateGoal={handleUpdateGoal}
                  onBulkGenerateFlashcards={handleBulkGenerateFlashcards}
                  isBulkGenerating={isBulkGenerating}
               />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
