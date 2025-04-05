import { useState, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveTreeMap, ResponsiveTreeMapHtml } from "@nivo/treemap";

export default function SalesComparisonChart({
  previousData,
  currentData,
  previousDate,
  currentDate,
  hourLabel,
}) {
  const [chartView, setChartView] = useState("quantity"); // 'sales' or 'quantity'
  const [activeTab, setActiveTab] = useState("bar"); // "bar" or "treemap"

  const chartData = useMemo(() => {
    const productMap = {};

    // 이전 데이터 처리
    previousData.forEach((item) => {
      productMap[item.productId] = {
        product: item.productName,
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
          product: item.productName,
          이전: 0, // 기존 데이터 없음
          현재: chartView === "sales" ? item.totalPrice : item.totalAmount,
        };
      }
    });

    // 정렬 & 상위 10개 선택
    return Object.values(productMap)
      .sort((a, b) => b.현재 + b.이전 - (a.현재 + a.이전))
      .slice(0, 10);
  }, [previousData, currentData, chartView]);

  const treemapData = useMemo(() => {
    return {
      name: "root",
      children: chartData.map((item) => ({
        name: item.product,
        value: item.현재 + item.이전,
      })),
    };
  }, [chartData]);

  const previousTotal = previousData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const currentTotal = currentData.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const totalChange = (
    ((currentTotal - previousTotal) / previousTotal) *
    100
  ).toFixed(1);

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
            <div className="min-h-[300px] sm:h-80 w-full">
              <ResponsiveBar
                data={chartData}
                keys={["이전", "현재"]}
                indexBy="product"
                margin={{ top: 10, right: 120, bottom: 30, left: 120 }}
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
                  legend: chartView === "sales" ? "매출액 (원)" : "판매량 (개)",
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
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
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
                      {id === "이전" ? "7일 전" : "현재"}:{" "}
                      {chartView === "sales"
                        ? value.toLocaleString() + "원"
                        : value + "개"}
                    </strong>
                  </div>
                )}
              />
            </div>
          )}

          {activeTab === "treemap" && (
            <div className="min-h-[300px] sm:h-80 w-full">
              <ResponsiveTreeMapHtml
                data={treemapData}
                identity="name"
                label={(node) => `${node.data.name}
                  (${
                    chartView === "sales"
                      ? `${node.value.toLocaleString()}원`
                      : `${node.value}개`
                  })`}
                value="value"
                tile="binary"
                leavesOnly={true}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                labelSkipSize={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 3]] }}
                parentLabelTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                colors={{ scheme: "blues" }}
                nodeOpacity={0.6}
                borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
                tooltip={({ node }) => (
                  <div
                    style={{
                      padding: 12,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>{node.data.name}</strong>:{" "}
                    {node.value.toLocaleString()}
                  </div>
                )}
              />
            </div>
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
