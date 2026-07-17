# Terraform

Tài liệu tham khảo thực dụng cho việc dùng Terraform hằng ngày — workflow cốt lõi cùng các construct hay dùng nhất.

## Workflow cơ bản

```bash
terraform init                # tải provider, khởi tạo backend
terraform validate            # kiểm tra cú pháp/config hợp lệ
terraform fmt -recursive      # tự động format các file .tf
terraform plan                # xem trước các thay đổi
terraform apply                # áp dụng thay đổi
terraform destroy              # xóa toàn bộ resource
```

### Plan → review → apply

Lưu lại kết quả plan và apply *đúng* plan đó sau này, để đảm bảo những gì được review chính là những gì được apply:

```bash
terraform plan -out plan.out
terraform apply "plan.out"
```

Xem lại plan đã lưu dưới dạng JSON (hữu ích khi chạy CI):

```bash
terraform show -json plan.out > plan.json
```

Bỏ qua bước xác nhận tương tác (chỉ dùng cho CI / tự động hóa):

```bash
terraform apply -auto-approve
```

## Variable

Khai báo trong bất kỳ file `.tf` nào (thường đặt ở `variables.tf`):

```hcl
variable "instance_type" {
  type        = string
  description = "Instance type of the EC2"
}
```

`type` là thuộc tính bắt buộc duy nhất; `description` dùng để ghi chú ý nghĩa cho người đọc.

Gán giá trị qua file `terraform.tfvars` (được load mặc định):

```hcl
instance_type = "t2.micro"
```

Hoặc chỉ định một file cụ thể:

```bash
terraform apply -var-file="production.tfvars"
```

## Output

Hiển thị giá trị sau khi apply, ví dụ public IP của một instance:

```hcl
output "ec2" {
  value = {
    public_ip = aws_instance.hello.public_ip
  }
}
```

## Data source

Block `data` dùng để tra cứu thông tin đã tồn tại (ví dụ AMI ID trên AWS) thay vì hardcode giá trị — linh hoạt và dễ đọc hơn nhiều so với một chuỗi khó hiểu như `ami-09dd2e08d601bff67`.

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  owners = ["099720109477"]
}
```

## Count & for expression

`count` là một **meta-argument** — thuộc tính ở cấp Terraform, có thể dùng ở bất kỳ resource block nào, chứ không phải thuộc tính do provider cung cấp — dùng để tạo nhiều bản sao của một resource.

```hcl
resource "aws_instance" "hello" {
  count         = 5
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
}
```

Việc tham chiếu từng instance riêng lẻ không scale được — dùng `for` expression thay thế:

```hcl
output "ec2" {
  value = {
    public_ip = [for v in aws_instance.hello : v.public_ip]
  }
}
```

## Local value

`locals` khai báo một giá trị một lần và tái sử dụng nhiều lần trong file qua cú pháp `local.<KEY>` — tiện cho các bảng tra cứu như MIME type:

```hcl
locals {
  mime_types = {
    html = "text/html"
    css  = "text/css"
    js   = "application/javascript"
  }
}
```

## Ví dụ for_each — upload static site lên S3

```hcl
resource "aws_s3_bucket" "static" {
  bucket = "terraform-series-bai3"
  policy = file("s3_static_policy.json")

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_object" "object" {
  for_each     = fileset(path.module, "static-web/**/*")
  bucket       = aws_s3_bucket.static.id
  key          = replace(each.value, "static-web", "")
  source       = each.value
  etag         = filemd5(each.value)
  content_type = lookup(local.mime_types, split(".", each.value)[length(split(".", each.value)) - 1])
}
```

## State

```bash
terraform state list                  # liệt kê các resource đang được track trong state
terraform state show <address>        # xem chi tiết state của một resource
terraform state mv <src> <dst>        # đổi tên/di chuyển resource trong state
terraform state rm <address>          # ngừng track resource (không xóa resource thật)
terraform import <address> <id>       # đưa một resource đã tồn tại vào quản lý bởi Terraform
```

## Workspace

Workspace cho phép một bộ config quản lý nhiều state file độc lập (ví dụ dev/staging/prod):

```bash
terraform workspace list
terraform workspace new staging
terraform workspace select staging
```

## Resource drift

Drift xảy ra khi hạ tầng thật bị thay đổi bên ngoài Terraform — ví dụ ai đó chỉnh sửa resource qua Web Console của AWS thay vì qua code. `terraform plan` sẽ hiển thị phần chênh lệch ở lần chạy tiếp theo; để khắc phục, hoặc cập nhật lại config cho khớp với thực tế, hoặc apply lại để ép về đúng như config.
