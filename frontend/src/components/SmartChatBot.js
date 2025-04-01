"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

const SmartChatBot = () => {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return

    setMessages((prev) => [...prev, { type: "user", text: question }])
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:8000/chat/full", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()
      setMessages((prev) => [...prev, { type: "bot", text: data.answer }])
    } catch (error) {
      setMessages((prev) => [...prev, { type: "bot", text: "⚠️ 서버와의 연결에 실패했습니다." }])
    } finally {
      setIsLoading(false)
      setQuestion("")
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📦 전체 데이터 기반 챗봇</h2>

      <div className="bg-gray-100 p-4 h-64 overflow-y-scroll rounded-xl mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.type === "user" ? "text-right" : "text-left"}`}>
            <span className="inline-block bg-white p-2 rounded-xl shadow-sm">{msg.text}</span>
          </div>
        ))}

        {isLoading && (
          <div className="text-left mb-2">
            <span className="inline-block bg-white p-2 rounded-xl shadow-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>응답 중...</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-full"
          placeholder="예: 이번 달 잘 팔린 간편식은?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-full"
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "전송"}
        </button>
      </div>
    </div>
  )
}

export default SmartChatBot

