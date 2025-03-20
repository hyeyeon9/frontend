import { ResponsiveLine } from "@nivo/line";

export default function DiffChart({ todayData, yesterdayData }) {
  // 데이터 변환
  const chartData = (todayData, yesterdayData) => {
    // data가 배열인지 체크
    if (!todayData || !Array.isArray(todayData)) {
      console.error("Invalid data format in DiffChart:", todayData);
      return { id: "today", color: "hsl(308, 70%, 50%)", todayData: [] };
    }

    if (!yesterdayData || !Array.isArray(yesterdayData)) {
      console.error("Invalid data format in DiffChart:", yesterdayData);
      return {
        id: "yesterday",
        color: "hsl(308, 70%, 50%)",
        yesterdayData: [],
      };
    }

    return [
      {
        id: "오늘",
        color: "hsl(308, 70%, 50%)",
        data: todayData.map((item) => ({
          x: item.salesHour.toString(),
          y: item.dailyPrice ?? 0,
        })),
      },
      {
        id: "어제",
        color: "hsl(308, 70%, 50%)",
        data: yesterdayData.map((item) => ({
          x: item.salesHour.toString(),
          y: item.dailyPrice ?? 0,
        })),
      },
    ];
  };

  return (
    <div>
      <div style={{ height: 400 }}>
        chart
        <ResponsiveLine
          data={chartData(todayData, yesterdayData)} // 데이터 배열을 전달
          margin={{ top: 50, right: 110, bottom: 50, left: 70 }}
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
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
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
    </div>
  );
}
