---
title: "Demystifying Kubernetes: A Beginner's Guide"
pubDate: 2023-08-08
featured: true
draft: false
tags:
    - orchestration
    - distributed systems
    - devops
heroImage: ""
description: "Dive into the fundamentals of Kubernetes with a beginner-friendly guide!"
---

## Kubernetes Overview

Kubernetes is an open-source container orchestration tool, offering a declarative API to deploy and manage containerized workloads on clusters.

When talking about clusters, we usually use the node terminology. So, **what really is a node?**

A node can be a physical or virtual machine with Kubernetes components running on it; they can be running as containers or installed as binaries.

We have two types of nodes in Kubernetes:

-   **Control plane node**: responsible for the orchestration of workloads (containers) across other nodes. It contains many components that work in collaboration:

    -   **etcd**: a distributed key-value store responsible for storing resources.
    -   **API server**: a REST API that we can interact with to perform CRUD operations on these resources.
    -   **Scheduler**: distributes containers on worker nodes based on resources availability.
    -   **Controller**: we can see it as the brain of Kubernetes; it runs a reconciliation loop trying to get the current state of resources into their desired state.

-   **Worker node**: responsible for running the workloads and communicating their status to the control plane. It has two main components:
    -   **Kubelet**: the agent responsible for applying control plane orders by running assigned workloads and reporting their current state to the control plane.
    -   **Container runtime**: the layer needed on top of the OS to run containers and manipulate them. There are many container runtimes, but Docker is the most commonly used.

In kubernetes, containers do not run directly on worker nodes; instead, they are encapsulated within **Pods**. When scaling your containerized applications, the scaling is not performed within the Pod itself. Instead, the scaling is achieved by scaling Pods.

Typically, a Pod contains one main container, but it can also incorporate multiple containers, including helper containers, often called sidecars, that complement the functionality of the primary container.

## Pods, ReplicatSets, Deployement

Kubernetes has a declarative API that lets the user declare the workloads they want to run on a cluster using the YAML format. **kubectl** is often used as the CLI to interact with the Kubernetes API managers. Essentially, what it does is take the YAML file in which the user specifies their workloads, converts it to JSON, and sends it as an HTTP request to the API managers, which take care of the rest.

### Pods

As mentioned before, a Pod resource encapsulates a container. If you want to run a container on your Kubernetes cluster, you start by writing the YAML file containing the specifications of the pod and use kubectl to send those specs to Kubernetes.

Here is an example demonstrating a YAML file describing a Pod resource that encapsulates one NGINX container:

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80
```

Assuming that the above yaml file is named _nginx.yaml_, in order to run this example execute the following command:

```bash
kubectl apply -f nginx.yaml
```

Now that you created the NGINX pod, we can check if it is created successfully by running:

```bash
kubectl get pods
```

You can display more details regarding the pod we just created:

```bash
kubectl get pods -o wide
```

In case of an error, you can determine the type of the error that prevents the container from running by checking the events of the pod:

```bash
kubectl describe pod nginx-pod
```

### ReplicatSets

A ReplicaSet is another Kubernetes resource that ensures an exact number of pods of a certain type is always running. If you delete one of the pods, another one will be automatically created. If you manually add a pod with the same selector, it will be terminated.

```YAML
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx-container
        image: nginx:latest
```

When applying the above YAML file, three NGINX pods are created, and you can verify this by listing all the pods using kubectl.

You can scale the ReplicaSet by either running:

```bash
kubectl scale replicaset nginx-replicaset —replicas=4
```

Or running:

```bash
kubectl edit replicaset nginx-replicaset
```

Kubectl will open a temporary YAML file containing the spec of the ReplicaSet. You can manually change the number from 3 to 4 and save the file. Kubectl will handle the rest and send a patch request to the API server.

### Deployement

Imagine you have deployed your application using a replicaset. Now, after adding some features, you have a new image for deployment. How are you going to handle that? You might think that if you change the image name in the replicaset, Kubernetes will manage it and roll out the new version of your application, but that's not how it works. To successfully roll out the new version, you need to create a new replicaset with the new image name and manually delete the old one, resulting in downtime for your app in this case.

That's why deployments exits in kubernetes, they allow for more automated rollout of containers by simply updating the image tag or name in the specification.

Here is an example of how a deployment might look like:

```YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

When creating a deployment, a replicaset is created under the hood to ensure that the specified number of replicas is always respected.

When changing the image name in a deployment, a rollout process is triggered. The old replicaset is scaled to zero, deleted, and a new one is created, featuring the new image.

In fact, there are two rollout strategies that you can explicitly mention in the deployment specs:

