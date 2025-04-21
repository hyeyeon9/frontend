from langchain_community.vectorstores.faiss import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI 
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import load_prompt
from langchain_core.runnables import RunnablePassthrough

import os
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import OpenAIEmbeddings

# ✅ OpenAI 임베딩으로 교체
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 또는 "text-embedding-ada-002"
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

vectorstore = FAISS.load_local(
    "vectorstore/index", 
    embeddings,
    allow_dangerous_deserialization=True  # NOTE: 로컬 테스트 시에는 True, 운영 시에는 False 권장
)

# 2) Retriever 설정 (예: 상위 3개 문서만 가져오기)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 3) LLM 정의

# ✅ GPT-4o로 전환 (OpenAI)
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# ❌ Ollama는 아래처럼 주석처리 (원하면 다시 사용 가능)
# llm = ChatOllama(model="yeon", temperature=0)

# 4) 프롬프트 로드
prompt = load_prompt("prompts/rag-exaone.yaml")

# 5) RAG 체인 구성
rag_full_chain = (
    {
        "context": retriever
        | (lambda x: "\n\n".join(doc.page_content for doc in x)),
        "question": RunnablePassthrough(),
    }
    | prompt
    | llm
    | StrOutputParser()
)
