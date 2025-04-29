import { useEffect, useState } from "react";
import {
  fetchAllAssociationRules,
  fetchAllAssociationTimeRules,
  fetchWeekSales,
} from "../api/HttpCartAnalysisService";
import AssociationTable from "../components/AssociationTable";
import HeatmapChart from "../components/HeatmapChart";
import { useTime } from "../../../contexts/TimeContext";
import LineChart from "../components/LineChart ";
import { categoryMap } from "../components/categoryMap";
import {
  BarChart2,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Info,
  LineChartIcon,
  Search,
  ShoppingBag,
  ShoppingCart,
  Target,
  X,
  Coffee,
  Sunrise,
  Sunset,
  Moon,
  Sun,
} from "lucide-react";
import { InfoModal } from "../components/InfoModal";

function getTimePeriod(time) {
  const hour = time.split(":")[0];

  if (hour >= 5 && hour < 11) return "아침";
  if (hour >= 11 && hour < 15) return "점심";
  if (hour >= 15 && hour < 18) return "한가한 오후";
  if (hour >= 18 && hour < 23) return "저녁";
  if (hour >= 23 || hour < 5) return "심야";
}

// 시간대별 아이콘 매핑
function getTimePeriodIcon(timePeriod) {
  switch (timePeriod) {
    case "아침":
      return <Sunrise className="h-6 w-6 text-orange-500" />;
    case "점심":
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case "한가한 오후":
      return <Coffee className="h-6 w-6 text-blue-500" />;
    case "저녁":
      return <Sunset className="h-6 w-6 text-indigo-500" />;
    default:
      return <Moon className="h-6 w-6 text-purple-500" />;
  }
}

