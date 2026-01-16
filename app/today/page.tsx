'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { saveWorkoutPhoto, getWorkoutPhoto, getAllWorkoutPhotos, saveData } from '@/lib/storage';

type View = 'today' | 'gallery' | 'notes' | 'calendar';

export default function TodayPage() {
  const { data, toggleRule, completeDay, failDay, updateNotes, saveNote } = useApp();
  const [showFailConfirm, setShowFailConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentView, setCurrentView] = useState<View>('today');
  const [workoutPhoto, setWorkoutPhoto] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; date: string } | null>(null);
  const [selectedNote, setSelectedNote] = useState<{ text: string; date: string; status: string } | null>(null);
  const [showDayReview, setShowDayReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: 'numeric' 
      }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if we need to show day review modal
  useEffect(() => {
    const lastUpdated = data.lastUpdated;
    const today = new Date().toISOString().split('T')[0];
    
    // If it's a new day and we haven't reviewed yesterday yet
    if (lastUpdated !== today && lastUpdated < today) {
      setShowDayReview(true);
    }
  }, [data.lastUpdated]);

  useEffect(() => {
    const photo = getWorkoutPhoto(today);
    if (photo) setWorkoutPhoto(photo);
  }, [today]);

  const allRulesCompleted = data.todayRules.every((rule) => rule.completed);
  const progressPercentage = (data.currentDay / 66) * 100;

  const handleCompleteDay = () => {
    completeDay();
    setShowDayReview(false);
  };

  const handleFail = () => {
    failDay();
    setShowFailConfirm(false);
    setShowDayReview(false);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const photoData = reader.result as string;
      setWorkoutPhoto(photoData);
      saveWorkoutPhoto(today, photoData);
    };
    reader.readAsDataURL(file);
  };

  const renderTodayView = () => (
    <>
      <div className="header-card flex-shrink-0">
        <div className="flex items-stretch justify-between mb-2">
          <div className="flex-1">
            <div className="text-base font-light tracking-tight mb-1">{currentDate}</div>
            <div className="text-6xl font-thin tracking-tighter leading-none">{currentTime}</div>
          </div>
          <div className="flex gap-6 items-center">
            <div className="text-center">
              <div className="text-base font-light opacity-60 mb-1">BEST</div>
              <div className="text-6xl font-thin leading-none">{data.bestStreak}</div>
            </div>
            <div className="text-center">
              <div className="text-base font-light opacity-60 mb-1">FAILS</div>
              <div className="text-6xl font-thin leading-none">{data.failureCount}</div>
            </div>
          </div>
        </div>

        <div className="relative day-badge mb-2 overflow-hidden">
          {/* Orange gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF4D00]"></div>
          
          {/* Content layer with proper spacing */}
          <div className="relative flex items-center justify-between w-full">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-auto z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-4xl font-black tracking-tight z-10">DAY {data.currentDay}</span>
          </div>
        </div>

        <div className="relative w-full h-10 bg-white rounded-full overflow-hidden shadow-md">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black tracking-widest text-black z-10">PROGRESS BAR</span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 space-y-0">
        {data.todayRules.map((rule, index) => (
          <div
            key={rule.id}
            className={`flex items-center gap-3 py-2 border-b border-gray-800 ${
              index === data.todayRules.length - 1 ? 'border-b-0' : ''
            }`}
          >
            <div 
              onClick={() => toggleRule(rule.id)}
              className="rule-checkbox cursor-pointer"
            >
              {rule.completed && (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span 
              onClick={() => toggleRule(rule.id)}
              className="flex-1 text-base font-medium tracking-tight cursor-pointer"
            >
              {rule.text}
            </span>
            {rule.id === 1 && (
              <button
                onClick={handleCameraClick}
                className="p-2 hover:opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />

      <div className="notes-card flex-shrink-0">
        <h3 className="text-base font-bold mb-1 tracking-tight">DAILY NOTES</h3>
        <p className="text-xs text-gray-400 font-light mb-2">
          Write one thing you learned today or any thoughts you want.
        </p>
        <textarea
          value={data.todayNotes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder="Your thoughts..."
          className="w-full h-16 p-2 bg-black border border-gray-700 rounded-lg text-base resize-none focus:outline-none focus:border-[#FF4D00] font-geist-mono text-white mb-2 touch-manipulation"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={() => {
            if (data.todayNotes.trim()) {
              saveNote();
              alert('Note saved to Notes history!');
            } else {
              alert('Please write something first!');
            }
          }}
          className="w-full py-2 px-4 bg-white text-black text-sm font-bold rounded-lg transition-all duration-200 active:scale-95"
        >
          SAVE NOTES
        </button>
      </div>
    </>
  );

  const renderGalleryView = () => {
    const photos = getAllWorkoutPhotos();
    const photoEntries = Object.entries(photos).reverse();

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Workout Gallery</h2>
          {photoEntries.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p>No photos yet. Take your first workout photo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photoEntries.map(([date, photo]) => (
                <div 
                  key={date} 
                  onClick={() => setSelectedPhoto({ url: photo, date })}
                  className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img src={photo} alt={`Workout ${date}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                    <p className="text-xs font-light">{new Date(date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNotesView = () => {
    const notesHistory = data.history.filter(entry => entry.notes).reverse();

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Notes History</h2>
          {notesHistory.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <p>No notes yet. Start writing your journey!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notesHistory.map((entry, index) => {
                const isSaved = entry.saved || (!entry.completed && !entry.failed);
                const status = entry.completed ? 'Completed' : entry.failed ? 'Failed' : 'Saved';
                const statusColor = entry.completed ? 'bg-green-600' : entry.failed ? 'bg-red-600' : 'bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400]';
                
                return (
                  <div 
                    key={index} 
                    onClick={() => setSelectedNote({ 
                      text: entry.notes || '', 
                      date: entry.date,
                      status 
                    })}
                    className="notes-card cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded text-white font-bold ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{entry.notes}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - data.currentDay + 1);

    const days = [];
    for (let i = 0; i < 66; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = data.history.find(h => h.date === dateStr);
      days.push({
        date: dateStr,
        dayNumber: i + 1,
        completed: entry?.completed || false,
        failed: entry?.failed || false,
        isFuture: i >= data.currentDay
      });
    }

    return (
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">66 Day Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div
                key={day.date}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 ${
                  day.isFuture 
                    ? 'bg-gray-800 border-gray-700 opacity-50' 
                    : day.completed 
                    ? 'bg-green-600 border-green-400' 
                    : day.failed
                    ? 'bg-red-600 border-red-400'
                    : 'bg-gray-800 border-gray-600'
                }`}
              >
                <span className="text-xs font-bold">{day.dayNumber}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto pb-20">
        {currentView === 'today' && renderTodayView()}
        {currentView === 'gallery' && renderGalleryView()}
        {currentView === 'notes' && renderNotesView()}
        {currentView === 'calendar' && renderCalendarView()}
      </div>

      <div className="bottom-nav">
        <button 
          onClick={() => setCurrentView('today')}
          className={`nav-item ${currentView === 'today' ? 'text-[#FF4D00]' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs font-medium">Today</span>
        </button>

        <button 
          onClick={() => setCurrentView('gallery')}
          className={`nav-item ${currentView === 'gallery' ? 'text-[#FF4D00]' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">Gallery</span>
        </button>

        <button 
          onClick={() => setCurrentView('notes')}
          className={`nav-item ${currentView === 'notes' ? 'text-[#FF4D00]' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-xs font-medium">Notes</span>
        </button>

        <button 
          onClick={() => setCurrentView('calendar')}
          className={`nav-item ${currentView === 'calendar' ? 'text-[#FF4D00]' : 'text-gray-400'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">Calendar</span>
        </button>
      </div>

      {showFailConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4 border-2 border-gray-700">
            <h2 className="text-2xl font-bold">Reset to Day 1?</h2>
            <p className="text-base text-gray-300 font-light">
              This will reset your current streak. Your failure will be recorded in your progress history.
            </p>
            <div className="space-y-2">
              <button 
                onClick={handleFail} 
                className="w-full py-4 px-6 bg-red-600 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Yes, I failed
              </button>
              <button
                onClick={() => setShowFailConfirm(false)}
                className="w-full py-4 px-6 bg-gray-700 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-2xl w-full">
            <div className="relative">
              <img 
                src={selectedPhoto.url} 
                alt="Workout" 
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white mt-4 font-light">
              {new Date(selectedPhoto.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedNote(null)}
        >
          <div className="max-w-2xl w-full bg-[#1a1a1a] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold">
                  {new Date(selectedNote.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <span className={`text-xs px-2 py-1 rounded inline-block mt-2 text-white font-bold ${
                  selectedNote.status === 'Completed' ? 'bg-green-600' : 
                  selectedNote.status === 'Failed' ? 'bg-red-600' : 'bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400]'
                }`}>
                  {selectedNote.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-black rounded-lg p-4 border border-gray-700">
              <p className="text-base text-gray-200 whitespace-pre-wrap">{selectedNote.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Day Review Modal - Shows when new day starts */}
      {showDayReview && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full space-y-4 border-2 border-gray-700">
            <h2 className="text-2xl font-bold text-center">Day Review</h2>
            <p className="text-base text-gray-300 font-light text-center">
              How did yesterday go? Did you complete all your rules?
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleCompleteDay}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#FF6B35] via-[#FF4D00] to-[#E34400] text-black text-lg font-black rounded-xl active:scale-95 transition-transform shadow-md"
              >
                ✅ COMPLETED
              </button>
              <button
                onClick={() => setShowFailConfirm(true)}
                className="w-full py-4 px-6 bg-red-900 text-white text-lg font-light rounded-xl active:scale-95 transition-transform shadow-md border border-red-800"
              >
                ❌ FAILED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Confirmation Modal */}
      {showFailConfirm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4 border-2 border-gray-700">
            <h2 className="text-2xl font-bold">Reset to Day 1?</h2>
            <p className="text-base text-gray-300 font-light">
              This will reset your current streak. Your failure will be recorded in your progress history.
            </p>
            <div className="space-y-2">
              <button 
                onClick={handleFail} 
                className="w-full py-4 px-6 bg-red-600 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Yes, I failed
              </button>
              <button
                onClick={() => setShowFailConfirm(false)}
                className="w-full py-4 px-6 bg-gray-700 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}