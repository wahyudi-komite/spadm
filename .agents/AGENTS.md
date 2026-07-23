# Git Branching Strategy & Workflow Rules

- **Branch Structure**: Hanya terdapat 2 branch utama di repository ini, yaitu `dev` dan `master`.
- **Dilarang Membuat Branch Baru**: Agent TIDAK BOLEH membuat branch baru dalam bentuk apapun (seperti `agent/*`, `feature/*`, `fix/*`, atau branch sementara lainnya).
- **Development Workflow**: Semua pekerjaan pengembangan, pembuatan fitur baru, maupun pembenahan bug HANYA dikerjakan langsung di branch `dev`.
- **Merge Strategy**: Perubahan dari branch `dev` baru boleh di-merge ke `master` jika pekerjaan sudah selesai dan terverifikasi sepenuhnya.
