# ifs24047-pabwe2026-sk-p5-vue

Project Praktikum 5 PABWE berupa aplikasi lelang menggunakan Vue 3 dan API Delcom.

## Teknologi

- Vue 3
- Vite
- Pinia
- Tailwind CSS
- Vitest
- Bun
- SweetAlert2

## Fitur

- Login
- Register
- Daftar lelang
- Pencarian lelang
- Filter lelang
- Tambah lelang
- Detail lelang
- Edit lelang
- Hapus lelang
- Ganti cover lelang
- Tambah bid
- Hapus bid
- Daftar pengguna
- Profile pengguna
- Markdown untuk deskripsi lelang

## Struktur Project

```text
src/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── states/
│   ├── aucations/
│   │   ├── api/
│   │   ├── components/
│   │   ├── helpers/
│   │   ├── layouts/
│   │   ├── modals/
│   │   ├── pages/
│   │   └── states/
│   ├── users/
│   │   ├── api/
│   │   ├── pages/
│   │   └── states/
│   └── common/
│       └── pages/
├── helpers/
├── hooks/
├── App.vue
├── router.js
├── main.js
└── index.css
```

## Instalasi

Pastikan Bun sudah terpasang.

Install dependency:

```bash
bun install
```

## Menjalankan Project

Jalankan development server:

```bash
bun run dev
```

## Testing

Menjalankan semua test:

```bash
bun run vitest run
```

Menjalankan test dengan coverage:

```bash
bun run vitest run --coverage
```

Hasil testing:

```text
29 test files passed
289 tests passed

Statements  100%
Branches    100%
Functions   100%
Lines       100%
```

## Build

Untuk membuat production build:

```bash
bun run build
```

## API

Project menggunakan API Delcom untuk fitur authentication, auction, bid, dan users.

Base URL API diatur melalui:

```text
VITE_DELCOM_BASEURL
```

Jika tidak diatur, aplikasi menggunakan:

```text
https://open-api.delcom.org/api/v1
```

## Author

IFS24047

Praktikum 5 PABWE
