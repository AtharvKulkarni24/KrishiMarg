import pandas as pd
from prophet import Prophet
from models.schemas import ForecastData

def get_forecast(crop_name: str, days: int = 7):
    # 1. Load the historical data from the data folder
    try:
        df = pd.read_csv("data/historical_prices.csv")
    except FileNotFoundError:
        raise Exception("data/historical_prices.csv not found. Please ensure the data file exists.")
    
    # Filter by crop
    df = df[df['crop'].str.lower() == crop_name.lower()]
    
    if df.empty:
        raise Exception(f"No historical data found for crop: {crop_name}")
    
    # 2. Initialize and train the Prophet model
    m = Prophet(daily_seasonality=True, yearly_seasonality=False, weekly_seasonality=True)
    m.fit(df)
    
    # 3. Predict the next days
    future = m.make_future_dataframe(periods=days)
    forecast = m.predict(future)
    
    # Extract only the future days
    future_forecast = forecast[['ds', 'yhat']].tail(days)
    
    # 4. Format the output
    forecast_trend = []
    prices = []
    
    for _, row in future_forecast.iterrows():
        predicted_price = round(row['yhat'], 2)
        date_str = row['ds'].strftime('%Y-%m-%d')
        
        forecast_trend.append(ForecastData(date=date_str, price=predicted_price))
        prices.append(predicted_price)
    
    # 5. Generate a rule-based advisory
    price_start = prices[0]
    price_end = prices[-1]
    
    advisory = "⚖️ Prices are stable. Safe to harvest and list at your convenience."
    
    if price_end > price_start * 1.05:
        margin_increase = round(price_end - price_start, 2)
        advisory = f"📈 Demand surging next week. Delay harvest by a few days to capture approximately ₹{margin_increase}/kg higher margins."
    elif price_end < price_start * 0.95:
        advisory = "📉 Prices are projected to drop due to high market arrivals. Harvest and list your crop immediately to lock in today's rates."

    return {
        "forecast_trend": forecast_trend,
        "advisory_text": advisory
    }
