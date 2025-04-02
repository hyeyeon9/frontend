import { ResponsiveLine } from "@nivo/line";

const LineChart = ({ chartData, label }) => {
  if (!chartData || chartData.length === 0) return null;
  
  // 날짜 포맷 변경 (년도 제외, 월-일만 표시)
  const formattedData = chartData.map(series => ({
    ...series,
    data: series.data.map(point => {
      // YYYY-MM-DD 형식에서 MM-DD만 추출
      const dateStr = point.x;
      const formattedDate = dateStr.substring(5); // "MM-DD" 형식만 남김
      return {
        ...point,
        x: formattedDate
      };
    })
  }));

  return (
    <div className="w-full h-[300px]">
      <h3 className="font-semibold mb-2">최근 7일간 판매량</h3>
      <ResponsiveLine
        data={formattedData}
        margin={{ top: 20, right: 120, bottom: 50, left: 60 }} // 여백 조정
        xScale={{ type: "point" }}
        yScale={{ 
          type: "linear", 
          min: "auto", 
          max: "auto", 
          stacked: false,
          nice: true // 좀 더 깔끔한 Y축 값 표시
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -30, // 각도 조정
          legend: "날짜",
          legendOffset: 40,
          legendPosition: "middle",
          format: (value) => value // MM-DD 형식으로 이미 변환됨
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "판매량",
          legendOffset: -50,
          legendPosition: "middle"
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices="x"
        colors={{ scheme: "category10" }}
        lineWidth={3}
        enableArea={false}
        areaOpacity={0.15}
        enableGridX={false}
        enableGridY={true}
        legends={[
          {
            anchor: "top-right",
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
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
};

export default LineChart;