function Association() {
  const [rules, setRules] = useState([]);
  const [timeRules, setTimeRules] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { date, time } = useTime();
  const timePeriod = getTimePeriod(time);

  // 년별, 월별 연관관계 확인을 위한 상태
  const [period, setPeriod] = useState("");
  const [month, setMonth] = useState("");

  // 지지도, 신뢰도, 향상도 조절을 위한 상태
  const [minSupport, setMinSupport] = useState(0.03);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [minLift, setMinLift] = useState(1.5);

  const [selectedTopRule, setSelectedTopRule] = useState(null);
  const [activeTab, setActiveTab] = useState("heatmap"); // 'heatmap' or 'table'

  // 장바구니 설명 모달
  const [showModal, setShowModal] = useState(false);

  const topRules = rules
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // 전체상품 연관관계
  useEffect(() => {
    if (!rules) return;

    async function getAssociationRules() {
      try {
        setLoading(true);
        const data = await fetchAllAssociationRules(period, month);
        console.log("원본 data", data);

        // 필터링 추가
        const filtered = data.filter((rule) => {
          return (
            rule.support >= 0.03 &&
            rule.support <= 0.08 &&
            rule.confidence >= 0.5 &&
            rule.confidence <= 0.9 &&
            rule.lift >= 1.5 &&
            rule.lift <= 3.0
          );
        });

        console.log("필터링된 data", filtered);
        setRules(filtered);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    getAssociationRules();
  }, [period, month]);

  // 시간대별 연관관계
  useEffect(() => {
    if (!timeRules) return;

    async function getAssociationTimeRules() {
      try {
        const data = await fetchAllAssociationTimeRules();
        console.log("시간대별 연관관계", data);
        const timeRules = data
          .filter((item) => item.time_period === timePeriod)
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 1);

        setTimeRules(timeRules);

        console.log("탑", timeRules);
      } catch (error) {
        setError(error.message);
      }
    }
    getAssociationTimeRules();
  }, [timePeriod]);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0"); // 월은 0~11이니까 +1 필요

    setPeriod(currentYear);
    setMonth(currentMonth);
  }, []);

  // 전체 연관관계 필터링
  const filteredRules = rules.filter(
    (rule) =>
      rule.support >= minSupport &&
      rule.confidence >= minConfidence &&
      rule.lift >= minLift
  );

  const [selectedChartData, setSelectedChartData] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [expandedRuleIndex, setExpandedRuleIndex] = useState(null);

  async function handleTopRuleClick(item, index) {
    // 이미 선택된 항목을 다시 클릭하면 닫기
    if (expandedRuleIndex === index) {
      setExpandedRuleIndex(null);
      return;
    }

    setSelectedTopRule(item);
    setExpandedRuleIndex(index);

    const rawItems = `${item.itemset_a},${item.itemset_b}`
      .split(",")
      .map((v) => v.trim());

    const targets = rawItems.filter((name) => categoryMap[name]);
    if (targets.length === 0) return;

    try {
      const results = await Promise.all(
        targets.map(async (name) => {
          const { categoryId, subCategoryId } = categoryMap[name];
          const data = await fetchWeekSales(categoryId, subCategoryId);
          return {
            id: name,
            data: data.map((d) => ({
              x: d.date,
              y: d.totalSales,
            })),
          };
        })
      );

      setSelectedChartData(results);
      setSelectedLabel(rawItems.join(" + "));
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2 text-indigo-600" />
            장바구니 분석
            <div className="group relative ml-2">
              <button
                onClick={() => setShowModal(true)}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </h1>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 필터 및 히트맵/테이블 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 필터 영역 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-indigo-600" />
                  분석 필터
                </h2>

                <div className="flex items-center gap-3">
                  <select
                    onChange={(e) => setPeriod(e.target.value)}
                    value={period}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">전체 기간</option>
                    <option value="2024">2024년</option>
                    <option value="2025">2025년</option>
                  </select>

                  <select
                    onChange={(e) => setMonth(e.target.value)}
                    value={month}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">전체 월</option>
                    <option value="01">1월</option>
                    <option value="02">2월</option>
                    <option value="03">3월</option>
                    <option value="04">4월</option>
                    <option value="05">5월</option>
                    <option value="06">6월</option>
                    <option value="07">7월</option>
                    <option value="08">8월</option>
                    <option value="09">9월</option>
                    <option value="10">10월</option>
                    <option value="11">11월</option>
                    <option value="12">12월</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      지지도{" "}
                      <span className="lg:hidden xl:inline">(Support)</span> ≥{" "}
                      {(minSupport * 100).toFixed(1)}%
                    </label>
                    <span className="text-xs text-gray-500">
                      {(0.08 * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.03"
                    max="0.08"
                    step="0.02"
                    value={minSupport}
                    onChange={(e) =>
                      setMinSupport(Number.parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>3%</span>
                    <span>8%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      신뢰도{" "}
                      <span className="lg:hidden xl:inline">(Confidence)</span>{" "}
                      ≥ {(minConfidence * 100).toFixed(0)}%
                    </label>
                    <span className="text-xs text-gray-500">
                      {(0.9 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="0.9"
                    step="0.05"
                    value={minConfidence}
                    onChange={(e) =>
                      setMinConfidence(Number.parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>50%</span>
                    <span>90%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      향상도 <span className="lg:hidden xl:inline">(Lift)</span>{" "}
                      ≥ {minLift.toFixed(1)}
                    </label>
                    <span className="text-xs text-gray-500">
                      {3.0.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="3.0"
                    step="0.5"
                    value={minLift}
                    onChange={(e) =>
                      setMinLift(Number.parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1.5</span>
                    <span>3.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("heatmap")}
                  className={`flex-1 py-3 px-4 text-center font-medium flex items-center justify-center ${
                    activeTab === "heatmap"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  히트맵 시각화
                </button>
                <button
                  onClick={() => setActiveTab("table")}
                  className={`flex-1 py-3 px-4 text-center font-medium flex items-center justify-center ${
                    activeTab === "table"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  연관 상품 목록
                </button>
              </div>

              {/* 히트맵 뷰 */}
              {activeTab === "heatmap" && (
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : error ? (
                    <div className="flex justify-center items-center h-64 text-red-500">
                      데이터를 불러오는 중 오류가 발생했습니다.
                    </div>
                  ) : filteredRules.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                      <Info className="h-12 w-12 mb-2 text-gray-400" />
                      <p>필터 조건에 맞는 연관 규칙이 없습니다.</p>
                      <p className="text-sm mt-2">필터 값을 조정해보세요.</p>
                    </div>
                  ) : (
                    <HeatmapChart data={filteredRules} />
                  )}
                </div>
              )}

              {/* 테이블 뷰 */}
              {activeTab === "table" && (
                <div className="p-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="상품명으로 검색"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {searchText && (
                      <button
                        onClick={() => setSearchText("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : error ? (
                    <div className="flex justify-center items-center h-64 text-red-500">
                      데이터를 불러오는 중 오류가 발생했습니다.
                    </div>
                  ) : (
                    <AssociationTable
                      data={filteredRules}
                      filteringText={searchText}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 추천 및 차트 */}
          <div className="space-y-6">
            {/* 현재 시간대 정보 - 개선된 UI */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 text-white">
                <h2 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  현재 시간대 분석
                </h2>
                <div className="flex items-center text-sm mt-1 opacity-80">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{date}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{time}</span>
                </div>
              </div>

              <div className="p-4 flex items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="xl:text-xl md:text-lg xl:pl-3 font-bold text-gray-800">
                      {timePeriod}
                    </h3>
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      현재
                    </span>
                  </div>

                  {timeRules.length > 0 ? (
                    <div className="mt-2 xl:pl-3">
                      <div className="flex flex-col items-start xl:w-full ">
                        {/* ✅ 조합 카드 영역 */}
                        <div className="flex flex-wrap md:flex-nowrap gap-4 px-2 mt-1 xl:w-full lg:w-[260px]">
                          {timeRules.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center bg-gray-100 lg:w-[80px]  -m1-5 lg:p-3 lg:-ml-3 rounded-xl p-4 flex-1"
                            >
                              <div className="flex xl:px-10 flex-col items-center mr-3 lg:p-0 xl:p-3 bg-white rounded-md shadow-sm min-w-[100px]">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  추천 1
                                </span>
                                <span className="font-medium text-indigo-600 text-base md:text-lg">
                                  {item.itemset_a}
                                </span>
                              </div>
                              <div className="flex items-center lg:m-0 lg:mr-2 text-gray-400 xl:ml-2 xl:mr-4 text-lg font-bold">
                                +
                              </div>
                              <div className="flex xl:px-10 flex-col items-center  lg:p-0 bg-white xl:p-3 rounded-md shadow-sm min-w-[100px]">
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  추천 2
                                </span>
                                <span className="font-medium text-indigo-600 text-base md:text-lg">
                                  {item.itemset_b}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 설명 문구 */}
                        <div className="mt-3 text-sm text-gray-500 flex items-center lg:hidden xl:flex">
                          <Info className="h-3 w-3 mr-1" />이 시간대에 가장 많이
                          함께 구매되는 상품입니다
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">
                      이 시간대의 추천 상품이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 추천 상품 조합 - 개선된 UI */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                추천 상품 조합
              </h2>

              {topRules.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  추천 상품 조합이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {topRules.map((item, idx) => (
                    <div key={idx} className="transition-all duration-300">
                      <div
                        onClick={() => handleTopRuleClick(item, idx)}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          expandedRuleIndex === idx
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                              {idx + 1}
                            </div>
                            <h3 className="font-medium text-gray-800">
                              추천 조합
                            </h3>
                          </div>
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            신뢰도: {(item.confidence * 100).toFixed(1)}%
                          </div>
                        </div>

                        <div className="flex items-center text-gray-700">
                          <span className="font-medium lg:text-sm lg:w-[110px] xl:text-base xl:w-[200px]">
                            {item.itemset_a}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 mx-2 transform text-gray-400 transition-transform ${
                              expandedRuleIndex === idx
                                ? "rotate-180"
                                : "rotate-270"
                            }`}
                          />
                          <span className="font-medium lg:text-sm xl:text-base xl:w-[150px] xl:ml-1">
                            {item.itemset_b}
                          </span>
                        </div>
                      </div>

                      {/* 판매 추이 차트 - 선택된 항목 아래에 표시 */}
                      {expandedRuleIndex === idx &&
                        selectedChartData.length > 0 && (
                          <div className="mt-2 p-4 bg-white border border-indigo-100 rounded-lg shadow-sm animate-fadeIn">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center mb-3">
                              <LineChartIcon className="h-4 w-4 mr-1 text-indigo-500" />
                              판매 추이
                            </h3>
                            <LineChart
                              chartData={selectedChartData}
                              label={selectedLabel}
                            />
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center text-yellow-700 mb-2">
                  <Info className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">점주님을 위한 팁</h3>
                </div>
                <p className="text-sm text-yellow-600">
                  자주 함께 구매되는 상품들을 가까이 진열하면 매출 증가에 도움이
                  됩니다. 상품을 클릭하면 최근 판매 추이를 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <InfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
      )}

      {/* 애니메이션을 위한 CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Association;
