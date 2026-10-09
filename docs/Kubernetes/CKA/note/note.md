## Syllabus
### Domain 1: 
1. PV is cluster-scoped (no namespace). PVC is namespace-scoped
2. A PV is the actual storage (think: the hard drive). A PVC is a request for that storage (think: "I need 2Gi of disk"). A StorageClass tells Kubernetes how to dynamically create PVs when a PVC asks for one.
3. PVC binds to a PV when: capacity >= request, accessModes match, AND storageClassName matches. If any one of these is off, the PVC sits in Pending forever with no helpful error message.

**Access Modes** — know these four-letter abbreviations:

| Mode | Short | What it actually means |
| --- | --- | --- |
| ReadWriteOnce | RWO | One node can mount read-write. This is what you'll use 90% of the time. |
| ReadOnlyMany | ROX | Many nodes can mount read-only. Rarely comes up on the exam. |
| ReadWriteMany | RWX | Many nodes can mount read-write. Doesn't work with hostPath. |
| ReadWriteOncePod | RWOP | Only one pod can mount read-write. New in v1.29+, might show up. |

**Reclaim Policies** — know the difference or you'll lose data:

| Policy | What actually happens |
| --- | --- |
| Retain | The PV survives PVC deletion. Data is safe, but you must manually clean up the PV before it can be reused. |
| Delete | The PV and underlying storage are deleted. This is the default for most cloud StorageClasses. Be careful. |
| Recycle | Deprecated. Don't use it or memorize it. |

**Volume Modes:**

- **Filesystem** (default) — mounted as a directory.
- **Block** — a raw block device with no filesystem.

On the exam: know the difference between **Retain** and **Delete**. If the question says data should persist after PVC deletion, use **Retain**.

### Domain 2: Troubleshoots
1. Check container crashed: k logs <pod-name> --previous                 # crashed container — you'll use this a lot
2. Check certificated cluster expired: sudo kubeadm certs check-expiration

3. Check ETCD healthy: ETCDCTL_API=3 etcdctl endpoint health \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

4. ls /etc/kubernetes/manifests/  # Should have: etcd.yaml, kube-apiserver.yaml, kube-controller-manager.yaml, kube-scheduler.yaml

5. Troubleshoot Networking — Service not reachable? Work through this:

```bash
# 1. Does the service exist and have the right selector?
k get svc <service>
k describe svc <service>

# 2. Does the service have endpoints?
k get endpoints <service>
# If empty: selector doesn't match any running pod

# 3. Is the pod actually running on the target port?
k exec <pod> -- wget -qO- localhost:<port>

# 4. DNS working?
k run test-dns --image=busybox:1.36 --rm -it -- nslookup <service-name>

# 5. Is kube-proxy running?
k get pods -n kube-system -l k8s-app=kube-proxy

# 6. NetworkPolicy blocking traffic?
k get networkpolicy -n <namespace>
```

The most common networking issues on the exam:

- Service selector doesn't match pod labels (typo in labels)
- Service targetPort doesn't match container port
- NetworkPolicy denying traffic (remember: any policy = deny by default for that pod)
- CoreDNS down or misconfigured
- kube-proxy not running on a node

### Domain 3: Workloads, Scheduling
1. Deployments manage ReplicaSets, which manage Pods
1. Pod/Container just has containerPort. Service has port and targetPort
2. ConfigMaps hold non-sensitive config. Secrets hold sensitive data (base64-encoded, not encrypted by default)
3. Three ways to inject ConfigMap/Secret into a pod:

- Env vars (all keys at once):

```yaml
envFrom:
- configMapRef:
    name: app-config
- secretRef:
    name: db-creds
```

- Single key as one env var:

```yaml
env:
- name: DATABASE_USER
  valueFrom:
    secretKeyRef:
      name: db-creds
      key: DB_USER
```

- Mounted as files (each key becomes a file in the mount path):

