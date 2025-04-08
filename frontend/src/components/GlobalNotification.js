"use client"

import { useState, useEffect, useRef } from "react"

// 전역 알림 컴포넌트
export default function GlobalNotification() {
  // 알림 목록 상태 (로컬스토리지에서 불러오기)
  const [alertList, setAlertList] = useState(() => {
    const saved = localStorage.getItem("admin_alerts")
    return saved ? JSON.parse(saved) : []
  })

  // 알림 드롭다운 표시 여부
  const [showAlertDropdown, setShowAlertDropdown] = useState(false)

  // 읽지 않은 알림만 표시 여부
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // 현재 선택된 탭 (결제, 재고, 폐기, 전체)
  const [activeTab, setActiveTab] = useState("전체")

  // 드롭다운 ref (외부 클릭 감지용)
  const dropdownRef = useRef(null)

  // 모바일 화면 여부 확인
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640) // sm 브레이크포인트
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024) // md 브레이크포인트
    }

    // 초기 체크
    checkScreenSize()

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // 알림 목록이 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (alertList.length > 0) {
      localStorage.setItem("admin_alerts", JSON.stringify(alertList))
    }
  }, [alertList])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAlertDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // SSE 리스너 설정
  useEffect(() => {
    console.log("📡 SSE 연결 시도중...")
    // EventSource: SSE (Server-Sent Events)를 위한 브라우저 내장 객체
    const eventSource = new EventSource("http://localhost:8090/app/sse/connect?clientId=admin")

    eventSource.onopen = () => {
      console.log("✅ SSE 연결 성공")
    }

    // 메시지 수신 시 처리
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📡 실시간 알림 수신:", data)

        // 알림 타입 매핑 (기존 타입을 새 탭 카테고리로 변환)
        let mappedType = "일반"

        if (data.type === "유통기한임박" || data.type === "자동폐기") {
          mappedType = "폐기"
        } else if (data.type === "재고부족") {
          mappedType = "재고"
        } else if (data.type === "결제완료" || data.type === "환불" || data.type === "주문") {
          mappedType = "결제"
        }

        // 새 알림 추가
        addNewAlert({
          ...data,
          type: mappedType,
        })
      } catch (error) {
        console.error("SSE 메시지 처리 오류:", error)
      }
    }

    // 에러 처리
    eventSource.onerror = (error) => {
      console.error("SSE 연결 오류:", error)
      eventSource.close()

      // 3초 후 재연결 시도
      setTimeout(() => {
        console.log("SSE 재연결 시도...")
        // 컴포넌트가 마운트된 상태일 때만 재연결
      }, 3000)
    }

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      console.log("SSE 연결 종료")
      eventSource.close()
    }
  }, [])

  // 새 알림 추가 함수
  const addNewAlert = (data) => {
    setAlertList((prevAlerts) => {
      // 중복 알림 체크
      const isDuplicate = prevAlerts.some((alert) => alert.message === data.message && alert.type === data.type)

      if (!isDuplicate) {
        // 새 알림 생성
        const newAlert = {
          id: Date.now().toString(), // 고유 ID 생성
          type: data.type || "일반",
          message: data.message || "새 알림 도착",
          time: "방금 전",
          read: false,
        }

        // 알림 목록 업데이트
        const updated = [newAlert, ...prevAlerts]

        // 로컬스토리지에 저장
        localStorage.setItem("admin_alerts", JSON.stringify(updated))

        return updated
      }

      return prevAlerts // 중복이면 이전 상태 그대로 반환
    })
  }

  // 알림 읽음/안읽음 상태 토글 함수
  const toggleReadStatus = (alertId) => {
    setAlertList((prevAlerts) =>
      prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, read: !alert.read } : alert)),
    )
  }

  // 모든 알림 읽음 처리 함수
  const markAllAsRead = () => {
    setAlertList((prevAlerts) => prevAlerts.map((alert) => ({ ...alert, read: true })))
  }

  // 필터링된 알림 목록 계산
  const filteredAlerts = alertList
    .filter((alert) => !showUnreadOnly || !alert.read) // 읽지 않은 알림만 표시 옵션
    .filter((alert) => activeTab === "전체" || alert.type === activeTab) // 선택된 탭에 따라 필터링

  // 각 탭별 읽지 않은 알림 개수 계산
  const unreadCounts = {
    전체: alertList.filter((alert) => !alert.read).length,
    결제: alertList.filter((alert) => !alert.read && alert.type === "결제").length,
    재고: alertList.filter((alert) => !alert.read && alert.type === "재고").length,
    폐기: alertList.filter((alert) => !alert.read && alert.type === "폐기").length,
  }

  // 알림 유형에 따른 스타일 및 아이콘 설정
  const getAlertStyle = (type) => {
    switch (type) {
      case "결제":
        return { bgColor: "bg-blue-50", icon: "💰" }
      case "재고":
        return { bgColor: "bg-amber-50", icon: "📦" }
      case "폐기":
        return { bgColor: "bg-red-50", icon: "🗑️" }
      default:
        return { bgColor: "bg-gray-50", icon: "📢" }
    }
  }

  // 모바일/태블릿에 따른 드롭다운 너비 조정
  const getDropdownWidth = () => {
    if (isMobile) return "w-[calc(100vw-32px)]" // 모바일에서는 화면 너비의 대부분
    if (isTablet) return "w-80" // 태블릿에서는 중간 크기
    return "w-96" // 데스크탑에서는 원래 크기
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* 알림 아이콘 버튼 */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => setShowAlertDropdown((prev) => !prev)}
        aria-label="알림"
      >
        <svg
          className="h-6 w-6 text-gray-600 hover:text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 읽지 않은 알림 개수 표시 */}
        {unreadCounts.전체 > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCounts.전체}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {showAlertDropdown && (
        <div
          className={`absolute right-0 mt-2 ${getDropdownWidth()} bg-white border border-gray-200 rounded-lg shadow-lg z-[110] overflow-hidden`}
        >
          {/* 드롭다운 헤더 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-800">알림</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="text-xs px-2 py-1 rounded hover:bg-gray-100"
              >
                {showUnreadOnly ? "전체 보기" : "안읽은 알림만"}
              </button>

              {unreadCounts.전체 > 0 && (
                <button onClick={markAllAsRead} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">
                  모두 읽음
                </button>
              )}
            </div>
          </div>

          {/* 알림 탭 */}
          <div className="flex border-b">
            {["전체", "결제", "재고", "폐기"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 py-2 text-center text-sm font-medium ${
                  activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {/* 탭별 읽지 않은 알림 개수 표시 */}
                {unreadCounts[tab] > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-medium text-white">
                    {unreadCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 알림 목록 */}
          <div className={`${isMobile ? "max-h-[70vh]" : "max-h-[400px]"} overflow-y-auto`}>
            {filteredAlerts.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-sm text-gray-500">
                {showUnreadOnly ? "읽지 않은 알림이 없습니다" : "알림이 없습니다"}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAlerts.map((alert) => {
                  const { bgColor, icon } = getAlertStyle(alert.type)

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 ${bgColor} ${
                        !alert.read ? "bg-opacity-70" : "bg-opacity-30"
                      } hover:bg-opacity-100 transition-colors`}
                    >
                      <div className="flex gap-3">
                        <div className="text-lg flex-shrink-0">{icon}</div>
                        <div className="flex-1">
                          <p className={`text-sm ${!alert.read ? "font-medium" : ""} text-gray-800`}>{alert.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              {alert.time}
                              {alert.read && <span className="ml-2 text-gray-400">읽음</span>}
                            </p>
                            <button
                              onClick={() => toggleReadStatus(alert.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                              {alert.read ? "안읽음 표시" : "읽음 표시"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
