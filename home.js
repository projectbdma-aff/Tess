// Mengakses Firebase dari variabel global window (sesuai setup v8 standar)
const db = window.db;
const auth = window.auth;

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    loadHomeFeed();
});

// Cek status login
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // User login, muat data user
            loadUserData(user.uid);
        } else {
            // User belum login, lempar ke index
            window.location.href = 'index.html';
        }
    });
}

// Muat data user
function loadUserData(uid) {
    db.collection('users').doc(uid).get().then(docSnap => {
        if (docSnap.exists) {
            window.currentUserData = docSnap.data();
        }
    }).catch(err => {
        console.error('Error loading user data:', err);
    });
}

// Muat Feed Jasa
function loadHomeFeed() {
    const jobFeed = document.getElementById('jobFeed');
    const emptyFeed = document.getElementById('emptyFeed');
    
    if (!jobFeed) return;

    // Query v8 untuk mengambil semua pekerjaan
    // Menambahkan .orderBy('createdAt', 'desc') jika ingin terbaru di atas
    db.collection('jobs').onSnapshot((snapshot) => {
        jobFeed.innerHTML = '';
        
        if (snapshot.empty) {
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
    });
}

// Membuat Card Jasa
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const rating = job.userRating ? job.userRating.toFixed(1) : '0';
    const verifyBadge = job.isVerified ? '' : '';
    const premiumBadge = job.isPremium ? '' : '';
    
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
            <p class="job-card-description">${job.description ? job.description.substring(0, 100) : ''}...</p>
            
            <div class="job-card-meta">
                <span class="meta-item"> ${job.location || '-'}</span>
                <span class="meta-item"> Rp ${job.price ? job.price.toLocaleString('id-ID') : '0'}</span>
            </div>
            
            <div class="job-card-footer">
                <span class="applicants-badge">${job.totalApplicants || 0} Pelamar</span>
                <button class="btn btn-small" onclick="viewJobDetail('${job.id}')">Lihat Detail</button>
            </div>
        </div>
    `;
    
    return card;
}

// Fungsi Navigasi Global
window.viewJobDetail = function(jobId) {
    window.location.href = `detail-job.html?id=${jobId}`;
};

// Logout
window.logout = function(e) {
    if (e) e.preventDefault();
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
};

// Helper Kategori
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
