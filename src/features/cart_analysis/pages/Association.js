import { useEffect, useState } from "react";
import {
  fetchAllAssociationRules,
  fetchAllAssociationTimeRules,
} from "../api/HttpCartAnalysisService";
import AssociationTable from "../components/AssociationTable";
import HeatmapChart from "../components/HeatmapChart";
import { useTime } from "../../../contexts/TimeContext";

function getTimePeriod(time) {
  const hour = time.split(":")[0];

  if (hour >= 5 && hour < 11) return "아침";
  if (hour >= 11 && hour < 15) return "점심";
  if (hour >= 15 && hour < 18) return "한가한 오후";
  if (hour >= 18 && hour < 23) return "저녁";
  if (hour >= 23 || hour < 5) return "저녁";
}

function Association() {
  const [rules, setRules] = useState([]);

  const [timeRules, setTimeRules] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { date, time } = useTime();
  const timePeriod = getTimePeriod(time);

  // 년별, 월별 연관관계 확인을 위한 상태
  const [period, setPeriod] = useState("all");
  const [month, setMonth] = useState("all");

  // 지지도, 신뢰도, 향상도 조절을 위한 상태
  const [minSupport, setMinSupport] = useState(0.04);
  const [minConfidence, setMinConfidence] = useState(0.3);
  const [minLift, setMinLift] = useState(1.0);

  const [selectedTopRule, setSelectedTopRule] = useState(null);

  const topRules = rules
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // 전체상품 연관관계
  useEffect(() => {
    if (!rules) return;

    async function getAssociationRules() {
      try {
        const data = await fetchAllAssociationRules(period, month);
        console.log("data", data);
        setRules(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getAssociationRules();
  }, [period, month]);

  // 시간대별 연관관계
  useEffect(() => {
    if (!timeRules) return;

    async function getAssociationTimeRules() {
      try {
        const data = await fetchAllAssociationTimeRules();
        setTimeRules(data);
        console.log("시간 data", data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getAssociationTimeRules();
  }, [timePeriod]);

  // 전체 연관관계 필터링
  const filteredRules = rules.filter(
    (rule) =>
      rule.support >= minSupport &&
      rule.confidence >= minConfidence &&
      rule.lift >= minLift
  );

  const topTimeRules = timeRules
    .filter((item) => item.time_period === timePeriod)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 1);

  //console.log("topTimeRules", topTimeRules);

  return (
    <>
      <div className="w-full flex gap-6 px-8 items-start">
        <div className="flex-1">
          <div className="flex gap-4 mb-4">
            <select
              onChange={(e) => setPeriod(e.target.value)}
              value={period}
              className="p-2 border rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">전체</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>

            <select
              onChange={(e) => setMonth(e.target.value)}
              value={month}
              className="p-2 border rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">전체</option>
              <option value="01">1</option>
              <option value="02">2</option>
              <option value="03">3</option>
              <option value="04">4</option>
              <option value="05">5</option>
              <option value="06">6</option>
              <option value="07">7</option>
              <option value="08">8</option>
              <option value="09">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-1">
              지지도 ≥
              <input
                type="number"
                min="0.03"
                max="0.2"
                step="0.05"
                value={minSupport}
                onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                className="w-20 border px-2 py-1 rounded"
              />
            </label>

            <label className="flex items-center gap-1">
              신뢰도 ≥
              <input
                type="number"
                min="0.3"
                max="0.8"
                step="0.1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-20 border px-2 py-1 rounded"
              />
            </label>

            <label className="flex items-center gap-1">
              향상도 ≥
              <input
                type="number"
                min="1"
                max="3"
                step="1"
                value={minLift}
                onChange={(e) => setMinLift(parseFloat(e.target.value))}
                className="w-20 border px-2 py-1 rounded"
              />
            </label>
          </div>
          <HeatmapChart data={filteredRules} />
        </div>

        <div className="w-[700px] flex flex-col gap-6">
          <div className="border p-4 rounded shadow bg-white">
            <p className="pb-2 font-semibold">
              🎯 점주님, 고객들이 자주 함께 구매하는 조합입니다!
            </p>
            {topRules.map((item, idx) => {
              return (
                <p
                  key={idx}
                  onClick={() => setSelectedTopRule(item)}
                  className="text-sm cursor-pointer hover:underline"
                >
                  <p>Top {idx + 1}</p>
                  {item.itemset_a} + {item.itemset_b}{" "}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full px-8 mt-6">
        <input
          type="text"
          placeholder="상품을 입력하세요."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className=" w-[1000px]  px-4 py-2 border mt-4 mb-3"
        />
        <AssociationTable data={filteredRules} filteringText={searchText} />
      </div>
    </>
  );
}

export default Association;
