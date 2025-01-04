from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd
import re
import time

RETRY_MAX = 3 # ページ読み込みをやり直す回数

def fetch_dynamic_html(url):
    print(f"GOTO {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        for attempt in range(RETRY_MAX):
            try:
                page.goto(url, timeout=60000)
                html = page.content()
                browser.close()
                return html # 上手くいけば
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt < RETRY_MAX - 1:
                    print("Retrying...")
                    time.sleep(2)
                else:
                    browser.close()
                    raise e  # あきらめ

def get_dates():
    future_dates = []
    today_int = int(datetime.now().strftime("%Y%m%d"))
    lines = []
    with open("cache/kaisai.txt",mode='r') as f:
        lines = f.readlines()
    if len(lines) > 0 and int(lines[-1]) > today_int:
        print("LOAD dates from cache ", end="")
        future_dates = [d.strip() for d in lines if int(d) > today_int]
    else:
        future_dates = extract_dates(today_int)
    print(future_dates)
    return future_dates

def extract_dates(today_int):
    future_dates = []
    url = "https://race.netkeiba.com/top/race_list.html"
    print(f"GETS dates from {url}", end="")
    with open("cache/kaisai.txt",mode='a') as f:
        html = fetch_dynamic_html(url)
        soup = BeautifulSoup(html, "html.parser")
        date_element = soup.find("ul", id="date_list_sub")
        for li in date_element.find_all("li"):
            date_str = li.get("date")
            if int(date_str) >= today_int:
                future_dates.append(date_str+"\n")
                f.write(date_str)
    return future_dates

def extract_races(date, col_name):
    new_rows = []
    url = "https://race.netkeiba.com/top/race_list.html?kaisai_date=" + date
    print(f"GETS races on {date} from {url}")
    soup = BeautifulSoup(fetch_dynamic_html(url), "html.parser")
    for races in soup.find_all("dl", class_="RaceList_DataList"): # 競馬場ごと
        text = races.find("p", class_="RaceList_DataTitle").get_text(strip=False)
        print(text)
        cource = text.split()[1]
        for race in races.find_all("li"):
            race_name = race.find("span", class_="ItemTitle").get_text(strip=True)
            race_id   = re.search(r"race_id=(\d+)", race.find("a").get("href")).group(1)
            new_rows.append([date, cource, race_name, race_id])
    new_df = pd.DataFrame(new_rows, columns=col_name)
    return new_df

def main():
    race_dates = extract_dates()


    # get link of grade race
    race_df = pd.read_csv("cache/races.csv", dtype=str)
    for date in race_dates:
        if date in race_df["date"].values:
            print(f"LOAD races on {date} from cache")
            continue
        new_df = extract_races(date, race_df.columns)
        race_df = pd.concat([race_df, new_df])
        race_df.to_csv("cache/races.csv", index=False)

if __name__ == "__main__":
    main()

