---
title: Facts About Docker That You May Not Know
pubDate: 2023-08-02
featured: true
draft: false
tags:
    - docker
    - containers
    - devops
heroImage: ""
description: "Explore lesser-known insights about Docker that might be unfamiliar to you."
---

## Native Containers

-   Linux and Windows coexist in the container world, but they have different compatibility. Linux-based containers are more common, while Windows has two container types:

    -   Windows Server Containers: run on windows servers and share the kernel like Linux.
    -   Hyper-V Containers: each container has its own kernel like a lighweight VM.

-   Linux containers rely on two kernel features:

    -   namespaces for isolation, ensuring processes have different PIDs inside the host and the container.
    -   Cgroups which restrict CPU/RAM resources allocated to a container.

-   Running a Linux-based container on Windows is possible using Docker Desktop. It achieves this by creating a Linux VM on top of hyper-v and running containers on it.

-   Windows for desktop primarily runs Linux containers but can be configured for Windows containers (the Hyper-V type).

## Docker Architecture

-   Docker Engine comprises the CLI, REST API, and Daemon. The CLI and API can be on separate hosts, allowing for remote Docker commands. Example: `docker -H 10.12.0.1:23303 run nginx` creates a nginx container on a remote host.

## Containers and Images

-   A running container cannot be deleted directly; it must be stopped first. Similarly, an image with an associated container, whether running or stopped, cannot be deleted until the container is stoped and then deleted.

-   One of the differences between ENTRYPOINT and CMD in a Dockerfile is that: `docker run <image-name> <command>` overides CMD but append to ENTRYPOINT.

## Networking in Docker

-   There are three default network types in Docker:

    -   **Bridge:** This is the network type used by if the `--network` flag is not specified. Each created container is added to the bridge network by default. You can perform port mapping between container and host ports.

    -   **None:** Containers with the `--network none` option are placed in an isolated network, and no port mappings can be done in this mode.

    -   **Host:** Containers with the `--network host` option share the network namespace with the host. Port mappings are not needed, as the containers directly use the host's network. However, this prevents running multiple containers with the same port on the host.

-   You can create your own network, specify the IP range and the type of the network by using the `docker network create ...` command.

-   Containers attached to brige default network use host dns server

-   Containers attached to custom networks use docker internal dns server.

-   Docker compose creates a default network linking between the services and manages hostname resolution to ip address automatically (hostname is the service name).

## Container registery

-   The default registry for docker is is [docker.io](http://docker.io).

-   Tech companies often have their own container registry, usually deployed on their on-premise data centers.

## Container orchestration

-   In production environment, you can’t just have one docker host, you need to have a more reliable system by running multiple docker hosts to ensure high availability.

-   Container orchestration tools addresses issues like managing multiple hosts, handling unhealthy containers, and enables auto-scaling.
