"use client";

import { ResponsiveLine } from "@nivo/line";
import { memo, useMemo } from "react";

// React.memo를 사용하여 불필요한 리렌더링 방지
const DiffChart = memo(function DiffChart({
  todayData,
  targetDateData,
  date1,
  date2,
}) {
  // useMemo를 컴포넌트 최상위 레벨에서 호출 (조건부 호출 금지)
  const chartData = useMemo(() => {
    // 데이터가 없는 경우 빈 배열 반환
    if (
      !todayData ||
      !targetDateData ||
      !Array.isArray(todayData) ||
      !Array.isArray(targetDateData)
    ) {
      return [];
    }

    return [
      {
        id: `${date1}`,
        color: "hsl(215, 70%, 50%)",
        data: todayData.map((item) => ({
          x: item.salesHour.toString(),
          y: item.dailyPrice ?? 0,
        })),
      },
      {
        id: `${date2}`,
        color: "hsl(10, 70%, 50%)",
        data: targetDateData.map((item) => ({
          x: item.salesHour.toString(),
          y: item.dailyPrice ?? 0,
        })),
      },
    ];
  }, [todayData, targetDateData, date1, date2]); // 의존성 배열 추가

  // 데이터가 없는 경우 로딩 UI 표시
  if (
    !todayData ||
    !targetDateData ||
    !Array.isArray(todayData) ||
    !Array.isArray(targetDateData) ||
    chartData.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full py-4 px-2">
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=">-0,.0f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "시간(24시간)",
          legendOffset: 36,
          legendPosition: "middle",
          truncateTickAt: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "판매량",
          legendOffset: -60,
          legendPosition: "middle",
          truncateTickAt: 0,
          format: ">-0,~r",
        }}
        colors={{ scheme: "category10" }}
        lineWidth={3}
        pointSize={7}
        pointColor={{ from: "color", modifiers: [] }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="data.yFormatted"
        pointLabelYOffset={-12}
        areaOpacity={0}
        enableTouchCrosshair={true}
        useMesh={true}
        legends={[
          {
            anchor: "top-right",
            direction: "row",
            justify: false,
            translateX: 10,
            translateY: -30,
            itemsSpacing: 20,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
});

export default DiffChart;
