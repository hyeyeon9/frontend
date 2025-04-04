from langchain_community.vectorstores.faiss import FAISS
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import load_prompt
from langchain_core.runnables import RunnablePassthrough

# 1) 저장된 벡터스토어 불러오기
embeddings = OllamaEmbeddings(model="bge-m3")

# 보안상 위험을 감수하지 않으려면 allow_dangerous_deserialization=False를 고려할 수도 있습니다.
# 단, pickle 파일 로드 문제로 에러가 날 수 있으니 주의해 주세요.
vectorstore = FAISS.load_local(
    "vectorstore/index", 
    embeddings,
    allow_dangerous_deserialization=True
)

# 2) Retriever 설정 (예: 상위 3개 문서만 가져오기)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 3) LLM & 프롬프트
llm = ChatOllama(model="yeon2", temperature=0)
prompt = load_prompt("prompts/rag-exaone.yaml", encoding="utf-8")

# 4) 체인 구성
#    - "context": Retriever 결과 문서들의 page_content를 "\n\n"으로 이어붙인 문자열
#    - "question": 실제 사용자가 물어본 질문
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
