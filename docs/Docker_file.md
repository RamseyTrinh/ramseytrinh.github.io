# Dockerfile & Compose

Reference based on [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) and [Compose file reference](https://docs.docker.com/reference/compose-file/).

## Common instructions

| Instruction | Purpose |
|---|---|
| `FROM` | base image (e.g. `alpine`, `debian`, `ubuntu`) |
| `WORKDIR` | set the working directory for following instructions |
| `COPY` | copy files from build context into the image |
| `RUN` | execute a command at build time (installs, setup) |
| `ENV` | set an environment variable |
| `EXPOSE` | document the port(s) the container listens on |
| `CMD` | default command run when the container starts |

## Build & run

```bash
docker build -t <repo>/<name> .          # build from Dockerfile in cwd
docker run -p 80:80 --rm <repo>/<name>   # run it
docker tag <name>:latest <repo>/<name>:latest
docker push <repo>/<name>:latest
```

!!! tip "Layer caching"
    Each instruction is a cached layer. Changing a line invalidates the cache for that line and every line after it. Put the things that change most often (like `COPY . .`) near the **bottom** of the Dockerfile to keep builds fast.

## Minimal example

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

## Docker Compose

Compose describes multi-container setups in one file. The `version:` key is obsolete in the current Compose Specification and can be omitted.

```yaml
services:
  app:
    build: .
    ports:
      - "80:3000"
    depends_on:
      - mongo
  mongo:
    image: mongo
    ports:
      - "27017:27017"
```

```bash
docker compose up          # start (foreground)
docker compose up -d       # start (detached)
docker compose logs -f     # follow logs
docker compose down        # stop and remove containers/networks
```
