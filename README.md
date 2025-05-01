# Daily24 - 프론트엔드 클론 저장소
본 저장소는 무인매장 운영 시스템인 **Daily24** 프로젝트의 개인 포크 프론트엔드 레포지토리입니다.

> **개발 기간:** 2025.02.28 ~ 2025.04.22
> **기술 스택:** React · Tailwind CSS · Zustand · Chart.js · Nivo · AWS S3

---

## 프로젝트 소개
**Daily24** 는 처음 무인 매장을 운영하는 점주니들을 위한 스마트 매장 관리 시스템입니다.
**매출, 재고, 폐기, 발주** 관리부터 **장바구니 분석**, **실시간 알림**, **AI 챗봇** 등  
점주님의 운영 효율을 높이기 위한 다양한 기능들을 통합 제공하는 웹 기반 플랫폼입니다.

---

## 🙋‍♀️ 주요 기여

본인은 다음과 같은 핵심 프론트엔드 기능들을 구현했습니다:

### 장바구니 분석 페이지
고객들이 자주 함께 구매하는 상품 조합을 분석해 점주에게 진열 전략 및 마케팅에 활용할 수 있도록 도와주는
연관 분석 시스템을 구현했습니다.

✅ 주요 구현 기능
- Apriori 기반 연관규칙 분석을 통해 support, confidence, lift 필터로 유의미한 조합만 시각화
- Nivo Heatmap을 사용해 상품 A/B 조합을 직관적으로 보여주는 히트맵 구성
- Top3 추천 조합 클릭시, 해당 조합의 최근 7일간 판매 추이를 Nivo LineChart로 함께 제공
- 시간대별 추천 기능: 현재 시간대(아침,점심 등)에 가장 자주 팔리는 상품 조합을 실시간 제공
- Context API를 사용해 시간대 데이터를 전역 관리, 실시간 UX 강화

💡 Nivo 히트맵 시각화 포맷 오류 해결
**문제 상황**
Nivo 히트맵을 활용해 상품 간 연관 규칙을 시각화하는 과정에서, 
에러는 발생하지 않았지만 차트가 렌더링되지 않는 이슈가 발생했습니다.

**해결방법**
공식 문서를 참고해 Nivo가 요구하는 데이터 포맷에 맞게 변환했습니다.👍
itemset_a와 itemset_b를 각각 **세로축(Y축), 가로축(X축)**으로 매핑하고,
신뢰도(confidence) 값을 y에 대응시켜 아래처럼 가공했습니다:
```
// Nivo에 맞는 데이터 구조 변환
  const transformedData = itemA.map((a) => ({
    id: a, // 세로축 라벨
    data: itemB.map((b) => {
      const match = data.find(
        (rule) => rule.itemset_a === a && rule.itemset_b === b
      );
      return { x: b, y: match ? match.confidence : null }; // 없으면 0
    }),
  }));
```
이 방식으로 변환하면, 아래처럼 Nivo가 이해할 수 있는 "객체 배열"로 구성됩니다.
```
[
  { "id": "콜라", "data": [{ "x": "사이다", "y": 0.75 }, { "x": "과자", "y": 0.58 }] },
  { "id": "사이다", "data": [{ "x": "콜라", "y": 0.68 }, { "x": "맥주", "y": 0.9 }] }
]
```
**배운점**
백엔드에서 전달된 데이터를 프론트 요구에 맞게 가공하는 과정이 생각보다 중요하고, 
외부 라이브러리를 사용할 때, 공식 문서를 한번이라도 꼭 읽어야 한다것을 깨달았습니다.🧐

### 발주 관리 페이지
점주의 상품 발주 및 발주 내역을 확인할 수 있는 페이지입니다.

![발주 화면](https://github.com/user-attachments/assets/92ef95fe-dab8-4288-a6ad-d68c95f2f3cd)

✅ 주요 구현 기능
- 상품을 발주하고, 날짜/상태별로 발주 리스트 확인 가능
- 최근 7일간 요일별 발주 내역을 기반으로 루틴성 발주 지원 
- 최근 판매 데이터를 바탕으로 발주 수량 추천
- 발주 내역을 엑셀로 다운로드하여 체크리스트로 활용 가능

💡 재고 소진 예측 기반 발주 추천 기능 구현
**문제 상황**
점주가 어떤 상품을 얼마나 발주해야 할지 매번 판단이 어려워, 
과잉 발주나 품절이 반복되는 문제가 있었습니다.

**해결 방법**
- 최근 7일간의 판매 데이터를 기반으로 하루 평균 판매량을 계산
- 전체 재고 수량과 비교해 재고 소진까지 남은 일수(daysLeft)를 예측
- 부족한 수량만큼 발주를 추천하는 로직을 구현
- 로직은 `useOrderRecommendation` 커스텀 훅으로 분리해 재사용성과 유지보수성 강화

```javascript
      // 평균 판매량 계산
      const total = salesData.reduce((sum, item) => sum + item.amount, 0);
      const avgSales = total / 7;


      // 총 재고량을 기준으로 소진 일수 예측
      const daysLeft = avgSales > 0 ? Math.floor(stock / avgSales) : "N/A";

      // 추천 발주량 (1일치 평균 판매량 - 현재 재고)
      const recommendedOrder = Math.ceil(Math.max(0, avgSales * 1 - stock));

```

**배운점**
단순히 데이터를 보여주는 것보다, 
**"이 데이터를 바탕으로 어떤 액션을 유도할 수 있을까?"**를 고민하는 것이
프론트엔드 UX 사고에서 얼마나 중요한지 체감할 수 있었습니다. 
또한 복잡한 로직을 커스텀 훅으로 분리하니 리팩토링도 쉬워지고 재사용하기 편했습니다. (오류 고칠때 짱편함👍)


### 재고 및 폐기 관리 페이지




### 실시간 알림 



### AI 챗봇 


### UI/UX 개선


## 기타
- 전체 프로젝트 구조 및 기술스택은 [팀 레포지토리 바로가기](https://github.com/KDT7team1/frontend)에서 확인하실 수 있습니다.

---
# 무인매장관리 시스템 - 백엔드 서버

이 프로젝트의 `backend` 폴더에는 **관리자용 챗봇 기능**이 포함된 FastAPI 기반의 백엔드 서버 코드가 있습니다. <br>
AI는 **판매 데이터를 기반**으로 관리자의 질문에 답변할 수 있도록 구성되어 있습니다.

---

## 🛠️ 백엔드 실행 방법

### 1. 백엔드 디렉토리로 이동
```bash
cd backend
```

### 2. 가상환경 생성 및 활성화
#### ▶️ 가상환경 생성
- 맥
```bash
python3 -m venv .venv  
```

- 윈도우
```bash
python -m venv .venv
```

#### ✅ 가상환경 활성화
- 맥
```bash
source .venv/bin/activate
```

- 윈도우
```bash
.venv\Scripts\activate
```

### 3. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

> `requirements.txt`는 `backend` 폴더 내에 위치하고 있습니다.

- 추가 업데이트
```bash
pip freeze > requirements.txt
```

### 4. 서버 실행
```bash
uvicorn main:app --reload
```
🔗 API 문서: http://127.0.0.1:8000/docs 에서 실행 확인 가능

### 5. 서버 종료 방법
```bash
CTRL + C   # 서버 실행 중단
deactivate # 가상환경 종료
```

### 6. 사용한 ollama 모델
ollama pull bge-m3

---
## 💻 프론트엔드 실행 방법
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
🔗 실행 주소: http://localhost:3000

