# CKA — Certified Kubernetes Administrator

Tổng quan kỳ thi và checklist học 30 ngày để chuẩn bị thi chứng chỉ CKA, cập nhật theo Kubernetes v1.35.

## Thông tin kỳ thi

- **Thời lượng:** 2 giờ, thi online, có giám sát (proctored), dạng performance-based (17-25 task làm trực tiếp trên terminal, không có trắc nghiệm)
- **Điểm đậu:** 66%
- **Phiên bản Kubernetes:** v1.35
- **Hiệu lực chứng chỉ:** 2 năm
- **Chi phí:** $445 (bao gồm 1 lượt thi lại)
- **Môi trường thi:** PSI Secure Browser, terminal Ubuntu Linux; được phép mở kubernetes.io/docs, kubernetes.io/blog, github.com/kubernetes trong lúc thi
- **Copy/paste:** Ctrl+Shift+C/V trong terminal, Ctrl+C/V trong notepad
- **Simulator:** 2 lượt dùng Killer.sh (mỗi lượt 36 giờ truy cập)

## Domain & trọng số

| Domain | Trọng số |
|---|---|
| Troubleshooting | 30% |
| Cluster Architecture, Installation & Configuration | 25% |
| Services & Networking | 20% |
| Workloads & Scheduling | 15% |
| Storage | 10% |

## Điểm mới trong v1.35 cần lưu ý khi ôn

- **Native sidecar container (GA)** — init container với `restartPolicy: Always` chạy như sidecar, thay thế pattern sidecar cũ. Nhiều khả năng có câu hỏi về phần này.
- **Gateway API (GA)** — dần thay thế Ingress, nên biết tạo `Gateway` + `HTTPRoute` trỏ tới backend Service. Ingress vẫn hoạt động nhưng Gateway API được khuyến nghị.
- **`kubectl debug` (GA)** — `kubectl debug node/<name>` và `kubectl debug pod/<name>`, hữu ích cho các task troubleshooting.
- **ValidatingAdmissionPolicy (GA)** — admission dựa trên CEL, không cần webhook. Ít khả năng ra thi nhưng đã có trong curriculum, nên dành khoảng 15 phút đọc qua.
- **In-place Pod vertical scaling (Beta)** — resize CPU/memory mà không cần restart Pod. Có thể không ra thi nhưng nên biết khái niệm.
- **CSI migration hoàn tất** — toàn bộ storage provisioner giờ dùng CSI; các in-tree volume plugin cũ đã bị loại bỏ.

## 5 kỹ năng bắt buộc phải làm được trước khi thi

1. Backup và restore etcd một cách chính xác, không cần xem tài liệu
2. Thực hiện `kubeadm upgrade` đúng thứ tự — control plane trước, worker node sau
3. Nắm rõ cú pháp RBAC role binding, bao gồm cách test bằng `kubectl auth can-i --as=system:serviceaccount:<ns>:<name>`
4. Viết NetworkPolicy có kèm rule cho phép DNS egress (lỗi rất hay gặp nếu quên)
5. Troubleshoot kết nối Pod theo trình tự: `describe` → `logs` → `endpoints` → DNS → NetworkPolicy

## Chiến thuật làm bài thi (two-pass)

- **Pass 1 (~80 phút):** làm tuần tự tất cả câu hỏi, câu nào mất hơn 8 phút thì đánh dấu (flag) và bỏ qua để lấy điểm các câu dễ trước.
- **Pass 2 (~40 phút):** quay lại các câu đã flag khi đã biết rõ thời gian còn lại — giảm áp lực và tăng độ chính xác cho các câu khó như etcd restore hay debug NetworkPolicy.

## Nguồn tham khảo

- [Trang chứng chỉ CKA — Linux Foundation Training](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/)
- [CKA Curriculum (PDF) — CNCF](https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.35.pdf)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [theplatformlab/CKA-Certified-Kubernetes-Administrator](https://github.com/theplatformlab/CKA-Certified-Kubernetes-Administrator) — bộ 31 bài lab thực hành, 2 mock exam, cheat sheet, và diagnostic playbook cho troubleshooting, viết bởi người thi đậu 89% (tháng 3/2026, K8s v1.35)

## Checklist học hằng ngày

Xem [CKA_Checklist](CKA_Checklist.md) — kế hoạch 30 ngày, mỗi ngày một chủ đề, để tick dần tiến độ.
