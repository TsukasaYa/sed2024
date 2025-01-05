from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scraping import get_dates, get_races
from odds import get_win, get_quinella
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

class Selection(BaseModel):
    selection: list[int]
saved_selection = []

win_df : pd.DataFrame = None

@app.post("/send_id")
async def get_odds(race: RaceId):
    global saved_race_id
    saved_race_id = race.race_id
    print(f"receive id {saved_race_id}")
    return {"message": "ok"}

@app.get("/race-card")
async def get_card():
    global win_df
    win_df = get_win(saved_race_id)
    win_renamed = win_df.set_axis(["number", "name", "odds", "votingRate"], axis='columns')
    json_data = win_renamed.to_json(orient="records", force_ascii=False)
    print(f"SEND race-card")
    return JSONResponse(content=json.loads(json_data), headers={"Content-Type": "application/json; charset=utf-8"})

@app.post("/selection")
async def set_selection(s: Selection):
    global saved_selection
    saved_selection = s.selection
    print(f"RECEIVE selection {saved_selection}")
    return {"message": "ok"}

@app.get("/quinellas")
async def quinellas():
    quinellas = get_quinella(saved_race_id, win_df)
    quinellas.columns = ["firstHorse", "secondHorse", "odds", "votingRate", "expetedRate"]
    json_data = quinellas.to_json(orient="records", force_ascii=False)
    print(f"SEND quinella-odds")
    return JSONResponse(content=json.loads(json_data), headers={"Content-Type": "application/json; charset=utf-8"})

if __name__ == '__main__':
    pass
    

# pip install uvicorn fastapi
#  uvicorn main:app --reload で起動
# http://localhost:8000 でHellow Worldを確認