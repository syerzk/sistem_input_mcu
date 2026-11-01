# Step 1: Build binary Go (menggunakan versi Go paling baru)
FROM golang:alpine AS builder

WORKDIR /app

# Copy go.mod dan go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copy seluruh source code
COPY . .

# Compile main.go yang ada di dalam folder cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server/main.go

# Step 2: Final lightweight image
FROM alpine:latest

RUN apk add --no-cache tzdata

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]