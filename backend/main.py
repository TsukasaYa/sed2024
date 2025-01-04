from fastapi import FastAPI
from scraping import get_dates, get_races

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000"
]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/races")
async def thisweek_races():
    dates = get_dates()
    races = get_races(dates)
    return races.to_json(orient="records")

if __name__ == '__main__':
    pass
    

# pip install uvicorn fastapi
#  uvicorn main:app --reload で起動
# http://localhost:8000 でHellow Worldを確認