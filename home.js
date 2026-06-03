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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
//if (typeof loadHomeFeed === 'function') {
    loadHomeFeed();
});


    // Panggil fungsi ini saat halaman dimuat
   // document.addEventListener('DOMContentLoaded', () => {
        // Jika Anda menggunakan app.js yang digabung, pastikan fungsi ini ada
      //  if (typeof loadHomeFeed === 'function') {
      //      loadHomeFeed();
    //    }
 //   });


function checkAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            loadUserData();
           // loadHomeFeed();
        } else {
            window.location.href = 'index.html';
        }
    });
}

function loadUserData() {
    const userDoc = doc(db, 'users', currentUser.uid);
    getDoc(userDoc).then(docSnap => {
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
        }
    }).catch(err => {
        console.error('Error loading user data:', err);
        showNotification('Gagal memuat profil');
    });
}

function loadHomeFeed() {
    const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'open')
    );
    
    const feedUnsubscribe = onSnapshot(jobsQuery, (snapshot) => {
        const jobFeed = document.getElementById('jobFeed');
        jobFeed.innerHTML = '';
        
        if (snapshot.empty) {
            document.getElementById('emptyFeed').style.display = 'block';
            return;
        }
        
        document.getElementById('emptyFeed').style.display = 'none';
        
        snapshot.docs.forEach(docSnap => {
            const job = { id: docSnap.id, ...docSnap.data() };
            jobFeed.appendChild(createJobCard(job));
        });
    }, (error) => {
        console.error('Feed error:', error);
        showNotification('Gagal memuat jasa');
    });
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const rating = job.userRating ? job.userRating.toFixed(1) : '0';
    const verifyBadge = job.isVerified ? '✔️' : '';
    const premiumBadge = job.isPremium ? '🥇' : '';
    
    card.innerHTML = `
        <div class="job-card-header">
            <img src="${job.userPhoto}" alt="${job.userName}" class="job-card-avatar">
            <div class="job-card-user-info">
                <div class="job-card-name">
                    ${job.userName}
                    ${verifyBadge}
                    ${premiumBadge}
                </div>
                <div class="job-card-category">${getCategoryLabel(job.category)}</div>
            </div>
            <div class="job-card-rating">⭐ ${rating}</div>
        </div>
        
        <div class="job-card-content">
            <h3 class="job-card-title">${job.title}</h3>
            <p class="job-card-description">${job.description.substring(0, 100)}...</p>
            
            <div class="job-card-meta">
                <span class="meta-item">📍 ${job.location}</span>
                <span class="meta-item">💰 Rp ${job.price.toLocaleString('id-ID')}</span>
            </div>
            
            <div class="job-card-footer">
                <span class="applicants-badge">${job.totalApplicants} Pelamar</span>
                <button class="btn btn-small" onclick="viewJobDetail('${job.id}')">Lihat Detail</button>
            </div>
        </div>
    `;
    
    return card;
}

function viewJobDetail(jobId) {
    window.location.href = `detail-job.html?id=${jobId}`;
}

function logout(e) {
    if (e) e.preventDefault();
    signOut(auth)
        .then(() => {
            currentUser = null;
            currentUserData = null;
            showNotification('Berhasil keluar');
            setTimeout(() => window.location.href = 'index.html', 1500);
        })
        .catch(error => {
            console.error('Logout error:', error);
            showNotification('Gagal keluar');
        });
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.left = '0';
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.left = '-100%';
    document.body.style.overflow = 'auto';
}

function setActive(event) {
    event.preventDefault();
    closeSidebar();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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
