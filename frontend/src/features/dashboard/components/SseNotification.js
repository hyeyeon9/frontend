import { useEffect } from "react";

export default function SseNotification({ onMessage }) {
  useEffect(() => {
    console.log("📡 SSE 연결 시도중...");
    // EventSource: SSE (Server-Sent Events)를 위한 브라우저 내장 객체
    // 서버에서 클라이언트(브라우저)로 실시간 데이터를 푸시하는 기능을 제공하는 객체
    const eventSource = new EventSource("http://localhost:8090/app/sse/connect?clientId=admin");

    eventSource.onopen = () => {
        console.log("✅ SSE 연결 성공");
      };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📡 실시간 알림 수신:", data);
      onMessage(data); // 알림 목록에 추가
    };

    eventSource.onerror = (err) => {
      console.error("SSE 연결 에러", err);
      eventSource.close(); // 오류 시 연결 종료
    };

    return () => {
      eventSource.close(); // 연결 종료
    };
  }, []);

  return null;
}
