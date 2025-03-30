# 무인매장관리 시스템 - 백엔드 서버
이 프로젝트의 backend 폴더에는 관리자용 챗봇 기능이 포함된 FastAPI 기반의 백엔드 서버 코드가 있습니다. 
AI는 판매 데이터를 기반으로 관리자의 질문에 답변할 수 있도록 구성되어 있습니다.
---

## 백엔드 실행 방벙

### 1. 백엔드 디렉토리로 이동
```bash
cd backend
```

### 2. 가상환경 생성 및 활성화
#### 가상환경 생성
```bash
python3 -m venv .venv  
```

#### 가상환경 활성화
```bash
source .venv/bin/activate
```

### 3. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

> `requirements.txt`는 `backend` 폴더 내에 위치하고 있습니다.

### 4. 서버 실행
```bash
uvicorn main:app --reload
```
API 문서: http://127.0.0.1:8000/docs 에서 실행 확인 가능

### 5. 서버 종료 방법
```bash
CTRL + C   # 서버 실행 중단
deactivate # 가상환경 종료
```

---
## 프론트엔드 실행 방법
### 1. 프론트 디렉토리로 이동
```bash
cd frontend
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 프론트 서버 실행
```bash
npm start
```
실행 주소: http://localhost:3000

