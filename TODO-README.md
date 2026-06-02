# Todo List Application

Aplikasi Todo List modern dengan fitur lengkap untuk mengelola tugas harian Anda.

## ✨ Fitur

### Core Features
- ✅ Tambah tugas baru dengan berbagai detail
- 📝 Edit tugas yang sudah ada
- 🗑️ Hapus tugas
- ✔️ Mark tugas sebagai selesai
- 🎯 Prioritas: Tinggi, Sedang, Rendah
- 📂 Kategori: Personal, Kerja, Belanja, Kesehatan, Lainnya
- 📅 Tanggal jatuh tempo dengan tracking status
- 🔍 Cari tugas
- 🎛️ Filter: Semua, Aktif, Selesai, Berdasarkan Prioritas
- 📊 Sorting: Tanggal, Prioritas, Nama

### Advanced Features
- 📈 Dashboard statistik real-time
- 🌙 Dark/Light Mode
- 💾 Local Storage persistence
- 📥 Export tugas ke JSON
- 📤 Import tugas dari JSON
- 🎨 Responsive design
- ⚡ Smooth animations
- 🔔 Toast notifications

## 🛠️ Teknologi

- HTML5
- CSS3 (dengan CSS Variables)
- Vanilla JavaScript
- Local Storage API
- Responsive Design

## 📁 Struktur File

```
todo-app/
├── todo-index.html      # Halaman utama
├── todo-app.js          # Main logic
├── todo-style.css       # Styling
├── todo-config.js       # Configuration
├── todo-utils.js        # Utility functions
└── README.md            # Dokumentasi
```

## 🚀 Cara Menggunakan

### 1. Buka Aplikasi
Buka file `todo-index.html` di browser

### 2. Tambah Tugas
- Masukkan judul tugas
- Pilih prioritas (Rendah, Sedang, Tinggi)
- Pilih kategori
- Tambahkan tanggal jatuh tempo (opsional)
- Klik tombol "Tambah Tugas"

### 3. Kelola Tugas
- **Centang checkbox** untuk menandai tugas selesai
- **Klik tombol edit** (✏️) untuk mengubah tugas
- **Klik tombol hapus** (🗑️) untuk menghapus tugas

### 4. Filter & Cari
- Gunakan kolom search untuk mencari tugas
- Klik tombol filter untuk menyaring tugas
- Gunakan dropdown sort untuk mengubah urutan

### 5. Export/Import
- **Export**: Download tugas ke file JSON
- **Import**: Upload file JSON untuk menambah/mengganti tugas

### 6. Dark Mode
- Klik tombol theme toggle di header
- Pilihan akan disimpan otomatis

## 💾 Local Storage

Semua data tugas disimpan secara otomatis di Local Storage browser:
- `todos_app_data` - Menyimpan semua tugas
- `todos_app_theme` - Menyimpan preferensi tema

## 📅 Tracking Tanggal

- **Merah (Overdue)** - Tugas yang sudah melewati tanggal jatuh tempo
- **Biru (Today)** - Tugas yang jatuh tempo hari ini
- **Kuning (Tomorrow)** - Tugas yang jatuh tempo besok
- **Hijau (Scheduled)** - Tugas yang dijadwalkan di masa depan

## 🎨 Tema

### Light Mode
- Background putih
- Text gelap
- Cocok untuk siang hari

### Dark Mode
- Background gelap
- Text terang
- Cocok untuk malam hari

## 📊 Statistik

Dashboard menampilkan:
- **Total Tugas** - Jumlah semua tugas
- **Selesai** - Jumlah tugas yang sudah dikerjakan
- **Aktif** - Jumlah tugas yang belum dikerjakan
- **Progres** - Persentase penyelesaian (%)

## 🎯 Prioritas

- 🔴 **Tinggi** - Tugas urgent/penting
- 🟡 **Sedang** - Tugas normal
- 🟢 **Rendah** - Tugas yang tidak terburu-buru

## 📂 Kategori

- 👤 **Personal** - Tugas pribadi
- 💼 **Kerja** - Tugas pekerjaan
- 🛒 **Belanja** - Daftar belanja
- 🏥 **Kesehatan** - Tugas kesehatan
- 📌 **Lainnya** - Kategori lain

## 🔄 Import/Export Format

```json
[
  {
    "id": "todo_timestamp_random",
    "title": "Judul Tugas",
    "priority": "high",
    "category": "work",
    "dueDate": "2024-12-31",
    "completed": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

## 🌐 Browser Support

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile Browsers

## 💡 Tips

1. **Backup Rutin** - Gunakan fitur export untuk backup data
2. **Kategori Konsisten** - Gunakan kategori yang sama untuk filtering lebih mudah
3. **Prioritas Realistis** - Jangan tandai semua tugas sebagai prioritas tinggi
4. **Review Harian** - Periksa tugas setiap pagi untuk planning
5. **Arsipkan Selesai** - Hapus tugas selesai secara berkala

## 📝 Lisensi

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

---

**Dibuat dengan ❤️ untuk produktivitas Anda**