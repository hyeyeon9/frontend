from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from load_vectorstore_chain import rag_full_chain
import dotenv
import openai
import os

# ✅ .env에서 OpenAI API 키 로드
dotenv.load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# ✅ CORS 설정 (프론트 연결 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # 실제 배포 시에는 도메인 지정 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 요청 바디 정의
class Question(BaseModel):
    question: str

# ✅ RAG 체인 기반 응답 생성 API
@app.post("/chat/full")
async def chat_full(q: Question):
    # 🔽 현재는 GPT-4o 기반 rag_full_chain을 사용
    answer = rag_full_chain.invoke(q.question)
    return {"answer": answer}

# ❌ 이전 Ollama 기반 직접 호출 방식은 아래와 같이 주석 처리함
# from langchain_ollama import ChatOllama
# ollama_model = ChatOllama(model="yeon")
# answer = ollama_model.invoke(q.question)
