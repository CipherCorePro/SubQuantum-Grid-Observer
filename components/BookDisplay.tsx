
import React from 'react';

interface BookDisplayProps {
  content: string;
  onContentChange: (newContent: string) => void;
  isLoading: boolean;
}

const BookDisplay: React.FC<BookDisplayProps> = ({ content, onContentChange, isLoading }) => {
  return (
    <div className="flex flex-col h-full">
      <label htmlFor="bookContent" className="block text-lg font-semibold text-sky-400 mb-2">Book Content</label>
      <textarea
        id="bookContent"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Your story will appear here..."
        readOnly={isLoading}
        className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-md shadow-inner focus:ring-sky-500 focus:border-sky-500 text-slate-100 resize-none leading-relaxed"
      />
    </div>
  );
};

export default BookDisplay;
    