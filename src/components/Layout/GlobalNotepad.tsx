import React, { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';
import useAppStore from '../../store';

const GlobalNotepad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Charger la note depuis le localStorage
  useEffect(() => {
    const savedNote = localStorage.getItem('global_note');
    if (savedNote) {
      setContent(savedNote);
    }
  }, []);

  // Sauvegarder la note dans le localStorage
  const saveNote = () => {
    localStorage.setItem('global_note', content);
  };

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(saveNote, 30000);
    return () => clearInterval(timer);
  }, [content]);

  // Gestion du drag and drop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.className.includes('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.min(Math.max(0, e.clientX - dragStart.x), window.innerWidth - 380);
      const newY = Math.min(Math.max(0, e.clientY - dragStart.y), window.innerHeight - 400);
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Notes globales"
      >
        <StickyNote className="w-6 h-6 text-orange-500" />
      </button>
    );
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl overflow-hidden"
      style={{
        width: '380px',
        height: '400px',
        top: position.y,
        left: position.x,
      }}
    >
      {/* Barre de titre avec drag handle */}
      <div
        className="drag-handle flex justify-between items-center bg-orange-500 text-white p-3 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-medium">Notes Globales</h3>
        <button
          onClick={() => {
            saveNote();
            setIsOpen(false);
          }}
          className="hover:text-orange-200"
        >
          ×
        </button>
      </div>

      {/* Zone de texte */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={saveNote}
        className="w-full h-[calc(100%-56px)] p-4 resize-none focus:outline-none"
        placeholder="Écrivez vos notes ici..."
      />
    </div>
  );
};

export default GlobalNotepad;
