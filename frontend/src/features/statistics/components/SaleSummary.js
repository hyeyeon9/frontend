import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

export default function SaleSummary({ salesData1, salesData2, date1, date2 }) {
  const sumSales = (data) => data.reduce((acc, cur) => acc + cur.dailyPrice, 0);
  const sumCount = (data) =>
    data.reduce((acc, cur) => acc + cur.dailyAmount, 0);

  const total1 = sumSales(salesData1);
  const total2 = sumSales(salesData2);
  const count1 = sumCount(salesData1);
  const count2 = sumCount(salesData2);
  const avg1 = count1 ? total1 / count1 : 0;
  const avg2 = count2 ? total2 / count2 : 0;

  const getPercent = (v1, v2) => {
    if (v1 === 0) return "N/A";
    const diff = ((v2 - v1) / v1) * 100;
    return diff.toFixed(1);
  };

  // 증가/감소 여부 확인 함수
  const getDiffStatus = (v1, v2) => {
    if (v1 === 0) return "neutral";
    if (v2 > v1) return "increase";
    if (v2 < v1) return "decrease";
    return "neutral";
  };

  // 증가/감소에 따른 아이콘 반환
  const getDiffIcon = (status) => {
    switch (status) {
      case "increase":
        return <TrendingUpIcon className="h-4 w-4" />;
      case "decrease":
        return <TrendingDownIcon className="h-4 w-4" />;
      default:
        return <MinusIcon className="h-4 w-4" />;
    }
  };

  // 증가/감소에 따른 배경색 클래스 반환
  const getDiffBgClass = (status) => {
    switch (status) {
      case "increase":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "decrease":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const items = [
    {
      title: "총 매출",
      description: "해당 기간 동안의 전체 매출 금액",
      value1: `₩${total1.toLocaleString()}`,
      value2: `₩${total2.toLocaleString()}`,
      diff: getPercent(total1, total2),
      status: getDiffStatus(total1, total2),
    },
    {
      title: "총 건수",
      description: "해당 기간 동안의 총 판매 건수",
      value1: `${count1.toLocaleString()}건`,
      value2: `${count2.toLocaleString()}건`,
      diff: getPercent(count1, count2),
      status: getDiffStatus(count1, count2),
    },
    {
      title: "객단가",
      description: "고객 1인당 평균 구매 금액",
      value1: `₩${Number(avg1.toFixed(0)).toLocaleString()}`,
      value2: `₩${Number(avg2.toFixed(0)).toLocaleString()}`,
      diff: getPercent(avg1, avg2),
      status: getDiffStatus(avg1, avg2),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-800">매출 요약</h2>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm overflow-hidden relative"
          >
            {/* 배경 장식 */}
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-indigo-100 opacity-50"></div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDiffBgClass(
                    item.status
                  )} border`}
                >
                  {getDiffIcon(item.status)}
                  {item.diff === "N/A" ? "N/A" : `${item.diff}%`}
                </div>
              </div>

              {/* 설명 추가 */}
              <p className="text-xs text-gray-500 mb-3">{item.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="md:hidden lg:inline">
                      기준일
                      <br />
                      {date1}
                    </span>
                    <span className="hidden md:inline lg:hidden">
                      기준일 {date1}
                    </span>
                  </div>
                  <div className="font-bold text-gray-800">{item.value1}</div>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3">
                  <div className="text-xs text-indigo-600 mb-1">
                    <span className="md:hidden lg:inline">
                      비교일
                      <br />
                      {date2}
                    </span>
                    <span className="hidden md:inline lg:hidden">
                      비교일 {date2}
                    </span>
                  </div>
                  <div className="font-bold text-indigo-800">{item.value2}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
