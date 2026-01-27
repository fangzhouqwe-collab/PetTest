
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import * as messageService from '../services/messageService';
import * as testUserService from '../services/testUserService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

interface UserChatScreenProps {
  onBack: () => void;
  targetId: string;
  targetName: string;
  targetAvatar?: string;
  messages: ChatMessage[];
  onSendMessage: (id: string, msg: ChatMessage) => void;
}

const UserChatScreen: React.FC<UserChatScreenProps> = ({
  onBack,
  targetId,
  targetName,
  targetAvatar,
  messages: localMessages,
  onSendMessage
}) => {
  const { user } = useAuthContext();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // 加载消息
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);

      try {
        if (user && isSupabaseConfigured) {
          // 从数据库加载
          const msgs = await messageService.getMessages(targetId);
          setChatMessages(msgs);
        } else {
          // 演示模式：从测试服务加载
          const testMsgs = testUserService.getTestMessages(targetId);
          setChatMessages(testMsgs);
        }
      } catch (error) {
        console.error('加载消息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // 如果是数据库模式，订阅新消息
    if (user && isSupabaseConfigured) {
      const subscription = messageService.subscribeToMessages(targetId, (newMsg) => {
        setChatMessages(prev => [...prev, newMsg]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [targetId, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendText = async () => {
    if (!input.trim() || isSending) return;

    setIsSending(true);
    const text = input;
    setInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    // 立即添加到本地列表
    setChatMessages(prev => [...prev, newMsg]);

    try {
      if (user && isSupabaseConfigured) {
        // 发送到数据库
        await messageService.sendMessage(targetId, text);
      } else {
        // 演示模式：使用测试服务
        testUserService.sendTestMessage(targetId, text);
      }

      // 更新父组件的消息记录（用于消息列表预览）
      onSendMessage(targetId, newMsg);
    } catch (error) {
      console.error('发送消息失败:', error);
    }

    setIsSending(false);
  };

  const sendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = async () => {
        const imageData = r.result as string;
        const newImgMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'user',
          image: imageData,
          text: '[图片]',
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, newImgMsg]);
        onSendMessage(targetId, newImgMsg);
      };
      r.readAsDataURL(f);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F2F2F7] animate-in slide-in-from-right duration-300 overflow-hidden max-w-[540px] mx-auto shadow-2xl relative">
      <header className="fixed top-0 w-full max-w-[540px] z-50 ios-blur bg-white/80 h-[96px] pt-12 px-6 flex items-center border-b border-black/5">
        <button onClick={onBack} className="text-ios-blue flex items-center active:opacity-60 transition-opacity">
          <span className="material-symbols-outlined !text-[34px]">chevron_left</span>
          <span className="text-[18px] font-medium ml-[-4px]">消息</span>
        </button>
        <div className="flex-1 flex flex-col items-center mr-8">
          <span className="font-bold text-[18px] tracking-tight">{targetName}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-ios-green rounded-full shadow-[0_0_8px_rgba(52,199,89,0.5)]"></div>
            <span className="text-[11px] text-ios-gray font-bold uppercase tracking-widest">在线回复</span>
          </div>
        </div>
        {targetAvatar && (
          <div className="absolute right-6 top-[54px]">
            <img src={targetAvatar} className="size-9 rounded-full object-cover border border-black/5 shadow-sm" />
          </div>
        )}
      </header>

      <main className="flex-1 pt-[96px] pb-[100px] overflow-y-auto px-6 space-y-5 pt-8 no-scrollbar bg-[#F2F2F7]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-ios-gray h-full">
            <span className="animate-pulse">加载消息中...</span>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-ios-gray h-full opacity-60 italic text-sm py-20">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined !text-[32px] text-ios-gray">chat_bubble_outline</span>
            </div>
            <p>还没有任何消息</p>
            <p className="text-xs mt-1">开始聊天吧！</p>
          </div>
        ) : (
          chatMessages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] rounded-[22px] px-5 py-3 text-[17px] shadow-sm leading-relaxed relative ${m.sender === 'user' ? 'bg-ios-blue text-white rounded-tr-none' : 'bg-white text-black rounded-tl-none border border-black/5'
                }`}>
                {m.image && <img src={m.image} className="rounded-xl mb-2 w-full shadow-inner" />}
                {m.text && m.text !== '[图片]' && m.text}
              </div>
              <span className="text-[11px] text-ios-gray mt-1.5 px-2 font-medium opacity-60">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </main>

      <div className="fixed bottom-0 w-full max-w-[540px] bg-white border-t border-black/5 px-4 py-4 flex items-center gap-4 shadow-[0_-2px_15px_rgba(0,0,0,0.03)] min-h-[76px] pb-10">
        <button onClick={() => fileRef.current?.click()} className="text-ios-blue active:scale-90 transition-transform shrink-0">
          <span className="material-symbols-outlined !text-[34px] text-ios-blue/90">add_circle</span>
        </button>
        <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={sendImage} />

        <div className="flex-1 bg-black/5 rounded-[24px] px-5 py-2.5 flex items-center transition-all focus-within:bg-black/10 focus-within:ring-1 focus-within:ring-ios-blue/10">
          <input
            className="w-full bg-transparent border-none focus:ring-0 text-[17px] p-0 min-h-[40px]"
            placeholder="回复消息..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendText()}
            disabled={isSending}
          />
        </div>

        <button
          onClick={sendText}
          disabled={!input.trim() || isSending}
          className={`font-bold text-[18px] px-2 py-2 transition-all ${input.trim() && !isSending ? 'text-ios-blue active:opacity-60 scale-105' : 'text-ios-gray/40'}`}
        >
          {isSending ? '...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default UserChatScreen;
