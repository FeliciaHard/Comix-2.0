# 🚀 Comix – Docker Guide

This guide explains how to build and run the **Comix** app with Docker.  
The app is built using **Next.js** and **Prisma**.

---

## 📦 Requirements
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/) (optional)

---

## 🔨 Build the Docker Image

From the project root, run:

```bash
    sudo docker build -t comix .
```

---

## 🔨 Build the Docker Image

Start the container on port 3000:

```bash
    sudo docker run -p 3000:3000 comix
```

---

## ⚙️ Using Docker Compose

A docker-compose.yml file is included.
It can run both the app and the database.

Start services:

```bash
    sudo docker compose up -d
```

Stop services:

```bash
    sudo docker compose down
```

Stop and remove all related services:

```bash
    sudo docker compose down -v --rmi all --remove-orphans
```

By default:
App runs on: http://localhost:3000

## 🧹 Tips

Add lib/generated/prisma to .gitignore so you don’t commit generated files.

Use .dockerignore to exclude:

node_modules, .next, logs & Local env files

If you change schema.prisma, rebuild the image to regenerate Prisma client:

```bash
    sudo docker compose build --no-cache
```
