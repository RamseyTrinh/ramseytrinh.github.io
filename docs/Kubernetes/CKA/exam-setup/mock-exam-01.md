# Setup Mock Exam 01

Chuẩn bị sẵn các tài nguyên mà [Mock Exam 01](../mock-exams/MOCK-EXAM-01.md) coi là "đã tồn tại", để bấm giờ là làm được ngay.

!!! info "Điều kiện trước"
    Đã làm xong [Setup môi trường Mock Exam](init.md): cluster kind `cka-mock` (1 control plane + 2 worker), metrics-server, ingress-nginx, Helm.

!!! warning "Đừng đọc kỹ script"
    Script bên dưới tạo đúng hiện trạng mà đề mô tả, nên đọc kỹ sẽ lộ một phần đáp án (nhất là câu 11). Chỉ cần copy, chạy, rồi đóng trang này.

## Mỗi câu cần gì

| Câu | Cần chuẩn bị | Script có làm không |
| --- | --- | --- |
| 1. Pod troubleshooting | ns `production`, pod `app-frontend` đang CrashLoopBackOff, file manifest có sẵn | ✅ |
| 2. RBAC | ns `staging` có sẵn Pod + Deployment để test `can-i` | ✅ |
| 3. Node maintenance | Pod database (dữ liệu local) + Deployment 3 replica chạy trên `cka-mock-worker2` | ✅ |
| 4. Persistent Volume | ns `databases`, deployment `db-app` | ✅ |
| 5. NetworkPolicy | ns `shop` có pod `tier=frontend/backend/database` | ✅ |
| 6. Helm | Chart local `helm-charts/monitoring` với values `replica_count`, `storage_size`, `persistence` | ✅ |
| 7. CRI-dockerd | Không làm được trên kind (node không có dockerd/cri-dockerd) | ❌ chỉ đọc lý thuyết |
| 8. Audit logs | Không cần, chỉ cần vào được control plane | — |
| 9. HPA | Deployment `web-app` 2 replica trong `production` (có CPU request), metrics-server | ✅ |
| 10. Ingress TLS | Service `api` + Secret TLS `api-tls-cert` trong `default`, ingress controller | ✅ |
| 11. Cluster troubleshooting | `kube-scheduler` bị hỏng (script chọn ngẫu nhiên 1 kiểu lỗi) | ✅ |
| 12. StatefulSet | Không cần, kind có sẵn StorageClass mặc định `standard` | — |
| 13. ResourceQuota | ns `test` có sẵn workload | ✅ |
| 14. Pod Security | ns `restricted` | ✅ |
| 15. Sidecar | Không cần | — |

## Map tên trong đề sang kind

| Trong đề | Trên kind |
| --- | --- |
| `worker-2` | `cka-mock-worker2` |
| `controlplane` / `kube-scheduler-controlplane` | `cka-mock-control-plane` / `kube-scheduler-cka-mock-control-plane` |
| `ssh controlplane` | `docker exec -it cka-mock-control-plane bash` |
| `ssh worker-2` | `docker exec -it cka-mock-worker2 bash` |

## Script setup

Lưu thành `setup-mock-01.sh` rồi chạy `bash setup-mock-01.sh`. Script tạo thư mục làm bài `~/cka-mock-01` (chứa manifest câu 1 và Helm chart câu 6).

