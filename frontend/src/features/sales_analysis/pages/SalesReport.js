import {
  Button,
  Datepicker,
  Label,
  Select,
  Spinner,
  Table,
} from "flowbite-react";
import { useEffect, useState } from "react";
import {
  fetchGetAlertListByDate,
  fetchGetAlertListByTrend,
} from "../api/HttpSalesAnalysisService";
import { format } from "date-fns";
import ReportTable from "../components/ReportTable";
import { Calendar, Search, TrendingUp } from "lucide-react";

export default function SalesReport() {
  const [selectedDate, setSelectedDate] = useState(null); // 선택한 날짜
  const [selectedMode, setSelectedMode] = useState(0); // 조회 모드
  const [salesData, setSalesData] = useState([]); // 조회된 매출 데이터
  const [loading, setLoading] = useState(false);

  // 조회 모드 옵션
  const modes = [
    { value: 0, label: "전체" },
    { value: 1, label: "전주 동요일 대비" },
    { value: 7, label: "일주일 단기 트렌드" },
    { value: 30, label: "한 달 장기 트렌드" },
  ];

  // 페이지 로드 시 오늘 날짜의 전체 데이터 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const formattedDate = format(new Date(), "yyyy-MM-dd");
      const response = await fetchGetAlertListByDate(formattedDate);
      setSalesData(response.data);
      setLoading(false);
    };

    setSelectedDate(new Date());
    fetchInitialData();
  }, []);

  // 날짜 변경 함수
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // 조회 모드 변경 함수
  const handleModeChange = (modeValue) => {
    setSelectedMode(modeValue);
  };

  // 데이터 조회 함수
  const handleSearch = async () => {
    // 날짜 형식 맞추기
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    let response;

    if (selectedMode === 0) {
      response = await fetchGetAlertListByDate(formattedDate);
    } else {
      response = await fetchGetAlertListByTrend(formattedDate, selectedMode);
    }

    setSalesData(response.data);
  };

  // 날짜 또는 조회 모드가 바뀔 때마다 자동으로 조회
  useEffect(() => {
    if (selectedDate && selectedMode !== null) {
      handleSearch();
    }
  }, [selectedDate, selectedMode]); // selectedDate, selectedMode가 변경될 때마다 실행

  return (
    <div className="bg-gray-50 min-h-screen p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
          이상 매출 조회
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {/* 상단 컨트롤 영역 */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* 날짜 피커 */}
          <div className="w-full md:w-1/3">
            <Label htmlFor="date" className="mb-2 block">
              조회 날짜
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <Datepicker
                id="date"
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy/MM/dd"
                className="ps-10"
              />
            </div>
          </div>

          {/* 조회 모드 버튼 그룹 */}
          <div className="w-full md:w-2/3">
            <Label className="mb-2 block">조회 모드</Label>
            <div className="flex flex-wrap gap-2">
              {modes.map((mode) => (
                <Button
                  key={mode.value}
                  color={selectedMode === mode.value ? "blue" : "light"}
                  onClick={() => handleModeChange(mode.value)}
                  className="flex-grow md:flex-grow-0"
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 결과 테이블 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 mt-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : salesData.length > 0 ? (
          <ReportTable salesData={salesData} />
        ) : (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p>조회된 매출 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
