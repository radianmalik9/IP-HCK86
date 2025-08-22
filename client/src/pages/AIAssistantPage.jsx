import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { aiAPI } from '../apis/services';
import useDocumentTitle from '../utils/useDocumentTitle';

export default function AIAssistantPage() {
  useDocumentTitle('AI Assistant · Smart Learning');
  const { user } = useSelector((s) => s.auth);
  const firstName = useMemo(() => (user?.name ? String(user.name).split(' ')[0] : null), [user]);

  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [concept, setConcept] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem('ai-chat-history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ai-chat-history', JSON.stringify(messages));
  }, [messages]);

  // Reset chat when leaving the page so it always starts fresh on revisit
  useEffect(() => {
    return () => {
      localStorage.removeItem('ai-chat-history');
    };
  }, []);

  const chatContainerRef = useRef(null);

  // Auto-scroll hanya area chat, bukan seluruh page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const ask = useMutation({
    mutationFn: async (payload) => (await aiAPI.askQuestion(payload)).data.data,
    retry: (failureCount, error) => error?.response?.status === 429 && failureCount < 1,
    retryDelay: 1500,
  });

  const explain = useMutation({
    mutationFn: async () => (await aiAPI.explainConcept(concept, context)).data.data,
    retry: (failureCount, error) => error?.response?.status === 429 && failureCount < 1,
    retryDelay: 1500,
  });

  const suggestions = useMemo(
    () => [
      'Jelaskan konsep Big O Notation secara sederhana dengan contoh.',
      'Buat rangkuman 5 poin tentang React hooks dan kapan dipakai.',
      'Rancang rencana belajar 7 hari untuk belajar SQL dari nol.',
      'Berikan 3 latihan soal tentang struktur data stack & queue.',
    ],
    []
  );

  const sendQuestion = async () => {
    const q = question.trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: 'user', content: q, ts: Date.now() }]);
    setQuestion('');

    // Optimistic typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [...prev, { role: 'ai-typing', content: 'typing…', ts: typingId }]);
    try {
      const res = await ask.mutateAsync({ question: q, context: context || undefined });
      setMessages((prev) =>
        prev
          .filter((m) => m.ts !== typingId)
          .concat({ role: 'ai', content: res.answer || 'Tidak ada jawaban.', ts: Date.now() })
      );
    } catch (err) {
      // Remove typing and show error bubble
      setMessages((prev) => prev.filter((m) => m.ts !== typingId));
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || 'Permintaan AI gagal. Coba lagi.';
      const hint = status === 429 ? 'Terlalu sering. Tunggu 10-15 detik lalu coba lagi.' : '';
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: `${msg}${hint ? `\n\nTip: ${hint}` : ''}`, ts: Date.now(), isError: true },
      ]);
    }
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!ask.isPending) sendQuestion();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai-chat-history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Learning Assistant</h1>
                <p className="text-gray-600">
                  {firstName ? `Halo, ${firstName}! ` : ''}Tanya apa saja seputar belajar dan dapatkan jawaban cerdas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">AI Online</span>
              </div>
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" 
                onClick={clearChat} 
                disabled={messages.length === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <section className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{height: 'calc(100vh - 220px)'}}>
              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0" 
                aria-live="polite"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Mulai Percakapan</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      Tanyakan apa saja tentang pembelajaran, konsep, atau butuh bantuan memahami materi tertentu.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                      {suggestions.slice(0, 4).map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="p-4 text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-colors group"
                          onClick={() => setQuestion(suggestion)}
                        >
                          <div className="text-sm text-gray-700 group-hover:text-blue-700 line-clamp-2">
                            {suggestion}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((m, idx) => (
                  <MessageBubble key={idx} role={m.role} isError={m.isError}>
                    {m.role === 'ai' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                  </MessageBubble>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Ketik pertanyaan Anda di sini... (Ctrl+Enter untuk kirim)"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={onKeyDown}
                      disabled={ask.isPending}
                      rows="2"
                    />
                  </div>
                  <button 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
                    onClick={sendQuestion} 
                    disabled={ask.isPending || !question.trim()}
                  >
                    {ask.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Mengirim
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Kirim
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      checked={showContext} 
                      onChange={(e) => setShowContext(e.target.checked)} 
                    />
                    Tambahkan konteks pembelajaran
                  </label>
                  
                  {ask.isError && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {ask.error?.response?.data?.message || 'Terjadi kesalahan. Coba lagi.'}
                    </span>
                  )}
                </div>
                
                {showContext && (
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-3"
                    placeholder="Konteks: tingkat kesulitan, materi spesifik, atau batasan jawaban"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Sidebar Tools */}
          <aside className="xl:col-span-1 space-y-6">
            {/* Quick Explain Tool */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Jelaskan Konsep</h3>
                  <p className="text-sm text-gray-600">Penjelasan singkat dan jelas</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  placeholder="Contoh: Closure di JavaScript" 
                  value={concept} 
                  onChange={(e) => setConcept(e.target.value)} 
                />
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  placeholder="Konteks (opsional)" 
                  value={context} 
                  onChange={(e) => setContext(e.target.value)} 
                />
                
                <button 
                  disabled={explain.isPending || !concept.trim()} 
                  onClick={() => explain.mutate()} 
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  {explain.isPending ? 'Memproses...' : 'Jelaskan'}
                </button>
                
                {explain.data && (
                  <button 
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" 
                    onClick={() => setQuestion(`Jelaskan: ${concept}.\n\n${explain.data.explanation}`)}
                  >
                    Masukkan ke Chat
                  </button>
                )}
              </div>
              
              {explain.isError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-red-700">
                      {explain.error?.response?.data?.message || 'Permintaan gagal'}
                      {explain.error?.response?.status === 429 && (
                        <div className="text-xs mt-1">Tunggu 10-15 detik lalu ulangi.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {explain.data && (
                <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-sm prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{explain.data.explanation}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Tips Bertanya</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Spesifik: sebutkan level, tujuan, dan batasan yang jelas</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Berikan konteks: kurikulum, materi, atau contoh nyata</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Minta format: bullet point, tabel, atau langkah-langkah</span>
                </div>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Pertanyaan Populer</h3>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setQuestion(suggestion)}
                  >
                    {suggestion.slice(0, 50)}...
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, children, isError }) {
  const isUser = role === 'user';
  const isTyping = role === 'ai-typing';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}
      
      <div className={`max-w-[95%] md:max-w-[85%] lg:max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-600 text-white ml-auto' 
          : isError 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-gray-100 text-gray-900'
      }`}>
        {isTyping ? (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 mr-2">AI sedang mengetik</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        ) : (
          <div className={`whitespace-pre-wrap break-words ${isUser ? 'text-white' : 'text-gray-900'} prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
            <div className="ai-response-content">
              {children}
            </div>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
