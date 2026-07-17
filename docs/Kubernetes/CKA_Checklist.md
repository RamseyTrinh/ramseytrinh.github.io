# CKA — Checklist học 30 ngày

Kế hoạch học mỗi ngày một chủ đề, bám theo trọng số domain của kỳ thi CKA (xem [CKA](CKA.md)) và cấu trúc bài lab từ [theplatformlab/CKA-Certified-Kubernetes-Administrator](https://github.com/theplatformlab/CKA-Certified-Kubernetes-Administrator). Tick vào ô khi hoàn thành.

!!! tip "Cách dùng"
    Domain **Troubleshooting** chiếm trọng số cao nhất (30%) nhưng phụ thuộc vào kiến thức của các domain khác, nên được ôn xuyên suốt tuần 4 thay vì học riêng ngay từ đầu. Mỗi cuối tuần đều có 1 ngày ôn tập — thực hành lại bằng tay, không xem tài liệu.

## Tuần 1 — Nền tảng + Storage (10%)

- [ ] Ngày 1: Setup cluster thực hành bằng kind (`init-cluster.sh`) — tạo cluster Kubernetes v1.35.1 local để lab
- [ ] Ngày 2: Pod cơ bản — tạo, xem, xóa Pod; multi-container Pod (sidecar pattern cũ)
- [ ] Ngày 3: **Native sidecar container (mới ở v1.35, GA)** — init container với `restartPolicy: Always`, phân biệt với multi-container Pod truyền thống
- [ ] Ngày 4: ConfigMap và Secret — tạo, mount vào Pod (qua env var / volume)
- [ ] Ngày 5: Storage — PersistentVolume, PersistentVolumeClaim, StorageClass, access modes
- [ ] Ngày 6: Storage nâng cao — `WaitForFirstConsumer` binding mode
- [ ] Ngày 7: Ôn tập tuần 1 + thực hành lại toàn bộ bằng tay (không xem tài liệu)

## Tuần 2 — Cluster Architecture, Installation & Configuration (25%)

- [ ] Ngày 8: RBAC — Role, ClusterRole, RoleBinding, ClusterRoleBinding; test quyền bằng `kubectl auth can-i --as=`
- [ ] Ngày 9: kubeadm — cài cluster (init, join node), cấu hình CNI plugin
- [ ] Ngày 10: kubeadm upgrade — nhớ đúng thứ tự: control plane trước, worker sau; upgrade kubelet/kubectl từng node
- [ ] Ngày 11: Static Pod — cấu hình qua manifest path của kubelet
- [ ] Ngày 12: etcd — backup và restore (`etcdctl snapshot save/restore`), nhớ đúng path certificate
- [ ] Ngày 13: CRI-dockerd setup + CNI installation (Calico/Tigera)
- [ ] Ngày 14: Ôn tập tuần 2 + thực hành lại toàn bộ bằng tay

## Tuần 3 — Workloads & Scheduling (15%) + Services & Networking (20%)

- [ ] Ngày 15: Deployment — rolling update, rollback, scale; StatefulSet cơ bản
- [ ] Ngày 16: Node drain/cordon, taints & tolerations, nodeSelector/affinity
- [ ] Ngày 17: Jobs/CronJobs, PriorityClass, resource requests/limits tuning
- [ ] Ngày 18: HPA (Horizontal Pod Autoscaler) với metrics-server, `kubectl debug` (node/pod)
- [ ] Ngày 19: Service — ClusterIP, NodePort, LoadBalancer; CoreDNS và service discovery
- [ ] Ngày 20: Ingress (classic) và **Gateway API (mới ở v1.35, GA)** — tạo `Gateway` + `HTTPRoute` trỏ tới backend Service
- [ ] Ngày 21: NetworkPolicy — luôn nhớ thêm rule cho phép DNS egress; ôn tập tuần 3 + thực hành lại bằng tay

## Tuần 4 — Troubleshooting (30%) + Tổng ôn tập

- [ ] Ngày 22: Troubleshoot cluster components — log/status control plane, kubelet, event inspection
- [ ] Ngày 23: Troubleshoot Pod/container theo trình tự: `describe` → `logs` → `exec`; các lỗi thường gặp (CrashLoopBackOff, ImagePullBackOff, Pending)
- [ ] Ngày 24: Troubleshoot network — DNS lỗi, Service không route đúng, NetworkPolicy chặn nhầm (tiếp tục theo trình tự `endpoints` → DNS → NetworkPolicy)
- [ ] Ngày 25: Troubleshoot etcd endpoint và TLS configuration; ôn lại RBAC + etcd backup/restore dưới áp lực thời gian
- [ ] Ngày 26: Làm **Mock Exam 01** (giới hạn đúng 120 phút, dùng bộ đề trong repo tham khảo)
- [ ] Ngày 27: Chạy **Killer.sh lượt 1** (khuyến nghị 2 tuần trước ngày thi) — ghi lại phần bị chậm/sai để ôn lại
- [ ] Ngày 28: Ôn đúng phần yếu từ Killer.sh; luyện tốc độ gõ `kubectl` + alias/autocomplete; làm **Mock Exam 02**
- [ ] Ngày 29: Chạy **Killer.sh lượt 2** (khuyến nghị 3 ngày trước ngày thi), đặt mục tiêu hoàn thành trong 2 giờ theo chiến thuật two-pass
- [ ] Ngày 30: Tổng ôn nhẹ, nghỉ ngơi; kiểm tra lại checklist công cụ trước khi thi (kubectl context, alias, vim/nano config, exam-setup.sh)
