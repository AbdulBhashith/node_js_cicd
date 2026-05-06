# Single-stage build — this app uses only Node.js built-in modules,
# so no npm install step is needed.
FROM node:20-alpine AS runtime
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY server.js .
COPY package.json .

# Switch to non-root user
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]