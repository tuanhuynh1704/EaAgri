import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../api/api-chatbot';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

const FAQS = [
  {
    icon: 'ri-leaf-line',
    title: 'Sầu riêng vàng lá',
    answer: 'Hiện tượng vàng lá trên sầu riêng có thể do thiếu trung vi lượng (như Magie, Kẽm), úng nước ở rễ hoặc do nấm Phytophthora tấn công. Nên kiểm tra độ ẩm đất và bộ rễ trước tiên.'
  },
  {
    icon: 'ri-sun-line',
    title: 'Kỹ thuật ra hoa',
    answer: 'Để sầu riêng ra hoa đồng loạt, cần tạo khô hạn (siết nước) từ 20-30 ngày kết hợp phun MKP (0-52-34) để chặn đọt non và kích mầm hoa.'
  },
  {
    icon: 'ri-seedling-line',
    title: 'Rụng trái non',
    answer: 'Rụng trái non thường do cạnh tranh dinh dưỡng giữa đọt non và trái, hoặc do sốc nhiệt/nước. Giải pháp: Phun chặn đọt và bổ sung Bo, Canxi qua lá.'
  },
  {
    icon: 'ri-calendar-todo-line',
    title: 'Lịch thu hoạch',
    answer: 'Tùy theo giống, sầu riêng Ri6 thu hoạch sau 100-105 ngày từ khi xả nhụy, Monthong thu hoạch sau 115-120 ngày.'
  }
];

// const THEMES = [
//   { id: 'theme-pastel', color: '#ebedee', name: 'Pastel' },
//   { id: 'theme-dark-space', color: '#243b55', name: 'Dark Space' },
//   { id: 'theme-mystic', color: '#4b6cb7', name: 'Mystic Purple' },
//   { id: 'theme-nature', color: '#96e6a1', name: 'Nature Green' },
//   { id: 'theme-warm', color: '#fda085', name: 'Warm Sunset' }
// ];

