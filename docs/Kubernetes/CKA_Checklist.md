# CKA — Checklist to GOAL

Study one topic each day, following the CKA exam domain weights (see [CKA](CKA.md)) and the lab structure from [theplatformlab/CKA-Certified-Kubernetes-Administrator](https://github.com/theplatformlab/CKA-Certified-Kubernetes-Administrator). Tick each box when completed.

!!! tip "How to use this checklist"
    The **Troubleshooting** domain carries the highest weight (30%), but it depends on knowledge from the other domains. Review it throughout week 4 rather than studying it separately from the start. Reserve one day at the end of each week for review—repeat everything manually without referring to the documentation.

## Week 1 — Foundations + Storage (10%)

- [x] Day 1: Set up a practice cluster with kind (`init-cluster.sh`) — create a local Kubernetes v1.35.1 cluster for labs
- [x] Day 2: Basic Pods — create, inspect, and delete Pods; multi-container Pods (the older sidecar pattern)
- [x] Day 3: **Native sidecar containers (new in v1.35, GA)** — init containers with `restartPolicy: Always`; distinguish them from traditional multi-container Pods
- [x] Day 4: ConfigMaps and Secrets — create and mount them in Pods (through environment variables or volumes)
- [ ] Day 5: Storage — PersistentVolumes, PersistentVolumeClaims, StorageClasses, and access modes
- [ ] Day 6: Advanced storage — `WaitForFirstConsumer` binding mode
- [ ] Day 7: Review week 1 + repeat everything manually (without documentation)

## Week 2 — Cluster Architecture, Installation & Configuration (25%)

- [ ] Day 8: RBAC — Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings; test permissions with `kubectl auth can-i --as=`
- [ ] Day 9: kubeadm — install a cluster (init and join nodes) and configure a CNI plugin
- [ ] Day 10: kubeadm upgrade — remember the exact order: control plane first, then workers; upgrade kubelet/kubectl on every node
- [ ] Day 11: Static Pods — configure them through the kubelet manifest path
- [ ] Day 12: etcd — backup and restore (`etcdctl snapshot save/restore`); remember the certificate paths
- [ ] Day 13: CRI-dockerd setup + CNI installation (Calico/Tigera)
- [ ] Day 14: Review week 2 + repeat everything manually

## Week 3 — Workloads & Scheduling (15%) + Services & Networking (20%)

- [ ] Day 15: Deployments — rolling updates, rollbacks, and scaling; basic StatefulSets
- [ ] Day 16: Node drain/cordon, taints and tolerations, nodeSelector/affinity
- [ ] Day 17: Jobs/CronJobs, PriorityClass, and tuning resource requests/limits
- [ ] Day 18: HPA (Horizontal Pod Autoscaler) with metrics-server; `kubectl debug` (node/Pod)
- [ ] Day 19: Services — ClusterIP, NodePort, and LoadBalancer; CoreDNS and service discovery
- [ ] Day 20: Classic Ingress and **Gateway API (new in v1.35, GA)** — create a `Gateway` and `HTTPRoute` pointing to a backend Service
- [ ] Day 21: NetworkPolicy — always remember to add a rule allowing DNS egress; review week 3 + repeat everything manually

## Week 4 — Troubleshooting (30%) + Final Review

- [ ] Day 22: Troubleshoot cluster components — inspect control-plane and kubelet logs/status, and inspect events
- [ ] Day 23: Troubleshoot Pods/containers in this order: `describe` → `logs` → `exec`; common issues (CrashLoopBackOff, ImagePullBackOff, Pending)
- [ ] Day 24: Troubleshoot networking — broken DNS, incorrectly routed Services, and mistakenly blocking NetworkPolicies; continue in this order: `endpoints` → DNS → NetworkPolicy
- [ ] Day 25: Troubleshoot etcd endpoints and TLS configuration; review RBAC + etcd backup/restore under time pressure
- [ ] Day 26: Take **Mock Exam 01** (strict 120-minute limit; use the practice set in the reference repository)
- [ ] Day 27: Run **Killer.sh, attempt 1** (recommended two weeks before the exam) — record slow or incorrect areas for review
- [ ] Day 28: Review the weak areas identified by Killer.sh; practise `kubectl` typing speed, aliases, and autocomplete; take **Mock Exam 02**
- [ ] Day 29: Run **Killer.sh, attempt 2** (recommended three days before the exam); aim to finish in two hours using a two-pass strategy
- [ ] Day 30: Light final review and rest; check the pre-exam tools checklist (kubectl context, aliases, vim/nano configuration, `exam-setup.sh`)
