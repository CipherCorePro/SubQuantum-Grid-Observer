
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, WeightingStrategyType } from './types';
import { DEFAULT_PROMPT, INITIAL_SETTINGS } from './constants';
import * as bookService from './services/bookService';
import * as textProcessorService from './services/textProcessorService';
import { generateText as geminiGenerateText } from './services/geminiService';

import SettingsPanel from './components/SettingsPanel';
import BookDisplay from './components/BookDisplay';
import ActionButton from './components/ActionButton';
import LoadingIcon from './components/LoadingIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import TrashIcon from './components/icons/TrashIcon';
import SparklesIcon from './components/icons/SparklesIcon';


const App: React.FC = () => {
  const [bookContent, setBookContent] = useState<string>("");
  const [userInstructionForNextSegment, setUserInstructionForNextSegment] = useState<string>(DEFAULT_PROMPT); // Renamed for clarity
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadedBook = bookService.loadBook();
    setBookContent(loadedBook);
    
    const storedSettings = localStorage.getItem('aiStoryWeaver_settings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Failed to parse stored settings:", e);
        localStorage.setItem('aiStoryWeaver_settings', JSON.stringify(INITIAL_SETTINGS)); // Reset to default if corrupt
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aiStoryWeaver_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSettingsChange = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = async () => {
    if (!userInstructionForNextSegment.trim()) {
      setError("Instruction cannot be empty."); // Updated error message
      return;
    }
    if (!process.env.API_KEY) {
        setError("Gemini API Key is not configured. Please set the API_KEY environment variable. Generation is disabled.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let currentSettings = { ...settings };
      // Dynamic window size adjustment can still be useful based on instruction length
      if (settings.dynamicWindowSize && textProcessorService.countWords(userInstructionForNextSegment) < 100) { 
        currentSettings.windowSize = settings.windowSize * 2;
      }

      const context = textProcessorService.getContext(bookContent, currentSettings);
      const generatedText = await geminiGenerateText(userInstructionForNextSegment, context);
      
      const updatedBookContent = bookService.appendToBook(bookContent, generatedText);
      setBookContent(updatedBookContent);
      setUserInstructionForNextSegment(""); // Clear instruction after successful generation
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "An unknown error occurred during text generation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearBook = () => {
    bookService.clearBook();
    setBookContent("");
    setError(null);
  };

  const handleDownloadBook = () => {
    bookService.downloadBook(bookContent, "ai_story_weaver_book.txt");
  };
  
  const handleBookContentChange = (newContent: string) => {
    setBookContent(newContent);
    bookService.saveBook(newContent); // Save changes made directly in textarea
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100">
      <header className="p-4 shadow-lg bg-slate-800/50 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpenIcon className="w-8 h-8 text-sky-400" />
            <h1 className="text-2xl font-bold text-sky-400">AI Story Weaver</h1>
          </div>
          <button 
            onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-slate-700 transition-colors"
            aria-label="Toggle settings panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75m-9.75 6h9.75M3.75 6H7.5m3 12V6.75M3.75 12h3.75m-3.75 6h3.75M3.75 18v-2.25" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        <div className={`lg:w-1/3 xl:w-1/4 ${isSettingsPanelOpen ? 'block' : 'hidden'} lg:block`}>
          <SettingsPanel 
            settings={settings} 
            onSettingsChange={handleSettingsChange}
            isOpen={isSettingsPanelOpen}
            onToggle={() => setIsSettingsPanelOpen(false)}
          />
        </div>
        
        <div className="flex-grow lg:w-2/3 xl:w-3/4 flex flex-col gap-6">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 flex-grow flex flex-col min-h-[300px] md:min-h-[400px] lg:min-h-[calc(100vh-250px)] max-h-[calc(100vh-200px)]">
            <BookDisplay content={bookContent} onContentChange={handleBookContentChange} isLoading={isLoading} />
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
            {error && (
              <div className="mb-4 p-3 bg-red-700/30 border border-red-500 text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
            <textarea
              value={userInstructionForNextSegment}
              onChange={(e) => setUserInstructionForNextSegment(e.target.value)}
              placeholder="Instruct AI on what to write next (e.g., 'Describe the hero's arrival at the castle.' or 'The villain reveals their motive.')"
              rows={3}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 resize-none shadow-inner mb-4"
              disabled={isLoading}
              aria-label="Instruction for next story segment"
            />
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <ActionButton
                onClick={handleGenerate}
                isLoading={isLoading}
                disabled={isLoading || !process.env.API_KEY}
                icon={<SparklesIcon className="w-5 h-5" />}
                variant="primary"
                className="flex-grow sm:flex-grow-0"
              >
                Generate Next
              </ActionButton>
              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={handleClearBook}
                  disabled={isLoading}
                  icon={<TrashIcon className="w-5 h-5" />}
                  variant="danger"
                >
                  Clear Book
                </ActionButton>
                <ActionButton
                  onClick={handleDownloadBook}
                  disabled={isLoading || !bookContent}
                  icon={<DownloadIcon className="w-5 h-5" />}
                  variant="secondary"
                >
                  Download
                </ActionButton>
              </div>
            </div>
             {!process.env.API_KEY && (
                <p className="text-xs text-amber-400 mt-3">
                    Note: API_KEY environment variable is not set. Text generation is disabled.
                </p>
            )}
          </div>
        </div>
      </main>
      
      <footer className="text-center p-4 text-sm text-slate-500 border-t border-slate-700/50">
        Powered by Gemini API. Created with React & Tailwind CSS.
      </footer>
    </div>
  );
};

export default App;
