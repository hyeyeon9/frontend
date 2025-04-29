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
  Target,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

function DisposalAnalyze() {
  // 도넛 그래프를 위한 통계 data
  const [data, setData] = useState([]);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [topItems, setTopItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [disposalRates, setDisposalRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 저번 달 top3 품목 저장
  const [prevMonthTopItems, setPrevMonthTopItems] = useState([]);
  // 집중 관리 대상 품목 저장
  const [focusItems, setFocusItems] = useState([]);

  useEffect(() => {
    async function getStats() {
      setLoading(true);
      try {
        const res = await fetchStats(month, year);
        const formatted = res
          .map((item) => ({
            id: item.subCategoryName,
            label: item.subCategoryName,
            value: item.totalQuantity,
          }))
          .filter((item) => item.value > 0);

        setData(formatted);
        const filtered_data = formatted.map((item) => item.label);
        setFiltered(filtered_data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getStats();
  }, [month, year]);

  useEffect(() => {
    async function getDisposalData() {
      if (!filtered || filtered.length === 0) return;
      try {
        const response = await fetchDisposalRate(
          filtered.join(","),
          month,
          year
        );
        const top3 = response
          .sort((a, b) => b.disposalRate - a.disposalRate)
          .slice(0, 3);
        setTopItems(top3);
        setDisposalRates(top3);
        fetchFocusItems(top3);
      } catch (error) {
        console.error(error.message);
      }
    }
    getDisposalData();
  }, [filtered, month, year]);

  async function fetchFocusItems(currentTop3) {
    try {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevResponse = await fetchDisposalRate(
        filtered.join(","),
        prevMonth,
        prevYear
      );
      const prevTop3 = prevResponse
        .sort((a, b) => b.disposalRate - a.disposalRate)
        .slice(0, 3);
      setPrevMonthTopItems(prevTop3);
      const focusTargets = currentTop3.filter((current) =>
        prevTop3.some((prev) => prev.subName === current.subName)
      );
      setFocusItems(focusTargets);
    } catch (error) {
      console.error("집중 관리 품목 계산 오류", error);
    }
  }

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
    return "text-green-600";
  };

  // 폐기율에 따른 배경색 결정
  const getRateBgColor = (rate) => {
    if (rate >= 50) return "bg-red-500";
    if (rate >= 30) return "bg-orange-400";
    if (rate >= 10) return "bg-yellow-400";
    return "bg-green-500";
  };

  // 이전 달 대비 증감 계산
  const getChangeFromPrevMonth = (currentItem) => {
    const prevItem = prevMonthTopItems.find(
      (item) => item.subName === currentItem.subName
    );
    if (!prevItem) return null;

    const change = currentItem.disposalRate - prevItem.disposalRate;
    return {
      value: change.toFixed(1),
      increased: change > 0,
    };
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
              className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium flex items-center"
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
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              폐기 통계 분석
            </h2>

            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex items-center space-x-2">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {[...Array(3)].map((_, i) => (
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
                  className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>

              <button
                onClick={goToCurrentMonth}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200 transition-colors"
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-80 text-red-500">
                <AlertCircle className="h-6 w-6 mr-2" />
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
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
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
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    이번 달에는{" "}
                    <span className="font-bold text-purple-700">
                      {topItems.map((item, i) => (
                        <span key={item.subName}>
                          {item.subName}
                          {i < topItems.length - 1 && ", "}
                        </span>
                      ))}
                    </span>{" "}
                    품목의 폐기량이 특히 높았습니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    입고 대비 폐기율
                  </h4>

                  {disposalRates.length > 0 ? (
                    <div className="space-y-3">
                      {disposalRates.map((item) => {
                        const change = getChangeFromPrevMonth(item);
                        const isFocusItem = focusItems.some(
                          (focusItem) => focusItem.subName === item.subName
                        );

                        return (
                          <div
                            key={item.subName}
                            className={`bg-white border ${
                              isFocusItem ? "border-red-300" : "border-gray-200"
                            } rounded-lg p-3 transition-all hover:shadow-md relative group`}
                          >
                            {isFocusItem && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                <Target className="h-4 w-4" />
                              </div>
                            )}

                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium flex items-center">
                                {item.subName}
                                {isFocusItem && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    집중관리
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center">
                                <span
                                  className={`font-bold ${getRateColor(
                                    item.disposalRate
                                  )}`}
                                >
                                  {item.disposalRate}%
                                </span>

                                {change && (
                                  <span
                                    className={`ml-2 text-xs flex items-center ${
                                      change.increased
                                        ? "text-red-500"
                                        : "text-green-500"
                                    }`}
                                  >
                                    {change.increased ? "+" : ""}
                                    {change.value}%p
                                    <ArrowUpRight
                                      className={`h-3 w-3 ml-0.5 ${
                                        !change.increased && "rotate-180"
                                      }`}
                                    />
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${getRateBgColor(
                                  item.disposalRate
                                )}`}
                                style={{
                                  width: `${Math.min(100, item.disposalRate)}%`,
                                }}
                              ></div>
                            </div>

                            {/* 툴팁 */}
                            {/* <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity absolute z-10 -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 w-48">
                              <div className="flex justify-between mb-1">
                                <span>입고량:</span>
                                <span>{item.inQuantity}개</span>
                              </div>
                              <div className="flex justify-between">
                                <span>폐기량:</span>
                                <span>{item.disposalQuantity}개</span>
                              </div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div> */}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      폐기율 데이터를 불러오는 중입니다...
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                    개선 제안
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-5">
                    {focusItems.length > 0 ? (
                      <li className="font-medium">
                        <span className="text-red-600">
                          집중 관리 필요 품목:
                        </span>{" "}
                        {focusItems.map((item, i) => (
                          <span key={item.subName}>
                            {item.subName}
                            {i < focusItems.length - 1 && ", "}
                          </span>
                        ))}
                        <p className="text-xs mt-1 font-normal">
                          연속 2개월 이상 폐기율 상위 품목으로, 특별 관리가
                          필요합니다.
                        </p>
                      </li>
                    ) : null}
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
