import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useMemo } from "react";

function HeatmapChart({ data }) {
  // 🚀 최적화: useMemo를 먼저 호출 (Hook 규칙 준수)
  const { transformedData, itemCount } = useMemo(() => {
    // 데이터가 없으면 null 반환
    if (!data || data.length === 0) {
      return { transformedData: null, itemCount: { a: 0, b: 0 } };
    }
    //console.time('HeatmapChart 데이터 변환'); // 🔍 성능 측정 시작
    
    // 1️⃣ 세로축(A), 가로축(B) 데이터 추출
    const itemA = [...new Set(data.map((d) => d.itemset_a))];
    const itemB = [...new Set(data.map((d) => d.itemset_b))];

    // 🚀 핵심 최적화: Map으로 O(1) 조회 가능하게 인덱싱
    const dataMap = new Map(
      data.map(rule => [`${rule.itemset_a}_${rule.itemset_b}`, rule])
    );

    // 2️⃣ 최적화된 데이터 변환 (O(n²) → O(n))
    const transformedData = itemA.map((a) => ({
      id: a,
      data: itemB.map((b) => {
        const match = dataMap.get(`${a}_${b}`); // 🚀 O(1) 조회!
        return { x: b, y: match ? match.confidence : null };
      }),
    }));

    //console.timeEnd('HeatmapChart 데이터 변환'); // 🔍 성능 측정 종료
    //console.log(`변환된 데이터: ${itemA.length} × ${itemB.length} = ${itemA.length * itemB.length}개 셀`);
    
    return { 
      transformedData, 
      itemCount: { a: itemA.length, b: itemB.length } 
    };
  }, [data]); // data가 변경될 때만 다시 계산

  // 데이터가 없으면 여기서 early return
  if (!transformedData) {
    return <p>데이터가 존재하지 않습니다.</p>;
  }

  return (
    <div className="w-full xl:w-[800px] lg:w-[580px] xl:h-[527px] md:h-[450px] mx-auto overflow-auto">
      {/* 🔍 성능 정보 표시 (개발용) */}
      <div className="text-xs text-gray-500 mb-2">
        히트맵 크기: {itemCount.a} × {itemCount.b} ({itemCount.a * itemCount.b}개 셀)
      </div>
      
      <ResponsiveHeatMap
        data={transformedData}
        margin={{
          top: 50,
          right: 60,
          bottom: 60,
          left: 95,
        }}
        valueFormat={(value) => (value > 0 ? value.toFixed(2) : "-")}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
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
          scheme: "blues",
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