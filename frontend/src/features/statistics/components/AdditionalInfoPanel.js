import SaleSummary from "./SaleSummary";

export default function AdditionalInfoPanel({
  salesData1,
  salesData2,
  date1,
  date2,
}) {
  return (
    <>
      <SaleSummary salesData1={salesData1} salesData2={salesData2} />
    </>
  );
}
