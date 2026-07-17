# Stage 1: Build the binary
FROM golang:1.21-alpine AS builder

WORKDIR /app

RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

COPY go.mod ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o notification-service .

# Stage 2: Create the minimal execution image
FROM alpine:3.19

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

WORKDIR /app

COPY --from=builder /app/notification-service .

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8084

ENV PORT=8084
ENV GO_ENV=production

ENTRYPOINT ["./notification-service"]
