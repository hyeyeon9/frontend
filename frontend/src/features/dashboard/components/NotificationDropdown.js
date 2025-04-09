"use client"

import { useState } from "react"

import { useEffect, useRef } from "react"

// 알림 드롭다운 컴포넌트
export default function NotificationDropdown({
  alertList,
  setAlertList,
  showUnreadOnly,
  setShowUnreadOnly,
  showAlertDropdown,
  setShowAlertDropdown,
  position = { top: "60px", right: "20px" },
}) {
  // 현재 선택된 탭 (결제, 재고, 폐기, 전체)
  const [activeTab, setActiveTab] = useState("전체")

  // 드롭다운 ref (외부 클릭 감지용)
  const dropdownRef = useRef(null)

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
  }, [setShowAlertDropdown])

  // 알림 읽음/안읽음 상태 토글 함수
  const toggleReadStatus = (alertIndex) => {
    const updatedAlerts = [...alertList]
    updatedAlerts[alertIndex].read = !updatedAlerts[alertIndex].read
    setAlertList(updatedAlerts)
  }

  // 모든 알림 읽음 처리 함수
  const markAllAsRead = () => {
    setAlertList(alertList.map((alert) => ({ ...alert, read: true })))
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

  // 알림 드롭다운 위치 스타일
  const positionStyle = {
    position: "absolute",
    ...position,
  }

  return (
    <div className="relative notification-dropdown" ref={dropdownRef} style={positionStyle}>
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
        <div className="absolute right-0 mt-2 w-96  bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
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
          <div className="max-h-[400px] overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-sm text-gray-500">
                {showUnreadOnly ? "읽지 않은 알림이 없습니다" : "알림이 없습니다"}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAlerts.map((alert, index) => {
                  const { bgColor, icon } = getAlertStyle(alert.type)

                  return (
                    <div
                      key={alert.id || index}
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
                              onClick={() => toggleReadStatus(alertList.indexOf(alert))}
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
