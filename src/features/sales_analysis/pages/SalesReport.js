import { Button, Datepicker, Label, Select, Table } from "flowbite-react";
import { useState } from "react";
import { fetchGetAlertListByDate } from "../api/HttpSalesAnalysisService";
import { format } from "date-fns";
import ReportTable from "../components/ReportTable";

export default function SalesReport() {
  const [selectedDate, setSelectedDate] = useState(null); // 선택한 날짜
  const [selectedMode, setSelectedMode] = useState(null); // 조회 모드
  const [salesData, setSalesData] = useState([]); // 조회된 매출 데이터

  // 조회 모드 옵션
  const modes = [
    { value: 1, label: "전주 동요일 대비" },
    { value: 7, label: "일주일 단기 트렌드" },
    { value: 30, label: "한 달 장기 트렌드" },
  ];

  // 날짜 변경 함수
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // 조회 모드 변경 함수
  const handleModeChange = (selectedOption) => {
    setSelectedMode(selectedOption);
  };

  // 데이터 조회 함수
  const handleSearch = async () => {
    // if (!selectedDate || !selectedMode) {
    //   alert("날짜와 조회 모드를 선택해주세요!");
    //   return;
    // }

    // 날짜 형식 맞추기
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // API 호출 추가
    const response = await fetchGetAlertListByDate(formattedDate);
    setSalesData(response.data);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">이상 매출 조회</h1>

      {/* 날짜 피커 */}
      <div className="mb-4">
        <Label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          조회 날짜
        </Label>
        <Datepicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          className="mt-2 p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* 조회 모드 드롭다운 */}
      <div className="mb-4">
        <Label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          조회 모드
        </Label>
        <Select
          options={modes}
          onChange={handleModeChange}
          className="mt-2"
          aria-placeholder="조회 모드 선택"
        />
      </div>
      {/* 조회 버튼 */}
      <Button
        onClick={handleSearch}
        className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        조회
      </Button>
      {/* 결과 테이블 */}
      <div className="mt-6">
        {salesData.length > 0 && <ReportTable salesData={salesData} />}
        {salesData.length === 0 && (
          <p className="mt-4 text-gray-500">조회된 매출 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
