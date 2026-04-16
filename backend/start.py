import uvicorn

from app.settings import HOST, PORT, WEB_CONCURRENCY


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        workers=WEB_CONCURRENCY,
        proxy_headers=True,
        forwarded_allow_ips="*",
    )
