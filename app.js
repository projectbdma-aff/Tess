// Mengambil akses langsung dari window
const auth = window.auth;
const db = window.db;

// Helper agar fungsi Firebase kompatibel dengan kode lama
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
const collection = (name) => db.collection(name);
const doc = (db, col, id) => db.collection(col).doc(id);

// Global State
let currentUser = null;
let currentUserData = null;
let unsubscribeFunctions = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    setupEventListeners();
});

// Check Auth State
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserData();
            showMainApp();
        } else {
            currentUser = null;
            showAuthSection();
        }
    });
}

// Load User Data from Firestore
function loadUserData() {
    db.collection('users').doc(currentUser.uid).get().then(docSnap => {
        if (docSnap.exists) {
            currentUserData = docSnap.data();
            loadHomeFeed();
        }
    }).catch(err => {
        console.error('Error loading user data:', err);
        showNotification('Gagal memuat profil');
    });
}

// Setup Event Listeners
function setupEventListeners() {
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    const createJobForm = document.getElementById('createJobForm');
    if (createJobForm) createJobForm.addEventListener('submit', handleCreateJob);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', handleSearch);
}

// Auth Functions
function toggleAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showNotification('Berhasil masuk!');
            document.getElementById('loginFormElement').reset();
        })
        .catch(error => {
            console.error('Login error:', error);
            showNotification('Email atau password salah');
        })
        .finally(() => showLoading(false));
}

function handleRegister(e) {
    e.preventDefault();
    showLoading(true);
    
    const fullName = document.getElementById('fullName').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const location = document.getElementById('location').value;
    const jobCategory = document.getElementById('jobCategory').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const uid = userCredential.user.uid;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=10b981&color=fff`;
            saveUserData(uid, fullName, whatsapp, email, location, jobCategory, avatarUrl);
        })
        .catch(error => {
            console.error('Register error:', error);
            showNotification('Gagal mendaftar: ' + error.message);
            showLoading(false);
        });
}

function saveUserData(uid, fullName, whatsapp, email, location, jobCategory, photoURL) {
    const userData = {
        uid: uid,
        name: fullName,
        email: email,
        whatsapp: whatsapp,
        location: location,
        jobCategory: jobCategory,
        photo: photoURL,
        isVerified: false,
        isPremium: false,
        averageRating: 0,
        totalReviews: 0,
        completedJobs: 0,
        createdAt: serverTimestamp()
    };
    
    db.collection('users').doc(uid).set(userData)
        .then(() => {
            showNotification('Berhasil mendaftar! Silakan login.');
            document.getElementById('registerFormElement').reset();
            toggleAuth();
            showLoading(false);
        })
        .catch(error => {
            console.error('Save user error:', error);
            showNotification('Gagal menyimpan data');
            showLoading(false);
        });
}

function logout(e) {
    if (e) e.preventDefault();
    auth.signOut()
        .then(() => {
            currentUser = null;
            currentUserData = null;
            unsubscribeFunctions.forEach(unsub => unsub());
            unsubscribeFunctions = [];
            showNotification('Berhasil keluar');
        })
        .catch(error => {
            console.error('Logout error:', error);
            showNotification('Gagal keluar');
        });
}

// Job Functions
function handleCreateJob(e) {
    e.preventDefault();
    showLoading(true);
    
    const title = document.getElementById('jobTitle').value;
    const description = document.getElementById('jobDescription').value;
    const price = parseInt(document.getElementById('jobPrice').value);
    const location = document.getElementById('jobLocation').value;
    const category = document.getElementById('jobCategoryCreate').value;
    
    const jobData = {
        title: title,
        description: description,
        price: price,
        location: location,
        category: category,
        status: 'open',
        totalApplicants: 0,
        selectedWorkerId: null,
        userId: currentUser.uid,
        userName: currentUserData.name,
        userPhoto: currentUserData.photo,
        userRating: currentUserData.averageRating,
        isVerified: currentUserData.isVerified,
        isPremium: currentUserData.isPremium,
        createdAt: serverTimestamp()
    };
    
    db.collection('jobs').add(jobData)
        .then(() => {
            showNotification('Jasa berhasil diposting!');
            document.getElementById('createJobForm').reset();
            showPage('home');
        })
        .catch(error => {
            console.error('Create job error:', error);
            showNotification('Gagal membuat jasa');
        })
        .finally(() => showLoading(false));
}

// Load Home Feed
function loadHomeFeed() {
    const jobsQuery = db.collection('jobs').where('status', '==', 'open');
    
    const feedUnsubscribe = jobsQuery.onSnapshot((snapshot) => {
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
    
    unsubscribeFunctions.push(feedUnsubscribe);
}

// Create Job Card
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    const rating = job.userRating ? job.userRating.toFixed(1) : '0';
    const verifyBadge = job.isVerified ? '' : '';
    const premiumBadge = job.isPremium ? '' : '';
    
    card.innerHTML = `
        <div class="job-card-header">
            <img src="${job.userPhoto}" alt="${job.userName}" class="job-card-avatar">
            <div class="job-card-user-info">
                <div class="job-card-name">
                    ${job.userName} ${verifyBadge} ${premiumBadge}
                </div>
                <div class="job-card-category">${getCategoryLabel(job.category)}</div>
            </div>
            <div class="job-card-rating"> ${rating}</div>
        </div>
        <div class="job-card-content">
            <h3 class="job-card-title">${job.title}</h3>
            <p class="job-card-description">${job.description.substring(0, 100)}...</p>
            <div class="job-card-meta">
                <span class="meta-item"> ${job.location}</span>
                <span class="meta-item"> Rp ${job.price.toLocaleString('id-ID')}</span>
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

// Search Jobs
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length === 0) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    db.collection('jobs').where('status', '==', 'open').get()
        .then(snapshot => {
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';
            let found = false;
            
            snapshot.docs.forEach(docSnap => {
                const job = { id: docSnap.id, ...docSnap.data() };
                if (job.title.toLowerCase().includes(searchTerm) ||
                    job.description.toLowerCase().includes(searchTerm) ||
                    job.location.toLowerCase().includes(searchTerm) ||
                    job.category.toLowerCase().includes(searchTerm)) {
                    searchResults.appendChild(createJobCard(job));
                    found = true;
                }
            });
            
            if (!found) {
                searchResults.innerHTML = '<div class="empty-state">Tidak ada hasil</div>';
            }
        })
        .catch(err => console.error('Search error:', err));
}

