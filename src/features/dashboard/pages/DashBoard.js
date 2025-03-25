import DisposalToday from "../../disposal/pages/DisposalToday";
import SalesToday from "../../statistics/pages/SalesToday";
import ExpiringSoonList from "./ExpiringSoonList";

export default function DashBoard() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4 ml-4">📊 대시보드</h1>
      <SalesToday />
      <div className="max-w-sm mx-auto grid grid-cols-1 gap-4">
        <DisposalToday />
        <ExpiringSoonList />
      </div>
    </>
  );
}