```yaml
volumeMounts:
- name: config-vol
  mountPath: /etc/config
volumes:
- name: config-vol
  configMap:
    name: app-config
```
4. If you set resource limits without requests, requests default to limits.
5. Schedule pods on specific nodes — three mechanisms:

- `nodeSelector` — simplest, exact label match:

```yaml
spec:
  nodeSelector:
    disk: ssd
```

- Node affinity — more flexible, supports expressions (`In`, `NotIn`, etc.):

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disk
            operator: In
            values:
            - ssd
```

- Taints (on nodes) + tolerations (on pods) — repels pods instead of attracting them:

```bash
k taint nodes node1 gpu=true:NoSchedule    # taint
k taint nodes node1 gpu=true:NoSchedule-   # remove
```

```yaml
spec:
  tolerations:
  - key: "gpu"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"
```

Effects: `NoSchedule` (block new pods) · `PreferNoSchedule` (soft avoid) · `NoExecute` (also evicts existing pods).
6. Static pods: managed directly by the kubelet on a node (not by the API server/scheduler). The kubelet watches a directory and auto-creates/restarts a pod for every manifest file dropped there.

- Default manifest directory is usually `/etc/kubernetes/manifests/`, but it's **not guaranteed** — it's whatever the kubelet is configured with.

!!! warning "Verify the actual staticPodPath"
    Forgot to check the actual path on the node. Placed the manifest in the "usual" spot, but the kubelet was configured to look elsewhere. Always verify:

    ```bash
    cat /var/lib/kubelet/config.yaml | grep staticPodPath
    ```

    Paths are configurable and exam clusters might differ from defaults. A typo in the path means the pod never appears — and the kubelet won't error loudly about it, so it's easy to miss.

### Domain 4 — Cluster Architecture, Installation & Configuration
1. RBAC has four objects:

| Object | Scope | Binds to |
|---|---|---|
| Role | Namespace | RoleBinding |
| ClusterRole | Cluster-wide | ClusterRoleBinding or RoleBinding |
| RoleBinding | Namespace | Role or ClusterRole |
| ClusterRoleBinding | Cluster-wide | ClusterRole |
2. Test permissions RBAC: k auth can-i list pods -n dev --as=system:serviceaccount:dev:my-sa
3. Use kubeadm to install a basic cluster:

```bash
# On control plane node:
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Set up kubeconfig
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install CNI (e.g., Calico)
k apply -f https://docs.projectcalico.org/manifests/calico.yaml

# On worker nodes:
sudo kubeadm join <control-plane-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

Lost the join command? Regenerate it: `kubeadm token create --print-join-command`
4. Node prerequisites — check in this order when a node won't join, `kubeadm init/join` fails, or kubelet won't start:

| Vấn đề | Kiểm tra | Cách sửa |
|---|---|---|
| Container runtime không chạy | `systemctl status containerd` | `systemctl start containerd` |
| Swap bật | `swapon --show` | `swapoff -a` |
| Thiếu module overlay | `lsmod \| grep overlay` | `modprobe overlay` |
| Thiếu module br_netfilter | `lsmod \| grep br_netfilter` | `modprobe br_netfilter` |
| Sai sysctl | `sysctl net.bridge.bridge-nf-call-iptables` | `sysctl -w net.bridge.bridge-nf-call-iptables=1` |

These are the most common OS-level misconfigurations the exam (or real environments) use to break node bootstrapping.

```mermaid
graph TD
    RAM[RAM] --> Swap[Swap]
    Swap --> SwapReq["Kubernetes yêu cầu OFF"]

    FS[Filesystem] --> Overlay[overlay]
    Overlay --> OverlayUse["Containerd dùng để mount filesystem"]

    Net[Networking] --> Bridge[Linux Bridge]
    Net --> BrNetfilter[br_netfilter]
    BrNetfilter --> IptablesUse["Cho phép iptables xử lý traffic của Pod/Service"]
```
5. Upgrade on a Kubernetes Cluster Using Kubeadm 4.5
6. ETCD Backup Key difference: control plane uses kubeadm upgrade apply, worker uses kubeadm upgrade node
7. Where to find the cert paths: cat /etc/kubernetes/manifests/etcd.yaml and look for --cert-file, --key-file, --trusted-ca-file.