```bash
#!/bin/bash
# Setup cho CKA Mock Exam 01 trên kind cluster "cka-mock"
set -euo pipefail

CP=cka-mock-control-plane
W1=cka-mock-worker
W2=cka-mock-worker2
WORKDIR=~/cka-mock-01

kubectl config use-context kind-cka-mock
mkdir -p "$WORKDIR"

# ---------- Q3: workload trên worker2 (cordon worker1 tạm thời để pod dồn sang worker2) ----------
kubectl cordon "$W1"
kubectl create ns maintenance --dry-run=client -o yaml | kubectl apply -f -
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: critical-db
  namespace: maintenance
  labels: {app: critical-db}
spec:
  nodeName: $W2
  containers:
  - name: db
    image: busybox:1.36
    command: ["sh", "-c", "echo data > /data/db.txt && sleep 36000"]
    volumeMounts:
    - {name: data, mountPath: /data}
  volumes:
  - name: data
    emptyDir: {}
EOF
kubectl create deployment web-frontend -n maintenance --image=nginx:1.27 --replicas=3 \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout status deploy/web-frontend -n maintenance --timeout=180s
kubectl uncordon "$W1"

# ---------- Q1: pod app-frontend crash vì thiếu /etc/app/config.yaml ----------
kubectl create ns production --dry-run=client -o yaml | kubectl apply -f -
cat > "$WORKDIR/app-frontend.yaml" <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: app-frontend
  namespace: production
  labels: {app: app-frontend}
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "cat /etc/app/config.yaml && sleep 36000"]
EOF
kubectl apply -f "$WORKDIR/app-frontend.yaml"

# ---------- Q9: web-app 2 replica, có CPU request ----------
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels: {app: web-app}
  template:
    metadata:
      labels: {app: web-app}
    spec:
      containers:
      - name: web
        image: nginx:1.27
        resources:
          requests: {cpu: 100m, memory: 64Mi}
          limits: {cpu: 200m, memory: 128Mi}
EOF

# ---------- Q2: staging có sẵn pod + deployment ----------
kubectl create ns staging --dry-run=client -o yaml | kubectl apply -f -
kubectl create deployment staging-api -n staging --image=nginx:1.27 --replicas=2 \
  --dry-run=client -o yaml | kubectl apply -f -

# ---------- Q4: databases/db-app ----------
kubectl create ns databases --dry-run=client -o yaml | kubectl apply -f -
kubectl create deployment db-app -n databases --image=nginx:1.27 \
  --dry-run=client -o yaml | kubectl apply -f -

# ---------- Q5: shop với 3 tier ----------
kubectl create ns shop --dry-run=client -o yaml | kubectl apply -f -
for tier in frontend backend database; do
  kubectl run "$tier" -n shop --image=nginx:1.27 --labels="tier=$tier" \
    --dry-run=client -o yaml | kubectl apply -f -
done

# ---------- Q6: Helm chart local ----------
CHART="$WORKDIR/helm-charts/monitoring"
mkdir -p "$CHART/templates"
cat > "$CHART/Chart.yaml" <<'EOF'
apiVersion: v2
name: monitoring
description: Monitoring stack for CKA mock exam
type: application
version: 0.1.0
appVersion: "1.0.0"
EOF
cat > "$CHART/values.yaml" <<'EOF'
replica_count: 1
storage_size: 10Gi
persistence: false
image: nginx:1.27
EOF
cat > "$CHART/templates/deployment.yaml" <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replica_count }}
  selector:
    matchLabels: {app: {{ .Release.Name }}}
  template:
    metadata:
      labels: {app: {{ .Release.Name }}}
    spec:
      containers:
      - name: monitoring
        image: {{ .Values.image }}
        {{- if .Values.persistence }}
        volumeMounts:
        - {name: data, mountPath: /data}
        {{- end }}
      {{- if .Values.persistence }}
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: {{ .Release.Name }}-data
      {{- end }}
EOF
cat > "$CHART/templates/pvc.yaml" <<'EOF'
{{- if .Values.persistence }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ .Release.Name }}-data
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: {{ .Values.storage_size }}
{{- end }}
EOF

# ---------- Q10: service api + TLS secret ----------
kubectl create deployment api --image=nginx:1.27 --dry-run=client -o yaml | kubectl apply -f -
kubectl expose deployment api --port=80 --dry-run=client -o yaml | kubectl apply -f -
TMP=$(mktemp -d)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$TMP/tls.key" -out "$TMP/tls.crt" -subj "/CN=api.example.com" 2>/dev/null
kubectl create secret tls api-tls-cert --cert="$TMP/tls.crt" --key="$TMP/tls.key" \
  --dry-run=client -o yaml | kubectl apply -f -
rm -rf "$TMP"

# ---------- Q13, Q14: namespace ----------
kubectl create ns test --dry-run=client -o yaml | kubectl apply -f -
kubectl create deployment heavy-app -n test --image=nginx:1.27 --replicas=2 \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl create ns restricted --dry-run=client -o yaml | kubectl apply -f -

# ---------- Q8: ConfigMap để có access log sau khi bật audit ----------
kubectl create configmap app-settings -n default --from-literal=mode=prod \
  --dry-run=client -o yaml | kubectl apply -f -

# Chờ mọi thứ chạy trước khi làm hỏng scheduler
for ns in production staging databases shop test; do
  kubectl wait --for=condition=Available deploy --all -n "$ns" --timeout=180s 2>/dev/null || true
done
kubectl wait --for=condition=Available deploy/api -n default --timeout=180s

# ---------- Q11: làm hỏng kube-scheduler (ngẫu nhiên 1 kiểu) ----------
docker exec "$CP" cp /etc/kubernetes/manifests/kube-scheduler.yaml /root/kube-scheduler.yaml.orig
case $((RANDOM % 3)) in
  0) docker exec "$CP" sed -i 's/- kube-scheduler$/- kube-schedulerr/' /etc/kubernetes/manifests/kube-scheduler.yaml ;;
  1) docker exec "$CP" sed -i 's#scheduler.conf#scheduler.cnf#g' /etc/kubernetes/manifests/kube-scheduler.yaml ;;
  2) docker exec "$CP" mv /etc/kubernetes/manifests/kube-scheduler.yaml /etc/kubernetes/kube-scheduler.yaml ;;
esac

echo ""
echo "✅ Mock Exam 01 setup xong. Thư mục làm bài: $WORKDIR"
echo "⚠️  kube-scheduler đang hỏng: pod MỚI sẽ Pending cho tới khi bạn sửa câu 11."
```

