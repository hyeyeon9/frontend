"use client"

import { useState, useEffect, useRef } from "react"

const ChatBot = () => {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)

  // 메시지가 변경될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // 한 글자씩 타이핑 효과 구현 함수
  const typeResponse = (response) => {
    // 봇 메시지 자리 추가
    setMessages((prev) => [...prev, { type: "bot", text: "", isTyping: true }])

    let i = 0
    const typingInterval = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev]
        const lastIndex = newMessages.length - 1

        // 한 글자씩 추가
        if (i < response.length) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: response.substring(0, i + 1),
          }
          i++
        } else {
          // 타이핑 완료
          newMessages[lastIndex] = {
            type: "bot",
            text: response,
            isTyping: false,
          }
          clearInterval(typingInterval)
        }

        return newMessages
      })
    }, 30) // 타이핑 속도 조절 (밀리초)
  }

  // 채팅 메시지 전송 함수
  const handleSubmit = async () => {
    if (!question.trim()) return

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, { type: "user", text: question }])

    // 입력 필드 초기화 및 로딩 상태 표시
    setQuestion("")
    setIsLoading(true)

    try {
      // FastAPI 서버 호출
      const res = await fetch("http://localhost:8000/chat/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        throw new Error("서버 응답이 정상적이지 않습니다.")
      }

      const data = await res.json()
      setIsLoading(false)

      // 응답 타이핑 효과 시작
      typeResponse(data.answer)
    } catch (error) {
      console.error("에러 발생:", error)
      setIsLoading(false)
      typeResponse("오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    }
  }

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📊 관리자용 판매 챗봇</h2>

      {/* 채팅창 */}
      <div ref={chatContainerRef} className="bg-gray-100 p-4 h-64 overflow-y-auto rounded mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.type === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block p-2 rounded shadow ${
                msg.type === "user" ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              {msg.text}
              {msg.isTyping && <span className="ml-1 animate-pulse">|</span>}
            </span>
          </div>
        ))}

        {/* 로딩 표시기 */}
        {isLoading && (
          <div className="text-left mb-2">
            <span className="inline-flex items-center bg-white p-2 rounded shadow">
              <svg
                className="animate-spin h-4 w-4 mr-2 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              응답 생성 중...
            </span>
          </div>
        )}
      </div>

      {/* 입력 및 전송 */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="질문을 입력하세요..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
          disabled={isLoading}
        >
          전송
        </button>
      </div>
    </div>
  )
}

export default ChatBot