### Domain 5 - Services & Networking
1. Networking in Kubernetes "just works" if your CNI is installed correctly. Don't overthink the model — pods get IPs, pods can talk to each other, nodes can talk to pods. The CNI plugin (Calico, Flannel, Cilium) makes it happen
2. Same-node pods talk through a bridge, cross-node pods go through the CNI overlay
```bash
# Test pod-to-pod connectivity
k exec pod-a -- wget -qO- --timeout=2 http://<pod-b-ip>
```
3. The most important thing: port is what clients use to reach the service. targetPort is the port the container listens on. nodePort is the port on the node (NodePort/LoadBalancer only)
4. CoreDNS is the cluster DNS server (replaced kube-dns a long time ago). It runs as a Deployment in kube-system
5. Critical gotcha on the exam: if you add an Egress policy, you must also allow DNS (UDP 53). Otherwise the pod can't resolve any service names and everything looks broken even though the policy is "correct."

## Time Allocation

| Question Type | Typical Time | Notes |
| --- | --- | --- |
| Create a pod/deployment | 2-3 min | Use `$do` to generate YAML |
| Create RBAC resources | 3-5 min | Know the imperative commands |
| NetworkPolicy | 5-8 min | Always allow DNS egress |
| etcd backup/restore | 8-10 min | Know the cert paths |
| kubeadm upgrade | 8-10 min | Follow the sequence exactly |
| Troubleshoot broken node | 5-8 min | Check kubelet first |
| Troubleshoot networking | 5-8 min | Check endpoints, selectors |
| PV/PVC/StorageClass | 4-6 min | Match accessModes and storageClassName |
| DaemonSet | 3-4 min | Copy from docs fast |
| Ingress/Gateway | 4-6 min | Know ingressClassName |
| Static pod | 3-4 min | Write manifest directly to `/etc/kubernetes/manifests/` |
| Node drain/cordon | 2-3 min | `--ignore-daemonsets --delete-emptydir-data` |

## Notes

### Exam tips

- Cần mẫu YAML (ví dụ sidecar): copy từ docs rồi sửa — tìm "sidecar containers" trên kubernetes.io.

### ConfigMap / Secret

- Dùng `envFrom` để load tất cả key từ ConfigMap hoặc Secret thành biến môi trường.
- Dùng `volumes` + `volumeMounts` để mount ConfigMap thành file.

#### envFrom vs env.valueFrom

- `envFrom`: load TẤT CẢ key của ConfigMap/Secret thành biến môi trường (tên biến = tên key).
- `env.valueFrom.configMapKeyRef` (hoặc `secretKeyRef`): load MỘT key duy nhất, và có thể đổi tên biến.
- Trong đề thi:
  - Nếu đề nói "load all keys" → dùng `envFrom`.
  - Nếu đề nói "load KEY_X as MY_VAR" → dùng `valueFrom`.
- Dùng ngược nhau sẽ KHÔNG báo lỗi, chỉ ra sai tên biến → dễ mất điểm mà không biết.

### Kubeadm Upgrade

Bài này chủ yếu cần nhớ sequence nâng Kubernetes cluster bằng kubeadm. Với CKA, quan trọng nhất là phân biệt control plane và worker.

#### 1. Ý tưởng tổng quát

Ví dụ cluster đang `v1.34.x`, muốn nâng lên `v1.35.x`. Luôn theo nguyên tắc:

```
CONTROL PLANE
     ↓
WORKER 1
     ↓
WORKER 2
     ↓
...
```

Không nâng worker trước control plane.

#### 2. Control Plane upgrade

Sequence cần thuộc:

