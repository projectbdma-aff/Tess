// Get Firebase Services
const {
    auth,
    db,
    doc,
    getDoc,
    onSnapshot,
    onAuthStateChanged,
    signOut
} = window.firebaseServices;

let currentUser = null;
let currentUserData = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
});

function checkAuthState() {
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            loadProfile();
        } else {
            window.location.href = 'index.html';
        }
    });
}

function loadProfile() {
    const userDoc = doc(db, 'users', currentUser.uid);
    
    const profileUnsub = onSnapshot(userDoc, (docSnap) => {
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            renderProfile();
        }
    });
}

function renderProfile() {
    const profileContent = document.getElementById('profileContent');
    
    const verifyBadge = currentUserData.isVerified ? '✔️ Terverifikasi' : '';
    const premiumBadge = currentUserData.isPremium ? '🥇 Premium' : '';
    const ratingDisplay = currentUserData.averageRating > 0 ? `⭐ ${currentUserData.averageRating.toFixed(1)} (${currentUserData.totalReviews} ulasan)` : 'Belum ada ulasan';
    
    profileContent.innerHTML = `
        <div class="profile-header">
            <img src="${currentUserData.photo}" alt="${currentUserData.name}" class="profile-photo">
            <h2 class="profile-name">${currentUserData.name}</h2>
            <div class="profile-badges">
                ${verifyBadge} ${premiumBadge}
            </div>
        </div>
        
        <div class="profile-stats">
            <div class="stat-item">
                <div class="stat-value">${currentUserData.completedJobs}</div>
                <div class="stat-label">Pekerjaan Selesai</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${ratingDisplay}</div>
                <div class="stat-label">Rating</div>
            </div>
        </div>
        
        <div class="profile-info">
            <div class="info-item">
                <span class="info-label">📍 Lokasi</span>
                <span class="info-value">${currentUserData.location}</span>
            </div>
            <div class="info-item">
                <span class="info-label">💼 Kategori</span>
                <span class="info-value">${getCategoryLabel(currentUserData.jobCategory)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">📱 WhatsApp</span>
                <span class="info-value">${currentUserData.whatsapp}</span>
            </div>
            <div class="info-item">
                <span class="info-label">📧 Email</span>
                <span class="info-value">${currentUserData.email}</span>
            </div>
        </div>
        
        <button class="btn btn-primary btn-block" onclick="editProfile()">Edit Profil</button>
    `;
}

function editProfile() {
    showNotification('Fitur edit profil segera hadir');
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