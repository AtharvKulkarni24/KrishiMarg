import csv
from datetime import datetime, timedelta
import random
import math

def generate_historical_prices(filename="data/historical_prices.csv", days=180):
    start_date = datetime.now() - timedelta(days=days)
    
    crops = {
        "Tomato": 30.0,
        "Potato": 20.0,
        "Onion": 25.0
    }
    
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['crop', 'ds', 'y']) # Prophet requires 'ds' (datestamp) and 'y' (value) columns
        
        for crop, base_price in crops.items():
            for i in range(days):
                current_date = start_date + timedelta(days=i)
                
                # Simulate market fluctuations using sine waves for seasonality and random noise
                
                # Weekly seasonality (prices might go up slightly on weekends)
                weekly_effect = math.sin(current_date.weekday() / 7.0 * 2 * math.pi) * 0.5
                
                # Monthly/longer-term seasonal trend
                monthly_effect = math.sin(i / 30.0 * 2 * math.pi) * 2.0
                
                # Random daily fluctuation (noise)
                noise = random.uniform(-2.5, 2.5)
                
                # Calculate final price, ensuring it doesn't drop below a minimum threshold
                price = max(5.0, base_price + weekly_effect + monthly_effect + noise)
                
                # Add occasional big spikes to simulate "festivals", "weather events", or "shortages"
                spike_chance = random.random()
                if spike_chance < 0.08: # 8% chance of a huge sudden price surge
                    price += random.uniform(8.0, 18.0)
                elif spike_chance > 0.95: # 5% chance of a market crash (oversupply)
                    price -= random.uniform(5.0, 10.0)
                    price = max(5.0, price) # Ensure it doesn't go below 5
                    
                writer.writerow([crop, current_date.strftime('%Y-%m-%d'), round(price, 2)])

if __name__ == "__main__":
    generate_historical_prices()
    print("Successfully generated historical_prices.csv with 6 months (180 days) of dummy data for Tomato, Potato, and Onion!")
