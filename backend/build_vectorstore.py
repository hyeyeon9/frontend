import os
import pandas as pd
from langchain_core.documents import Document
from langchain_community.vectorstores.faiss import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings

print("📦 벡터스토어 생성 시작")

# 1) CSV 경로 로드
csv_path = "data/final.csv"
print(f"🔍 CSV 로딩 중: {csv_path}")
df = pd.read_csv(csv_path, encoding="utf-8")

# 2) 날짜 타입 변환
print("📅 날짜 타입으로 변환 중")
df["sale_date"] = pd.to_datetime(df["sale_date"])

# 3) 텍스트 생성 (시간 포함)
print("🧾 텍스트 생성 중 (시간 포함)")
df["text"] = df.apply(
    lambda row: f"{row['sale_date']}에 '{row['goods_name']}'({row['sub_name']})이 {row['sale_amount']}개 판매되었습니다.",
    axis=1,
)

# 4) 날짜별로 그룹핑하여 문서 생성
print("📚 날짜별로 문서 그룹핑 중")
grouped = df.groupby(df["sale_date"].dt.date)

docs = []
for date, group in grouped:
    full_text = "\n".join(group["text"].tolist())
    docs.append(Document(page_content=full_text))
print(f"✅ 총 {len(docs)}개의 날짜별 문서 생성 완료")

# 5) 텍스트 분할
print("✂️ 문서 분할 중")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
split_docs = text_splitter.split_documents(docs)
print(f"✅ 분할된 문서 수: {len(split_docs)}")

# 6) 임베딩 및 FAISS 벡터스토어 생성
print("🧠 벡터 임베딩 중 (모델: bge-m3)")
embeddings = OllamaEmbeddings(model="bge-m3")
vectorstore = FAISS.from_documents(split_docs, embedding=embeddings)

# 7) 저장
print("💾 벡터스토어 저장 중: vectorstore/index")
os.makedirs("vectorstore", exist_ok=True)
vectorstore.save_local("vectorstore/index")

print("🎉 ✅ 벡터스토어 생성 및 저장 완료!")
