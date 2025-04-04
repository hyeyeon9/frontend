from fastapi import FastAPI
from pydantic import BaseModel
from tools.rag_filter import save_filtered_csv
from rag_filtered_chain import load_filtered_chain
from fastapi.middleware.cors import CORSMiddleware
from load_vectorstore_chain import rag_full_chain

app = FastAPI()

class ChatRequest(BaseModel):
    start_date: str
    end_date: str
    keyword: str
    question: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/filter")
async def chat_with_filter(req: ChatRequest):
    csv_path = save_filtered_csv(req.start_date, req.end_date, req.keyword)
    if csv_path == "No data found":
        return {"answer": "해당 조건에 맞는 데이터가 없습니다."}

    chain = load_filtered_chain(csv_path)
    answer = chain.invoke(req.question)
    return {"answer": answer}

class Question(BaseModel):
    question: str

@app.post("/chat/full")
async def chat_full(q: Question):
    # rag_full_chain.invoke()를 통해 RAG 방식 답변 생성
    answer = rag_full_chain.invoke(q.question)
    return {"answer": answer}