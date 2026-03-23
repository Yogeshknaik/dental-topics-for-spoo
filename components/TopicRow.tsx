import React from 'react';
import { Topic, ColumnType, SUBJECT_COLORS } from '../types';
import Checkbox from './Checkbox';

interface TopicRowProps {
  topic: Topic;
  progress: {
    m10: boolean;
    m5: boolean;
    m2: boolean;
    revise: boolean;
    finalRevise: boolean;
  };
  onToggle: (id: string, column: ColumnType) => void;
}

const TopicRow: React.FC<TopicRowProps> = ({ topic, progress, onToggle }) => {
  const badgeColorClass = SUBJECT_COLORS[topic.subject] || 'bg-gray-100 text-gray-600';

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors group">
      <td className="px-2 md:py-3 py-2 text-[11px] font-bold text-gray-400 w-12 text-center sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[inset_-1px_0_0_0_#e5e7eb]">{topic.sNo}</td>
      <td className="px-3 md:py-3 py-2 text-sm text-gray-900 font-medium md:min-w-[150px] min-w-[120px] border-r border-gray-100">
        <div className="relative inline-block max-w-[200px] md:max-w-[400px]">
          <a 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors flex items-center gap-2 leading-relaxed line-clamp-2"
          >
            {topic.title}
          </a>
          {progress.finalRevise && (
            <span className="absolute -top-1 -right-4 flex items-center justify-center w-3.5 h-3.5 bg-green-500 rounded-full shadow-sm">
              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
      </td>
      <td className="px-2 md:py-3 py-2 text-[11px] whitespace-nowrap border-r border-gray-100">
        <div className="flex justify-center">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider ${badgeColorClass}`}>
            {topic.subject}
          </span>
        </div>
      </td>
      <td className="px-1 md:py-3 py-2 text-center w-20 border-r border-gray-100">
        <Checkbox 
          checked={progress.m10} 
          onChange={() => onToggle(topic.id, ColumnType.M10)} 
          className="md:scale-100 scale-90"
        />
      </td>
      <td className="px-1 md:py-3 py-2 text-center w-20 border-r border-gray-100">
        <Checkbox 
          checked={progress.m5} 
          onChange={() => onToggle(topic.id, ColumnType.M5)} 
          className="md:scale-100 scale-90"
        />
      </td>
      <td className="px-1 md:py-3 py-2 text-center w-20 border-r border-gray-100">
        <Checkbox 
          checked={progress.m2} 
          onChange={() => onToggle(topic.id, ColumnType.M2)} 
          className="md:scale-100 scale-90"
        />
      </td>
      <td className="px-1 md:py-3 py-2 text-center w-20 border-r border-gray-100">
        <Checkbox 
          checked={progress.revise} 
          onChange={() => onToggle(topic.id, ColumnType.REVISE)} 
          className="md:scale-100 scale-90"
        />
      </td>
      <td className="px-1 md:py-3 py-2 text-center w-24">
        <Checkbox 
          checked={progress.finalRevise} 
          onChange={() => onToggle(topic.id, ColumnType.FINAL_REVISE)} 
          className="md:scale-100 scale-90"
        />
      </td>
    </tr>
  );
};

export default React.memo(TopicRow);