-   **Recreate**: This strategy starts by deleting the old replicasets and then creating the new one. There is downtime with this strategy, but in some cases, it cannot be avoided, so recreate is the option here.
-   **Rolling Update**: This is the default strategy if the user does not specify anything. It involves gradually scaling down the old replicaset and scaling up the new one simultaneously, ensuring that there is no downtime.

When making changes to a deployment, you may want to check the progress of the rollout. To do that, you can run the following command:

```bash
kubectl rollout status deployment nginx-deployment
```

To view the history of deployment updates, you can use:

```bash
kubectl rollout hitory deployment nginx-deployment
```

Here, you'll notice something called a revision, each with a number. You can think of them as checkpoints in your deployment history that you can revert back to whenever something unpredictable happens during an update.

Imagine you rolled out a new version of your app and discovered a bug that needs fixing. You can revert back to the previous deployment by running:

```bash
kubectl rollout undo deployment nginx-deployment
```

## Networking between pods

In Kubernetes, the default CIDR block for Pods is typically set to _10.244.0.0/16_. This CIDR block is used for assigning IP addresses to Pods in the cluster. Each node in the cluster receives a subset of this CIDR range to allocate IP addresses to Pods running on that node. For example: node-1 might gets _10.244.1.0/24_ and node-2 might gets _10.244.2.0/24_ and so on.

Pods from different nodes on the cluster can not communicate if we rely only on the default network configuration in kubernetes. We need to add some third-party networking solutions also called CNI plugins such as: calico, Flannel, Weave ...etc. It depends also on the bootstrap tool you use for boostraping your kubernetes cluster. Some tools includes a CNI plugin by default and others don't.

## Services

A Service can be conceptualized as a unified endpoint that aggregates other endpoints (pods' IP addresses) under it. When you direct traffic to a service, it automatically handles load balancing among the pods for which it is responsible.

Here how a service might look like:

```YAML
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

By specifying the selector as `app: nginx` every pods with a label `app: nginx` will be listed as an endpoint under this service.

There are three types of services:

-   **clusterIP (default):** used for communication between microservices within the cluster (not exposed to the internet), it essentially groups a set of pods under one IP address and load balances traffic between them.

    -   There is a default service created by kubernetes named _kubernetes_ of type ClusterIP. Its main purpose is to allow pods and worker nodes to communicate with the API server in the master node.

    -   The name of a service of type clusterIP is important since it represents the hostname that can be used by other pods for communication.

-   **nodePort:** allows external traffic to reach the service by essentially mapping the its port to a port on the node where it is running.

    -   If the pods are on the same node, it will function like a load balancer.

    -   If the pods are distributed across multiple nodes, it will span across the different nodes and perform the mapping on each node. This results in multiple IP addresses through which you can access the app(the IP addresses of all the nodes). There might be nodes where no pods match the definition specified in the service. The service still performs its function even if there are no pods because some pods may be scheduled on those nodes in the future.

-   **loadBalancer**: Used to perform load balancing for a microservice that need to be exposed to the internet with pods distributed across multiple nodes, addressing the limitation of node-level load balancing for NodePort services. The loadBalancer service type is only applicable when your cluster is running on the cloud, as it utilizes the load balancing service provided by the cloud platform the cluster is running on.

## kubernetes on the cloud (managed solution)

Most cloud providers offer dedicated services for running Kubernetes clusters. These services are known as managed Kubernetes because the cloud provider handles infrastructure provisioning and bootstrapping. You cannot access the control plane machines, as they are maintained by the cloud provider. However, you can still access the API server to deploy and manage workloads. Here are some of the most well-known managed Kubernetes solutions:

-   **GKE from GCP:** GCP features the best user interface among cloud providers; however, it doesn't provide advanced cluster configuration options. This design choice prioritizes an intuitive and easy-to-use creation process.

-   **EKS from AWS:** The AWS user interface is recognized for being more complex, but it offers a greater range of configuration options.

-   **AKS from Azure:** In my opinion, it falls between GCP and AWS in terms of complexity. It combines the best of both worlds, offering advanced customization options for the cluster along with a user-friendly and easy-to-use UI.

## Kubernetes for dev environment

If your machine is limited in terms of resources and you want to spin up a Kubernetes cluster for learning purposes or to use it for your development environment, you can check:

-   **Minikube:** a bootstrap tool used to provision a single-node Kubernetes cluster locally on your machine. Under the hood, it provisions a VM that acts as a master and worker node simultaneously.

-   **KinD:** KinD stands for Kubernetes in Docker and is highly efficient for running a multi-node cluster on your local machine without requiring significant resources because nodes in KinD are containers, not VMs.
