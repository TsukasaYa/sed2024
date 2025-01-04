from fastapi import FastAPI

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000"
]

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == '__main__':
    pass
    

# pip install uvicorn fastapi
#  uvicorn main:app --reload で起動
# http://localhost:8000 でHellow Worldを確認