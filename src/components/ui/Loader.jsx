import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading…', full = false }) {
  return (
    <div className={`loader ${full ? 'loader--full' : ''}`}>
      <Loader2 size={22} className="spin" />
      <span>{label}</span>
    </div>
  );
}
