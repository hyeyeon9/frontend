import React, { useEffect, useState } from "react";

export function InfoModal({ isOpen, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // 모달이 열리거나 닫힐 때 애니메이션 처리
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      document.body.style.overflow = ""; // ✅ 스크롤 복원
    }

    return () => {
      document.body.style.overflow = ""; // ✅ 혹시 모를 cleanup
    };
  }, [isOpen]);

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[2000] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center z-[2001] p-4 ">
        {/* 모달 콘텐츠 */}
        <div
          className={`bg-white rounded-lg shadow-xl w-[460px]  transition-all duration-300 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 모달 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-blue-500"
              >
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
              🔍 장바구니 분석이란?
            </h3>
          </div>

          {/* 모달 본문 */}
          <div className="px-6 py-4 mt-3 space-y-4">
            <p className="text-center text-sm text-gray-600">
              고객이 어떤 상품을 함께 구매하는지 분석해서 <br></br>
              매출을 올릴 수 있는 방법을 알려드려요!
            </p>

            <div className="grid gap-3">
              {/* 지지도 */}
              <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 20V10"></path>
                    <path d="M12 20V4"></path>
                    <path d="M6 20v-6"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-700">
                    지지도 : 함께 얼마나 팔렸나요?
                  </p>
                  <p className="text-xs text-blue-600">
                    두 상품이 얼마나 자주 함께 팔렸는지 보여드려요.
                  </p>
                </div>
              </div>

              {/* 신뢰도 */}
              <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M11 9l3 3l-3 3"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path>
                    <path d="M18 9a2 2 0 1 1 4 0a2 2 0 0 1-4 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-700">
                    신뢰도 : 같이 살 확률이 얼마나 되나요?
                  </p>
                  <p className="text-xs text-green-600">
                    한 상품을 산 고객이 다른 상품도 살 확률이에요.
                  </p>
                </div>
              </div>

              {/* 향상도 */}
              <div className="flex items-start gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m23 6-9.5 9.5-5-5L1 18"></path>
                    <path d="M17 6h6v6"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-purple-700">
                    향상도 : 정말 관련이 있나요?
                  </p>
                  <p className="text-xs text-purple-600">
                    단순히 우연히 아니라 실제로 관련이 있는지 알려줘요.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-center text-sm text-gray-600">
                💡 이 데이터로 세트상품, 매장 진열 개선에 활용해 보세요!
              </p>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
              onClick={onClose}
            >
              알겠어요!
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
