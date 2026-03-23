import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, className = '' }) => {
  return (
    <div 
      onClick={onChange}
      className={`relative inline-flex items-center justify-center w-5 h-5 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange();
        }
      }}
    >
      {checked ? (
        // Checked State (Blue background with white check)
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="16" height="16" rx="2" fill="#2383E2" />
          <path d="M6.71429 12.2852L14 4.9995L12.7143 3.71436L6.71429 9.71378L3.28571 6.2831L2 7.57092L6.71429 12.2852Z" fill="white" />
        </svg>
      ) : (
        // Unchecked State (White background with border)
        <div className="w-[18px] h-[18px] bg-white border-2 border-gray-300 rounded hover:bg-gray-50 transition-colors"></div>
      )}
    </div>
  );
};

export default Checkbox;