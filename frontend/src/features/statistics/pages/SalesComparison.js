import { useEffect, useState } from "react";
import { fetchGetHourlySales } from "../api/HttpStatService";
import { Datepicker } from "flowbite-react";
import { Calendar, TrendingUp, BarChart2 } from "lucide-react";
import DiffChart from "../components/DiffChart";
import DailySalesTable from "../components/DailySalesTable";

// 날짜 포매팅 함수
function formatDateTo(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD 형식
}

export default function SalesComparison() {
  // 어제, 오늘 날짜를 비교할 기본 값으로 등록
  const today = new Date();
  const yesterday = new Date(new Date().setDate(today.getDate() - 1));

  // 비교할 날짜를 선택할 값
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(yesterday);

  // 포맷된 날짜 값
  const [formattedDate1, setFormattedDate1] = useState(formatDateTo(date1));
  const [formattedDate2, setFormattedDate2] = useState(formatDateTo(date2));

  // 비교할 두 날짜의 데이터
  const [salesData1, setSalesData1] = useState([]);
  const [salesData2, setSalesData2] = useState([]);
  const [loading, setLoading] = useState(true);

  // 날짜가 변경될 때마다 포맷된 날짜를 업데이트
  useEffect(() => {
    setFormattedDate1(formatDateTo(date1));
    setFormattedDate2(formatDateTo(date2));
  }, [date1, date2]);

  // 데이터를 받아서 상태에 저장
  useEffect(() => {
    const fetchGetSales = async () => {
      try {
        setLoading(true);

        // 오늘 날짜의 데이터
        const response1 = await fetchGetHourlySales(formattedDate1);
        setSalesData1(response1.data);

        // 어제 날짜의 데이터
        const response2 = await fetchGetHourlySales(formattedDate2);
        setSalesData2(response2.data);

        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다: ", error);
        setLoading(false);
      }
    };

    fetchGetSales();
  }, [formattedDate1, formattedDate2]);

  if (loading) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50">
      {/* 페이지 제목 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
          매출 비교
        </h1>
      </div>

      {/* 3단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1, 2단 컨텐츠 영역 */}
        <div className="lg:col-span-2">
          {/* 날짜 선택 섹션 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              날짜 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기준 날짜
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <Datepicker
                    language="ko-KR"
                    labelTodayButton="오늘"
                    labelClearButton="초기화"
                    title={`기준 날짜: ${formattedDate1}`}
                    label="date1"
                    format="yyyy-mm-dd"
                    value={date1}
                    onChange={(e) => setDate1(e)}
                    className="ps-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비교 날짜
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <Datepicker
                    language="ko-KR"
                    labelTodayButton="오늘"
                    labelClearButton="초기화"
                    title={`비교할 날짜: ${formattedDate2}`}
                    label="date2"
                    value={date2}
                    onChange={(e) => setDate2(e)}
                    className="ps-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 차트 섹션 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
              시간대별 매출 비교
            </h2>
            <div>
              <DiffChart
                todayData={salesData1}
                targetDateData={salesData2}
                date1={formattedDate1}
                date2={formattedDate2}
              />
            </div>
          </div>

          {/* 테이블 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {formattedDate1} 매출 현황
              </h2>
              <DailySalesTable date={formattedDate1} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {formattedDate2} 매출 현황
              </h2>
              <DailySalesTable date={formattedDate2} />
            </div>
          </div>
        </div>

        {/* 3단 영역 (비워둠) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            추가 정보
          </h2>
          <div className="flex justify-center items-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-center">
              <span className="block mb-2">추가 정보 영역</span>
              <span className="text-sm">향후 확장 예정</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