```
kubeadm package
    ↓
kubeadm upgrade plan
    ↓
kubeadm upgrade apply v1.35.x
    ↓
kubelet + kubectl package
    ↓
systemctl daemon-reload
    ↓
systemctl restart kubelet
```

**Bước 1 — kiểm tra version**

```bash
k get nodes
kubeadm version
```

Ví dụ:

```
NAME           STATUS   ROLES           VERSION
controlplane   Ready    control-plane   v1.34.2
node01         Ready    <none>          v1.34.2
```

**Bước 2 — upgrade kubeadm** (trên control plane)

```bash
apt update
apt install kubeadm='1.35.x-*'
kubeadm version
```

Lúc này kubeadm đã là version mới nhưng cluster chưa upgrade.

**Bước 3 — xem upgrade có khả dụng không**

```bash
kubeadm upgrade plan
```

Nó cho bạn biết cluster hiện tại là gì và có thể upgrade lên version nào. Ví dụ:

```
Components that must be upgraded manually:
COMPONENT   CURRENT   TARGET
kubelet     1.34.x    1.35.x
```

**Bước 4 — upgrade control plane**

Đây là command cực kỳ quan trọng:

```bash
kubeadm upgrade apply v1.35.x
```

Control plane → `apply`. Sau bước này, các Kubernetes control-plane components được nâng cấp.

**Bước 5 — upgrade kubelet + kubectl**

```bash
apt install kubelet='1.35.x-*' kubectl='1.35.x-*'

systemctl daemon-reload
systemctl restart kubelet
```

!!! warning "CKA trap"
    Đừng chỉ `systemctl restart kubelet`. Mà phải:

    ```bash
    systemctl daemon-reload
    systemctl restart kubelet
    ```

    Vì package mới có thể thay đổi systemd unit file. Có thể nhớ: **Package changed → daemon-reload → restart**.

#### 3. Worker upgrade

Worker có sequence khác control plane một chút. Phải thuộc:

```
drain
  ↓
upgrade kubeadm
  ↓
upgrade kubelet + kubectl
  ↓
kubeadm upgrade node
  ↓
daemon-reload
  ↓
restart kubelet
  ↓
uncordon
```

**Bước 1 — Drain worker** (từ control plane)

```bash
kubectl drain node01 --ignore-daemonsets
```

Mục đích là di chuyển workload ra khỏi worker trước khi ta restart/upgrade nó. Đây là lý do drain phải xảy ra trước upgrade.

**Bước 2 — SSH vào worker**

```bash
ssh node01

apt update
apt install kubeadm='1.35.x-*'
apt install kubelet='1.35.x-*' kubectl='1.35.x-*'
```

**Bước 3 — kubeadm upgrade node**

Đây là điểm rất dễ nhầm:

| | Control plane | Worker |
| --- | --- | --- |
| Command | `kubeadm upgrade apply v1.35.x` | `kubeadm upgrade node` |

Worker **KHÔNG** dùng `apply`.

**Bước 4 — restart kubelet**

```bash
systemctl daemon-reload
systemctl restart kubelet
```

**Bước 5 — quay lại control plane và uncordon**

```bash
kubectl uncordon node01
```

Node quay lại trạng thái có thể nhận workload.

#### 4. Full workflow cần thuộc lòng

Giả sử cluster có `controlplane`, `node01`, `node02`, upgrade từ `1.34 → 1.35`.

Control plane:

```bash
apt update
apt install kubeadm='1.35.x-*'

kubeadm upgrade plan
kubeadm upgrade apply v1.35.x

apt install kubelet='1.35.x-*' kubectl='1.35.x-*'

systemctl daemon-reload
systemctl restart kubelet
```

Worker 1 (từ control plane rồi SSH vào worker):

```bash
# Control plane
kubectl drain node01 --ignore-daemonsets

# SSH vào worker
apt update
apt install kubeadm='1.35.x-*'
apt install kubelet='1.35.x-*' kubectl='1.35.x-*'

kubeadm upgrade node

systemctl daemon-reload
systemctl restart kubelet
```

