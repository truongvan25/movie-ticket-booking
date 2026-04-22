# movie-ticket-booking

## ⚡️ Khởi động nhanh dự án

### Clone code về máy

```bash
git clone https://github.com/truongvan25/movie-ticket-booking
```

### Chạy bằng Docker Compose

```bash
docker compose up --build
```

### Chạy Local

Nên chạy bằng Docker để đồng bộ

#### Cài đặt backend

```bash
cd backend
cp .env.example .env        # Tạo file .env và điền biến môi trường (MongoDB, JWT, PORT)
npm install
npm run dev
```

#### Cài đặt frontend

```bash
cd frontend
npm install
npm run dev
```

### Cấu trúc thư mục

```bash
MentorMe/
├── backend/
│   ├── public/
│   ├── src/
│   ├── .env
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

