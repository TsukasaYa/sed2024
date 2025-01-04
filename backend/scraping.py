from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from datetime import datetime

def fetch_dynamic_html(url, selector=None):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)#, wait_until="domcontentloaded")
        if selector: # 特定の要素を待つ場合
            page.wait_for_selector(selector)
        #page.wait_for_timeout(5000)  # 指定された時間だけ待機
        html = page.content()
        browser.close()
        return html

def extract_dates(soup):
    today_int = int(datetime.now().strftime("%Y%m%d"))
    future_dates = []

    date_element = soup.find("ul", id="date_list_sub")
    for li in date_element.find_all("li"):
        date_str = li.get("date")
        if int(date_str) >= today_int:
            future_dates.append(date_str)
    return future_dates

def main():
    # dates of races
    url = "https://race.netkeiba.com/top/race_list.html"
    html = fetch_dynamic_html(url)
    soup = BeautifulSoup(html, "html.parser")
    race_dates = extract_dates(soup)
    print(race_dates)
    
    # get link of grade race
    target_element = soup.find("div", id="RaceTopRace")
    if target_element:
        #print(target_element.prettify())
        pass
    else:
        print("Specified element not found.")

if __name__ == "__main__":
    main()

