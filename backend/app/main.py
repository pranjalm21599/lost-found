import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from .config import settings
from .database import engine, Base
from .routers import auth, users, items, files, claims

# Create tables if not using migrations
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Campus Lost & Found API",
    description="Backend API for reporting, searching, claiming, and returning lost and found items on campus.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)
app.include_router(files.router)
app.include_router(claims.router)

# Custom validation error handler for clean, friendly messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        msg = err.get("msg", "Invalid value")
        errors.append(f"{field}: {msg}" if field else msg)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "; ".join(errors)}
    )

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Campus Lost & Found API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
