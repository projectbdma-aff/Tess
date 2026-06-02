// Get Firebase Services
const {
    auth,
    db,
    getDoc,
    doc,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp,
    onAuthStateChanged
} = window.firebaseServices;

let currentUser = null;
let jobId = null;
let jobData = null;
let currentUserData = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndLoadJob();
});

function checkAuthAndLoadJob() {
    onAuthStateChanged(auth, user => {
        if (user) {
            currentUser = user;
            jobId = getJobIdFromURL();
            if (jobId) {
                loadJobDetail();
                loadUserData();
            } else {
                showNotification('ID Jasa tidak ditemukan');
                setTimeout(() => window.location.href = 'index.html', 1500);
            }
        } else {
            showNotification('Silakan login terlebih dahulu');
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    });
}

function getJobIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function loadUserData() {
    const userDoc = doc(db, 'users', currentUser.uid);
    getDoc(userDoc).then(docSnap => {
        if (docSnap.exists()) {
            currentUserData = docSnap.data();
        }
    });
}

function loadJobDetail() {
    const jobDoc = doc(db, 'jobs', jobId);
    
    onSnapshot(jobDoc, (docSnap) => {
        if (docSnap.exists()) {
            jobData = { id: docSnap.id, ...docSnap.data() };
            renderJobDetail();
            if (currentUser.uid === jobData.userId && jobData.status === 'open') {
                loadApplicantsList();
            }
        } else {
            showNotification('Jasa tidak ditemukan');
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    }, (error) => {
        console.error('Error loading job:', error);
        showNotification('Gagal memuat jasa');
    });
}

function renderJobDetail() {
    const detailContent = document.getElementById('detailContent');
    
    const rating = jobData.userRating ? jobData.userRating.toFixed(1) : '0';
    const verifyBadge = jobData.isVerified ? '✔️' : '';
    const premiumBadge = jobData.isPremium ? '🥇' : '';
    const isOwner = currentUser.uid === jobData.userId;
    const isClosed = jobData.status === 'closed';
    
    let actionButton = '';
    
    if (isOwner) {
        if (isClosed && jobData.selectedWorkerId) {
            actionButton = `
                <button class="btn btn-secondary btn-block" onclick="openWhatsApp('${jobData.selectedWorkerId}')">Hubungi via WhatsApp</button>
            `;
        } else if (!isClosed) {
            actionButton = `
                <div id="applicantsList" class="applicants-list"></div>
            `;
        }
    } else {
        if (!isClosed) {
            actionButton = `
                <button class="btn btn-primary btn-block" onclick="applyJob()">Lamar Jasa Ini</button>
            `;
        } else {
            actionButton = `<div class="status-badge closed">✓ Jasa Ditutup</div>`;
        }
    }
    
    detailContent.innerHTML = `
        <div class="job-detail">
            <!-- User Info -->
            <div class="job-detail-user">
                <img src="${jobData.userPhoto}" alt="${jobData.userName}" class="detail-avatar">
                <div class="detail-user-info">
                    <h2>${jobData.userName} ${verifyBadge} ${premiumBadge}</h2>
                    <p class="detail-rating">⭐ ${rating}</p>
                    <p class="detail-category">${getCategoryLabel(jobData.category)}</p>
                </div>
            </div>
            
            <!-- Job Info -->
            <div class="job-detail-section">
                <h3>${jobData.title}</h3>
                <p class="job-detail-description">${jobData.description}</p>
            </div>
            
            <!-- Job Details -->
            <div class="job-detail-section">
                <div class="detail-row">
                    <span class="detail-label">💰 Harga</span>
                    <span class="detail-value">Rp ${jobData.price.toLocaleString('id-ID')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📍 Lokasi</span>
                    <span class="detail-value">${jobData.location}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Dibuat</span>
                    <span class="detail-value">${formatDate(jobData.createdAt)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">👥 Pelamar</span>
                    <span class="detail-value">${jobData.totalApplicants} orang</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📊 Status</span>
                    <span class="detail-value ${isClosed ? 'status-closed' : 'status-open'}">
                        ${isClosed ? '🔒 Ditutup' : '🟢 Dibuka'}
                    </span>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="job-detail-actions">
                ${actionButton}
            </div>
        </div>
    `;
}

function loadApplicantsList() {
    const applicantsQuery = query(
        collection(db, 'jobs', jobId, 'applicants')
    );
    
    getDocs(applicantsQuery)
        .then(snapshot => {
            const applicantsList = document.getElementById('applicantsList');
            if (!applicantsList) return;
            
            applicantsList.innerHTML = '<h4>📋 Daftar Pelamar</h4>';
            
            if (snapshot.empty) {
                applicantsList.innerHTML += '<p class="empty-text">Belum ada pelamar</p>';
                return;
            }
            
            snapshot.docs.forEach(docSnap => {
                const applicant = docSnap.data();
                const applicantCard = document.createElement('div');
                applicantCard.className = 'applicant-card';
                
                applicantCard.innerHTML = `
                    <div class="applicant-info">
                        <img src="${applicant.workerPhoto}" alt="${applicant.workerName}" class="applicant-avatar">
                        <div>
                            <p class="applicant-name">${applicant.workerName}</p>
                            <p class="applicant-rating">⭐ ${applicant.workerRating || '0'}</p>
                        </div>
                    </div>
                    <button class="btn btn-small" onclick="selectWorker('${docSnap.id}', '${applicant.workerId}', '${applicant.whatsapp}')">Pilih</button>
                `;
                
                applicantsList.appendChild(applicantCard);
            });
        })
        .catch(error => {
            console.error('Error loading applicants:', error);
            showNotification('Gagal memuat daftar pelamar');
        });
}

function applyJob() {
    if (!currentUserData) {
        showNotification('Data profil tidak ditemukan');
        return;
    }
    
    showLoading(true);
    
    const applicationData = {
        workerId: currentUser.uid,
        workerName: currentUserData.name,
        workerPhoto: currentUserData.photo,
        workerRating: currentUserData.averageRating || 0,
        whatsapp: currentUserData.whatsapp,
        createdAt: serverTimestamp()
    };
    
    addDoc(collection(db, 'jobs', jobId, 'applicants'), applicationData)
        .then(() => {
            // Update total applicants
            updateDoc(doc(db, 'jobs', jobId), {
                totalApplicants: (jobData.totalApplicants || 0) + 1
            }).then(() => {
                showNotification('Berhasil melamar jasa ini!');
            });
        })
        .catch(error => {
            console.error('Apply error:', error);
            showNotification('Gagal melamar jasa');
        })
        .finally(() => showLoading(false));
}

function selectWorker(applicantId, workerId, whatsapp) {
    showLoading(true);
    
    updateDoc(doc(db, 'jobs', jobId), {
        status: 'closed',
        selectedWorkerId: workerId
    })
    .then(() => {
        showNotification('Pelamar dipilih!');
        // Redirect to open WhatsApp
        setTimeout(() => {
            openWhatsApp(workerId);
        }, 1000);
    })
    .catch(error => {
        console.error('Select worker error:', error);
        showNotification('Gagal memilih pelamar');
    })
    .finally(() => showLoading(false));
}

function openWhatsApp(userId) {
    // Get worker's WhatsApp number
    const userDoc = doc(db, 'users', userId);
    getDoc(userDoc)
        .then(docSnap => {
            if (docSnap.exists()) {
                const whatsapp = docSnap.data().whatsapp;
                const message = encodeURIComponent(`Halo, saya tertarik dengan jasa Anda: "${jobData.title}"`);
                const waLink = `https://wa.me/${whatsapp}?text=${message}`;
                window.open(waLink, '_blank');
            }
        })
        .catch(error => {
            console.error('Error getting worker data:', error);
            showNotification('Gagal membuka WhatsApp');
        });
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

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}