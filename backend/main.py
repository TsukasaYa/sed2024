from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scraping import get_dates, get_races
from odds import get_tansho, get_umaren
import json
import pandas as pd

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

# レースIDのデータモデル
class RaceId(BaseModel):
    race_id: int
saved_race_id = None

tansho_odds = None

@app.post("/race_card")
async def get_odds(race: RaceId):
    global saved_race_id
    global tansho_odds
    saved_race_id = race.race_id
    tansho_odds : pd.DataFrame = get_tansho(saved_race_id)
    return {"message": "Race ID received", "race_card": tansho_odds.to_json()}

if __name__ == '__main__':
    pass
    

# pip install uvicorn fastapi
#  uvicorn main:app --reload で起動
# http://localhost:8000 でHellow Worldを確認