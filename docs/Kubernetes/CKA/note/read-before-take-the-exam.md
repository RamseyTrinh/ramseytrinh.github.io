# Read Before Taking the Exam

## The Exam Environment (PSI Remote Desktop)

The exam runs in a PSI Secure Browser — a remote Ubuntu desktop. Things that surprised me:

### Copy/Paste

- `Ctrl+Shift+C` / `Ctrl+Shift+V` in the terminal
- Right-click paste works sometimes, sometimes it doesn't
- The built-in notepad uses normal `Ctrl+C` / `Ctrl+V`
- Practice these shortcuts. I wasted 2 minutes fumbling with paste in the first question.

### Terminal quirks

- There's a small delay on every keystroke — maybe 50-100ms. It adds up.
- Tab completion works but feels laggy.
- You can open multiple terminal tabs. I used two: one for the task, one for verification.
- The file browser is basic. Stick to command line.

### Browser

- One extra tab allowed for kubernetes.io documentation
- Bookmarks are not available — you'll type URLs manually
- The search on kubernetes.io is your best friend. Use it instead of navigating.

### General

- Webcam and mic are on the entire time
- Clear your desk — nothing on it except your computer
- No second monitor
- No headphones/earphones
- Water bottle is fine (clear, no label)
- Bathroom breaks are allowed but the timer doesn't pause

## Killer.sh — hướng dẫn làm bài

**Môi trường**

- Giao diện là **Remote Desktop (XFCE)**, không còn Remote Terminal. Copy/paste khác macOS/Windows.
- Có thể dùng **VSCodium** để sửa file và mở terminal; **không** được cài extension.
- Ghi chú trong lúc thi: **Application → Accessories → Mousepad**.
- Có quyền `sudo` (ví dụ `sudo -i`) nếu gặp lỗi permission.

**Khác biệt giữa simulator và đề thật**

| Simulator | Đề thật |
| --- | --- |
| Dùng Chrome/Firefox | Phải dùng **PSI Secure Browser** |
| Không giới hạn URL | Firefox trong Remote Desktop chỉ vào được URL cho phép |
| Có thể chuyển về Remote Terminal cũ | Không chuyển được |
| Nhiều câu hỏi dùng chung instance | **Mỗi câu một instance riêng** |

**SSH giữa các instance**

- Mỗi câu phải làm trên một instance cụ thể (không phải `candidate@terminal`); lệnh `ssh` được cho sẵn trước mỗi câu.
- Muốn sang instance khác: `exit` về terminal chính trước, rồi mới `ssh` tiếp.

**Timer & chấm điểm**

- 120 phút, bắt đầu đếm khi session start (góc trên bên trái). Hết giờ vẫn **không** bị khoá môi trường.
- Xem đáp án và điểm: khi hết giờ, hoặc sớm hơn qua **Exam Controls → Answers & Score** (nên tự làm trước).
- Session giữ 36 giờ; đóng/reload trình duyệt không mất thay đổi.
- **Flag question** chỉ là đánh dấu cho bản thân, không ảnh hưởng điểm.

**Tài liệu được phép truy cập**

- `https://kubernetes.io/docs`
- `https://kubernetes.io/blog`
- `https://helm.sh/docs`
- `https://gateway-api.sigs.k8s.io`

!!! warning "Chỉ sửa đúng resource của câu đang làm"
    Trong cluster có sẵn nhiều resource thuộc các câu khác. Không edit/modify/delete những thứ không được yêu cầu.

!!! tip "Gặp lỗi bàn phím / kết nối chậm"
    - macOS: **Preferences → Keyboard → Input Sources** → chọn English **"ABC"** (hoặc "Default").
    - Windows: đổi sang layout English khác.
    - Ubuntu + Chrome hay lỗi phím → dùng **Firefox/Chromium**; mở killer.sh ở chế độ private.
    - Tắt hết extension, không dùng VPN/Proxy, dùng mạng ổn định.
