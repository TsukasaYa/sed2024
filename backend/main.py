from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from scraping import get_dates, get_races
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じて特定のオリジンを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/races")
async def thisweek_races():
    dates = get_dates()
    races = get_races(dates)
    json_data = races.to_json(orient="records", force_ascii=False)
    return JSONResponse(content=json.loads(json_data), headers={"Content-Type": "application/json; charset=utf-8"})

if __name__ == '__main__':
    pass
    

# pip install uvicorn fastapi
#  uvicorn main:app --reload で起動
# http://localhost:8000 でHellow Worldを確認