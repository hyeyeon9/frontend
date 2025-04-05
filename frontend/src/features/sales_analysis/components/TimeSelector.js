import { Clock } from "lucide-react";

export default function TimeSelector({
  salesData,
  selectedHour,
  onTimeSelect,
}) {
  // 시간대별로 데이터 그룹화 (문자열과 숫자 모두 처리)
  const groupedByHour = salesData.reduce((acc, item) => {
    // alertHour가 숫자인지 문자열인지 확인하고 문자열로 통일
    const hour =
      typeof item.alertHour === "number"
        ? item.alertHour.toString()
        : item.alertHour;

    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(item);
    return acc;
  }, {});

  // 디버깅용 로그 (개발 중에만 사용)
  console.log("Grouped hours:", Object.keys(groupedByHour));
  console.log("First few sales data items:", salesData.slice(0, 3));

  // 시간대 선택 함수
  const handleHourSelect = (hour) => {
    // 데이터가 없는 경우 클릭 방지
    if (!hasDataForHour(hour)) {
      return;
    }

    // 해당 시간의 첫 번째 데이터를 선택
    const hourKey = findMatchingHourKey(hour);
    const data = groupedByHour[hourKey][0];
    onTimeSelect(hour, data);
  };

  // 시간에 대한 데이터가 있는지 확인하는 함수
  const hasDataForHour = (hour) => {
    // 정확한 키 매칭 또는 숫자 변환 후 매칭 확인
    return findMatchingHourKey(hour) !== null;
  };

  // 시간에 맞는 키를 찾는 함수 (다양한 형식 지원)
  const findMatchingHourKey = (hour) => {
    // 정확한 문자열 매칭
    if (groupedByHour[hour]) {
      return hour;
    }

    // 숫자로 변환하여 매칭 (예: "01" -> "1", "00" -> "0")
    const numericHour = Number.parseInt(hour, 10).toString();
    if (groupedByHour[numericHour]) {
      return numericHour;
    }

    // 한 자리 숫자에 0 패딩 추가하여 매칭 (예: "1" -> "01")
    const paddedHour = hour.padStart(2, "0");
    if (groupedByHour[paddedHour]) {
      return paddedHour;
    }

    return null;
  };

  // 24시간 배열 생성
  const allHours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  // AM/PM 시간 분리
  const amHours = allHours.slice(0, 12);
  const pmHours = allHours.slice(12, 24);

  // 시간 블록 렌더링 함수
  const renderHourBlock = (hour) => {
    const hourHasData = hasDataForHour(hour);
    const hourKey = findMatchingHourKey(hour);
    const data = hourHasData ? groupedByHour[hourKey][0] : null;
    const isPositive = data && data.difference > 0;
    const isNegative = data && data.difference < 0;

    return (
      <button
        key={hour}
        onClick={() => handleHourSelect(hour)}
        disabled={!hourHasData}
        className={`
          relative flex flex-col items-center justify-center p-2 rounded-lg transition-all
          ${
            selectedHour === hour
              ? "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2"
              : hourHasData
              ? isPositive
                ? "bg-green-50 hover:bg-green-100 border border-green-200"
                : isNegative
                ? "bg-red-50 hover:bg-red-100 border border-red-200"
                : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
              : "bg-gray-50 border border-gray-200 opacity-40 cursor-not-allowed"
          }
        `}
      >
        <div className="text-base font-medium">{Number.parseInt(hour)}</div>
        <div className="text-[10px]">시</div>

        {/* 변화량 표시 (데이터가 있는 경우만) */}
        {hourHasData && (
          <div
            className={`
              absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold
              ${
                isPositive
                  ? "bg-green-500 text-white"
                  : isNegative
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }
            `}
          >
            {isPositive ? "↑" : isNegative ? "↓" : "-"}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      {/* 모바일: 6시간씩 4줄 */}
      <div className="grid grid-cols-6 gap-2 md:hidden">
        {allHours.map(renderHourBlock)}
      </div>

      {/* 태블릿 이상: AM/PM 구분 */}
      <div className="hidden md:block">
        <div className="mb-1">
          <div className="text-xs font-medium text-gray-500 mb-1">오전</div>
          <div className="grid grid-cols-12 gap-2">
            {amHours.map(renderHourBlock)}
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">오후</div>
          <div className="grid grid-cols-12 gap-2">
            {pmHours.map(renderHourBlock)}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        <span>
          시간을 선택하여 상세 정보를 확인하세요 (회색 시간대는 당일 매출액이
          0원입니다)
        </span>
      </div>
    </div>
  );
}
