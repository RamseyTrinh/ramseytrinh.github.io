# CKA — Checklist to GOAL

Study one topic each day, following the CKA exam domain weights (see [CKA](CKA.md)) and the lab structure from [theplatformlab/CKA-Certified-Kubernetes-Administrator](https://github.com/theplatformlab/CKA-Certified-Kubernetes-Administrator). Tick each box when completed.

!!! tip "How to use this checklist"
    The **Troubleshooting** domain carries the highest weight (30%), but it depends on knowledge from the other domains. Review it throughout week 4 rather than studying it separately from the start. Reserve one day at the end of each week for review—repeat everything manually without referring to the documentation.

## Week 1 — Foundations + Storage (10%)

- [x] Day 1: Set up a practice cluster with kind (`init-cluster.sh`) — create a local Kubernetes v1.35.1 cluster for labs
- [x] Day 2: Basic Pods — create, inspect, and delete Pods; multi-container Pods (the older sidecar pattern)
- [x] Day 3: **Native sidecar containers (new in v1.35, GA)** — init containers with `restartPolicy: Always`; distinguish them from traditional multi-container Pods
- [x] Day 4: ConfigMaps and Secrets — create and mount them in Pods (through environment variables or volumes)
- [x] Day 5: Storage — PersistentVolumes, PersistentVolumeClaims, StorageClasses, and access modes
- [x] Day 6: Advanced storage — `WaitForFirstConsumer` binding mode
- [x] Day 7: Review week 1 + repeat everything manually (without documentation)

## Week 2 — Cluster Architecture, Installation & Configuration (25%)

- [x] Day 8: RBAC — Roles, ClusterRoles, RoleBindings, and ClusterRoleBindings; test permissions with `kubectl auth can-i --as=`
- [ ] Day 9: kubeadm — install a cluster (init and join nodes) and configure a CNI plugin
- [x] Day 10: kubeadm upgrade — remember the exact order: control plane first, then workers; upgrade kubelet/kubectl on every node
- [x] Day 11: Static Pods — configure them through the kubelet manifest path
- [x] Day 12: etcd — backup and restore (`etcdctl snapshot save/restore`); remember the certificate paths
- [ ] Day 13: CRI-dockerd setup + CNI installation (Calico/Tigera)
- [x] Day 14: Review week 2 + repeat everything manually

## Week 3 — Workloads & Scheduling (15%) + Services & Networking (20%)

- [x] Day 15: Deployments — rolling updates, rollbacks, and scaling; basic StatefulSets
- [x] Day 16: Node drain/cordon, taints and tolerations, nodeSelector/affinity
- [ ] Day 17: Jobs/CronJobs, PriorityClass, and tuning resource requests/limits
- [x] Day 18: HPA (Horizontal Pod Autoscaler) with metrics-server; `kubectl debug` (node/Pod)
- [x] Day 19: Services — ClusterIP, NodePort, and LoadBalancer; CoreDNS and service discovery
- [x] Day 20: Classic Ingress and **Gateway API (new in v1.35, GA)** — create a `Gateway` and `HTTPRoute` pointing to a backend Service
- [ ] Day 21: NetworkPolicy — always remember to add a rule allowing DNS egress; review week 3 + repeat everything manually

## Week 4 — Troubleshooting (30%) + Final Review

- [x] Day 22: Troubleshoot cluster components — inspect control-plane and kubelet logs/status, and inspect events
- [x] Day 23: Troubleshoot Pods/containers in this order: `describe` → `logs` → `exec`; common issues (CrashLoopBackOff, ImagePullBackOff, Pending)
- [x] Day 24: Troubleshoot networking — broken DNS, incorrectly routed Services, and mistakenly blocking NetworkPolicies; continue in this order: `endpoints` → DNS → NetworkPolicy
- [x] Day 25: Troubleshoot etcd endpoints and TLS configuration; review RBAC + etcd backup/restore under time pressure
- [x] Day 26: Take **Mock Exam 01** (strict 120-minute limit; use the practice set in the reference repository)
- [x] Day 27: Run **Killer.sh, attempt 1** (recommended two weeks before the exam) — record slow or incorrect areas for review
- [ ] Day 28: Review the weak areas identified by Killer.sh; practise `kubectl` typing speed, aliases, and autocomplete; take **Mock Exam 02**
- [ ] Day 29: Run **Killer.sh, attempt 2** (recommended three days before the exam); aim to finish in two hours using a two-pass strategy
- [ ] Day 30: Light final review and rest; check the pre-exam tools checklist (kubectl context, aliases, vim/nano configuration, `exam-setup.sh`)

## Exam Day Checklist

### 1 Week Before

- [x] Schedule the exam — pick a time when you're sharpest, not Friday evening after a long week (I did Saturday 10am)
- [x] Verify your CNCF account name matches your government ID EXACTLY — character for character, including middle name if it's on your ID
- [ ] Do killer.sh session 2
- [ ] Review your weakest domain one more time — for me that was NetworkPolicy and etcd
- [ ] Test your webcam, microphone, and internet — the PSI system check catches issues early

### 1 Day Before

- [ ] Clear your desk completely — nothing on it except laptop, keyboard, mouse. I had to remove a sticky note from my monitor.
- [ ] Remove second monitors, disconnect external screens
- [ ] Switch to wired ethernet if possible — WiFi dropped during my killer.sh practice run and I lost 2 minutes reconnecting. I switched to ethernet for the real thing.
- [ ] Run through the first 60 seconds setup from memory one last time
- [ ] Read the exam day strategy but don't cram new content — it won't stick
- [ ] Sleep. Seriously. I went to bed early and it helped more than any last-minute studying.

### 30 Minutes Before

- [ ] Close every app except the PSI browser — it checks for background processes
- [ ] Go to the bathroom. You can't pause the exam.
- [ ] Have water ready in a clear bottle with no label (they make you peel it off if it has one)
- [ ] Start PSI check-in 15 minutes early — the room scan and ID verification took longer than I expected
- [ ] Show the proctor your desk, under your desk, and your walls

### During the Exam

- [ ] Type your aliases and vim config FIRST — before even reading question 1
- [ ] Switch context before every question — I lost two answers to wrong context during practice
- [ ] Read the full question before touching the terminal. I misread a question once and solved the wrong problem.
- [ ] Flag anything that looks like it'll take >8 minutes. Come back after you've scored the easy points.
- [ ] Verify everything: `k get`, `k describe`, check the namespace
- [ ] If kubectl hangs after etcd restore, WAIT. It comes back in 30-60 seconds. Don't start editing the manifest again.
