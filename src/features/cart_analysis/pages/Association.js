import { useEffect, useState } from "react";
import {
  fetchAllAssociationRules,
  fetchAllAssociationTimeRules,
} from "../api/HttpService";
import AssociationTable from "../components/AssociationTable";
import HeatmapChart from "../components/HeatmapChart";
import { useTime } from "../../../contexts/TimeContext";

function getTimePeriod(time) {
  const hour = time.split(":")[0];

  if (hour >= 5 && hour < 12) return "아침";
  if (hour >= 12 && hour < 17) return "점심";
  if (hour >= 17 && hour < 22) return "저녁";
  return "야식";
}

function Association() {
  const [rules, setRules] = useState([]);

  const [timeRules, setTimeRules] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { date, time } = useTime();
  const timePeriod = getTimePeriod(time);

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

  console.log("topTimeRules", topTimeRules);

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
          <div className="border flex-row ">
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
            {timePeriod === "아침" ? (
              <div>
                <p>☀️ 아침 추천 (05:00~12:00)</p>
                <p>출근길 고객을 위한 아침 추천 상품을 준비하세요!</p>
              </div>
            ) : timePeriod === "점심" ? (
              <div>
                <p>🍽 점심 추천 (11:30~14:00)</p>
                <p>점심 피크 시간! 인기 상품 미리 준비하세요.</p>
              </div>
            ) : timePeriod === "저녁" ? (
              <div>
                <p>🌆 저녁 추천 (18:00~21:00)</p>
                <p>퇴근 후 고객을 위한 상품을 미리 확보하세요!</p>
              </div>
            ) : timePeriod === "야식" ? (
              <div>
                <p>🌙 야식 추천 (22:00~02:00) </p>
                <p>야식 수요 급증! 인기 상품을 빠르게 채우세요.</p>
              </div>
            ) : (
              ""
            )}

            {topTimeRules.length > 0 ? (
              topTimeRules.map((item, index) => {
                const { itemset_a, itemset_b, confidence } = item;
                const confidencePercent = (confidence * 100).toFixed(1);

                let recommendationMesg = "";

                if (timePeriod === "아침") {
                  recommendationMesg = `출근길에 많이 찾는 ${itemset_a}, ${itemset_b}!  재고 확인 후 빠르게 채워주세요. 🍙🥪`;
                } else if (timePeriod === "점심") {
                  recommendationMesg = `바쁜 점심시간! ${itemset_a}를 구매하는 손님들이 
                  ${confidencePercent}% 확률로 ${itemset_b}도 함께 구매합니다.  추천 진열을 고려해보세요! 🍽
                  `;
                } else if (timePeriod === "저녁") {
                  recommendationMesg = `
                  퇴근 후 간편한 저녁식사! ${itemset_a}와 ${itemset_b}도 인기가 많아요.
                  추가 진열을 확인하세요! 🌆`;
                } else if (timePeriod === "야식") {
                  recommendationMesg = `${itemset_a}를 구매하는 손님들이 ${confidencePercent}% 확률로 ${itemset_b}를 함께 구매합니다! 🛒`;
                }

                return <p key={index}>{recommendationMesg}</p>;
              })
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Association;
