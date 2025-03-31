import { Link } from "react-router-dom";
import DisposalToday from "../../disposal/pages/DisposalToday";
import SalesToday from "../../statistics/pages/SalesToday";
import ExpiringSoonList from "./ExpiringSoonList";
import { useEffect, useState } from "react";
import {
  fetchGetTodaySales,
  fetchGetTodayVisitors,
} from "../api/DashboardService";

export default function DashBoard() {
  const [visitors, setVisitors] = useState(0);
  const [sales, setSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysData = async () => {
      const now = new Date().toISOString().slice(0, 19);
      console.log(now);
      setLoading(true);
      try {
        const visitorResponse = await fetchGetTodayVisitors(now);
        const salesResponse = await fetchGetTodaySales(now);

        console.log(visitorResponse);

        setVisitors(visitorResponse.data);
        setSales(salesResponse.data);
      } catch (error) {
        console.error("데이터를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodaysData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 ml-4">📊 대시보드</h1>
      <Link to="/chatBot">
        <div>챗봇</div>
      </Link>
      <div>
        <div>현재까지의 방문자 수: {visitors.toLocaleString()}</div>
        <div>현재까지의 매출액: {sales.toLocaleString()}</div>
      </div>
      <SalesToday />
      <div className="max-w-sm mx-auto grid grid-cols-1 gap-4">
        <DisposalToday />
        <ExpiringSoonList />
      </div>
    </>
  );
}
