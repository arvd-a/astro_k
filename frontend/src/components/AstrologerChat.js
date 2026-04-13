'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchChat } from '@/lib/api';

// Suggested starter questions
const STARTER_QUESTIONS = [
  "What are the key strengths in my chart?",
  "Tell me about my career prospects",
  "What does my Moon placement indicate?",
  "Are there any significant Yogas?",
  "What remedies do you suggest?",
];

export default function AstrologerChat({ chartData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Cap conversation history to last 10 messages to control payload size
      const recentMessages = updatedMessages.slice(-10);
      const data = await fetchChat(chartData, recentMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I could not reach the astrologer service. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStarterClick = (question) => {
    sendMessage(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        id="open-chat-btn"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FBBF24, #D97706)',
          border: 'none',
          color: '#141419',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(251, 191, 36, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          zIndex: 1000,
        }}
        onMouseEnter={e => { e.target.style.transform = 'scale(1.1)'; e.target.style.boxShadow = '0 6px 32px rgba(251, 191, 36, 0.6)'; }}
        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 24px rgba(251, 191, 36, 0.4)'; }}
        title="Ask the Astrologer"
      >
        ✦
      </button>
    );
  }

  return (
    <div
      id="astrologer-chat-panel"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '400px',
        maxWidth: 'calc(100vw - 48px)',
        height: '560px',
        maxHeight: 'calc(100vh - 48px)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        background: 'rgba(20, 20, 25, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(251, 191, 36, 0.25)',
        boxShadow: '0 8px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.1)',
        animation: 'chatSlideUp 0.35s ease forwards',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(217, 119, 6, 0.1))',
        borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>✦</span>
          <div>
            <div style={{ fontWeight: 600, color: '#FBBF24', fontSize: '0.95rem' }}>
              Vedic Astrologer
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.8)', marginTop: '1px' }}>
              AI-powered • Reading your chart
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          id="close-chat-btn"
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.target.style.background = 'none'}
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Welcome + Starters if no messages yet */}
        {messages.length === 0 && (
          <div className="fade-in">
            <div style={{
              padding: '14px 16px',
              background: 'rgba(251, 191, 36, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(251, 191, 36, 0.12)',
              fontSize: '0.85rem',
              color: '#E2E8F0',
              lineHeight: 1.6,
              marginBottom: '12px',
            }}>
              🔮 Namaste! I am your Vedic astrologer. I have studied your birth chart in detail.
              Ask me anything about your planetary placements, Yogas, Dashas, career, relationships, or spiritual path.
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px', fontWeight: 500 }}>
              Suggested questions:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {STARTER_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleStarterClick(q)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#CBD5E1',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                    e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                    e.target.style.color = '#FBBF24';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.color = '#CBD5E1';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0.1))'
                : 'rgba(255, 255, 255, 0.06)',
              border: msg.role === 'user'
                ? '1px solid rgba(74, 222, 128, 0.25)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              color: msg.role === 'user' ? '#BBF7D0' : '#E2E8F0',
              fontSize: '0.83rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '12px 12px 12px 4px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FBBF24',
              fontSize: '0.83rem',
            }}>
              <span className="animate-pulse">✦ Reading the stars...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your chart..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#F8FAFC',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        />
        <button
          type="submit"
          id="chat-send-btn"
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #FBBF24, #D97706)'
              : 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: input.trim() && !loading ? '#141419' : '#64748B',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
