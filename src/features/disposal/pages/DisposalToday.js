import { useEffect, useState } from "react";
import { fetchDisposalByDate } from "../api/HttpDisposalService";
import { getToday } from "./DisposalPage";

function DisposalToday() {
  const [disposal, setDisposal] = useState([]);

  useEffect(() => {
    async function getDisposalByDate() {
      try {
        const today = getToday();
        const data = await fetchDisposalByDate(today);
        setDisposal(data);
        console.log("today", data);
      } catch (error) {
        console.log(error.message);
      }
    }
    getDisposalByDate();
  }, []);

  return (
    <div className="w-full bg-white shadow-md rounded-lg p-5 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        🗑 오늘 폐기된 항목
      </h2>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
        {disposal.length === 0 ? (
          <li className="text-gray-400">오늘은 폐기된 항목이 없습니다.</li>
        ) : (
          disposal.map((item) => (
            <li key={item.disposal_id}>
              <span className="font-medium text-black">{item.goods_name}</span>{" "}
              - {item.disposed_quantity}개 폐기됨
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default DisposalToday;
