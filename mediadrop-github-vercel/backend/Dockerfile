FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server.py ./server.py
RUN mkdir -p storage/tmp storage/out
ENV PORT=3000
EXPOSE 3000
CMD ["python3", "server.py"]
