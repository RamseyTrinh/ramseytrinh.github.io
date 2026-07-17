# Docker cheat sheet

Quick reference for everyday Docker CLI usage. Based on the [official Docker CLI reference](https://docs.docker.com/reference/cli/docker/).

## Common flags

| Flag | Meaning |
|---|---|
| `-d` | run in detached mode (background) |
| `-it` | interactive terminal (`-i` keep STDIN open, `-t` allocate a TTY) |
| `--name` | assign a container name |
| `-p host:container` | publish a port |
| `-v host:container` | mount a volume / bind mount |
| `-e KEY=value` | set an environment variable |
| `--rm` | remove the container automatically on exit |
| `--network` | attach to a network (default: `bridge`) |
| `--restart` | restart policy (`no`, `on-failure`, `always`, `unless-stopped`) |

## Images

```bash
docker images                      # list local images
docker pull <image>                # download an image
docker image rm <image>            # remove one image
docker rmi $(docker images -aq)    # remove all images
docker image tag <src> <dst>       # retag an image
docker push <image>                # push to a registry
```

## Containers

```bash
docker run -d -p 80:80 --name web nginx   # create + start
docker ps                                 # list running containers
docker ps -a                              # list all containers (incl. stopped)
docker stop <name|id>                     # stop
docker stop $(docker ps -aq)              # stop all
docker rm <name|id>                       # remove (must be stopped, or add -f)
docker rm $(docker ps -aq)                # remove all
docker start -ai <name|id>                # restart and attach
docker exec -it <name|id> sh              # shell into a running container
docker logs -f <name|id>                  # follow logs
docker inspect <name|id>                  # full metadata as JSON
docker stats <name|id>                    # live resource usage
```

!!! tip "Containers vs VMs"
    A container is just an isolated process on the host kernel, not a full VM. On Linux, container processes show up directly in `ps aux`. Docker Desktop (Mac/Windows) runs a lightweight Linux VM under the hood to make this possible.

## Networking

```bash
docker network ls                                  # list networks
docker network create <name>                       # create (default driver: bridge)
docker network inspect <name>                       # inspect
docker network connect <network> <container>         # attach a running container
docker network disconnect <network> <container>      # detach
docker network rm <name>                             # remove
```

## Volumes

A **volume** is storage managed by Docker (outside the container filesystem) — the standard way to persist data such as databases. A **bind mount** instead maps a specific host path into the container.

```bash
docker volume ls                     # list volumes
docker volume inspect <name>          # inspect
docker volume prune                   # remove unused volumes

docker run -d --name db -v db-data:/var/lib/mysql mysql   # named volume
```

Named volumes matter as soon as you run more than one instance of the same image (e.g. two MySQL containers) — without a name there's no way to tell their data apart.

## Quick recipes

```bash
# nginx
docker run -d -p 80:80 --name nginx nginx

# postgres
docker run -d -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=postgres postgres

# mysql
docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=root mysql
```
