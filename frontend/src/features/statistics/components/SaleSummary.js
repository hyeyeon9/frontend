export default function SaleSummary({ salesData1, salesData2 }) {
  const sumSales = (data) =>
    data.reduce((acc, cur) => acc + cur.totalAmount, 0);
  const sumCount = (data) => data.reduce((acc, cur) => acc + cur.count, 0);

  const total1 = sumSales(salesData1);
  const total2 = sumSales(salesData2);
  const count1 = sumCount(salesData1);
  const count2 = sumCount(salesData2);
  const avg1 = count1 ? total1 / count1 : 0;
  const avg2 = count2 ? total2 / count2 : 0;

  const getPercent = (v1, v2) => {
    if (v1 === 0) return "N/A";
    const diff = ((v2 - v1) / v1) * 100;
    const arrow = diff > 0 ? "🔺" : diff < 0 ? "🔻" : "➡️";
    return `${arrow} ${diff.toFixed(1)}%`;
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">매출 요약 비교</h2>
      <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-700">
        <div>
          <div className="font-medium">총 매출</div>
          <div>₩{total1.toLocaleString()}</div>
          <div>₩{total2.toLocaleString()}</div>
          <div className="text-indigo-600">{getPercent(total1, total2)}</div>
        </div>
        <div>
          <div className="font-medium">총 건수</div>
          <div>{count1.toLocaleString()}건</div>
          <div>{count2.toLocaleString()}건</div>
          <div className="text-indigo-600">{getPercent(count1, count2)}</div>
        </div>
        <div>
          <div className="font-medium">객단가</div>
          <div>₩{avg1.toFixed(0)}</div>
          <div>₩{avg2.toFixed(0)}</div>
          <div className="text-indigo-600">{getPercent(avg1, avg2)}</div>
        </div>
      </div>
    </div>
  );
}
