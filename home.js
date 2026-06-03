// Get Firebase Services
const {
    auth,
    db,
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    onSnapshot,
    onAuthStateChanged,
    signOut
} = window.firebaseServices;

let currentUser = null;
let currentUserData = null;

// Fungsi untuk mengecek status login
export function checkAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            loadUserData();
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Fungsi untuk memuat data user
export function loadUserData() {
    if (!currentUser) return;
    const userDoc = doc(db, 'users', currentUser.uid);
    getDoc(userDoc).then(docSnap => {
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
        }
    }).catch(err => {
        console.error('Error loading user data:', err);
    });
}

// Fungsi Utama: Memuat feed jasa
export function loadHomeFeed() {
    console.log("Memuat data feed...");
    const jobFeed = document.getElementById('jobFeed');
    const emptyFeed = document.getElementById('emptyFeed');
    
    if (!jobFeed) {
        console.error("Elemen #jobFeed tidak ditemukan di DOM");
        return;
    }

    const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'open')
    );
    
    // Gunakan onSnapshot untuk real-time update
    onSnapshot(jobsQuery, (snapshot) => {
        jobFeed.innerHTML = '';
        
        if (snapshot.empty) {
            console.log("Tidak ada jasa dengan status 'open'");
            if (emptyFeed) emptyFeed.style.display = 'block';
            return;
        }
        
        if (emptyFeed) emptyFeed.style.display = 'none';
        
        snapshot.docs.forEach(docSnap => {
            const job = { id: docSnap.id, ...docSnap.data() };
            jobFeed.appendChild(createJobCard(job));
        });
    }, (error) => {
        console.error('Feed error:', error);
        showNotification('Gagal memuat jasa. Cek konsol untuk detail indeks.');
    });
}

// Helper: Membuat Card Jasa
export function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const rating = job.userRating ? job.userRating.toFixed(1) : '0';
    const verifyBadge = job.isVerified ? '' : '';
    const premiumBadge = job.isPremium ? '' : '';
    
    // Pastikan deskripsi ada agar tidak error
    const desc = job.description || '';
    
    card.innerHTML = `
        <div class="job-card-header">
            <img src="${job.userPhoto || 'default-avatar.png'}" alt="${job.userName}" class="job-card-avatar">
            <div class="job-card-user-info">
                <div class="job-card-name">
                    ${job.userName || 'User'}
                    ${verifyBadge}
                    ${premiumBadge}
                </div>
                <div class="job-card-category">${getCategoryLabel(job.category)}</div>
            </div>
            <div class="job-card-rating"> ${rating}</div>
        </div>
        
        <div class="job-card-content">
            <h3 class="job-card-title">${job.title}</h3>
            <p class="job-card-description">${desc.substring(0, 100)}...</p>
            
            <div class="job-card-meta">
                <span class="meta-item"> ${job.location || 'Lokasi tidak diketahui'}</span>
                <span class="meta-item"> Rp ${job.price ? job.price.toLocaleString('id-ID') : '0'}</span>
            </div>
            
            <div class="job-card-footer">
                <span class="applicants-badge">${job.totalApplicants || 0} Pelamar</span>
                <button class="btn btn-small" onclick="window.viewJobDetail('${job.id}')">Lihat Detail</button>
            </div>
        </div>
    `;
    
    return card;
}

// Global scope helper agar bisa dipanggil via onclick
window.viewJobDetail = (jobId) => {
    window.location.href = `detail-job.html?id=${jobId}`;
};

function getCategoryLabel(category) {
    const categories = {
        'pembersih': 'Pembersih Rumah',
        'angkut': 'Angkut Barang',
        'potong-rumput': 'Potong Rumput',
        'cuci-motor': 'Cuci Motor',
        'servis-elektronik': 'Servis Elektronik',
        'pindahan': 'Bantu Pindahan',
        'les-privat': 'Les Privat',
        'kurir': 'Kurir Lokal',
        'lainnya': 'Lainnya'
    };
    return categories[category] || category;
}

export function logout(e) {
    if (e) e.preventDefault();
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
}

function showNotification(message) {
    alert(message); // Alternatif sederhana jika CSS notification belum terpanggil
}

// Inisialisasi awal saat file dimuat
checkAuthState();