export default function AIChat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  // const [theme, setTheme] = useState('theme-pastel');
  // const [showThemePicker, setShowThemePicker] = useState(false);
  const [modelProvider, setModelProvider] = useState('gemini');

  const defaultMessage: Message = {
    id: '1',
    role: 'assistant',
    content: 'Chào bạn! Tôi là **Chuyên gia AI Nông nghiệp EaAgri**. Bạn cần tư vấn về vấn đề gì hôm nay?'
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Usage tracking state
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  // Initialize and load data when user changes
  useEffect(() => {
    if (user) {
      setShowLoginPrompt(false);

      // 1. Load History from Supabase
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Lỗi lấy lịch sử chat từ Supabase", error);
        }

        if (data && data.length > 0) {
          const mappedHistory = data.map((item: any) => ({
            id: item.id,
            role: item.role,
            content: item.content
          }));
          setMessages([defaultMessage, ...mappedHistory]);
        } else {
          setMessages([defaultMessage]);
        }
      };

      fetchHistory();

      // 2. Check Daily Usage
      const today = new Date().toISOString().split('T')[0];
      const storedUsage = localStorage.getItem(`chat_usage_${user.id}`);
      if (storedUsage) {
        const usageData = JSON.parse(storedUsage);
        if (usageData.date === today) {
          setUsageCount(usageData.count);
          if (profile?.role === 'user' && usageData.count >= 5) {
            setLimitReached(true);
          }
        } else {
          // New day, reset count
          localStorage.setItem(`chat_usage_${user.id}`, JSON.stringify({ date: today, count: 0 }));
          setUsageCount(0);
          setLimitReached(false);
        }
      } else {
        // First time
        localStorage.setItem(`chat_usage_${user.id}`, JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      setMessages([defaultMessage]);
    }
  }, [user, profile]);



  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 120 ? '120px' : scrollHeight + 'px';
    }
  }, [inputValue]);

  // Speech to Text (Web Speech API)
  const handleMicrophone = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.');
      return;
    }

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Text to Speech
  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt không hỗ trợ phát giọng nói.');
    }
  };

  const incrementUsage = () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(`chat_usage_${user.id}`, JSON.stringify({ date: today, count: newCount }));
    if (profile?.role === 'user' && newCount >= 5) {
      setLimitReached(true);
    }
  };

  const sendMessage = async (text: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!text.trim()) return;

    if (profile?.role === 'user' && limitReached) {
      return; // Handled by UI overlay
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const typingId = (Date.now() + 1).toString();
    const typingMsg: Message = { id: typingId, role: 'assistant', content: '', isTyping: true };

    setMessages((prev) => [...prev, newUserMsg, typingMsg]);
    setInputValue('');
    incrementUsage();

    // Save User message to Supabase
    supabase.from('chat_history').insert({
      user_id: user.id,
      role: 'user',
      content: text
    }).then(({ error }) => {
      if (error) console.error("Lỗi lưu tin nhắn user", error);
    });

    try {
      const historyToPass = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const responseData = await sendChatMessage(text, historyToPass, modelProvider);

      setMessages((prev) =>
        prev.map(msg =>
          msg.id === typingId
            ? { ...msg, isTyping: false, content: responseData.answer }
            : msg
        )
      );

      // Save Assistant message to Supabase
      supabase.from('chat_history').insert({
        user_id: user.id,
        role: 'assistant',
        content: responseData.answer
      }).then(({ error }) => {
        if (error) console.error("Lỗi lưu tin nhắn assistant", error);
      });
    } catch (error: any) {
      console.error(error);
      setMessages((prev) =>
        prev.map(msg =>
          msg.id === typingId
            ? { ...msg, isTyping: false, content: `Đã có lỗi xảy ra khi kết nối với máy chủ AI: **${error.message}**. Vui lòng kiểm tra lại kết nối hoặc Terminal.` }
            : msg
        )
      );
    }
  };

  const handleFAQClick = (faq: any) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveTab('chat');
    sendMessage(faq.question || faq.title);
  };

  // Helper text for limit
  const isUserRole = profile?.role === 'user';
  const remaining = isUserRole ? Math.max(0, 5 - usageCount) : 'Vô hạn';

  return (
    // <section className={`ai-chat-section ${theme}`} id="ai-chat">
    <section className={`ai-chat-section`} id="ai-chat">
      <div className="ai-chat" data-aos="fade-up">

        {/* Login Prompt Overlay */}
        {showLoginPrompt && (
          <div className="ai-chat__overlay">
            <div className="ai-chat__overlay-content">
              <i className="ri-shield-user-line" style={{ fontSize: '3rem', color: '#4caf50' }}></i>
              <h3 style={{ fontSize: '1.5rem', color: '#333' }}>Yêu cầu đăng nhập</h3>
              <p style={{ color: '#666', lineHeight: 1.5 }}>Bạn cần có tài khoản để gửi câu hỏi cho chuyên gia. Bạn có muốn đăng nhập ngay bây giờ không?</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{ padding: '0.75rem 1.5rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  style={{ padding: '0.75rem 1.5rem', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Không, cảm ơn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Limit Reached Overlay */}
        {user && isUserRole && limitReached && (
          <div className="ai-chat__limit-banner">
            <i className="ri-error-warning-line"></i>
            Bạn đã dùng hết 5 lượt tư vấn miễn phí trong ngày hôm nay. Vui lòng quay lại vào ngày mai!
          </div>
        )}

        {/* Header */}
        <div className="ai-chat__header">
          <div className="ai-chat__ai-info">
            <div className="ai-avatar">
              <img src="/logo_new.jpg" alt="EaAgri AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <div className="ai-details">
              <h3>Chuyên gia AI Nông nghiệp</h3>
              <span className="ai-chat__status">
                {user ? `Đang trực tuyến (Còn ${remaining} lượt)` : 'Đang trực tuyến (Yêu cầu đăng nhập để gửi)'}
              </span>
            </div>
          </div>

          <div className="ai-chat__header-actions">
            <select
              className="ai-chat__model-select"
              value={modelProvider}
              onChange={(e) => setModelProvider(e.target.value)}
              disabled={!!user && limitReached}
            >
              <option value="gemini">Ea AI Tiêu chuẩn</option>
              <option value="deepseek">Ea AI Chuyên sâu</option>
            </select>

            {/* <div style={{ position: 'relative' }}>
              <button
                className={`ai-chat__icon-btn ${showThemePicker ? 'active' : ''}`}
                onClick={() => setShowThemePicker(!showThemePicker)}
                title="Đổi hình nền"
              >
                <i className="ri-palette-line"></i>
              </button>

              {showThemePicker && (
                <div className="ai-chat__theme-picker">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      style={{ backgroundColor: t.color }}
                      className={theme === t.id ? 'active' : ''}
                      onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                    />
                  ))}
                </div>
              )}
            </div> */}
          </div>
        </div>

        {/* Tabs */}
        <div className="ai-chat__tabs">
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            Trò chuyện
          </button>
          <button
            className={activeTab === 'faq' ? 'active' : ''}
            onClick={() => setActiveTab('faq')}
          >
            Câu hỏi thường gặp
          </button>
        </div>

        {/* Body */}
        <div className="ai-chat__body">
          {activeTab === 'chat' ? (
            <>
              <div className="ai-chat__tab-content" ref={chatContentRef}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`message message--${msg.role}`}>
                    <div className={`message__avatar ${msg.role === 'user' ? 'user-avatar' : ''}`}>
                      {msg.role === 'user' ? (
                        <i className="ri-user-smile-line"></i>
                      ) : (
                        <img src="/logo_new.jpg" alt="EaAgri AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      )}
                    </div>
                    <div className="message__content-wrapper">
                      <div className="message__bubble">
                        {msg.isTyping ? (
                          <div className="typing-indicator">
                            <span></span><span></span><span></span>
                          </div>
                        ) : (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        )}
                      </div>

                      {msg.role === 'assistant' && !msg.isTyping && (
                        <div className="message__actions">
                          <button onClick={() => handleTTS(msg.content)} title="Đọc văn bản">
                            <i className="ri-volume-up-line"></i> Nghe
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="ai-chat__input-area">
                <button
                  className="ai-chat__icon-btn"
                  onClick={handleMicrophone}
                  style={{ color: isRecording ? '#ef5350' : '' }}
                  title="Nhập bằng giọng nói"
                  disabled={!!user && limitReached}
                >
                  <i className={isRecording ? "ri-mic-fill" : "ri-mic-line"}></i>
                </button>

                <textarea
                  ref={textareaRef}
                  className="ai-chat__textarea"
                  placeholder={limitReached ? "Bạn đã hết lượt hỏi hôm nay..." : "Nhập câu hỏi của bạn..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={!!user && limitReached}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputValue);
                    }
                  }}
                />

                <button
                  className="ai-chat__send-btn"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || (!!user && limitReached)}
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="ai-chat__tab-content">
              <div className="faq-grid">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="faq-card" onClick={() => {
                    if (user && limitReached) return;
                    handleFAQClick(faq);
                  }}>
                    <i className={faq.icon}></i>
                    <h4>{faq.title}</h4>
                    <p>{faq.answer.substring(0, 70)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
