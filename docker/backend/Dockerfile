FROM python:3.11-slim

WORKDIR /app

# Build context для бэкенда установлен в ./backend,
# поэтому все пути COPY должны быть относительно корня контекста.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DATABASE_PATH=/data/education.db

EXPOSE 3000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]