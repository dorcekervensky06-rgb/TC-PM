// ===== GLOBAL VARIABLES =====
let currentUser = null;
let currentCourse = null;
const MAX_COURSES = 10;

// ===== AUTH FUNCTIONS =====
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        tabBtns[0].classList.add('active');
        tabBtns[1].classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        tabBtns[1].classList.add('active');
        tabBtns[0].classList.remove('active');
    }
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
        errorEl.textContent = 'Veuillez remplir tous les champs';
        return;
    }

    showLoading(true);
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            currentUser = user.user;
            updateUI();
            showLoading(false);
        })
        .catch(error => {
            errorEl.textContent = 'Email ou mot de passe incorrect';
            showLoading(false);
        });
}

function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    const errorEl = document.getElementById('registerError');

    if (!email || !password || !confirm) {
        errorEl.textContent = 'Veuillez remplir tous les champs';
        return;
    }

    if (password !== confirm) {
        errorEl.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = 'Le mot de passe doit avoir au moins 6 caractères';
        return;
    }

    showLoading(true);
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            currentUser = user.user;
            updateUI();
            showLoading(false);
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                errorEl.textContent = 'Cet email est déjà utilisé';
            } else if (error.code === 'auth/invalid-email') {
                errorEl.textContent = 'Email invalide';
            } else {
                errorEl.textContent = 'Erreur lors de l\'inscription';
            }
            showLoading(false);
        });
}

function logout() {
    firebase.auth().signOut()
        .then(() => {
            currentUser = null;
            currentCourse = null;
            updateUI();
        });
}

// ===== UI UPDATE =====
function updateUI() {
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    const userEmail = document.getElementById('userEmail');

    if (currentUser) {
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        userEmail.textContent = currentUser.email;
        loadCourses();
    } else {
        authSection.style.display = 'flex';
        appSection.style.display = 'none';
        userEmail.textContent = '';
    }
}

// ===== COURSE FUNCTIONS =====
function addCourse() {
    const form = document.getElementById('addCourseForm');
    const courseContent = document.getElementById('courseContent');
    const emptyState = document.getElementById('emptyState');

    form.style.display = 'block';
    courseContent.style.display = 'none';
    emptyState.style.display = 'none';
    document.getElementById('courseName').focus();
}

function cancelAddCourse() {
    document.getElementById('addCourseForm').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('courseName').value = '';
}

function saveCourse() {
    const courseName = document.getElementById('courseName').value;
    const errorEl = document.getElementById('loginError');

    if (!courseName.trim()) {
        alert('Veuillez entrer un nom de cours');
        return;
    }

    showLoading(true);
    const db = firebase.firestore();
    const courseData = {
        userId: currentUser.uid,
        name: courseName,
        createdAt: new Date().toISOString(),
        recordings: []
    };

    db.collection('courses').add(courseData)
        .then(docRef => {
            currentCourse = {
                id: docRef.id,
                ...courseData
            };
            document.getElementById('courseName').value = '';
            document.getElementById('addCourseForm').style.display = 'none';
            loadCourses();
            showCourseContent();
            showLoading(false);
        })
        .catch(error => {
            alert('Erreur lors de la création du cours');
            showLoading(false);
        });
}

function loadCourses() {
    if (!currentUser) return;

    const db = firebase.firestore();
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    db.collection('courses')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(MAX_COURSES)
        .onSnapshot(snapshot => {
            coursesList.innerHTML = '';
            if (snapshot.empty) {
                coursesList.innerHTML = '<p style="color: #7a8fa3; font-size: 0.9rem;">Aucun cours</p>';
                return;
            }

            snapshot.forEach(doc => {
                const course = { id: doc.id, ...doc.data() };
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';
                if (currentCourse && currentCourse.id === course.id) {
                    courseItem.classList.add('active');
                }
                courseItem.textContent = course.name;
                courseItem.onclick = () => selectCourse(course);
                coursesList.appendChild(courseItem);
            });
        });
}

function selectCourse(course) {
    currentCourse = course;
    loadCourses();
    showCourseContent();
}

function showCourseContent() {
    const form = document.getElementById('addCourseForm');
    const courseContent = document.getElementById('courseContent');
    const emptyState = document.getElementById('emptyState');

    form.style.display = 'none';
    courseContent.style.display = 'block';
    emptyState.style.display = 'none';

    document.getElementById('courseTitle').textContent = currentCourse.name;
    document.getElementById('recordingDate').valueAsDate = new Date();
    loadRecordings();
}

function deleteCourse() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    showLoading(true);
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Delete associated files
    if (currentCourse.recordings && currentCourse.recordings.length > 0) {
        currentCourse.recordings.forEach(rec => {
            if (rec.fileUrl) {
                try {
                    storage.refFromURL(rec.fileUrl).delete();
                } catch (e) {
                    console.log('File not found:', e);
                }
            }
        });
    }

    db.collection('courses').doc(currentCourse.id).delete()
        .then(() => {
            currentCourse = null;
            loadCourses();
            document.getElementById('courseContent').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
            showLoading(false);
        })
        .catch(error => {
            alert('Erreur lors de la suppression');
            showLoading(false);
        });
}

// ===== RECORDING FUNCTIONS =====
function toggleRecordingType() {
    const type = document.querySelector('input[name="recordingType"]:checked').value;
    const uploadSection = document.getElementById('uploadSection');
    const linkSection = document.getElementById('linkSection');

    if (type === 'upload') {
        uploadSection.style.display = 'block';
        linkSection.style.display = 'none';
    } else {
        uploadSection.style.display = 'none';
        linkSection.style.display = 'block';
    }
}