Quay lại control plane:

```bash
kubectl uncordon node01
```

Sau đó làm tương tự với `node02`.

#### 5. Vì sao phải làm theo thứ tự này?

Có thể hiểu cluster upgrade thành 3 tầng:

```
        Kubernetes Control Plane
                 ↑
              kubeadm
                 ↑
          kubelet / kubectl
                 ↑
              Worker
```

Control plane trước, vì worker version mới cần tương thích với control plane mới. Do đó:

```
Control Plane 1.35
       ↓
Worker 1.35
```

chứ không phải:

```
Worker 1.35
       ↓
Control Plane 1.34
```

#### 6. Drain vs Cordon vs Uncordon

Đây cũng là kiến thức CKA rất đáng nhớ.

| Command | Hiệu ứng |
| --- | --- |
| `kubectl cordon node01` | Không cho pod mới được schedule vào node. Pod đang chạy vẫn tiếp tục chạy. |
| `kubectl drain node01 --ignore-daemonsets` | Cordon node + evict các workload phù hợp khỏi node. Dùng khi chuẩn bị bảo trì/reboot/upgrade node. |
| `kubectl uncordon node01` | Cho node nhận workload trở lại. |

#### 7. Những lỗi bài này cố tình muốn bạn nhớ

- ❌ **Sai 1**: `kubeadm upgrade apply` trên worker. → Đúng: `kubeadm upgrade node`
- ❌ **Sai 2**: Upgrade worker trước rồi mới drain (upgrade → drain). → Đúng: drain → upgrade
- ❌ **Sai 3**: `systemctl restart kubelet` ngay sau khi upgrade package. → Đúng: `systemctl daemon-reload` → `systemctl restart kubelet`
- ❌ **Sai 4**: Upgrade tất cả worker cùng lúc. → Đúng: control plane → worker 1 → worker 2 → worker 3, one worker at a time.

#### 8. Verify

```bash
kubectl get nodes
```

Ví dụ:

```
NAME           STATUS   ROLES           VERSION
controlplane   Ready    control-plane   v1.35.x
node01         Ready    <none>          v1.35.x
node02         Ready    <none>          v1.35.x
```

Kiểm tra component:

```bash
kubeadm version
kubelet --version
kubectl version --client
```

#### 🧠 CKA cheat sheet

Nếu vào CKA gặp "Upgrade Kubernetes cluster from X to Y", nghĩ ngay:

```
CONTROL PLANE
────────────────────────────
1. apt update
2. upgrade kubeadm
3. kubeadm upgrade plan
4. kubeadm upgrade apply v1.35.x
5. upgrade kubelet + kubectl
6. daemon-reload
7. restart kubelet


WORKER
────────────────────────────
1. kubectl drain NODE
2. upgrade kubeadm
3. upgrade kubelet + kubectl
4. kubeadm upgrade node
5. daemon-reload
6. restart kubelet
7. kubectl uncordon NODE


VERIFY
────────────────────────────
kubectl get nodes
```

**Câu thần chú để nhớ:**

- Control plane: plan → apply
- Worker: drain → node → uncordon
- Package đổi → daemon-reload → restart
- Control plane trước → worker từng node một.

### Cheatsheet

| Problem | Kiểm tra đầu tiên |
| --- | --- |
| Node NotReady | `systemctl status kubelet` |
| Kubelet lỗi | `journalctl -u kubelet` |
| DNS không resolve | `cat /etc/resolv.conf` |
| Test DNS | `nslookup kubernetes` |
| CoreDNS | `k get pods -n kube-system` |
| kube-proxy | `k get ds -n kube-system \| grep proxy` |
| Service networking | `iptables-save \| grep <service>` |
| Audit | `kube-apiserver.yaml` |
| Tìm delete event | `grep 'verb.*delete' audit.log` |
