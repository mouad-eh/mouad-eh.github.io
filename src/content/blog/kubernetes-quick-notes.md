---
title: Kubernetes quick notes
pubDate: 2023-08-08
featured: true
draft: false
tags:
    - orchestration
    - distributed systems
    - devops
heroImage: ""
description: "useful notes from kodcloud beginner kubernetes course on udemy."
---

## Kubernetes overview

node: a virtual or a physical machine with kubernetes installed on it

master node: api server (frontend), etcd, scheduler(distribute containers on worker nodes), controller(brain)

worker node: kubelet, container runtime

## Kubernetes concepts

containers does not run as they are on worker nodes they are encapsulated in PODs

if you want to scale your container you do not do that inside the POD, instead of that you scale PODs

a POD usually contains one container but it can have multiple containers ( helper containers with the main container )

## YAML

[https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell](https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell)

tab = 2 spaces

there is two ways to indent lists in yaml:

```yaml
containers:
    - image: nginx
      name: nginx
    - image: busybox
      name: busybox
```

```yaml
containers:
    - image: nginx
      name: nginx
    - image: busybox
      name: busybox
```

## Pods, ReplicatSets, Deployement

### PODS

kubectl get pods -o wide

you can figure out the type of the error why the containers is not running in the events of the pod after kubectl describe pod podname

kubectl run —image=redis —dry-run=client -o yaml > redis.yaml

### ReplicatSets

replication controller or replicatset:

-   a k8s object ensuring that an exact number of pods of a certain type are always running
-   if you delete one of the pods, another one will be automatically created
-   if you add manually a pod with the same selector, it will be terminated

replicatset are enhanced version of replication controller

---

kubectl edit replicaset new-replicat-set → change the image name → trigger a rolling update by deleting all the pods

kubectl scale replicaset new-replica-set —replicas=2

kubectl explain replicaset

kubectl get rs

### Deployement

kubectl get all

creating or changing a deployment → a rollout process is triggered → a new revision is created

in case of changing, the old replicaset is scaled to 0 and the new replicaset is created

deployment strategy:

-   recreate
-   rolling update

kubectl rollout status deployment

kubectl rollout history deployment

kubectl rollout undo deployment

changing the deployment strategy of a deployment does not trigger a rolling update

recreate strategy no new replicaset is created, no revision

---

k get deploy

## Networking in kubernetes

internal network between pods inside one single node : 10.244.0.0

pods from different nodes on the cluster can not communicate if we rely only on the default network configuration, we need to add some third-party networking solutions

we expect from the networking solution:

-   pods across different nodes can communicate without nat
-   nodes can communicate with pods and vice-versa without nat

## Services

-   nodePort: **allow external traffic to reach the service, frontend service for example, it can act as an internal loadbalancer inside the node**
    -   targetPort (pod)
    -   pod
    -   nodePort (between 30000 and 32xxx)lo

if there is multiple pods on the same node: it will act like a load balancer

if there are multiple pods accross multiple nodes with the same label: it will span accross the different nodes and do the mapping on every node (there are multiple IP addresses you can access the app from → the ip address of the all the nodes)

nodePort service in the case of multiple pods spanned accross multiple nodes : there might be some nodes where there is no pods that match the definition specified in the service → the service does the job even if there is no pods and you can access the node with the node port

_kubectl service myservice —url_

-   clusterIP (default): **used for internal services, it does loadbalancing but for internal services (not exposed to internet traffic)**

groupe a set of pods under one IP address

-   loadBalancer: **loadbalancing for external services spanned accross multiple nodes, exposed to internet traffic**

loadBalancer is only supported on the cloud

<aside>
💡 the default service created by kubernetes named kubernetes of type ClusterIP allow pods and worker nodes to communicate with the API server in the master node

</aside>

endpoints = how many pods are the service directing traffic to

the name of a service of type clusterIP is important since it represents the hostname associated with the IP of the internal service (that host name is often used to communicate with databases etc)

## Microservices

_kubectl get pods,services_

_minikube service my-service —url (to get the Ip address of the minikube node)_

the cluster IP field when displaying the services → the IP address used to access the service internally ( mostly used in the case of clusterIP )

---

[https://github.com/kodekloudhub/example-voting-app-kubernetes](https://github.com/kodekloudhub/example-voting-app-kubernetes)

## kubernetes on the cloud (managed solution)

a managed k8s cluster : GKE, AKS, EKS ( you can not access master nodes, they are maintained by the cloud provider )

GCP: ( best ui + very simple in terms of configurations )

-   create a kubernetes cluster on GKE
-   access it through cloud shell
-   the cluster by default came up with 3 worker nodes
-   get the yaml files from github
-   apply and create deployment and services ( is small change is to change the type of NodePort to a LoadBalancer )
-   when the loadBalancers are provisioned, you can access them from the external-ip provided ( ≠ clusterIP which is for internal use )

EKS:

-   much more complicated then GCP ;)
-   aws cli, you run kubectl on your machine but the changes are reflected on the remote cluster in the cloud ( you can use cloudshell also)

AKS:

-   between GCP and AWS in terms of complication

## Set up a _multinode_ cluster using kubeadm (non managed solution)

vagrant: provision a bunch of VMs according to specs specified in a conf file (makes clusters portable)

kubeadm: a tool to set up kubernetes components on master and worker nodes ( bootstrap and manage kubernetes cluster )

-   install a container runtime on all the nodes: containerd ( we follow the install process of docker engine since docker engine = containerd + other stuff , we follow the same process but when installing we install only containerd)
-   kubelet and containerd needs cgroups drivers to limit ressources for pods ( cgroupfs is the default used by container runtime and kubelet and you can’t keep it that way if the the init system is systemd )
-   installing kubeadm, kubelet and kubectl on all nodes
-   initialize the master node with **_kubeadm init +_** run some other commands to be able to connect to your cluster (api server)
-   deploy a pod network

namespaces ? and demonset ?

-   join the worker node to the master node by running a command on every worker node

**_minikube_**: a **_single node_** kubernetes cluster locally on your machine, under the hood it provisions a VM that acts as a master and worker node at the same time
