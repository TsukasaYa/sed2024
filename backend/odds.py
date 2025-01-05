import pandas as pd
import sys
import os
from scraping import fetch_dynamic_html

def extract_win_place(id):
    cache_path=f"cache/win{id}.html"
    html = ""
    if os.path.exists(cache_path):
        print("LOAD odds from cache")
        with open(cache_path, "r", encoding="utf-8") as file:
            html = file.read()
    else:
        url = f"https://race.netkeiba.com/odds/index.html?type=b1&race_id={id}&rf=shutuba_submenu"
        html = fetch_dynamic_html(url)
        print(f"LOAD odds from {url}")
        with open(cache_path, "w", encoding="utf-8") as file:
            file.write(html)
    tables = pd.read_html(html)

    wins = tables[0]
    wins.columns = [col.replace(" ", "") for col in wins.columns]
    wins = wins[["馬番","馬名","オッズ"]].astype({"馬番": "int", "馬名": "str", "オッズ": "float"})
    wins = support_ratio(wins[["馬番","馬名","オッズ"]], 0.80, ["馬番"])
    places = tables[1]
    places.columns = [col.replace(" ", "") for col in places.columns]
    places = places[["馬番","オッズ"]].astype({"馬番": "int", "オッズ": "str"}) # TODO str -> float
    return wins, places

def support_ratio(df, deduction_rate, key_columns): # deduction_rate: 控除率
    df = df.sort_values("オッズ", ascending=False, ignore_index=True)
    # 2番人気までの支持率
    df["支持率"] = 0.0
    df.loc[df.index[:-1], "支持率"] = deduction_rate / df.loc[df.index[:-1], "オッズ"]
    # 1番人気の支持率
    df.at[df.index[-1], "支持率"] = 1 - df.loc[df.index[:-1], "支持率"].sum()
    df = df.sort_values(key_columns).reset_index(drop=True)
    return df

def extract_quinella(id, wins):
    cache_path=f"cache/quinella{id}.html"
    if os.path.exists(cache_path):
        print("LOAD quinella odds from cache")
        with open(cache_path, "r", encoding="utf-8") as file:
            html = file.read()
    else:
        url = f"https://race.netkeiba.com/odds/index.html?type=b4&race_id={id}&rf=shutuba_submenu"
        print(f"LOAD quinella odds from {url}")
        html = fetch_dynamic_html(url)
        with open(cache_path, "w", encoding="utf-8") as file:
            file.write(html)
            
    tables = pd.read_html(html)

    # dfに変換
    processed_tables = []
    for i, table in enumerate(tables, start=1):
        table = table.rename(columns={f"{i}": "馬番2", f"{i}.1": "オッズ"})
        table["馬番1"] = str(i)
        processed_tables.append(table[["馬番1", "馬番2", "オッズ"]])
    quinellas = pd.concat(processed_tables, ignore_index=True)
    quinellas = quinellas.astype({"馬番1": "int", "馬番2": "int", "オッズ": "float"})
    quinellas = support_ratio(quinellas, 0.775, ["馬番1", "馬番2"])

    # 単勝に基づくオッズを計算
    quinellas["単勝ベース"] = 0.0
    for idx, row in quinellas.iterrows():
        win_first = wins[wins["馬番"] == int(row["馬番1"])]["支持率"].values[0]
        win_second = wins[wins["馬番"] == int(row["馬番2"])]["支持率"].values[0]
        expected_vote  = ((win_first * win_second) / (1 - win_first) +
                        (win_second * win_first) / (1 - win_second))
        quinellas.at[quinellas.index[idx], "単勝ベース"] = expected_vote
    return quinellas

def get_win(id):
    win, place = extract_win_place(id)
    return win

def get_quinella(id, win):
    return extract_quinella(id, win)

def main(id):
    if len(id) != 12:
        return
    print(f"id={id}")
    win, place= extract_win_place(id)
    print(win)
    quinellas = extract_quinella(id, win)
    print(quinellas)


if __name__ == "__main__":
    args = sys.argv
    main(args[1])

