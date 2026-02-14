
import React, { useState, useEffect } from 'react';
import { ALL_CITIES } from '../constants';
import { CityData, Friend } from '../types';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (city: CityData) => void;
}

export const AddCityModal: React.FC<AddCityModalProps> = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl" onClick={onClose}>
      <div className="w-[85%] max-w-[350px] max-h-[80vh] bg-white/10 border border-white/20 rounded-[30px] p-6 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-light text-center text-white mb-6">Add City</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {ALL_CITIES.map((city, idx) => (
            <div 
              key={idx} 
              className="py-4 border-b border-white/10 flex justify-between items-center cursor-pointer active:bg-white/20 transition-colors"
              onClick={() => onAdd(city)}
            >
              <span className="text-white text-lg">{city.name}</span>
              <span className="text-white/40 text-sm uppercase">{city.zone.split('/')[0]}</span>
            </div>
          ))}
        </div>
        <button 
          className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl h-12 transition-colors font-medium border border-white/10"
          onClick={onClose}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};

interface EditFriendModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export const EditFriendModal: React.FC<EditFriendModalProps> = ({ friend, isOpen, onClose, onSave, onDelete }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (friend) setName(friend.name);
  }, [friend]);

  if (!isOpen || !friend) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl" onClick={onClose}>
      <div className="w-[85%] max-w-[350px] bg-white/10 border border-white/20 rounded-[30px] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-light text-center text-white mb-2">Edit {friend.cityName}</h3>
        <p className="text-white/40 text-center text-sm mb-6 uppercase tracking-wider">Assign a custom label</p>
        
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mom, IT Team, My Boss"
          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/40 mb-6 transition-colors"
          autoFocus
        />

        <div className="flex flex-col gap-3">
          <button 
            className="w-full bg-orange-400/30 border border-orange-400/40 text-orange-100 hover:bg-orange-400/40 rounded-xl h-12 transition-all duration-300 font-normal"
            onClick={() => onSave(friend.id, name)}
          >
            Save Changes
          </button>
          <div className="flex gap-3">
             <button 
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl h-12 transition-colors font-normal text-sm"
              onClick={() => onDelete(friend.id)}
            >
              Delete
            </button>
            <button 
              className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 border border-white/10 transition-colors text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
