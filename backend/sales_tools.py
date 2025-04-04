import pandas as pd
import pymysql

def get_sales_data(start_date: str, end_date: str, keyword: str = "") -> pd.DataFrame:
    """
    MySQL에서 기간과 키워드로 판매 데이터를 필터링하여 DataFrame으로 반환
    
    :param start_date: 시작 날짜 (예: '2025-01-01')
    :param end_date: 종료 날짜 (예: '2025-03-31')
    :param keyword: 상품명 또는 서브카테고리명에 포함될 키워드
    :return: 필터링된 판매 데이터 DataFrame
    """
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="",  # 비밀번호가 없으면 빈 문자열, 있으면 "1234" 등 입력
        database="final",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

    query = f"""
    SELECT s.sale_date, g.goods_name, sc.sub_name, s.sale_amount
    FROM sale_data s
    JOIN goods g ON s.goods_id = g.goods_id
    JOIN sub_category sc ON g.sub_category_id = sc.sub_category_id
    WHERE s.sale_date BETWEEN '{start_date}' AND '{end_date}'
    AND (g.goods_name LIKE '%{keyword}%' OR sc.sub_name LIKE '%{keyword}%')
    ORDER BY s.sale_date ASC
    """

    df = pd.read_sql(query, conn)
    conn.close()
    return df