!!! warning "Câu 11 ảnh hưởng các câu khác"
    Khi scheduler hỏng, mọi pod **mới** tạo ra (câu 1, 4, 6, 9, 12, 15, ...) sẽ nằm ở `Pending`. Đề thi thật cũng có thể gài kiểu này. Gặp pod Pending không rõ lý do thì kiểm tra `kube-system` trước, hoặc làm câu 11 sớm.

## Lưu ý khi làm trên kind

- **Câu 3**: database pod là pod "trần" dùng `emptyDir` trong ns `maintenance`. Drain sẽ cần thêm flag, đọc kỹ thông báo lỗi.
- **Câu 4**: StorageClass `standard` của kind (local-path) **không hỗ trợ `ReadWriteMany`**, nên PVC RWX sẽ `Pending`. Cứ viết đúng YAML; trên cluster thật có storage hỗ trợ RWX thì sẽ Bound.
- **Câu 7**: bỏ qua phần thực hành, chỉ ôn lý thuyết (`containerRuntimeEndpoint` trong kubelet config, `systemctl restart kubelet`).
- **Câu 8 và 11**: vào control plane bằng `docker exec -it cka-mock-control-plane bash`. Trong node kind có sẵn `crictl` và `journalctl -u kubelet`.

## Reset sau khi làm xong

```bash
# Khôi phục scheduler nếu chưa sửa được
docker exec cka-mock-control-plane sh -c \
  'rm -f /etc/kubernetes/kube-scheduler.yaml; cp /root/kube-scheduler.yaml.orig /etc/kubernetes/manifests/kube-scheduler.yaml'

# Xoá tài nguyên của đề
kubectl delete ns production staging databases shop test restricted maintenance monitoring --ignore-not-found
kubectl delete deploy,svc api -n default --ignore-not-found
kubectl delete secret api-tls-cert -n default --ignore-not-found
kubectl delete configmap app-settings -n default --ignore-not-found
rm -rf ~/cka-mock-01

# Hoặc xoá hẳn cluster rồi tạo lại theo init.md
kind delete cluster --name cka-mock
```

Nếu đã bật audit log ở câu 8 mà muốn tắt, cách nhanh nhất là xoá cluster rồi tạo lại.
