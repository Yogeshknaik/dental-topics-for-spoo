import React from 'react';

interface FilterDropdownProps {
  items: string[];
  selectedItem: string;
  onChange: (item: string) => void;
  allLabel?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ items, selectedItem, onChange, allLabel = 'All Subjects' }) => {
  return (
    <div className="relative inline-block w-full sm:w-auto min-w-[150px]">
      <select
        value={selectedItem}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-colors"
      >
        <option value="all">{allLabel}</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {/* Custom arrow icon to replace default select arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
};

export default FilterDropdown;