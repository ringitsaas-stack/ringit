'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Agent {
  id: string;
  businessName: string;
  industry: string;
  tone: string;
  services: string;
}

interface ChatbotTabProps {
  currentAgent: Agent;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export default function ChatbotTab({ currentAgent }: ChatbotTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when agent changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'agent',
        text: `Hello! Thank you for reaching out to ${currentAgent.businessName}. I'm your AI receptionist. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentAgent]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI receptionist response after 1.5 seconds
    setTimeout(() => {
      let reply = '';
      const lowerInput = userMsg.text.toLowerCase();

      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        reply = `Hi there! Welcome to ${currentAgent.businessName}. We specialize in ${currentAgent.industry.toLowerCase()} services. How may I assist you?`;
      } else if (lowerInput.includes('services') || lowerInput.includes('do you offer') || lowerInput.includes('what do you do')) {
        reply = `For ${currentAgent.businessName}, we offer several services including: ${currentAgent.services || 'general support and customer care'}. Is there a specific service you'd like to book or ask about?`;
      } else if (lowerInput.includes('tone') || lowerInput.includes('personality')) {
        reply = `I am programmed to be "${currentAgent.tone || 'warm and professional'}"! I always aim to make our customers feel valued.`;
      } else if (lowerInput.includes('appointment') || lowerInput.includes('book') || lowerInput.includes('schedule')) {
        reply = `I would love to help you book an appointment. Could you please provide your name, preferred date, and the service you are looking for?`;
      } else {
        reply = `I understand. As the receptionist for ${currentAgent.businessName}, I can help you with questions about our ${currentAgent.industry.toLowerCase()} practice or write down your inquiry. Let me know how you'd like to proceed!`;
      }

      const agentMsg: Message = {
        id: Math.random().toString(),
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border/60 bg-card/45 flex flex-col h-[520px] max-w-3xl mx-auto animate-fade-in-up">
      {/* Playpen Header */}
      <div className="border-b border-border/40 pb-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            Chatbot Playpen
            <span className="w-1.5 h-1.5 rounded-full bg-foreground-blue animate-pulse" />
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Test the live receptionist behavior for <strong className="text-foreground">{currentAgent.businessName}</strong>
          </p>
        </div>
        <div className="bg-foreground-blue/10 text-foreground-blue text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
          {currentAgent.tone}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 pr-1 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user' ? 'bg-foreground-blue text-white' : 'bg-secondary border border-border'
            }`}>
              {msg.sender === 'user' ? 'U' : 'R'}
            </div>
            
            {/* Text Bubble */}
            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-foreground-blue text-white rounded-tr-none shadow-md shadow-foreground-blue/5'
                : 'bg-card border border-border/80 text-foreground rounded-tl-none'
            }`}>
              <p>{msg.text}</p>
              <span className={`text-[8px] mt-1.5 block text-right font-medium ${
                msg.sender === 'user' ? 'text-white/60' : 'text-muted-foreground'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[80%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold">
              R
            </div>
            <div className="bg-card border border-border/80 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="border-t border-border/40 pt-4 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Chat with ${currentAgent.businessName}...`}
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground-blue transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="bg-foreground-blue hover:bg-foreground-blue/90 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
