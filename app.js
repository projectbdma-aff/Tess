//console.log("app.js berhasil dimuat!");

//document.addEventListener('DOMContentLoaded', function() {
//    console.log("DOM sudah siap.");
//    checkAuthState();
//    setupEventListeners();
//});


// Global State
let currentUser = null;
let currentUserData = null;
let unsubscribeFunctions = [];

// Get Firebase Services
const {
    auth,
    db,
   createUserWithEmailAndPassword,
   // auth.createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
  //  auth.signInWithEmailAndPassword,
   signOut,
   // auth.signOut,
   onAuthStateChanged,
   // auth.onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} = window.firebaseServices;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    setupEventListeners();
});

// Check Auth State
function checkAuthState() {
   onAuthStateChanged(auth, user => {
    //    auth.onAuthStateChanged(user => {
       console.log("Auth State Changed:", user);
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
    const userDoc = doc(db, 'users', currentUser.uid);
    getDoc(userDoc).then(docSnap => {
        if (docSnap.exists()) {
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
     Login Form
   const loginForm = document.getElementById('loginFormElement');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

//function setupEventListeners() {
    // Login Form
//    const loginForm = document.getElementById('loginFormElement');
    
//    if (loginForm) {
  //      console.log("Form login ditemukan, memasang event listener...");
      //  loginForm.addEventListener('submit', function(e) {
    //        console.log("Tombol masuk diklik!");
         //   handleLogin(e);
      //  });
  //  } else {
      //  console.error("Gawat! Form login (loginFormElement) tidak ditemukan di HTML!");
  //  }

//}
    
    // ... sisa kode lainnya

    
    // Register Form
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    // Create Job Form
    const createJobForm = document.getElementById('createJobForm');
    if (createJobForm) createJobForm.addEventListener('submit', handleCreateJob);
    
    // Search Input
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
    
    signInWithEmailAndPassword(auth, email, password)
      //  auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            showNotification('Berhasil masuk!');
            document.getElementById('loginFormElement').reset();
            showMainApp();
        })
        .catch(error => {
            console.error('Login error:', error);
          //  showNotification('Email atau password salah');
            showNotification('Gagal masuk: ' + error.message);
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
    
    createUserWithEmailAndPassword(auth, email, password)
      //  auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const uid = userCredential.user.uid;
            // Generate avatar using initials
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
    
    setDoc(doc(db, 'users', uid), userData)
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
    signOut(auth)
      //  auth.signOut()
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
    
    addDoc(collection(db, 'jobs'), jobData)
        .then(docRef => {
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
  //  const jobsQuery = query(
      //  collection(db, 'jobs'),
     //   where('status', '==', 'open')
  //  );

    const jobsQuery = collection(db, 'jobs').where('status', '==', 'open');
    
    // Unsubscribe from previous listener if exists
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
    
    unsubscribeFunctions.push(feedUnsubscribe);
}

// Create Job Card
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

// View Job Detail
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
    
   // const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'open'));
    const jobsQuery = collection(db, 'jobs').where('status', '==', 'open');
    
    getDocs(jobsQuery)
        .then(snapshot => {
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';
            
            let found = false;
            
            snapshot.docs.forEach(docSnap => {
                const job = { id: docSnap.id, ...docSnap.data() };
                
                // Filter by title, description, location, or category
                if (job.title.toLowerCase().includes(searchTerm) ||
                    job.description.toLowerCase().includes(searchTerm) ||
                    job.location.toLowerCase().includes(searchTerm) ||
                    job.category.toLowerCase().includes(searchTerm)) {
                    searchResults.appendChild(createJobCard(job));
                    found = true;
                }
            });
            
            if (!found && searchTerm.length > 0) {
                searchResults.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>Tidak ada hasil</p></div>';
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            showNotification('Gagal mencari jasa');
        });
}

// Profile Functions
function loadProfile() {
    const userDoc = doc(db, 'users', currentUser.uid);
    
    const profileUnsub = onSnapshot(userDoc, (docSnap) => {
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
            renderProfile();
        }
    });
    
    unsubscribeFunctions.push(profileUnsub);
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

// Page Navigation
function showPage(pageName, event) {
    if (event) event.preventDefault();
    
    closeSidebar();
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    
    // Show selected page
    switch(pageName) {
        case 'home':
            document.getElementById('homePage').style.display = 'block';
            loadHomeFeed();
            break;
        case 'createJob':
            document.getElementById('createJobPage').style.display = 'block';
            break;
        case 'searchJob':
            document.getElementById('searchJobPage').style.display = 'block';
            document.getElementById('searchInput').value = '';
            document.getElementById('searchResults').innerHTML = '';
            break;
        case 'profile':
            document.getElementById('profilePage').style.display = 'block';
            loadProfile();
            break;
    }
}

// Sidebar Navigation
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

// Show/Hide Main App
function showMainApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    showPage('home');
}

function showAuthSection() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
}

// Utility Functions
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
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
