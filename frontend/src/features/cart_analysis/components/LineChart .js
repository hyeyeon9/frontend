import { ResponsiveLine } from "@nivo/line"

const LineChart = ({ chartData, label }) => {
  if (!chartData || chartData.length === 0) return null

  // 날짜 포맷 변경 (년도 제외, 월-일만 표시)
  const formattedData = chartData.map((series) => ({
    ...series,
    data: series.data.map((point) => {
      // YYYY-MM-DD 형식에서 MM-DD만 추출
      const dateStr = point.x
      const formattedDate = dateStr.substring(5) // "MM-DD" 형식만 남김
      return {
        ...point,
        x: formattedDate,
      }
    }),
  }))

  // 화면 크기에 따라 차트 설정 변경
  const isSmallScreen = window.innerWidth <= 1180

  return (
    <div className="w-full h-[200px] md:h-[300px]">
      <ResponsiveLine
        data={formattedData}
        margin={
          isSmallScreen
            ? { top: 10, right: 30, bottom: 30, left: 40 } // 작은 화면용 여백
            : { top: 20, right: 85, bottom: 50, left: 60 } // 큰 화면용 여백
        }
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          nice: true,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -30,
          legend: isSmallScreen ? undefined : "날짜",
          legendOffset: 40,
          legendPosition: "middle",
          format: (value) => value,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isSmallScreen ? undefined : "판매량",
          legendOffset: -50,
          legendPosition: "middle",
        }}
        pointSize={isSmallScreen ? 6 : 10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices="x"
        colors={{ scheme: "category10" }}
        lineWidth={isSmallScreen ? 2 : 3}
        enableArea={false}
        areaOpacity={0.15}
        enableGridX={false}
        enableGridY={true}
        legends={
          isSmallScreen
            ? [] // 작은 화면에서는 범례 제거
            : [
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
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]
        }
      />
    </div>
  )
}

export default LineChart
