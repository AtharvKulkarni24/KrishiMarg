from fastapi import FastAPI
from routes import forecast, optimize

app = FastAPI(title="KrishiMarg AI Engine")

# Include the routers
app.include_router(forecast.router)
app.include_router(optimize.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
