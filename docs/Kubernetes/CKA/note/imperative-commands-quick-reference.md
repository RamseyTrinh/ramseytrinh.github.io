# Imperative Commands Quick Reference

!!! info "Why imperative?"
    Under exam pressure (2 hours, ~17 tasks), typing YAML is slow. The CKA expects speed. Most questions can be solved faster with imperative commands than writing manifests. Declarative is for when you need complex control or for learning.

!!! tip "Speed tip"
    Memorize these command patterns. On test day, `kubectl run`, `kubectl create`, and `kubectl expose` will be your fastest friends.

## Fast Pod Creation (15-30 seconds vs 2 minutes for YAML)

```bash
# Basic pod
k run nginx --image=nginx:1.27

# Pod with port exposed
k run nginx --image=nginx:1.27 --port=80

# Pod with labels
k run nginx --image=nginx:1.27 --labels=app=web,tier=frontend

# There is no direct command to run pod with resource limits, instead you can use dry-run then edit file or use --overrides arg
k run nginx --image=nginx --overrides='{"spec":{"containers":[{"name":"nginx","image":"nginx","resources":{"requests":{"cpu":"100m","memory":"128Mi"},"limits":{"cpu":"200m","memory":"256Mi"}}}]}}'

# Pod with environment variables
k run nginx --image=nginx:1.27 --env=LOG_LEVEL=debug --env=APP_ENV=prod

# Pod with command override
k run nginx --image=nginx:1.27 -- sh -c "echo 'Hello' && sleep 3600"

# Pod with multiple containers (init + app)
k run myapp --image=myapp:1.0 --overrides='{"spec":{"initContainers":[{"name":"init","image":"busybox","command":["wget","-O","/data/file","http://example.com"]}],"containers":[{"name":"myapp","image":"myapp:1.0","volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","emptyDir":{}}]}}'

# Generate YAML without running (for review/editing)
k run nginx --image=nginx:1.27 $do > pod.yaml
```

!!! tip "Exam pattern"
    Use the `$do` flag to generate YAML, review it, then apply. Saves you from memorizing exact YAML structure.

## Deployment Creation & Management (Most exam questions)

```bash
# Basic deployment
k create deployment webapp --image=nginx:1.27

# Deployment with replicas
k create deployment webapp --image=nginx:1.27 --replicas=3

# Deployment with resource requests
k create deployment webapp --image=nginx:1.27 --replicas=3 --dry-run=client -o yaml | \
  sed 's/resources: {}/resources:\n              requests:\n                cpu: 100m\n                memory: 128Mi/' > deploy.yaml

# Scale deployment
k scale deployment webapp --replicas=5

# Update image (rolling update)
k set image deployment/webapp nginx=nginx:1.28 --record

# Check rollout status
k rollout status deployment/webapp

# View rollout history
k rollout history deployment/webapp

# Rollback to previous version
k rollout undo deployment/webapp

# Rollback to specific revision
k rollout undo deployment/webapp --to-revision=2

# Pause rollout (for manual canary)
k rollout pause deployment/webapp

# Resume rollout
k rollout resume deployment/webapp

# Generate deployment YAML
k create deployment webapp --image=nginx:1.27 --dry-run=client -o yaml > deploy.yaml
```

!!! tip "Exam tip"
    Rollout commands appear on almost every CKA exam. Practice `rollout undo` and `rollout history` until they're muscle memory.

## Service Exposure (ClusterIP, NodePort, LoadBalancer)

```bash
# Expose deployment as ClusterIP (default, internal only)
k expose deployment webapp --port=80 --target-port=8080

# Expose as NodePort (accessible on all nodes)
k expose deployment webapp --port=80 --target-port=8080 --type=NodePort

# Expose as LoadBalancer (cloud-only)
k expose deployment webapp --port=80 --target-port=8080 --type=LoadBalancer

# Get service external IP (NodePort/LoadBalancer)
k get svc -w

# Expose a pod directly (not recommended but does work)
k expose pod nginx --port=80 --name=web-svc

# Create service without deploying (generate YAML)
k create service clusterip web --tcp=80:8080 $do > svc.yaml
k create service nodeport web --tcp=80:8080 $do > svc.yaml

# Edit service after creation
k edit svc webapp

# Port forward for testing (like accessing the pod locally)
k port-forward svc/webapp 8080:80
```

!!! tip "Exam pattern"
    Most questions ask: "Expose deployment X on port Y." Use `k expose deployment X --port=Y --target-port=<app-port>`.

## RBAC — Roles, ServiceAccounts, RoleBindings (25% of exam)

```bash
# Create ServiceAccount
k create sa my-app -n prod

# Create Role (allow specific verbs on specific resources)
k create role pod-reader --verb=get,list,watch --resource=pods -n prod
k create role pod-deleter --verb=get,list,delete --resource=pods -n prod

# Create RoleBinding (bind role to user/sa)
k create rolebinding read-pods --role=pod-reader --serviceaccount=prod:my-app -n prod

# ClusterRole (cross-namespace)
k create clusterrole node-reader --verb=get,list --resource=nodes

# ClusterRoleBinding
k create clusterrolebinding read-nodes --clusterrole=node-reader --serviceaccount=prod:my-app

# Check if user/SA has permission
k auth can-i list pods -n prod --as=system:serviceaccount:prod:my-app

# Check your own permissions
k auth can-i list pods -n prod

# View role details
k get role pod-reader -n prod -o yaml
k get rolebinding read-pods -n prod -o yaml

# Edit role to add/remove permissions
k edit role pod-reader -n prod
```

