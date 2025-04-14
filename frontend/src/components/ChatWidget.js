"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // 스크롤 위치 이동용 ref
  const chatContainerRef = useRef(null); // 채팅창 DOM
  const chatWidgetRef = useRef(null); // 전체 위젯 DOM

  // 메시지가 변경될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 바깥 영역 클릭 감지를 위한 이벤트 리스너
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        chatWidgetRef.current &&
        !chatWidgetRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    // 이벤트 리스너 추가
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 한 글자씩 타이핑 효과 구현 함수
  const typeResponse = (response) => {
    // 봇 메시지 자리 추가
    setMessages((prev) => [
      ...prev,
      { type: "bot", text: "", isTyping: true, timestamp: new Date() },
    ]);

    let i = 0;
    const typingInterval = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;

        // 한 글자씩 추가
        if (i < response.length) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: response.substring(0, i + 1),
          };
          i++;
        } else {
          // 타이핑 완료
          newMessages[lastIndex] = {
            type: "bot",
            text: response,
            isTyping: false,
            timestamp: new Date(),
          };
          clearInterval(typingInterval);
        }

        return newMessages;
      });
    }, 30); // 타이핑 속도 조절 (밀리초)
  };

  // 채팅 메시지 전송 함수
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!question.trim() || isLoading) return;

    const newUserMessage = {
      type: "user",
      text: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // 입력 필드 초기화 및 로딩 상태 표시
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error("서버 응답이 정상적이지 않습니다.");
      }

      const data = await res.json();

      // 응답 타이핑 효과 시작
      typeResponse(data.answer);
    } catch (error) {
      console.error("에러 발생:", error);
      setIsLoading(false);
      typeResponse("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // 채팅 시간 포맷
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[50]" ref={chatWidgetRef}>
      {/* 채팅창 */}
      <div
        className={`absolute bottom-0 right-0 xl:w-[400px] sm:w-96 h-[500px] shadow-xl flex flex-col rounded-2xl overflow-hidden border-0 bg-white
          transition-all duration-300 ease-in-out origin-bottom-right
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
      >
        {/* 헤더 */}
        <div className="bg-[#6B7CFF] text-white py-4 px-4 rounded">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <div className="text-base font-medium"> 관리자 챗봇</div>
            </div>
            <button
              className="h-7 w-7 text-white hover:bg-[#5c69ca] rounded-full flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <MessageCircle className="mb-2 h-12 w-12 opacity-20 text-blue-500" />
              <p>안녕하세요! 관리자 챗봇입니다.</p>
              <p className="text-sm">질문을 입력해주세요.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  msg.type === "user"
                    ? "ml-auto items-end"
                    : "mr-auto items-start"
                }`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded-2xl shadow-sm ${
                    msg.type === "user"
                      ? "bg-[#6B7CFF] text-white rounded-br-none"
                      : "bg-white border border-gray-100 rounded-bl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.type === "bot" ? (
                    <ReactMarkdown
                      components={{
                        ul: ({ node, ...props }) => (
                          <ul {...props} className="list-disc pl-5" />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            {...props}
                            className="m-0 p-0 leading-snug" // ✔️ 줄간격 조정
                          />
                        ),
                      }}
                    >
                      {msg.text
                        .trim()
                        .replace(/\n+/g, "\n")
                        .replace(/(- .+?)\n(?=[^\n-])/g, "$1\n\n")}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                  {msg.isTyping && (
                    <span className="ml-1 animate-pulse">|</span>
                  )}
                </span>
                <span className="text-xs text-gray-500 mt-1 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex max-w-[80%] mr-auto items-start">
              <div className="px-3 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#6B7CFF]" />
                <span>응답 중...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-3 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요..."
              onKeyPress={handleKeyPress}
              className="flex-1 rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="shrink-0 rounded-full bg-[#6B7CFF] hover:cursor-pointer hover:bg-[#5c69ca] w-10 h-10 flex items-center justify-center text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`h-14 w-14 rounded-full shadow-lg bg-[#6B7CFF] hover:bg-[#5c69ca] text-white flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isOpen ? "opacity-0" : "opacity-100"}`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
