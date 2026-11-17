import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      <div className="empty-icon"><Icon size={compact ? 24 : 30} /></div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
