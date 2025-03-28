import { ResponsiveLine } from "@nivo/line";

const LineChart = ({ chartData, label }) => {
  if (!chartData || chartData.length === 0) return null;

  return (
    <div className="w-full h-[300px] mt-4 bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-2">최근 7일간 판매량</h3>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 110, bottom: 50, left: 50 }} // 오른쪽 여백 좀 늘림
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
        axisBottom={{
          tickRotation: -45,
          legend: "날짜",
          legendOffset: 40,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: "판매량",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={8}
        pointBorderWidth={2}
        useMesh={true}
        colors={{ scheme: "category10" }}
        legends={[
          {
            anchor: "bottom-right", // 또는 bottom-right
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "#333",
            symbolSize: 12,
            symbolShape: "circle",
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
};

export default LineChart;
