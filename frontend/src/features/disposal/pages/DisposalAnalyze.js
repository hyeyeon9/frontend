import { useEffect, useState } from "react";
import DisposalPieChart from "./DisposalPieChart";
import { fetchDisposalRate, fetchStats } from "../api/HttpDisposalService";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  AlertTriangle,
  BarChart,
} from "lucide-react";

function DisposalAnalyze() {
  // 도넛 그래프를 위한 통계 data
  const [data, setData] = useState([]);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [topItems, setTopItems] = useState([]);
  const [disposalRates, setDisposalRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 폐기 월별 통계를 위한 함수
  useEffect(() => {
    async function getStats() {
      setLoading(true);
      try {
        const res = await fetchStats(month, year);
        console.log("년월 폐기", res);
        // 데이터 가공
        const formatted = res
          .map((item) => ({
            id: item.subCategoryName,
            label: item.subCategoryName,
            value: item.totalQuantity,
          }))
          .filter((item) => item.value > 0);

        setData(formatted);

        const top3 = [...formatted]
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map((item) => item.label);

        setTopItems(top3);
        console.log("년월 폐기 top3", top3);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getStats();
  }, [month, year]);

  // 입고 대비 폐기 비율
  useEffect(() => {
    async function getDisposalRate() {
      if (topItems.length === 0) return;

      try {
        const response = await fetchDisposalRate(
          topItems.join(","),
          month,
          year
        );
        console.log("년월 폐기 비율 response", response);
        setDisposalRates(response);
      } catch (error) {
        console.log(error.message);
      }
    }
    getDisposalRate();
  }, [topItems, month, year]);

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // 현재 달로 이동
  const goToCurrentMonth = () => {
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  };

  // 폐기율에 따른 색상 결정
  const getRateColor = (rate) => {
    if (rate >= 20) return "text-red-600";
    if (rate >= 10) return "text-orange-500";
    return "text-yellow-600";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 네비게이션 탭 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <Link
              to="/disposal"
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex items-center"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              폐기 내역
            </Link>
            <Link
              to="/disposal/analyze"
              className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium flex items-center"
            >
              <BarChart className="h-4 w-4 mr-2" />
              폐기 통계
            </Link>
          </div>
        </div>

        {/* 날짜 선택기 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              폐기 통계 분석
            </h2>

            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex items-center space-x-2">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[...Array(2)].map((_, i) => (
                    <option
                      key={now.getFullYear() - i}
                      value={now.getFullYear() - i}
                    >
                      {now.getFullYear() - i}년
                    </option>
                  ))}
                </select>

                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}월
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={goToCurrentMonth}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
              >
                현재 달
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 차트 영역 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {year}년 {month}월 폐기 품목 분포
            </h3>

            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-80 text-red-500">
                데이터를 불러오는 중 오류가 발생했습니다.
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-80 text-gray-500">
                <Info className="h-12 w-12 mb-2 text-gray-400" />
                <p>해당 기간에 폐기 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="h-80">
                <DisposalPieChart data={data} />
              </div>
            )}
          </div>

          {/* 분석 영역 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
              폐기 분석 리포트
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : data.length === 0 ? (
              <div className="text-gray-500 italic">
                해당 기간에 분석할 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    이번 달에는{" "}
                    <span className="font-medium text-indigo-700">
                      {topItems.map((name, i) => (
                        <span key={name}>
                          {name}
                          {i < topItems.length - 1 && ", "}
                        </span>
                      ))}
                    </span>{" "}
                    품목의 폐기량이 특히 높았습니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">
                    입고 대비 폐기율
                  </h4>

                  {disposalRates.length > 0 ? (
                    <div className="space-y-3">
                      {disposalRates.map((item) => (
                        <div
                          key={item.subName}
                          className="bg-white border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{item.subName}</span>
                            <span
                              className={`font-bold ${getRateColor(
                                item.disposalRate
                              )}`}
                            >
                              {item.disposalRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.disposalRate >= 50
                                  ? "bg-red-500"
                                  : item.disposalRate >= 30
                                  ? "bg-yellow-300"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(100, item.disposalRate)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      폐기율 데이터를 불러오는 중입니다...
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    개선 제안
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
                    <li>재고 및 유통기한 관리 강화</li>
                    <li>발주량 조정 검토</li>
                    <li>고객 선호도 분석을 통한 상품 구성 최적화</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisposalAnalyze;
