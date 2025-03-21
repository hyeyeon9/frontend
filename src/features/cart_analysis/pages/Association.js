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

  const [period, setPeriod] = useState("all");

  const topRules = rules
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // 전체상품 연관관계
  useEffect(() => {
    if (!rules) return;

    async function getAssociationRules() {
      try {
        const data = await fetchAllAssociationRules(period);
        console.log("data", data);
        setRules(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    getAssociationRules();
  }, [period]);

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
    (rule) => rule.support >= 0.03 && rule.confidence >= 0.3 && rule.lift >= 1.0
  );

  // 시간별 연관관계 필터링
  // const filteredTimeRules = timeRules.filter(
  //   (rule) => rule.support >= 0.02 && rule.confidence >= 0.5 && rule.lift >= 1.0
  // );

  const topTimeRules = timeRules
    .filter((item) => item.time_period === timePeriod)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 1);

  //console.log("topTimeRules", topTimeRules);

  return (
    <div className="w-full flex-col mb-3">
      <div className="flex justify-center gap-5">
        <HeatmapChart data={filteredRules} />

        <div className=" flex-col mt-4">
          <div className="border flex-row w-96 mb-10 p-3">
            <p className="pb-2">
              🎯 점주님, 고객들이 자주 함께 구매하는 조합입니다!
            </p>
            {topRules.map((item) => {
              return (
                <p>
                  "{item.itemset_a}" + "{item.itemset_b}" : {item.confidence}
                </p>
              );
            })}
          </div>

          <div className="border flex-row w-72 p-3">
            {timePeriod === "아침" ? (
              <div>
                <p className="pb-2">☀️ 아침 추천 (05:00~10:00)</p>
                <p>출근길 고객을 위한 아침 추천 상품을 준비하세요!</p>
              </div>
            ) : timePeriod === "점심" ? (
              <div>
                <p className="pb-2">🍙 점심 추천 (11:00~14:00)</p>
                <p>점심 피크 시간! 인기 상품 미리 준비하세요.</p>
              </div>
            ) : timePeriod === "한가한 오후" ? (
              <div>
                <p className="pb-2">😪 오후 추천 (15:00~17:00)</p>
                <p>가벼운 간식과 에너지를 채울 음료를 준비하세요!</p>
              </div>
            ) : timePeriod === "저녁" ? (
              <div>
                <p className="pb-2">🌆 저녁 추천 (18:00~22:00)</p>
                <p>퇴근 후 고객을 위한 상품을 미리 확보하세요!</p>
              </div>
            ) : timePeriod === "야식" ? (
              <div>
                <p className="pb-2">🌙 야식 추천 (23:00~05:00) </p>
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
                } else if (timePeriod === "한가한 오후") {
                  recommendationMesg = `
                  ${itemset_a}와 ${itemset_b}가 인기 메뉴예요! 
                  추가 진열을 확인하고 고객들에게 추천해 보세요! 🌆`;
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

      <div className="flex-row">
        <input
          type="text"
          placeholder="상품을 입력하세요."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-[800px]  px-4 py-2 border mt-4 mb-3"
        />

        <div className="flex justify-center">
          <select onChange={(e) => setPeriod(e.target.value)} value={period}>
            <option value="all">전체</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>

          <AssociationTable data={filteredRules} filteringText={searchText} />
        </div>
      </div>
    </div>
  );
}

export default Association;
