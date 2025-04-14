// import { useEffect } from "react";

// export default function SseNotification({ onMessage }) {
//   useEffect(() => {
//     console.log("📡 SSE 연결 시도중...");
//     // EventSource: SSE (Server-Sent Events)를 위한 브라우저 내장 객체
//     // 서버에서 클라이언트(브라우저)로 실시간 데이터를 푸시하는 기능을 제공하는 객체
//     const eventSource = new EventSource(
//       "http://localhost:8090/app/sse/connect?clientId=admin"
//     );

//     eventSource.onopen = () => {
//       console.log("✅ SSE 연결 성공");
//     };

//     eventSource.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("📡 실시간 알림 수신:", data);

//       // 알림 타입 매핑 (기존 타입을 새 탭 카테고리로 변환)
//       let mappedType = "일반";

//       if (data.type === "자동폐기") {
//         mappedType = "폐기";
//       } else if (
//         data.type === "유통기한임박" ||
//         data.type === "재고부족" ||
//         data.type === "품절"
//       ) {
//         mappedType = "재고";
//       } else if (data.type === "결제" || data.type === "결제실패") {
//         mappedType = "결제";
//       }

//       // 매핑된 타입으로 메시지 전달
//       onMessage({
//         ...data,
//         type: mappedType,
//         id: Date.now().toString(), // 고유 ID 추가
//       });
//     };

//     eventSource.onerror = (err) => {
//       console.error("SSE 연결 에러", err);
//       eventSource.close(); // 오류 시 연결 종료

//       // 3초 후 재연결 시도
//       setTimeout(() => {
//         console.log("SSE 재연결 시도...");
//         // 여기에 재연결 로직 추가 가능
//       }, 3000);
//     };

//     return () => {
//       console.log("SSE 연결 종료");
//       eventSource.close(); // 연결 종료
//     };
//   }, [onMessage]);

//   return null;
// }
