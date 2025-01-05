import pandas as pd
import sys
import os
from scraping import fetch_dynamic_html

def extract_tanfuku(id):
    cache_path="cache/tansho.html"
    html = ""
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as file:
            html = file.read()
    else:
        url = f"https://race.netkeiba.com/odds/index.html?type=b1&race_id={id}&rf=shutuba_submenu"
        html = fetch_dynamic_html(url)
        with open(cache_path, "w", encoding="utf-8") as file:
            file.write(html)
    tables = pd.read_html(html)

    tansho = tables[0]
    tansho.columns = [col.replace(" ", "") for col in tansho.columns]
    tansho = tansho[["馬番","馬名","オッズ"]].astype({"馬番": "int", "馬名": "str", "オッズ": "float"})
    tansho = support_ratio(tansho[["馬番","馬名","オッズ"]], 0.80, ["馬番"])
    fukusho = tables[1]
    fukusho.columns = [col.replace(" ", "") for col in fukusho.columns]
    fukusho = fukusho[["馬番","オッズ"]].astype({"馬番": "int", "オッズ": "str"}) # TODO str -> float
    return tansho, fukusho

def support_ratio(df, deduction_rate, key_columns): # deduction_rate: 控除率
    df = df.sort_values("オッズ", ascending=False, ignore_index=True)
    # 2番人気までの支持率
    df["支持率"] = 0.0
    df.loc[df.index[:-1], "支持率"] = deduction_rate / df.loc[df.index[:-1], "オッズ"]
    # 1番人気の支持率
    df.at[df.index[-1], "支持率"] = 1 - df.loc[df.index[:-1], "支持率"].sum()
    df = df.sort_values(key_columns).reset_index(drop=True)
    return df

def extract_umaren(id, tansho):
    cache_path="cache/umaren.html"
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as file:
            html = file.read()
    else:
        url = f"https://race.netkeiba.com/odds/index.html?type=b4&race_id={id}&rf=shutuba_submenu"
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
    umaren = pd.concat(processed_tables, ignore_index=True)
    umaren = umaren.astype({"馬番1": "int", "馬番2": "int", "オッズ": "float"})
    umaren = support_ratio(umaren, 0.775, ["馬番1", "馬番2"])

    # 単勝に基づくオッズを計算
    umaren["単勝ベース"] = 0.0
    for idx, row in umaren.iterrows():
        tansho_1 = tansho[tansho["馬番"] == int(row["馬番1"])]["支持率"].values[0]
        tansho_2 = tansho[tansho["馬番"] == int(row["馬番2"])]["支持率"].values[0]
        tansho_base  = ((tansho_1 * tansho_2) / (1 - tansho_1) +
                        (tansho_2 * tansho_1) / (1 - tansho_2))
        umaren.at[umaren.index[idx], "単勝ベース"] = tansho_base
    return umaren

def get_tansho(id):
    tan, fuku = extract_tanfuku(id)
    return tan

def get_umaren(id, tan):
    return extract_umaren(id, tan)

def main(id):
    if len(id) != 12:
        return
    print(f"id={id}")
    tan, fuku= extract_tanfuku(id)
    print(tan)
    umaren = extract_umaren(id, tan)
    print(umaren)


if __name__ == "__main__":
    args = sys.argv
    main(args[1])

