'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  medicalRecords: any[];
  patientAddress: string;
}

export default function AIAssistant({ medicalRecords, patientAddress }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Medical Assistant. I can help you understand your medical records, answer health questions, and provide general medical information. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          medicalRecords: medicalRecords.map(r => ({
            type: r.recordType,
            date: new Date(Number(r.timestamp) * 1000).toLocaleDateString(),
            diagnosis: r.diagnosis || 'N/A',
            treatment: r.treatment || 'N/A'
          })),
          patientAddress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please make sure the OpenAI API key is configured correctly.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Summarize my medical history",
    "What patterns do you see in my records?",
    "Explain my latest diagnosis",
    "What preventive care should I consider?"
  ];

  return (
    <div className="glass-card p-6 h-[600px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white mb-2">🤖 AI Medical Assistant</h3>
        <p className="text-sm text-gray-400">
          Powered by OpenAI • Medical records are sent to OpenAI for analysis
        </p>
        <p className="text-xs text-yellow-500 mt-1">
          ⚠️ Your data is shared with OpenAI to provide AI assistance. Not for diagnostic purposes.
        </p>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(prompt)}
              className="text-sm glass-card px-3 py-2 hover:bg-white/10 transition-all text-gray-300 hover:text-white text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'glass-card text-gray-100'
              }`}
            >
              {msg.role === 'assistant' && <span className="text-2xl mr-2">🤖</span>}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass-card p-4 rounded-2xl">
              <span className="text-2xl mr-2">🤖</span>
              <span className="text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your health or medical records..."
          className="glass-input flex-1 resize-none"
          rows={2}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="btn-primary px-6 self-end disabled:opacity-50"
        >
          {loading ? '...' : '📤'}
        </button>
      </div>
    </div>
  );
}
