import React from 'react';
import { MessageSquareText } from 'lucide-react';

export default function FormFeedback({ feedbackList }) {
  if (!feedbackList || feedbackList.length === 0) return null;

  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 w-full">
      <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
        <MessageSquareText size={18} className="text-blue-500" />
        Form Feedback
      </h3>
      <ul className="space-y-2">
        {feedbackList.map((msg, idx) => (
          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>{msg}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
