import { useEffect, useState } from "react";
import {
  fetchAllAssociationRules,
  fetchAllAssociationTimeRules,
} from "../api/HttpService";
import AssociationTable from "../components/AssociationTable";
import HeatmapChart from "../components/HeatmapChart";

function Association() {
  const [rules, setRules] = useState([]);

  const [timeRules, setTimeRules] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const topRules = rules
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // 전체상품 연관관계
  useEffect(() => {
    if (!rules) return;

    async function getAssociationRules() {
      try {
        const data = await fetchAllAssociationRules();
        setRules(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getAssociationRules();
  }, []);

  // 시간대별 연관관계
  useEffect(() => {
    if (!timeRules) return;

    async function getAssociationTimeRules() {
      try {
        const data = await fetchAllAssociationTimeRules();
        setTimeRules(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getAssociationTimeRules();
  }, []);

  // 전체 연관관계 필터링
  const filteredRules = rules.filter(
    (rule) => rule.support >= 0.02 && rule.confidence >= 0.5 && rule.lift >= 1.0
  );

  // 시간별 연관관계 필터링
  // const filteredTimeRules = timeRules.filter(
  //   (rule) => rule.support >= 0.02 && rule.confidence >= 0.5 && rule.lift >= 1.0
  // );

  const topTimeRules = timeRules
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 1);

  console.log(topTimeRules);

  return (
    <div className="w-full">
      <HeatmapChart data={filteredRules} />
      <input
        type="text"
        placeholder="상품을 입력하세요."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-[500px]  px-4 py-2 border mt-4 mb-3"
      />
      <div className="flex justify-center">
        <div className="flex justify-center">
          <AssociationTable data={filteredRules} filteringText={searchText} />
        </div>

        <div className="border flex-col">
          <div className="border flex-row">
            <p>🎯 점주님, 고객들이 자주 함께 구매하는 조합입니다!</p>
            {topRules.map((item) => {
              return (
                <p>
                  "{item.itemset_a}" + "{item.itemset_b}" : {item.confidence}
                </p>
              );
            })}
          </div>
          `
          <div className="border flex-row">
            <p>🎯 점주님, 고객들이 자주 함께 구매하는 조합입니다!</p>
            {topTimeRules.itemset_a}를 구매하는 손님들이{" "}
            {topTimeRules.confidence} 확률로
            {topTimeRules.itemset_b}를 구매합니다 !
          </div>
        </div>
      </div>
    </div>
  );
}

export default Association;
