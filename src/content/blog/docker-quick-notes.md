---
title: Docker quick notes
pubDate: 2023-08-02
featured: true
draft: false
tags:
    - docker
    - containers
    - devops
heroImage: ""
description: "useful notes I took while learning docker through a course from kodecloud."
---

## Introduction

you can not run a windows based container on a linux machine

you can run a linux based container on windows ( windows - linux VM - linux based container )

## Docker Command

you can not delete a container while it is running

you can not delete an image if there is container runned from that image whether it is actually running or exited

### commands

-   inspect
-   attach
-   ‘run -a’ (attach stdin, stdout of the container to the terminal)

docker run - a kodekloud/simple-prompt-docker (i have to run this to check if -a is by default added)

-   exec
-   logs
-   run -d
-   run -it ( i: Keep STDIN open even if not attached, t: Allocate a pseudo-TTY → gives you container terminal )

The `-it` instructs Docker to allocate a pseudo-TTY connected to the container’s stdin → creating an interactive `bash` shell in the container.

<aside>
💡 every process has a stdin, stdout, stderr files (datastream open for it), you can count a docker container as a process

</aside>

## Docker images

-   Docker history image

difference between ENTRYPOINT and CMD: docker run image [COMMAND] override CMD and append to ENTRYPOINT

## Docker compose

[https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell](https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell)

docker run —link redis:redis (deprecated)

docker compose v1 (this is the version of the compose file not compose itself) is also deprecated since it also uses links

v2 and beyond (version of the compose file format) : version, services, networks, volumes

-   create a default network linking between the services and manage hostname resolution to ip address automatically (hostname is the service name)

## Docker engine, storage

docker engine:

-   docker CLI
-   REST api
-   docker deamon

<aside>
💡 deomon is a type of process that is always running in the background (services in linux)

</aside>

cli and api can be in seperate hosts: docker -H 10.12.0.1:23303 run nginx

namespaces(isolation): same process have different PID in the host and inside the container, you can see this by running a command inside a docker container and doing ps in both host and the container, you will see the same command with different PID

cgroups(restriction): restrict CPU/RAM ressources allocated to a container, by default there is no restriction

---

docker image layers are read only, when you run a docker run command you add a container layer (read and write layers) on top of the image read only layers

you can change app code inside the container, the code file will be copied to the container layer and changed (copy on write)

the container layer is removed when container deleted and not stopped

### mounting:

-   volume mounting (mounting volumes under /var/lib/docker/volumes)
-   bind mounting (mounting any directory on the host file system, you can even mount on external hard drive)

docker —mount → more verbose than docker -v

under the hood of mounting and volumes: storage drivers

## Networking

default networks types:

-   bridge: every created container is added to it by default, you can do mapping
-   none: isolated network (I geuss there is no way to map it) —network=none
-   host: no need for mapping but you can not run containers with the same port —network=host

you can create your own network and specify the IP range and the type of the network (docker network create …)

containers attached to brige default network use host dns server

containers attached to custom networks use docker internal dns server

## Docker registry

default registry: [docker.io](http://docker.io) ( docker pull nginx/nginx-ingress → docker pull [docker.io/nginx/nginx-ingress](http://docker.io/nginx/nginx-ingress) )

you can deploy your own registry on-premis:

-   run the registry container and map it to a host port
-   tag the image ( linking the local image with a remote image )
-   push

## Docker on mac and windows

windows:

-   two option to run linux based docker containers on windows: virtualbox (docker toolbox) and hyper-v (docker destop for windows) : **hypervisor(virtual box or hyper-v) → linux OS → docker engine → docker container**
-   there is two types of windows containers:
    -   windows server containers (running on windows servers and share the kernel like linux )
    -   hyper-v containers (each container with its kernel like lightweight virtual machine)
-   windows for desktop by default runs linux containers and you can configure it to run windows containers (hyper-v ones)
-   virtualBox and hyper-v can not co-exists on the same windows host

macOS:

-   no images or containers specific to macOS
-   same analogy as windows: hyperkit instead of hyper-v

## Container orchestration

**_why container orchestration tool:_**

-   in production environment you can’t just have one docker host ( you need to have a more robust system by running multiple docker hosts → a distributed system )
-   there is also the problem of unhealthy container
-   auto-scaling

docker swarm lack the auto-scaling feature

relation between docker and kubernetes: docker is one of the container engines compatible with kubernetes
