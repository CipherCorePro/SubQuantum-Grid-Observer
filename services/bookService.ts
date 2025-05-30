
const BOOK_STORAGE_KEY = 'aiStoryWeaver_bookContent';

export const loadBook = (): string => {
  return localStorage.getItem(BOOK_STORAGE_KEY) || "";
};

export const saveBook = (content: string): void => {
  localStorage.setItem(BOOK_STORAGE_KEY, content);
};

export const appendToBook = (currentContent: string, newText: string): string => {
  const updatedContent = `${currentContent.trim()}\n\n${newText.trim()}`.trim();
  saveBook(updatedContent);
  return updatedContent;
};

export const clearBook = (): void => {
  localStorage.removeItem(BOOK_STORAGE_KEY);
};

export const downloadBook = (content: string, filename: string = "book.txt"): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
    