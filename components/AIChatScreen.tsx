
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageWithStreaming, resetConversation } from '../services/doubaoService';

const AIChatScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: '您好！我是您的 AI 宠物助手小豆 🐾 我可以为您提供宠物健康咨询、饲养建议和训练技巧。有什么我可以帮您的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 组件卸载时重置对话历史
  useEffect(() => {
    return () => {
      resetConversation();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const currentInput = inputValue;
    const currentImg = selectedImage;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentInput,
      image: currentImg || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    // 创建 AI 回复占位消息
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      sender: 'ai',
      text: '思考中...',
      timestamp: new Date()
    }]);

    // 构建发送给 AI 的消息（如果有图片，添加提示）
    let promptText = currentInput;
    if (currentImg) {
      promptText = `[用户上传了一张宠物图片] ${currentInput || '请帮我分析这张图片'}`;
    }

    // 调用豆包 API
    await sendMessageWithStreaming(promptText, (text) => {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, text } : m
      ));
    });

    setIsTyping(false);
  };

  // 快捷问题
  const quickQuestions = [
    '狗狗不吃饭怎么办？',
    '猫咪呕吐原因？',
    '如何训练狗狗？'
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-[480px] mx-auto overflow-hidden">
      <header className="ios-header flex items-center h-[88px] pt-10 px-4 border-b border-black/5 bg-white/80 shrink-0">
        <button onClick={onBack} className="flex items-center text-ios-blue w-20">
          <span className="material-symbols-outlined !text-[28px]">chevron_left</span>
          <span className="text-lg">返回</span>
        </button>
        <div className="flex-1 text-center">
          <div className="font-semibold text-[17px]">AI 宠物顾问</div>
          <div className="text-[10px] text-ios-green font-bold flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-ios-green rounded-full animate-pulse"></span>
            在线
          </div>
        </div>
        <div className="w-20 flex justify-end">
          <button
            onClick={() => {
              resetConversation();
              setMessages([{
                id: '1',
                sender: 'ai',
                text: '对话已重置 ✨ 有什么新问题想问我吗？',
                timestamp: new Date()
              }]);
            }}
            className="text-ios-blue text-sm"
          >
            重置
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar bg-gradient-to-b from-ios-bg/30 to-white">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ios-blue to-blue-600 flex items-center justify-center mr-2 shrink-0">
                <span className="material-symbols-outlined text-white !text-[18px]">smart_toy</span>
              </div>
            )}
            <div className="flex flex-col max-w-[75%]">
              {msg.image && (
                <div className="rounded-2xl overflow-hidden mb-1 shadow-md">
                  <img src={msg.image} className="w-full h-auto max-w-[200px]" />
                </div>
              )}
              {msg.text && (
                <div className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${msg.sender === 'user'
                    ? 'bg-ios-blue text-white rounded-br-md'
                    : 'bg-white text-black rounded-bl-md border border-black/5'
                  }`}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-ios-gray text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-ios-gray/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-ios-gray/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-ios-gray/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* 快捷问题 */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q)}
              className="whitespace-nowrap px-3 py-1.5 bg-ios-blue/10 text-ios-blue text-sm rounded-full border border-ios-blue/20 active:scale-95 transition-transform"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 图片预览 */}
      {selectedImage && (
        <div className="px-4 py-2 bg-ios-bg">
          <div className="relative inline-block">
            <img src={selectedImage} className="h-16 rounded-lg" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-ios-red text-white rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined !text-[14px]">close</span>
            </button>
          </div>
        </div>
      )}

      <div className="p-4 bg-white border-t border-black/5 pb-8">
        <div className="flex items-center gap-2 bg-ios-bg rounded-full p-1.5 shadow-inner">
          <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center text-ios-blue rounded-full hover:bg-white/50 transition-colors">
            <span className="material-symbols-outlined !text-[22px]">add_photo_alternate</span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const r = new FileReader();
              r.onload = () => setSelectedImage(r.result as string);
              r.readAsDataURL(f);
            }
          }} />
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] placeholder:text-ios-gray/60"
            placeholder="问问关于宠物的问题..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || (!inputValue.trim() && !selectedImage)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${inputValue.trim() || selectedImage
                ? 'bg-ios-blue active:scale-95'
                : 'bg-ios-gray/30'
              }`}
          >
            <span className="material-symbols-outlined !text-[18px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatScreen;
