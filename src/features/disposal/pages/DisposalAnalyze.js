import { useEffect, useState } from "react";
import DisposalPieChart from "./DisposalPieChart";
import { fetchDisposalRate, fetchStats } from "../api/HttpDisposalService";
import { Link } from "react-router-dom";

function DisposalAnalyze() {
  // 도넛 그래프를 위한 통계 data
  const [data, setData] = useState([]);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [topItems, setTopItems] = useState([]);
  const [disposalRates, setDisposalRates] = useState([]);

  // 폐기 월별 통계를 위한 함수
  useEffect(() => {
    async function getStats() {
      try {
        console.log(year, month);

        const res = await fetchStats(month, year);
        // 데이터 가공
        const formatted = res
          .map((item) => ({
            id: item.subCategoryName,
            label: item.subCategoryName,
            value: item.totalQuantity,
          }))
          .filter((item) => item.value > 0);

        console.log("도넛 데이터:", formatted);
        setData(formatted);

        const top3 = [...formatted]
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map((item) => item.label);

        setTopItems(top3);

        console.log(top3);
      } catch (error) {
        console.log(error.message);
      }
    }
    getStats();
  }, [month, year]);

  // 입고 대비 폐기 비율
  useEffect(() => {
    async function getDisposalRate() {
      if (topItems.length === 0) return;

      try {
        console.log(topItems.join(",")); //주먹밥
        const response = await fetchDisposalRate(
          topItems.join(","),
          month,
          year
        );
        console.log("폐기율 응답:", response);
        setDisposalRates(response);
      } catch (error) {
        console.log(error.message);
      }
    }
    getDisposalRate();
  }, [topItems, month, year]);

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Link to="/disposal" className="text-gray-600 hover:underline ">
          📋 폐기 내역
        </Link>
        <Link
          to="/disposal/analyze"
          className="text-blue-600 hover:underline font-semibold"
        >
          📊 폐기 통계
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="font-medium">연도:</label>

        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>

        <label className="font-medium">월:</label>
        <select
          className="border p-1 rounded"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}월
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-10">
        <div className="w-full ">
          <DisposalPieChart data={data} />
        </div>
        {/* 오른쪽: 해석 문구 */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {year}년 {month}월 폐기 통계 분석
          </h2>
          <div>
            <p className="text-gray-700 leading-relaxed">
              이번 달에는{" "}
              <span className="font-medium text-blue-600">
                {topItems.map((name, i) => (
                  <span key={name}>
                    {name}
                    {i < topItems.length - 1 && ", "}
                  </span>
                ))}
              </span>
              품목의 폐기량이 특히 높았습니다. <br />
              재고 및 유통기한 관리, 발주량 조정을 고려해보세요.
            </p>
          </div>
          <div className="text-gray-700 leading-relaxed mt-4">
            {disposalRates.length > 0 ? (
              disposalRates.map((item) => (
                <p key={item.subName}>
                  <span className="font-semibold text-blue-600">
                    {item.subName}
                  </span>
                  은(는) 입고된 수량 중{" "}
                  <span className="font-semibold text-red-600">
                    {item.disposalRate}%
                  </span>
                  가 폐기되어 주의가 필요합니다.
                </p>
              ))
            ) : (
              <p>폐기율 데이터를 불러오는 중입니다...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisposalAnalyze;