// Profile Functions
function loadProfile() {
    const profileUnsub = db.collection('users').doc(currentUser.uid).onSnapshot((docSnap) => {
        if (docSnap.exists) {
            currentUserData = docSnap.data();
            renderProfile();
        }
    });
    unsubscribeFunctions.push(profileUnsub);
}

function renderProfile() {
    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <div class="profile-header">
            <img src="${currentUserData.photo}" alt="${currentUserData.name}" class="profile-photo">
            <h2>${currentUserData.name}</h2>
        </div>
        <div class="profile-info">
            <p> ${currentUserData.location}</p>
            <p> ${getCategoryLabel(currentUserData.jobCategory)}</p>
            <p> ${currentUserData.whatsapp}</p>
        </div>
        <button class="btn btn-primary btn-block" onclick="editProfile()">Edit Profil</button>
    `;
}

function editProfile() {
    showNotification('Fitur edit profil segera hadir');
}

// Navigation & Utilities
function showPage(pageName, event) {
    if (event) event.preventDefault();
    closeSidebar();
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    
    if (pageName === 'home') {
        document.getElementById('homePage').style.display = 'block';
        loadHomeFeed();
    } else if (pageName === 'createJob') {
        document.getElementById('createJobPage').style.display = 'block';
    } else if (pageName === 'searchJob') {
        document.getElementById('searchJobPage').style.display = 'block';
    } else if (pageName === 'profile') {
        document.getElementById('profilePage').style.display = 'block';
        loadProfile();
    }
}

function closeSidebar() { document.getElementById('sidebar').style.left = '-100%'; }
function openSidebar() { document.getElementById('sidebar').style.left = '0'; }
function showMainApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    showPage('home');
}
function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}
function showLoading(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; }
function showNotification(msg) { alert(msg); } // Ganti dengan sistem UI notifikasi Anda

function getCategoryLabel(cat) {
    const cats = { 'pembersih': 'Pembersih Rumah', 'angkut': 'Angkut Barang', 'potong-rumput': 'Potong Rumput', 'cuci-motor': 'Cuci Motor', 'servis-elektronik': 'Servis Elektronik', 'pindahan': 'Bantu Pindahan', 'les-privat': 'Les Privat', 'kurir': 'Kurir Lokal', 'lainnya': 'Lainnya' };
    return cats[cat] || cat;
}
