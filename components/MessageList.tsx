import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <p className="text-xl mb-2">👋 Welcome to Privet AI</p>
        <p className="text-sm">Start the session to practice your Russian.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-700 text-slate-100 rounded-bl-none'
            }`}
          >
            <p className="text-sm font-medium opacity-70 mb-1 text-xs uppercase tracking-wider">
              {msg.role === 'user' ? 'You' : 'Anya (Tutor)'}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};