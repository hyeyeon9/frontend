import { useState, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveTreeMapHtml } from "@nivo/treemap";
import { Info } from "lucide-react";

export default function SalesComparisonChart({
  previousData,
  currentData,
  previousDate,
  currentDate,
  hourLabel,
  trendBasis,
}) {
  const [chartView, setChartView] = useState("quantity"); // 'sales' or 'quantity'
  const [activeTab, setActiveTab] = useState("bar"); // "bar" or "treemap"

  const truncate = (str, maxLength) =>
    str.length > maxLength ? str.slice(0, maxLength) + "…" : str;

  // 레이블 매핑
  const trendMapping = {
    1: "일주일 전",
    2: "1개월 전",
    3: "1년 전",
  };
  const labelMapping = {
    이전: trendMapping[trendBasis], // 예: "일주일 전"
    현재: "현재",
  };

  const chartData = useMemo(() => {
    const productMap = {};

    // 이전 데이터 처리
    previousData.forEach((item) => {
      productMap[item.productId] = {
        product: truncate(item.productName, 10),
        이전: chartView === "sales" ? item.totalPrice : item.totalAmount,
        현재: 0, // 기본값
      };
    });

    // 현재 데이터 처리
    currentData.forEach((item) => {
      if (productMap[item.productId]) {
        // 기존 상품이면 현재 값만 업데이트
        productMap[item.productId].현재 =
          chartView === "sales" ? item.totalPrice : item.totalAmount;
      } else {
        // 새로운 상품이면 추가
        productMap[item.productId] = {
          product: truncate(item.productName, 10),
          이전: 0, // 기존 데이터 없음
          현재: chartView === "sales" ? item.totalPrice : item.totalAmount,
        };
      }
    });

    // 정렬 & 상위 7개 선택
    return Object.values(productMap)
      .sort((a, b) => b.현재 + b.이전 - (a.현재 + a.이전))
      .slice(0, 7);
  }, [previousData, currentData, chartView]);

  // 이전 데이터와 현재 데이터를 분리한 트리맵 데이터 생성
  const treemapData = useMemo(() => {
    // 이전 데이터 트리맵
    const previousTreemap = {
      name: "이전",
      children: previousData
        .filter((item) => item.totalPrice > 0 && item.totalAmount > 0)
        .map((item) => ({
          name: truncate(item.productName, 7),
          value: chartView === "sales" ? item.totalPrice : item.totalAmount,
          fullName: item.productName,
        })),
    };

    // 현재 데이터 트리맵
    const currentTreemap = {
      name: "현재",
      children: currentData
        .filter((item) => item.totalPrice > 0 && item.totalAmount > 0)
        .map((item) => ({
          name: truncate(item.productName, 7),
          value: chartView === "sales" ? item.totalPrice : item.totalAmount,
          fullName: item.productName,
        })),
    };

    return { previous: previousTreemap, current: currentTreemap };
  }, [previousData, currentData, chartView]);

  const previousTotal = previousData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const currentTotal = currentData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const totalChange =
    previousTotal === 0
      ? "N/A"
      : (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {hourLabel}시 판매 비교 차트
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartView("sales")}
            className={`px-3 py-1 rounded-md text-sm ${
              chartView === "sales"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            매출액
          </button>
          <button
            onClick={() => setChartView("quantity")}
            className={`px-3 py-1 rounded-md text-sm ${
              chartView === "quantity"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            판매량
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "bar"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("bar")}
          >
            가로 막대 차트
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "treemap"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("treemap")}
          >
            트리맵 차트
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "bar" && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg flex items-center mb-4">
                <Info className="h-4 w-4 mr-2" />
                <p>
                  선택한 시간대에서 매출이 가장 높은 7개 상품을 골라, 매출과
                  판매 수량을 비교한 그래프를 제공합니다.
                </p>
              </div>
              <div className="min-h-[300px] sm:h-80 w-full">
                <ResponsiveBar
                  data={chartData}
                  keys={["이전", "현재"]}
                  indexBy="product"
                  margin={{ top: 10, right: 100, bottom: 40, left: 120 }}
                  padding={0.3}
                  layout="horizontal" // 가로 방향 차트
                  groupMode="grouped"
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={["#93c5fd", "#4f46e5"]}
                  borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 0,
                    tickRotation: 0,
                    legend:
                      chartView === "sales" ? "매출액 (원)" : "판매량 (개)",
                    legendPosition: "middle",
                    legendOffset: 25,
                    truncateTickAt: 0,
                    format: ">-0,~r",
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -20,
                    legend: "",
                    legendPosition: "top",
                    legendOffset: 0,
                    truncateTickAt: 0,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  legends={[
                    {
                      dataFrom: "keys",
                      anchor: "right",
                      direction: "column",
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: "left-to-right",
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemOpacity: 1,
                          },
                        },
                      ],
                      data: [
                        {
                          id: "이전",
                          label: trendMapping[trendBasis],
                          color: "#93c5fd", // ← 이전 색상 지정
                        },
                        {
                          id: "현재",
                          label: "현재",
                          color: "#4f46e5", // ← 현재 색상 지정
                        },
                      ],
                    },
                  ]}
                  role="application"
                  ariaLabel="상품별 판매 비교"
                  barAriaLabel={(e) =>
                    e.id + ": " + e.formattedValue + " " + e.indexValue
                  }
                  tooltip={({ id, value, color }) => (
                    <div
                      style={{
                        padding: 12,
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    >
                      <strong style={{ color }}>
                        {labelMapping[id]}:{" "}
                        {chartView === "sales"
                          ? value.toLocaleString() + "원"
                          : value + "개"}
                      </strong>
                    </div>
                  )}
                />
              </div>
            </>
          )}

          {activeTab === "treemap" && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg flex items-center mb-4">
                <Info className="h-4 w-4 mr-2" />
                <p>
                  선택한 시간대에 판매된 모든 상품을 매출 규모에 비례하여
                  사각형으로 표현한 그래프를 제공합니다. 각 구역에 마우스를
                  올리거나 구역을 클릭하면 상품명과 매출량을 확인하실 수
                  있습니다.
                </p>
              </div>

              {/* 트리맵 컨테이너 수정 */}
              <div className="w-full flex flex-col md:flex-row gap-4">
                {/* 이전 데이터 트리맵 */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 text-center">
                    {trendMapping[trendBasis]} : {previousDate} {hourLabel}시
                  </h4>
                  <div className="h-[250px] md:h-[300px] border rounded-lg overflow-hidden">
                    <ResponsiveTreeMapHtml
                      data={treemapData.previous}
                      identity="name"
                      label={(node) =>
                        node.id === "이전" ? "" : `${node.data.name}`
                      }
                      value="value"
                      tile="binary"
                      leavesOnly={true}
                      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      labelSkipSize={60}
                      labelTextColor={{
                        from: "color",
                        modifiers: [["darker", 3]],
                      }}
                      colors={{ scheme: "greens" }}
                      nodeOpacity={0.45}
                      borderColor={{
                        from: "color",
                        modifiers: [["darker", 0.3]],
                      }}
                      tooltip={({ node }) => (
                        <div
                          style={{
                            padding: 12,
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <strong>{node.data.fullName}</strong>:{" "}
                          {chartView === "sales"
                            ? `${node.value.toLocaleString()}원`
                            : `${node.value}개`}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* 현재 데이터 트리맵 */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <h4 className="text-xs font-bold text-blue-800 mb-2 text-center">
                    현재 : {currentDate} {hourLabel}시
                  </h4>
                  <div className="h-[250px] md:h-[300px] border rounded-lg overflow-hidden">
                    <ResponsiveTreeMapHtml
                      data={treemapData.current}
                      identity="name"
                      label={(node) =>
                        node.id === "현재" ? "" : `${node.data.name}`
                      }
                      value="value"
                      tile="binary"
                      leavesOnly={true}
                      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      labelSkipSize={60}
                      labelTextColor={{
                        from: "color",
                        modifiers: [["darker", 3]],
                      }}
                      colors={{ scheme: "blues" }}
                      nodeOpacity={0.7}
                      borderColor={{
                        from: "color",
                        modifiers: [["darker", 0.7]],
                      }}
                      tooltip={({ node }) => (
                        <div
                          style={{
                            padding: 12,
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <strong>{node.data.fullName}</strong>:{" "}
                          {chartView === "sales"
                            ? `${node.value.toLocaleString()}원`
                            : `${node.value}개`}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">총 매출 변화</p>
            <p className="text-lg font-semibold">
              {previousTotal.toLocaleString()}원 →{" "}
              {currentTotal.toLocaleString()}원
            </p>
          </div>
          <div
            className={`text-lg font-bold ${
              totalChange > 0
                ? "text-green-600"
                : totalChange < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {totalChange > 0 ? "+" : ""}
            {totalChange}%
          </div>
        </div>
      </div>
    </div>
  );
}