!!! tip "Exam tip"
    RBAC questions usually involve creating SA + Role + RoleBinding, then testing with `k auth can-i`. Practice the syntax until you don't have to think.

## ConfigMaps & Secrets (Application config)

```bash
# ConfigMap from literal values
k create configmap app-config --from-literal=LOG_LEVEL=debug --from-literal=DB_HOST=postgres.prod

# ConfigMap from file
k create configmap app-config --from-file=config.properties

# ConfigMap from directory
k create configmap app-config --from-file=./configs/

# Secret from literal
k create secret generic db-secret --from-literal=username=admin --from-literal=password=secret123

# Secret from file
k create secret generic tls-secret --from-file=tls.crt=cert.pem --from-file=tls.key=key.pem

# Docker registry secret (for pulling private images)
k create secret docker-registry dockerhub --docker-server=docker.io --docker-username=myuser --docker-password=mypass

# View secret (NOT decrypted)
k get secret db-secret -o yaml

# Describe configmap
k describe cm app-config
```

!!! tip "Exam pattern"
    When a question mentions "app needs config from file," use `k create configmap $name --from-file`.

## Node Management (Maintenance, upgrades, troubleshooting)

```bash
# Cordon node (mark unschedulable, don't evict existing pods)
k cordon node-1

# Drain node (evict all pods before maintenance)
k drain node-1 --ignore-daemonsets --delete-emptydir-data

# Uncordon node (resume scheduling)
k uncordon node-1

# Label a node
k label nodes node-1 disk=ssd
k label nodes node-1 disk=ssd --overwrite  # update existing

# Taint a node (prevent pods from scheduling)
k taint nodes node-1 key=value:NoSchedule
k taint nodes node-1 key=value:NoExecute   # evict existing pods

# Remove taint
k taint nodes node-1 key-

# Get node info (CPU, memory, conditions)
k describe node node-1

# Check node status
k get nodes -o wide
```

!!! tip "Exam pattern"
    "Prepare node for maintenance" = `k drain`. "Node is full" = label it and use `nodeSelector`. "Node needs maintenance" = `k cordon` + `k drain`.

## Debugging & Troubleshooting (30% of exam — learn this well)

```bash
# Get pod logs (follow in real-time)
k logs pod-name
k logs pod-name -f
k logs pod-name --tail=50

# Logs from previous crashed pod
k logs pod-name --previous

# Logs from all containers in pod
k logs pod-name --all-containers

# Logs from specific container in multi-container pod
k logs pod-name -c container-name

# Short-lived troubleshooting — exec into pod
k exec -it pod-name -- /bin/bash
k exec -it pod-name -c container-name -- /bin/bash

# One-off command in pod
k exec pod-name -- curl http://localhost:8080

# Describe pod (events, conditions, resource usage)
k describe pod pod-name

# Describe everything about a resource
k describe node node-1

# Watch events in real-time
k get events -w

# Get specific event from a namespace
k get events -n prod --sort-by='.lastTimestamp'

# Port forward to debug (useful when service isn't working)
k port-forward pod-name 8080:8080
k port-forward svc/service-name 8080:8080

# Copy files from pod to local (for log inspection)
k cp pod-name:/var/log/app.log ./app.log

# Check resource metrics (requires metrics-server)
k top nodes
k top pods -n prod
```

!!! tip "Exam tip"
    30% of exam is "troubleshoot why this isn't working." `k describe` and `k logs` are your debugging weapons. Learn to read the error messages.

## Resource Quotas & Limits (Cluster resource management)

```bash
# Create LimitRange (per-pod limits)
k create limitrange cpu-limit --max=2 --min=100m --type=Pod

# Resource quota (per-namespace total limits)
k create quota my-quota --hard=requests.cpu=10,limits.cpu=20,requests.memory=100Gi,pods=100

# Check current usage
k describe resourcequota my-quota -n prod
k describe limitrange cpu-limit -n prod
```

!!! tip "Exam pattern"
    Usually appears as "create resource quota so namespace doesn't exceed X CPU."

## Shortcuts & Pro Tips (Save 5-10 minutes per exam)

```bash
# Dry-run + output to file (review before applying)
k create deployment app --image=app:1.0 $do > deploy.yaml
k apply -f deploy.yaml

# Delete resources fast
k delete pod pod-name $now          # force deletion
k delete pods --all -n prod --now   # delete all pods in namespace
k delete deployment webapp -n prod  # cascade delete (pods too)

# Get resources in all namespaces
k get pods -A
k get pods --all-namespaces

# Get in custom columns (useful for spotting issues)
k get pods -o wide                  # show node, IP, etc.
k get pods -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image

# JSONPath queries (find pods by image)
k get pods -o jsonpath='{.items[*].metadata.name}' | xargs -I{} echo {}

# Get yaml for an existing resource then copy it
k get deployment webapp -o yaml > webapp-backup.yaml
k apply -f webapp-backup.yaml

# Edit resource live
k edit deployment webapp

# Patch resource (update specific field)
k patch deployment webapp -p '{"spec":{"replicas":5}}'
```
