FROM redis:7-alpine

RUN mkdir -p /data && chown redis:redis /data

EXPOSE 6379

CMD ["redis-server"]