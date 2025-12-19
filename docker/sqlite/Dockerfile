FROM debian:stable-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends sqlite3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY check_db.sh /check_db.sh
RUN chmod +x /check_db.sh

VOLUME ["/data"]

CMD ["sh", "/check_db.sh"]