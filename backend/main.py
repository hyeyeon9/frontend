from fastapi import FastAPI
from pydantic import BaseModel
from rag_chain import rag_chain
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# 🔥 CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 또는 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/chat")
async def chat_endpoint(q: Question):
    answer = rag_chain.invoke(q.question)
    return {"answer": answer}
