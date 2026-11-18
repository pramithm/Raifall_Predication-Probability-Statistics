import os
import httpx
import pandas as pd

def main():
    os.makedirs("data", exist_ok=True)
    url = (
        "https://archive-api.open-meteo.com/v1/archive"
        "?latitude=13.0827&longitude=80.2707"
        "&start_date=2004-01-01&end_date=2023-12-31"
        "&daily=precipitation_sum&timezone=auto"
    )
    print("Fetching 20-year Chennai dataset from Open-Meteo Archive API...")
    try:
        response = httpx.get(url, timeout=30.0)
        response.raise_for_status()
        daily = response.json()["daily"]
        df = pd.DataFrame({
            "date": daily["time"],
            "rainfall_mm": daily["precipitation_sum"]
        })
        # Fill None or missing with 0.0 or handle safely
        df["rainfall_mm"] = df["rainfall_mm"].fillna(0.0).round(2)
        output_path = os.path.join("data", "sample_rainfall.csv")
        df.to_csv(output_path, index=False)
        print(f"Successfully saved {len(df)} daily observations to {output_path}")
    except Exception as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    main()
