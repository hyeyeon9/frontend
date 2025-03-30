import React, { useState } from "react";

const ChatBot = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text: question }]);

    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { type: "bot", text: data.answer }]);
    setQuestion("");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">관리자용 챗봇</h2>

      <div className="bg-gray-100 p-4 h-64 overflow-y-scroll rounded mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${msg.type === "user" ? "text-right" : "text-left"}`}
          >
            <span className="inline-block bg-white p-2 rounded shadow">
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="무엇을 도와드릴까요?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
