# DTTap! 🎮
### Transformasi Teknologi Informasi Dan Peralatan Terapi Wicara (DTT)

**DTTap!** adalah sistem permainan edukatif berbasis web interaktif yang dirancang khusus untuk membantu proses terapi wicara pada anak-anak dengan gangguan bahasa melalui metode **Discrete Trial Training (DTT)** yang dimodifikasi.

---

## 🌟 Fitur Utama

- **Metode Pembelajaran DTT Terstruktur**:
  - **10 Ronde** per sesi permainan.
  - Setiap ronde melatih 3 kartu target dengan 3 tahapan (Target Tunggal $\rightarrow$ Target + 1 Pengecoh $\rightarrow$ Target + 2 Pengecoh).
  - Target 3 klik benar berturut-turut untuk melatih fokus dan pemahaman kosakata.
- **Audio Voice-Over & Sound Effects Interaktif**:
  - Instruksi suara otomatis (*Text-to-Speech*) berbahasa Indonesia ("Klik Melom!", "Klik Mata!", dll.).
  - Efek suara tepuk tangan (*Ding!*) untuk jawaban benar dan buzzer (*Tetot*) untuk jawaban salah via Web Audio API.
  - Tombol pengulangan suara (🔊) kapan saja.
- **9 Kategori Pembelajaran Lengkap (197 Kartu)**:
  - 🍎 **Buah** (20 kartu)
  - 🦁 **Hewan Buas** (20 kartu)
  - 🐱 **Hewan Jinak** (20 kartu)
  - 👋 **Anggota Tubuh** (20 kartu)
  - 👕 **Pakaian** (20 kartu)
  - 🔢 **Angka** (30 kartu)
  - 🔤 **Huruf** (26 kartu)
  - 🍽️ **Alat Makan** (21 kartu)
  - 🔷 **Bentuk** (20 kartu)
- **UI/UX Ramah Anak**:
  - Warna cerah, tipografi modern (Nunito & Fredoka), animasi kartu ceria.
  - Dioptimalkan untuk orientasi landscape di tablet maupun komputer.
- **Hasil & Evaluasi (Result Screen)**:
  - Menampilkan ringkasan jawaban benar, salah, dan akurasi untuk memantau perkembangan anak.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

```bash
# Masuk ke direktori aplikasi
cd dttap-app

# Install dependensi
npm install

# Jalankan server lokal
npm run dev
```

Buka `http://localhost:5173` pada browser Anda.

---

## 🌐 Deploy ke Vercel

Aplikasi ini bersifat **frontend-only** (Client-side Rendering) tanpa backend database, sehingga 100% siap di-hosting langsung di **Vercel**:

1. Login ke [Vercel](https://vercel.com).
2. Klik **Add New** $\rightarrow$ **Project**.
3. Hubungkan repositori GitHub: `SyaefulEffendi/dttap-app`.
4. Framework Preset otomatis terdeteksi sebagai **Vite**.
5. Klik **Deploy**! 🚀
