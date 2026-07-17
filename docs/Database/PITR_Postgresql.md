# PITR in PostgreSQL

## Link
[Link document](https://www.postgresql.org/docs/current/continuous-archiving.html#BACKUP-PITR-RECOVERY){:target="_blank"}

## Step 1: Sửa Config
```bash
nano /etc/postgresql/17/main/postgresql.conf
```
```bash
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'

# Hai dòng cuối này không chắc là phải cấu hình ngay từ đây
# không hay là có thể cấu hình ở file postgres.auto.conf trong main
restore_command = 'cp /var/lib/postgresql/archive/%f %p'
recovery_target_time = '2025-03-24 15:10:00'
```

## Step 2: Backup base data
```bash
sudo mkdir -p /var/lib/postgresql/archive
sudo chown postgres:postgres /var/lib/postgresql/archive
```
```bash
pg_basebackup -U postgres -D /var/lib/postgresql/backups/base -F tar -X fetch -P
# Copy cả pg_wal ra để phòng ngừa (Trên docs hướng dẫn thế)
sudo cp -r /var/lib/postgresql/17/main /var/lib/postgresql/17/main_backup

sudo cp -r /var/lib/postgresql/17/main/pg_wal /var/lib/postgresql/main_backup_pg_wal
```

## Step 3: Thử nào
```bash
sudo systemctl stop postgresql
```
#### Xóa hết trong main đi và cho lại data đã backup ra vào
```bash
sudo rm -rf /var/lib/postgresql/17/main/*

tar -xf /var/lib/postgresql/backups/base/base.tar -C /var/lib/postgresql/17/main

```

#### Xóa WAL cũ và cho WAL ở bước trên vào
```bash
sudo rm -rf /var/lib/postgresql/17/main/pg_wal/*

sudo cp /var/lib/postgresql/main_backup_pg_wal/* /var/lib/postgresql/17/main/pg_wal/
```

#### Tạo recovery rồi restart chờ không làm được
```bash
sudo touch /var/lib/postgresql/17/main/recovery.signal
```

#### Chỉnh sửa `postgresql.auto.conf` để thiết lập PITR nhưng mà ở trong bước 8 trong cái docs chính thức thì nó bắt sửa postgresql.conf, thì quay lại bước kia sửa thôi
Mở file cấu hình:
```bash
sudo nano /var/lib/postgresql/17/main/postgresql.auto.conf
```
Thêm các dòng sau:
```ini
restore_command = 'cp /var/lib/postgresql/archive/%f %p'
recovery_target_time = '2025-03-24 20:12:09+07'
```

## Debug
```bash
tail -f /var/log/postgresql/postgresql-17-main.log

journalctl -u postgresql --no-pager -n 50
```

Chạy lệnh kiểm tra thời gian khôi phục:
```sql
SELECT pg_wal_replay_resume();
SELECT now();
```