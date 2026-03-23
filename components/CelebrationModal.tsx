import React, { useEffect } from 'react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnName: string;
  message: string;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ 
  isOpen, 
  onClose, 
  columnName,
  message 
}) => {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Confetti Effect */}
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-bounceIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Trophy Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🎉 Congratulations, Spoo! 🎉
        </h2>

        {/* Column Name */}
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            {columnName} Complete!
          </span>
        </div>

        {/* Message */}
        <p className="text-gray-700 text-center text-lg font-medium mb-6">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 text-white font-semibold bg-gradient-to-r from-green-500 to-blue-500 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Keep Going! 💪
        </button>
      </div>
    </div>
  );
};

export default CelebrationModal;
