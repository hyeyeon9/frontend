import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;

    const newUserMessage = {
      type: "user",
      text: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.answer, timestamp: new Date() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "⚠️ 서버와의 연결에 실패했습니다.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[50]">
      {isOpen && (
        <div className="w-80 sm:w-96 max-w-full h-[500px] shadow-xl flex flex-col rounded-2xl overflow-hidden border-0 bg-white">
          {/* 헤더 */}
          <div className="bg-blue-600 text-white py-3 px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <div className="text-base font-medium">관리자 챗봇</div>
                <div className="text-xs bg-blue-500 text-white border-blue-400 px-2 py-0.5 rounded-full text-[10px]">
                  온라인
                </div>
              </div>
              <button
                className="h-7 w-7 text-white hover:bg-blue-500 rounded-full flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                  <div
                    className={`px-3 py-2 rounded-2xl shadow-sm ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex max-w-[80%] mr-auto items-start">
                <div className="px-3 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
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
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 w-10 h-10 flex items-center justify-center text-white"
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
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
