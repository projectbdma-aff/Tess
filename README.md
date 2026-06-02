# KerjaDekat - Marketplace Jasa Lokal Indonesia

Aplikasi web mobile-first yang menyediakan platform marketplace jasa lokal sederhana untuk masyarakat menengah ke bawah di Indonesia.

## 🎯 Konsep

KerjaDekat adalah kombinasi dari Facebook Marketplace, OLX, dan Gojek yang difokuskan pada jasa lokal dengan interface yang ringan, cepat, dan mudah dipakai.

## 💡 Fitur Utama

### Autentikasi
- Registrasi dengan email dan password
- Login/Logout
- Profile management

### Home Feed
- Jasa ditampilkan seperti postingan Facebook
- Card style yang modern dan clean
- Real-time update dengan Firestore

### Buat Jasa
- Posting jasa baru dengan judul, deskripsi, harga, lokasi, dan kategori
- User data terekam otomatis

### Detail Jasa
- Melihat detail lengkap jasa
- Pelamar dapat melamar jasa
- Pemilik dapat memilih pelamar
- Koneksi langsung via WhatsApp

### Profil User
- Menampilkan informasi user real-time
- Rating dan review system
- Badge verifikasi dan premium
- Statistik pekerjaan selesai

## 🛠️ Teknologi

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Firebase v8
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Cloud Storage

## 📁 Struktur File

```
kerja-dekat/
├── index.html              # Halaman login/register & home
├── app.js                  # Logika aplikasi utama
├── firebase.js             # Konfigurasi Firebase
├── detail-job.html         # Halaman detail jasa
├── detail-job.js           # Logika detail jasa
├── css/
│   └── style.css           # Stylesheet
├── README.md               # Dokumentasi ini
```

## 🚀 Setup & Deployment

### Prasyarat
- Akun Firebase
- Text editor (VS Code, Sublime, dll)
- Browser modern

### Setup Lokal

1. **Clone atau download project**
   ```bash
   git clone https://github.com/projectbdma-aff/kerja-dekat.git
   cd kerja-dekat
   ```

2. **Buat project Firebase**
   - Kunjungi [Firebase Console](https://console.firebase.google.com)
   - Buat project baru
   - Aktifkan Authentication (Email/Password)
   - Buat Firestore Database
   - Setup Storage

3. **Update `firebase.js`**
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "1:YOUR_SENDER_ID:web:YOUR_APP_ID"
   };
   ```

4. **Setup Firestore Rules**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth.uid == uid;
       }
       match /jobs/{document=**} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth.uid == resource.data.userId;
       }
       match /reviews/{document=**} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
       }
     }
   }
   ```

### Deploy ke Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login ke Firebase**
   ```bash
   firebase login
   ```

3. **Inisialisasi project**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## 📊 Struktur Database

### Collection: users
```json
{
  "uid": "user-id",
  "name": "Nama User",
  "email": "user@email.com",
  "whatsapp": "62812345678",
  "location": "Jakarta",
  "jobCategory": "pembersih",
  "photo": "https://...",
  "isVerified": false,
  "isPremium": false,
  "averageRating": 4.5,
  "totalReviews": 10,
  "completedJobs": 5,
  "createdAt": "timestamp"
}
```

### Collection: jobs
```json
{
  "id": "job-id",
  "title": "Bersihkan Rumah",
  "description": "Bersihkan rumah 3 kamar...",
  "price": 250000,
  "location": "Jakarta Timur",
  "category": "pembersih",
  "status": "open",
  "totalApplicants": 3,
  "selectedWorkerId": null,
  "userId": "user-id",
  "userName": "Nama Pemilik",
  "userPhoto": "https://...",
  "userRating": 4.5,
  "isVerified": false,
  "isPremium": false,
  "createdAt": "timestamp"
}
```

### Subcollection: jobs/{jobId}/applicants
```json
{
  "workerId": "worker-id",
  "workerName": "Nama Worker",
  "workerPhoto": "https://...",
  "workerRating": 4.2,
  "whatsapp": "62812345678",
  "createdAt": "timestamp"
}
```

## 🎨 Desain & UX

- **Warna Utama**: Hijau (#10b981) dan Putih
- **Font**: Poppins
- **Mobile First**: Responsive hingga 768px
- **Loading**: Spinner ringan
- **Notifikasi**: Toast notification

## 📱 Kategori Jasa

1. Pembersih Rumah
2. Angkut Barang
3. Potong Rumput
4. Cuci Motor
5. Servis Elektronik
6. Bantu Pindahan
7. Les Privat
8. Kurir Lokal
9. Lainnya

## 🔐 Keamanan

- Email/Password authentication
- Firestore security rules
- User-based access control
- HTTPS only

## 📞 Kontak & Support

Untuk pertanyaan atau bug report, silakan buat issue di repository ini.

## 📄 Lisensi

MIT License - Bebas digunakan untuk keperluan komersial maupun non-komersial.

---

**Made with ❤️ for Indonesian Local Services**