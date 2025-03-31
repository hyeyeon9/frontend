from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import CSVLoader
from langchain_community.vectorstores.faiss import FAISS
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import load_prompt

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# CSV 로드 및 분할
loader = CSVLoader(file_path="data/sales.csv")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = loader.load_and_split(text_splitter=text_splitter)

# 임베딩 생성
embeddings = OllamaEmbeddings(model="bge-m3")
vectorstore = FAISS.from_documents(docs, embedding=embeddings)
retriever = vectorstore.as_retriever()

# 프롬프트 로드
prompt = load_prompt("prompts/rag-exaone.yaml", encoding="utf-8")

# LLM 연결
llm = ChatOllama(model="yeon", temperature=0)

# 체인 생성
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
