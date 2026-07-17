# Develop Terraform (Plugin Framework — HashiCups)

Đường đi tối giản để scaffold và chạy thử một custom Terraform provider ở local, dựa trên [tutorial Plugin Framework của HashiCorp](https://developer.hashicorp.com/terraform/tutorials/providers-plugin-framework) (provider mẫu `hashicups`). Dùng làm điểm bắt đầu khi cần viết provider hỗ trợ một nền tảng cloud mới.

## Yêu cầu

- Go 1.21+
- Terraform v1.8+
- Git

=== "Ubuntu / Linux"

    ```bash
    # Go (nếu chưa cài)
    sudo snap install go --classic
    go version

    # Terraform
    wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
    sudo apt update && sudo apt install terraform
    ```

    `go install` sẽ đặt binary vào `$(go env GOBIN)`, hoặc `$(go env GOPATH)/bin` nếu `GOBIN` chưa được set — nhớ thêm thư mục này vào `PATH`.

=== "Windows"

    ```powershell
    # Go và Terraform (qua winget, hoặc cài thủ công từ trang chính thức)
    winget install GoLang.Go
    winget install HashiCorp.Terraform
    ```

    Kiểm tra đường dẫn Go bin bằng `go env GOBIN` — đây là path sẽ dùng trong cấu hình dev override bên dưới.

## Scaffold provider

Bắt đầu từ scaffolding template của HashiCorp thay vì viết từ đầu:

```bash
git clone https://github.com/hashicorp/terraform-provider-scaffolding-framework
mv terraform-provider-scaffolding-framework terraform-provider-<name>
cd terraform-provider-<name>
go mod edit -module terraform-provider-<name>
go mod tidy
```

## Interface của provider (`provider.go`)

Mọi provider đều implement `provider.Provider`. 5 hàm sau là phần bắt buộc phải có:

```go
// Metadata trả về tên loại provider (ví dụ "hashicups")
func (p *exampleProvider) Metadata(_ context.Context,
    _ provider.MetadataRequest, resp *provider.MetadataResponse)

// Schema định nghĩa config ở cấp provider (ví dụ API host/token)
func (p *exampleProvider) Schema(_ context.Context,
    _ provider.SchemaRequest, resp *provider.SchemaResponse)

// Configure khởi tạo API client dùng chung cho các resource/data source
func (p *exampleProvider) Configure(ctx context.Context,
    req provider.ConfigureRequest, resp *provider.ConfigureResponse)

// DataSources liệt kê các data source mà provider này cung cấp
func (p *exampleProvider) DataSources(_ context.Context) []func() datasource.DataSource

// Resources liệt kê các resource mà provider này cung cấp
func (p *exampleProvider) Resources(_ context.Context) []func() resource.Resource
```

`Configure` là nơi đọc config của provider (host, credentials, ...) và tạo API client, sau đó lưu vào `resp.ResourceData` / `resp.DataSourceData` để các resource và data source lấy lại dùng.

## Interface của resource (mỗi resource một file, ví dụ `resource_order.go`)

Mỗi resource implement `resource.Resource`:

```go
type Resource interface {
    Metadata(context.Context, MetadataRequest, *MetadataResponse)
    Schema(context.Context, SchemaRequest, *SchemaResponse)
    Create(context.Context, CreateRequest, *CreateResponse)
    Read(context.Context, ReadRequest, *ReadResponse)
    Update(context.Context, UpdateRequest, *UpdateResponse)
    Delete(context.Context, DeleteRequest, *DeleteResponse)
}
```

Nếu resource cần dùng API client từ provider, implement thêm:

```go
type ResourceWithConfigure interface {
    Configure(context.Context, ConfigureRequest, *ConfigureResponse)
}
```

Struct backing chứa những gì resource cần lúc runtime — thường chỉ là API client:

```go
type orderResource struct {
    client *hashicups.Client
}

func (r *orderResource) Metadata(_ context.Context, req resource.MetadataRequest,
    resp *resource.MetadataResponse) {
    resp.TypeName = req.ProviderTypeName + "_order"
}
```

`Schema` định nghĩa các attribute của resource (`Required`, `Optional`, `Computed`) bằng các kiểu như `StringAttribute`, `Int64Attribute`, `ListNestedAttribute`.

Mỗi hàm CRUD đều theo cùng một khuôn mẫu:

- **Create** — đọc plan vào một struct model Go → gọi API client → map response của API ngược lại vào model → `resp.State.Set(ctx, plan)`.
- **Read** — đọc state hiện tại → gọi API bằng ID đã lưu → map response mới nhất ngược lại → `resp.State.Set(ctx, state)`.
- **Update** — đọc plan → gọi hàm update của API → map response ngược lại → set state.
- **Delete** — đọc state hiện tại → gọi hàm delete của API → `resp.State.RemoveResource(ctx)`.

## Build & test ở local

Biên dịch và cài đặt binary của provider:

```bash
go install .
```

Trỏ Terraform về bản build local thay vì registry, thông qua **dev override**:

=== "Ubuntu / Linux (`~/.terraformrc`)"

    ```hcl
    provider_installation {
      dev_overrides {
        "hashicorp.com/edu/<name>" = "/home/<user>/go/bin"
      }
      direct {}
    }
    ```

=== "Windows (`%APPDATA%\terraform.rc`)"

    ```hcl
    provider_installation {
      dev_overrides {
        "hashicorp.com/edu/<name>" = "<GOBIN_PATH>"
      }
      direct {}
    }
    ```

    Lấy `<GOBIN_PATH>` từ lệnh `go env GOBIN`.

Sau đó test thử bằng một config tạm:

```bash
mkdir examples/provider-install-verification && cd $_
terraform plan
```

Khi dev override đang bật, `terraform plan`/`apply` sẽ dùng thẳng binary vừa build ở local — không cần `terraform init` hay publish lên registry trong lúc đang phát triển.
