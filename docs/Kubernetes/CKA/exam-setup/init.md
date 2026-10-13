# Setup môi trường Mock Exam

!!! warning "Không có script dựng sẵn bài thi"
    `run-mock-exam.sh` chỉ là **đồng hồ đếm ngược**: in đề → đếm 120 phút → mở file solutions. Nó **không** tạo namespace, pod hay node nào cả.

    Trong khi đó đề lại giả định nhiều thứ đã có sẵn (pod `app-frontend` trong ns `production`, node `worker-2`, deployment `db-app`, ...), nên phải tự chuẩn bị môi trường.

    Các script (`init-cluster.sh`, `exam-setup.sh`, `run-mock-exam.sh`) nằm ở repo gốc [theplatformlab/CKA-Certified-Kubernetes-Administrator](https://github.com/theplatformlab/CKA-Certified-Kubernetes-Administrator), không có trong repo docs này.

## 1. Clone repo gốc để lấy script

```bash
git clone https://github.com/theplatformlab/CKA-Certified-Kubernetes-Administrator.git
cd CKA-Certified-Kubernetes-Administrator
```

## 2. Tạo cluster nhiều node

`init-cluster.sh` chỉ tạo **1 node**, nên không làm được các câu drain node, DaemonSet hay PDB. Nên tự tạo cluster kind gồm 1 control plane và 2 worker:

```bash
cat > kind-mock.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

kind create cluster --name cka-mock --image kindest/node:v1.35.1 --config kind-mock.yaml
```

Tên node sẽ là `cka-mock-worker` và `cka-mock-worker2`. Đề ghi `worker-2` thì hiểu là `cka-mock-worker2`.

## 3. Cài các add-on mà đề cần

**metrics-server** (cho câu HPA). Trên kind phải thêm flag `--kubelet-insecure-tls`:

```bash
k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
k patch deploy metrics-server -n kube-system --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

**Ingress controller** (cho câu Ingress TLS): làm theo [hướng dẫn ingress-nginx cho kind](https://kind.sigs.k8s.io/docs/user/ingress/).

**Helm** (cho câu Helm):

```bash
brew install helm
```

**NetworkPolicy**: CNI mặc định của kind (kindnet) có hỗ trợ trên các bản mới, nhưng nhớ kiểm tra lại bằng một policy deny trước khi tin kết quả.

## 4. Nạp alias rồi bắt đầu thi

```bash
source scripts/exam-setup.sh        # dùng source, không dùng bash, để alias còn hiệu lực
bash scripts/run-mock-exam.sh 1     # Mock Exam 01, 120 phút
bash scripts/run-mock-exam.sh 2 90  # Mock Exam 02, 90 phút
```

## 5. Các câu cần chuẩn bị thêm hoặc làm khác đi

- **Tài nguyên "đã tồn tại"** (`app-frontend`, `db-app`, ...): trước khi bấm giờ, đọc lướt đề và tự tạo những thứ còn thiếu, cố ý làm hỏng nếu đề yêu cầu. Cách này sẽ làm lộ một phần đề, nên có thể nhờ người khác tạo giúp.
- **Các câu thao tác trên node** (container runtime, audit log, cluster troubleshooting, API server debugging, certificate rotation): node kind là container Docker, nên thay cho SSH dùng:

    ```bash
    docker exec -it cka-mock-control-plane bash
    ```

    Trong đó vẫn có `/etc/kubernetes/manifests/`, `kubeadm` và `crictl`.

- Những câu cần **kubeadm upgrade thật** hoặc nhiều VM sẽ không mô phỏng trọn vẹn trên kind được. Với các câu này, dùng **killer.sh** (đi kèm khi mua voucher CKA) là sát đề thật nhất.

## Dọn dẹp

```bash
kind delete cluster --name cka-mock
```
