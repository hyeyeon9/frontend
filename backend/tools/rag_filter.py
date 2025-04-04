# backend/tools/rag_filter.py

from sales_tools import get_sales_data

def save_filtered_csv(start_date, end_date, keyword=None):
    df = get_sales_data(start_date, end_date, keyword)
    print("필터링된 데이터:", df.head())  # ✅ 요걸로 실제 데이터 출력해보기

    if df.empty:
        print("❌ 데이터 없음")
        return "No data found"

    path = "filtered_data/filtered_sales.csv"
    df.to_csv(path, index=False)
    return path

