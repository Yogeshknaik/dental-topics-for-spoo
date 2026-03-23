import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TOPICS, EXAM_DATES } from './constants';
import { ColumnType, ProgressState, ViewMode, SUBJECT_COLORS } from './types';
import TopicRow from './components/TopicRow';
import FilterDropdown from './components/FilterDropdown';
import ConfirmModal from './components/ConfirmModal';
import CelebrationModal from './components/CelebrationModal';
import { fetchProgress, saveTopicProgress, fetchUIState, saveUIState } from './services/firebase';

function App() {
  // Initialize state from localStorage if available
  const [filter, setFilter] = useState<string>(() => localStorage.getItem('dtt_filter') || 'all');
  const [selectedYear, setSelectedYear] = useState<string>(() => localStorage.getItem('dtt_year') || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('dtt_view_mode') as ViewMode;
    return Object.values(ViewMode).includes(saved) ? saved : ViewMode.SUBJECT;
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{id: string, column: ColumnType} | null>(null);
  
  // Celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationColumn, setCelebrationColumn] = useState('');
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // Milestone expand state
  const [isMilestoneExpanded, setIsMilestoneExpanded] = useState(() => localStorage.getItem('dtt_milestone_expanded') === 'true');
  
  // Save state to localStorage and Firebase when it changes
  useEffect(() => {
    localStorage.setItem('dtt_filter', filter);
    localStorage.setItem('dtt_year', selectedYear);
    localStorage.setItem('dtt_view_mode', viewMode);
    localStorage.setItem('dtt_milestone_expanded', String(isMilestoneExpanded));
    
    // Save to Firebase as well
    saveUIState({
      filter,
      selectedYear,
      viewMode,
      isMilestoneExpanded
    });
  }, [filter, selectedYear, viewMode, isMilestoneExpanded]);

  // Initialize state with an empty object, keys will be populated from Firebase or as discovered
  const [progressState, setProgressState] = useState<ProgressState>({});

  // Get progress for a topic, with default values if not found
  const getTopicProgress = useCallback((id: string) => {
    return progressState[id] || {
      m10: false,
      m5: false,
      m2: false,
      revise: false,
      finalRevise: false,
    };
  }, [progressState]);

  // Load data from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Fetch both progress and UI settings in parallel
      const [remoteData, remoteSettings] = await Promise.all([
        fetchProgress(),
        fetchUIState()
      ]);
      
      if (remoteData) {
        setProgressState(prevState => ({
          ...prevState,
          ...remoteData
        }));
      }
      
      if (remoteSettings) {
        if (remoteSettings.filter) setFilter(remoteSettings.filter);
        if (remoteSettings.selectedYear) setSelectedYear(remoteSettings.selectedYear);
        if (remoteSettings.viewMode) setViewMode(remoteSettings.viewMode as ViewMode);
        if (remoteSettings.isMilestoneExpanded !== undefined) setIsMilestoneExpanded(remoteSettings.isMilestoneExpanded);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  // Helper to group exam subjects
  const getExamSubject = (s: string) => {
    if (['Complete Denture', 'Fixed Partial Denture', 'Removable Partial Denture'].includes(s)) return 'Prosthodontics';
    if (['Conservative Dentistry', 'Endodontics'].includes(s)) return 'Cons and Endo';
    return s;
  };

  // Extract unique subjects for the filter dropdown
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(TOPICS.map(t => t.subject));
    return Array.from(uniqueSubjects).sort();
  }, []);

  // Simplified subjects for EXAM mode
  const examTabSubjects = useMemo(() => {
    const examSet = new Set(subjects.map(getExamSubject));
    return Array.from(examSet).sort();
  }, [subjects]);

  // Filter logic
  const filteredTopics = useMemo(() => {
    if (viewMode === ViewMode.SUBJECT) {
      if (filter === 'all') return TOPICS;
      return TOPICS.filter(t => t.subject === filter);
    } else {
      // Generate Exam Paper Topics dynamically
      const paperTopics: any[] = [];
      const yearsToUse = selectedYear === 'all' ? EXAM_DATES : [selectedYear];
      
      // Determine which EXAM subjects to iterate over
      let examSubjects: string[] = [];
      if (filter === 'all') {
        examSubjects = examTabSubjects;
      } else {
        // If they filtered a sub-subject, show the combined one
        examSubjects = [getExamSubject(filter)];
      }

      examSubjects.forEach(subj => {
        yearsToUse.forEach(year => {
          paperTopics.push({
            id: `paper-${subj.replace(/\s+/g, '-')}-${year.replace(/\s+/g, '-')}`,
            sNo: paperTopics.length + 1,
            title: year,
            subject: subj,
            link: "#"
          });
        });
      });
      return paperTopics;
    }
  }, [filter, viewMode, subjects, selectedYear]);

  // Exam Grouping Logic
  const examGrouping = useMemo(() => {
    // For the new mode, we just use filteredTopics directly as it's already structured by paper
    return filteredTopics;
  }, [filteredTopics]);

  // Toggle handler with Firebase Integration
  const handleToggle = useCallback((id: string, column: ColumnType) => {
    const currentTopicState = getTopicProgress(id);
    const currentValue = currentTopicState[column];
    const newValue = !currentValue;
    
    // If unchecking (going from true to false), show confirmation modal
    if (currentValue === true && newValue === false) {
      setPendingAction({ id, column });
      setShowModal(true);
      return;
    }
    
    // If checking, proceed immediately
    setProgressState(prev => {
      saveTopicProgress(id, column, newValue);
      
      const current = prev[id] || { m10: false, m5: false, m2: false, revise: false, finalRevise: false };

      const newState = {
        ...prev,
        [id]: {
          ...current,
          [column]: newValue
        }
      };
      
      // Check if this completion makes the entire column complete
      if (newValue === true) {
        const totalTopics = TOPICS.length;
        let completedCount = 0;
        
        TOPICS.forEach(topic => {
          if (newState[topic.id]?.[column]) {
            completedCount++;
          }
        });
        
    
        if (completedCount === totalTopics){
          setTimeout(() => {
            let columnName = '';
            let message = '';
            
            switch (column) {
              case ColumnType.M10:
                columnName = '10 Marker';
                message = '10 Marker is finished, Spoo! Congratulations! 🎯';
                break;
              case ColumnType.M5:
                columnName = '5 Marks';
                message = '5 Marks is finished, Spoo! Congratulations! 🌟';
                break;
              case ColumnType.M2:
                columnName = '2 Marker';
                message = '2 Marker is finished, Spoo! Congratulations! ✨';
                break;
              case ColumnType.REVISE:
                columnName = 'Revise';
                message = 'Revise is finished, Spoo! Congratulations! 📚';
                break;
              case ColumnType.FINAL_REVISE:
                columnName = 'Final Revise';
                message = 'You are good to go for exam, Spoo! All the best! 🚀';
                break;
            }
            
            setCelebrationColumn(columnName);
            setCelebrationMessage(message);
            setShowCelebration(true);
          }, 300);
        }
      }
      
      return newState;
    });
  }, [progressState]);

  // Handle modal confirmation
  const handleConfirmUndo = useCallback(() => {
    if (pendingAction) {
      const { id, column } = pendingAction;
      
      setProgressState(prev => {
        saveTopicProgress(id, column, false);

        return {
          ...prev,
          [id]: {
            ...prev[id],
            [column]: false
          }
        };
      });
    }
    
    setShowModal(false);
    setPendingAction(null);
  }, [pendingAction]);

  // Handle modal cancellation
  const handleCancelUndo = useCallback(() => {
    setShowModal(false);
    setPendingAction(null);
  }, []);

  // Counter Statistics
  const stats = useMemo(() => {
    let m10 = 0, m5 = 0, m2 = 0, revise = 0, finalRevise = 0;
    
    filteredTopics.forEach(topic => {
      const p = getTopicProgress(topic.id);
      if (p?.m10) m10++;
      if (p?.m5) m5++;
      if (p?.m2) m2++;
      if (p?.revise) revise++;
      if (p?.finalRevise) finalRevise++;
    });

    return { m10, m5, m2, revise, finalRevise, total: filteredTopics.length };
  }, [filteredTopics, progressState]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1100px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Header Section */}
        <div className="p-4 md:p-6 bg-white border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  {viewMode === ViewMode.SUBJECT ? '📚 Dental Topics' : '🗓️ Exam Papers'} <span className="text-blue-600">for Spoo</span>
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {viewMode === ViewMode.SUBJECT ? 'Track progress across subjects' : 'Track revision by Exam Year'}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button 
                  onClick={() => setViewMode(ViewMode.SUBJECT)}
                  className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${viewMode === ViewMode.SUBJECT ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Topics
                </button>
                <button 
                  onClick={() => setViewMode(ViewMode.EXAM)}
                  className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${viewMode === ViewMode.EXAM ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Exams
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
               <div className="flex-1 min-w-0">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Filter Subject</label>
                 <FilterDropdown 
                   items={viewMode === ViewMode.SUBJECT ? subjects : examTabSubjects} 
                   selectedItem={filter === 'all' ? 'all' : (viewMode === ViewMode.EXAM ? getExamSubject(filter) : filter)} 
                   onChange={setFilter} 
                   allLabel="All Subjects"
                 />
               </div>
               {viewMode === ViewMode.EXAM && (
                 <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Filter Year</label>
                    <FilterDropdown 
                      items={EXAM_DATES} 
                      selectedItem={selectedYear} 
                      onChange={setSelectedYear} 
                      allLabel="All Years"
                    />
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Milestone Progress Section */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Milestones
            </h2>
            <button
              onClick={() => setIsMilestoneExpanded(!isMilestoneExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMilestoneExpanded ? 'Collapse' : 'Expand'}
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isMilestoneExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {isMilestoneExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* 10 Marker Milestone */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">10 Marker</span>
                <span className="text-xs font-bold text-blue-600">{Math.round((stats.m10 / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.m10 / stats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.m10} / {stats.total}</p>
            </div>

            {/* 5 Marks Milestone */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">5 Marks</span>
                <span className="text-xs font-bold text-blue-600">{Math.round((stats.m5 / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.m5 / stats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.m5} / {stats.total}</p>
            </div>

            {/* 2 Marker Milestone */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">2 Marker</span>
                <span className="text-xs font-bold text-blue-600">{Math.round((stats.m2 / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.m2 / stats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.m2} / {stats.total}</p>
            </div>

            {/* Revise Milestone */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Revise</span>
                <span className="text-xs font-bold text-yellow-600">{Math.round((stats.revise / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.revise / stats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.revise} / {stats.total}</p>
            </div>

            {/* Final Revise Milestone */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Final Revise</span>
                <span className="text-xs font-bold text-green-600">{Math.round((stats.finalRevise / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.finalRevise / stats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.finalRevise} / {stats.total}</p>
            </div>
            </div>
          )}
        </div>

        {/* Main Table Content */}
        <div className="overflow-x-auto custom-scrollbar relative">
          {loading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 overflow-hidden z-20">
              <div className="w-full h-full bg-blue-500 animate-pulse origin-left"></div>
            </div>
          )}
          
          <table className="w-full text-left min-w-[800px] border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-1 md:py-3 py-2 font-bold text-gray-500 w-12 text-center text-[10px] uppercase tracking-wider bg-gray-50 sticky left-0 z-20 shadow-[inset_-1px_0_0_0_#e5e7eb]">S.no</th>
                <th className="px-2 md:py-3 py-2 font-bold text-gray-700 border-r border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider">
                  {viewMode === ViewMode.SUBJECT ? 'Topic Name' : 'Exam Year'}
                </th>
                <th className="px-2 md:py-3 py-2 font-bold text-gray-700 border-r border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-center">Subject</th>
                <th className="px-1 md:py-3 py-2 font-bold text-gray-700 text-center w-20 border-r border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">10m</span>
                    <span className="bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{stats.m10} / {stats.total}</span>
                  </div>
                </th>
                <th className="px-1 md:py-3 py-2 font-bold text-gray-700 text-center w-20 border-r border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">5m</span>
                    <span className="bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{stats.m5} / {stats.total}</span>
                  </div>
                </th>
                <th className="px-1 md:py-3 py-2 font-bold text-gray-700 text-center w-20 border-r border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">2m</span>
                    <span className="bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{stats.m2} / {stats.total}</span>
                  </div>
                </th>
                <th className="px-1 md:py-3 py-2 font-bold text-gray-700 text-center w-20 border-r border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Revise</span>
                    <span className="bg-yellow-50 text-yellow-600 font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{stats.revise} / {stats.total}</span>
                  </div>
                </th>
                <th className="px-1 md:py-3 py-2 font-bold text-gray-700 text-center w-24 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5">Final</span>
                    <span className="bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{stats.finalRevise} / {stats.total}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredTopics.map((topic) => (
                <TopicRow 
                  key={topic.id}
                  topic={topic}
                  progress={getTopicProgress(topic.id)}
                  onToggle={handleToggle}
                />
              ))}
              
              {filteredTopics.length === 0 && (
                 <tr>
                    <td colSpan={8} className="text-center py-20 bg-gray-50">
                       <div className="flex flex-col items-center gap-2">
                         <span className="text-4xl text-gray-300">🔍</span>
                         <p className="text-gray-500 font-medium">No papers found for this selection.</p>
                       </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400">
          Syncing with Firebase Database
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={showModal}
        onConfirm={handleConfirmUndo}
        onCancel={handleCancelUndo}
      />
      
      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        columnName={celebrationColumn}
        message={celebrationMessage}
      />
    </div>
  );
}

export default App;
