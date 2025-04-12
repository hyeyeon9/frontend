import { ResponsiveHeatMap } from "@nivo/heatmap";

function HeatmapChart({ data }) {
  if (!data || data.length === 0) {
    return <p>데이터가 존재하지 않습니다.</p>;
  }

  // 1️⃣ 세로축(A), 가로축(B) 데이터 추출
  const itemA = [...new Set(data.map((d) => d.itemset_a))]; // 세로축
  const itemB = [...new Set(data.map((d) => d.itemset_b))]; // 가로축

  // 2️⃣ Nivo에 맞는 데이터 구조 변환
  const transformedData = itemA.map((a) => ({
    id: a, // 세로축 라벨
    data: itemB.map((b) => {
      const match = data.find(
        (rule) => rule.itemset_a === a && rule.itemset_b === b
      );
      return { x: b, y: match ? match.confidence : null }; // 없으면 0
    }),
  }));

  return (
    <div className="w-full  xl:w-[800px] lg:w-[580px] h-[400px] md:h-[500px] mx-auto overflow-auto">
      <ResponsiveHeatMap
        data={transformedData}
        margin={{
          top: 50,
          right: 60,
          bottom: 60,
          left: 60,
        }}
        valueFormat={(value) => (value > 0 ? value.toFixed(2) : "-")}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45, // 가로축 라벨 기울이기
          legend: "상품 B",
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "상품 A",
          legendOffset: -52,
        }}
        colors={{
          type: "diverging",
          scheme: "blues", // 🔥 부드러운 색상 그라데이션
          minValue: 0.5,
          maxValue: 0.9,
        }}
        emptyColor="#ffffff"
        legends={[
          {
            anchor: "bottom",
            translateX: 0,
            translateY: 30,
            length: window.innerWidth <= 1180 ? 300 : 500,
            thickness: 15,
            direction: "row",
            tickPosition: "after",
            tickSize: 3,
            tickSpacing: 4,
            tickFormat: ".2f",
            title: "Confidence →",
            titleAlign: "start",
            titleOffset: 4,
          },
        ]}
      />
    </div>
  );
}

export default HeatmapChart;
