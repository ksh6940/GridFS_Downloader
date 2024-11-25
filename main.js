import tkinter as tk
from tkinter import messagebox
from pymongo import MongoClient
import requests

# MongoDB 연결 설정
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "your_database_name"  # DB 이름
PRODUCT_COLLECTION = "products"  # 제품 컬렉션 이름
UPLOADS_COLLECTION = "uploads.files"  # 파일 업로드 컬렉션 이름

# GET 요청 URL 설정
API_URL = "http://localhost:5000/api/download"

# MongoDB 연결
client = MongoClient(MONGO_URI)
db = client[DB_NAME]


# 파일 다운로드 함수
def download_file(file_id):
    try:
        # GET 요청으로 파일 다운로드
        url = f"{API_URL}/{file_id}"
        response = requests.get(url, stream=True)

        if response.status_code == 200:
            # 파일 저장
            filename = response.headers.get("Content-Disposition", f"downloaded_file_{file_id}")
            with open(filename, "wb") as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)
            messagebox.showinfo("성공", f"파일이 {filename}로 다운로드되었습니다.")
        else:
            messagebox.showerror("오류", f"파일 다운로드 실패: {response.status_code}")
    except Exception as e:
        messagebox.showerror("오류", f"파일 다운로드 중 오류 발생: {e}")


# 제품 검색 함수
def search_product():
    user_id = entry.get().strip()

    if not user_id:
        messagebox.showerror("입력 오류", "ID 값을 입력해주세요.")
        return

    try:
        # MongoDB에서 제품 데이터 검색
        product = db[PRODUCT_COLLECTION].find_one({"id": user_id})

        if not product:
            messagebox.showinfo("결과 없음", "해당 ID에 해당하는 제품이 없습니다.")
            return

        # Product 내의 파일 이름 추출
        filename = product.get("product", {}).get("filename")

        if not filename:
            messagebox.showinfo("결과 없음", "해당 제품에 파일 데이터가 없습니다.")
            return

        # uploads.files에서 _id 찾기
        file_data = db[UPLOADS_COLLECTION].find_one({"filename": filename})

        if not file_data:
            messagebox.showinfo("결과 없음", "해당 파일을 찾을 수 없습니다.")
            return

        # _id를 사용해 파일 다운로드
        file_id = file_data["_id"]
        download_file(file_id)

    except Exception as e:
        messagebox.showerror("오류", f"제품 검색 중 오류 발생: {e}")


# Tkinter GUI 생성
root = tk.Tk()
root.title("MongoDB 파일 다운로드")

# 입력창과 버튼 구성
label = tk.Label(root, text="ID 값을 입력하세요:")
label.pack()

entry = tk.Entry(root, width=30)
entry.pack()

button = tk.Button(root, text="파일 다운로드", command=search_product)
button.pack()

root.mainloop()