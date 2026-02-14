
import React, { useState, useEffect, useRef } from 'react';
import { Friend, CityData } from './types';
import { STORAGE_KEY } from './constants';
import { getZonedTime, getInterpolatedColor } from './services/timeService';
import AnalogClock from './components/AnalogClock';
import { AddCityModal, EditFriendModal } from './components/Modals';

const App: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [manualOffset, setManualOffset] = useState<number>(0);
  const [showWorkMode, setShowWorkMode] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [currentFriendName, setCurrentFriendName] = useState('');

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFriends(parsed.friends || []);
        setSelectedId(parsed.selectedId || '');
        setShowWorkMode(parsed.showWorkMode || false);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    } else {
      const initialFriend: Friend = { id: '1', name: 'Taiwan', cityName: 'Taiwan', timezone: 'Asia/Taipei' };
      setFriends([initialFriend]);
      setSelectedId('1');
    }
  }, []);

  // Save on changes
  useEffect(() => {
    if (friends.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        friends,
        selectedId,
        showWorkMode
      }));
    }
  }, [friends, selectedId, showWorkMode]);

  // Update logic: Handle background and header text
  // We use a frequent interval for normal time, but manualOffset changes will also trigger this
  useEffect(() => {
    const updateHeaderAndBg = () => {
      const now = new Date();
      const travelTime = new Date(now.getTime() + manualOffset * 60000);
      const focus = friends.find(f => f.id === selectedId) || friends[0];
      
      if (focus) {
        const zoned = getZonedTime(travelTime, focus.timezone);
        setCurrentTimeStr(`${String(zoned.hour).padStart(2, '0')}:${String(zoned.minute).padStart(2, '0')}`);
        setCurrentFriendName(focus.name);
        // Instant background color update
        document.body.style.backgroundColor = getInterpolatedColor(zoned.hour + zoned.minute / 60);
      }
    };

    updateHeaderAndBg(); // Run immediately on dependency change
    const ticker = setInterval(updateHeaderAndBg, 100);
    return () => clearInterval(ticker);
  }, [friends, selectedId, manualOffset]);

  const addFriend = (city: CityData) => {
    if (friends.length >= 8) {
      alert("Maximum of 8 friends allowed.");
      return;
    }
    const newFriend: Friend = {
      id: Date.now().toString(),
      name: city.name,
      cityName: city.name,
      timezone: city.zone
    };
    setFriends([...friends, newFriend]);
    setSelectedId(newFriend.id);
    setIsAddModalOpen(false);
  };

  const handleUpdateName = (id: string, newName: string) => {
    setFriends(friends.map(f => f.id === id ? { ...f, name: newName || f.cityName } : f));
    setEditingFriend(null);
  };

  const handleDelete = (id: string) => {
    if (friends.length <= 1) return;
    const filtered = friends.filter(f => f.id !== id);
    setFriends(filtered);
    if (selectedId === id) setSelectedId(filtered[0].id);
    setEditingFriend(null);
  };

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFriendClick = (f: Friend) => {
    setSelectedId(f.id);
  };

  const handleFriendContextMenu = (e: React.MouseEvent, f: Friend) => {
    e.preventDefault();
    setEditingFriend(f);
  };

  const handleFriendTouchStart = (f: Friend) => {
    longPressTimer.current = setTimeout(() => {
      setEditingFriend(f);
    }, 600);
  };

  const handleFriendTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-5 text-white transition-colors duration-200 ease-out">
      {/* Header */}
      <div className="mt-10 mb-4 text-center h-28 flex flex-col justify-center">
        <h1 className="text-7xl font-extralight tracking-tighter m-0 leading-none">
          {currentTimeStr}
        </h1>
        <p className="mt-4 text-lg font-medium tracking-[0.2em] opacity-60 uppercase">
          {currentFriendName}
        </p>
      </div>

      {/* Clock Canvas */}
      <div className="relative my-2 z-10">
        <AnalogClock 
          friends={friends}
          selectedId={selectedId}
          manualOffset={manualOffset}
          onOffsetChange={(delta) => setManualOffset(prev => prev + delta)}
          showWorkMode={showWorkMode}
          onDraggingChange={setIsDragging}
        />
      </div>

      {/* Controls */}
      <div className={`w-full max-w-lg flex flex-col items-center gap-8 z-20 transition-opacity duration-300 ${isDragging ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-wrap justify-center gap-3">
          {friends.map(f => (
            <button
              key={f.id}
              onClick={() => handleFriendClick(f)}
              onContextMenu={(e) => handleFriendContextMenu(e, f)}
              onTouchStart={() => handleFriendTouchStart(f)}
              onTouchEnd={handleFriendTouchEnd}
              className={`
                px-6 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md text-sm whitespace-nowrap
                ${f.id === selectedId 
                  ? 'bg-white text-black border-white font-bold scale-105' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }
              `}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-2xl hover:bg-white/20 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="fa-solid fa-plus"></i>
          </button>
          
          <button 
            className={`
              px-6 py-3 rounded-full border text-sm font-bold tracking-widest transition-all
              ${showWorkMode 
                ? 'border-orange-500 text-orange-500 bg-orange-500/10' 
                : 'border-white/20 text-white/60 bg-white/5'
              }
            `}
            onClick={() => setShowWorkMode(!showWorkMode)}
          >
            WORK MODE
          </button>

          <button 
            className="px-6 py-3 rounded-full border border-red-500/30 text-red-500 text-sm bg-red-500/5 hover:bg-red-500/10 transition-all font-medium"
            onClick={() => setManualOffset(0)}
          >
            NOW
          </button>
        </div>

        <div className="text-center opacity-40">
          <p className="text-[10px] tracking-[0.15em] uppercase font-medium leading-relaxed">
            Spin the clock to travel time<br/>
            Hold / Right-click a button to edit label | Work Mode from 9:00-17:00
          </p>
        </div>
      </div>

      {/* Modals */}
      <AddCityModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addFriend} 
      />
      <EditFriendModal 
        isOpen={!!editingFriend} 
        friend={editingFriend}
        onClose={() => setEditingFriend(null)}
        onSave={handleUpdateName}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default App;