function addRecording() {
    const type = document.querySelector('input[name="recordingType"]:checked').value;
    const chapterName = document.getElementById('chapterName').value;
    const recordingDate = document.getElementById('recordingDate').value;

    if (!chapterName.trim()) {
        alert('Veuillez entrer un nom de chapitre');
        return;
    }

    if (!recordingDate) {
        alert('Veuillez sélectionner une date');
        return;
    }

    if (type === 'upload') {
        addUploadedRecording();
    } else {
        addLinkRecording();
    }
}

function addUploadedRecording() {
    const audioFile = document.getElementById('audioFile').files[0];
    const chapterName = document.getElementById('chapterName').value;
    const recordingDate = document.getElementById('recordingDate').value;

    if (!audioFile) {
        alert('Veuillez sélectionner un fichier audio');
        return;
    }

    showLoading(true);
    const storage = firebase.storage();
    const fileName = `${currentCourse.id}/${Date.now()}_${audioFile.name}`;
    const storageRef = storage.ref('recordings/' + fileName);

    storageRef.put(audioFile)
        .then(snapshot => {
            return snapshot.ref.getDownloadURL();
        })
        .then(downloadURL => {
            saveRecordingToDatabase(chapterName, recordingDate, downloadURL, 'file');
        })
        .catch(error => {
            alert('Erreur lors de l\'upload: ' + error.message);
            showLoading(false);
        });
}

function addLinkRecording() {
    const driveLink = document.getElementById('driveLink').value;
    const chapterName = document.getElementById('chapterName').value;
    const recordingDate = document.getElementById('recordingDate').value;

    if (!driveLink.trim()) {
        alert('Veuillez entrer un lien');
        return;
    }

    if (!driveLink.includes('drive.google.com')) {
        alert('Veuillez entrer un lien Google Drive valide');
        return;
    }

    saveRecordingToDatabase(chapterName, recordingDate, driveLink, 'link');
}

function saveRecordingToDatabase(chapterName, recordingDate, url, type) {
    const db = firebase.firestore();
    const recording = {
        chapter: chapterName,
        date: recordingDate,
        url: url,
        type: type,
        createdAt: new Date().toISOString()
    };

    db.collection('courses').doc(currentCourse.id).update({
        recordings: firebase.firestore.FieldValue.arrayUnion(recording)
    })
        .then(() => {
            document.getElementById('chapterName').value = '';
            document.getElementById('audioFile').value = '';
            document.getElementById('driveLink').value = '';
            loadRecordings();
            showLoading(false);
        })
        .catch(error => {
            alert('Erreur lors de l\'ajout de l\'enregistrement');
            showLoading(false);
        });
}

function loadRecordings() {
    if (!currentCourse) return;

    const db = firebase.firestore();
    db.collection('courses').doc(currentCourse.id).onSnapshot(doc => {
        const course = doc.data();
        const recordingsList = document.getElementById('recordingsList');
        recordingsList.innerHTML = '';

        if (!course.recordings || course.recordings.length === 0) {
            recordingsList.innerHTML = '<p style="color: #7a8fa3;">Aucun enregistrement</p>';
            return;
        }

        course.recordings.forEach((rec, index) => {
            const recordingItem = document.createElement('div');
            recordingItem.className = 'recording-item';

            const info = document.createElement('div');
            info.className = 'recording-info';
            info.innerHTML = `
                <div class="recording-chapter">📁 ${escapeHtml(rec.chapter)}</div>
                <div class="recording-date">📅 ${new Date(rec.date).toLocaleDateString('fr-FR')}</div>
            `;

            const actions = document.createElement('div');
            actions.className = 'recording-actions';

            if (rec.type === 'file') {
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'btn btn-download';
                downloadBtn.textContent = '⬇️ Télécharger';
                downloadBtn.onclick = () => downloadRecording(rec.url, rec.chapter);
                actions.appendChild(downloadBtn);
            } else {
                const linkBtn = document.createElement('a');
                linkBtn.href = rec.url;
                linkBtn.target = '_blank';
                linkBtn.className = 'btn btn-play';
                linkBtn.textContent = '🔗 Google Drive';
                actions.appendChild(linkBtn);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-delete';
            deleteBtn.textContent = '🗑️ Supprimer';
            deleteBtn.onclick = () => deleteRecording(index);
            actions.appendChild(deleteBtn);

            recordingItem.appendChild(info);
            recordingItem.appendChild(actions);
            recordingsList.appendChild(recordingItem);
        });
    });
}

function downloadRecording(url, chapterName) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(xhr.response);
        link.download = chapterName + '.mp3';
        link.click();
    };
    xhr.open('GET', url);
    xhr.send();
}

function deleteRecording(index) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) return;

    showLoading(true);
    const db = firebase.firestore();
    const recording = currentCourse.recordings[index];

    // Delete file from storage if it's an uploaded file
    if (recording.type === 'file') {
        const storage = firebase.storage();
        try {
            storage.refFromURL(recording.url).delete();
        } catch (e) {
            console.log('File not found:', e);
        }
    }

    // Remove from array
    const updatedRecordings = currentCourse.recordings.filter((_, i) => i !== index);

    db.collection('courses').doc(currentCourse.id).update({
        recordings: updatedRecordings
    })
        .then(() => {
            loadRecordings();
            showLoading(false);
        })
        .catch(error => {
            alert('Erreur lors de la suppression');
            showLoading(false);
        });
}

// ===== UTILITY FUNCTIONS =====
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== FIREBASE AUTH STATE LISTENER =====
firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    updateUI();
});

// ===== ENTER KEY SUPPORT =====
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.getElementById('authSection').style.display !== 'none') {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab === document.getElementById('loginTab')) {
                login();
            } else {
                register();
            }
        }
    }
});