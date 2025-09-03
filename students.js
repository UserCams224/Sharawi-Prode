// Students Component
class Students {
    constructor() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.editingStudent = null;
    }

    async init() {
        await this.loadStudents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterAndDisplayStudents();
            });
        }

        // Class filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.class;
                this.filterAndDisplayStudents();
            });
        });

        // Add student button
        document.getElementById('add-student-btn')?.addEventListener('click', () => {
            this.showAddStudentModal();
        });

        // Photo upload preview
        document.getElementById('student-photo')?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
    }

    async loadStudents() {
        try {
            this.students = await Database.getAllStudents();
            this.filterAndDisplayStudents();
        } catch (error) {
            console.error('Failed to load students:', error);
            app.showToast('Erreur lors du chargement des étudiants', 'error');
        }
    }

    filterAndDisplayStudents() {
        let filteredStudents = this.students;

        // Apply class filter
        if (this.currentFilter && this.currentFilter !== 'all') {
            filteredStudents = filteredStudents.filter(student => 
                student.classe === this.currentFilter
            );
        }

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredStudents = filteredStudents.filter(student =>
                student.firstName.toLowerCase().includes(query) ||
                student.lastName.toLowerCase().includes(query) ||
                student.id.toLowerCase().includes(query)
            );
        }

        this.displayStudents(filteredStudents);
    }

    displayStudents(students) {
        const container = document.getElementById('students-grid');
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="icon empty-icon">
                        <use href="assets/icons.svg#users"></use>
                    </svg>
                    <h3>Aucun étudiant trouvé</h3>
                    <p>Commencez par ajouter votre premier étudiant.</p>
                    <button class="btn btn-primary" onclick="app.components.students.showAddStudentModal()">
                        <svg class="icon">
                            <use href="assets/icons.svg#user-plus"></use>
                        </svg>
                        Ajouter un étudiant
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => this.createStudentCard(student)).join('');
    }

    createStudentCard(student) {
        const photoSrc = student.photo || 'assets/icons.svg#user';
        const birthDate = new Date(student.birthDate).toLocaleDateString('fr-FR');
        const registrationDate = new Date(student.createdAt).toLocaleDateString('fr-FR');

        return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    ${student.photo ? 
                        `<img src="${student.photo}" alt="${student.firstName}" class="student-photo">` :
                        `<div class="student-photo">
                            <svg class="icon">
                                <use href="assets/icons.svg#user"></use>
                            </svg>
                        </div>`
                    }
                    <div class="student-info">
                        <h3>${student.firstName} ${student.lastName}</h3>
                        <div class="student-id">${student.id}</div>
                    </div>
                </div>
                
                <div class="student-details">
                    <div class="detail-row">
                        <span class="detail-label">Classe:</span>
                        <span class="detail-value">
                            <span class="class-badge">${student.classe}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date de naissance:</span>
                        <span class="detail-value">${birthDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Inscription:</span>
                        <span class="detail-value">${registrationDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Frais d'inscription:</span>
                        <span class="detail-value">${this.formatCurrency(student.inscriptionFee)}</span>
                    </div>
                </div>
                
                <div class="student-actions">
                    <button class="btn btn-secondary btn-small" onclick="app.components.students.editStudent('${student.id}')">
                        <svg class="icon">
                            <use href="assets/icons.svg#edit"></use>
                        </svg>
                        Modifier
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.components.students.deleteStudent('${student.id}')">
                        <svg class="icon">
                            <use href="assets/icons.svg#trash"></use>
                        </svg>
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    showAddStudentModal() {
        this.editingStudent = null;
        document.getElementById('student-modal-title').textContent = 'Ajouter un étudiant';
        document.getElementById('student-form').reset();
        document.getElementById('photo-preview').innerHTML = '';
        app.showModal('student-modal');
    }

    async editStudent(studentId) {
        try {
            const student = await Database.getStudent(studentId);
            if (!student) {
                app.showToast('Étudiant non trouvé', 'error');
                return;
            }

            this.editingStudent = student;
            document.getElementById('student-modal-title').textContent = 'Modifier l\'étudiant';
            
            // Fill form with student data
            document.getElementById('student-firstname').value = student.firstName;
            document.getElementById('student-lastname').value = student.lastName;
            document.getElementById('student-birthdate').value = student.birthDate;
            document.getElementById('student-class').value = student.classe;
            document.getElementById('inscription-fee').value = student.inscriptionFee;
            
            // Show photo preview if exists
            const photoPreview = document.getElementById('photo-preview');
            if (student.photo) {
                photoPreview.innerHTML = `
                    <img src="${student.photo}" alt="Photo de ${student.firstName}">
                `;
            } else {
                photoPreview.innerHTML = '';
            }
            
            app.showModal('student-modal');
        } catch (error) {
            console.error('Failed to load student for editing:', error);
            app.showToast('Erreur lors du chargement de l\'étudiant', 'error');
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action supprimera également tous ses paiements.')) {
            return;
        }

        try {
            await Database.deleteStudent(studentId);
            await this.loadStudents();
            app.showToast('Étudiant supprimé avec succès', 'success');
            
            // Update dashboard if needed
            if (app.components.dashboard) {
                app.components.dashboard.updateStats();
            }
        } catch (error) {
            console.error('Failed to delete student:', error);
            app.showToast('Erreur lors de la suppression de l\'étudiant', 'error');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const photoFile = document.getElementById('student-photo').files[0];
        
        try {
            const studentData = {
                firstName: formData.get('student-firstname') || document.getElementById('student-firstname').value,
                lastName: formData.get('student-lastname') || document.getElementById('student-lastname').value,
                birthDate: formData.get('student-birthdate') || document.getElementById('student-birthdate').value,
                classe: formData.get('student-class') || document.getElementById('student-class').value,
                inscriptionFee: parseFloat(document.getElementById('inscription-fee').value) || 0,
                photo: this.editingStudent?.photo || '', // Keep existing photo if editing
                createdAt: this.editingStudent?.createdAt || new Date().toISOString()
            };

            // Generate ID for new student
            if (!this.editingStudent) {
                studentData.id = Database.generateStudentId(studentData.firstName, studentData.classe);
            } else {
                studentData.id = this.editingStudent.id;
            }

            // Handle photo upload
            if (photoFile) {
                studentData.photo = await this.convertToBase64(photoFile);
            }

            // Validate required fields
            if (!studentData.firstName || !studentData.lastName || !studentData.birthDate || !studentData.classe) {
                app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            // Save student
            if (this.editingStudent) {
                await Database.updateStudent(studentData);
                app.showToast('Étudiant modifié avec succès', 'success');
            } else {
                await Database.addStudent(studentData);
                app.showToast('Étudiant ajouté avec succès', 'success');
            }

            // Refresh display
            await this.loadStudents();
            app.closeModal('student-modal');
            
            // Update dashboard stats
            if (app.components.dashboard) {
                app.components.dashboard.updateStats();
            }
            
        } catch (error) {
            console.error('Failed to save student:', error);
            app.showToast('Erreur lors de l\'enregistrement de l\'étudiant', 'error');
        }
    }

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            app.showToast('Veuillez sélectionner un fichier image', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            app.showToast('La taille de l\'image ne doit pas dépasser 5MB', 'error');
            return;
        }

        try {
            const base64 = await this.convertToBase64(file);
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.innerHTML = `
                <img src="${base64}" alt="Aperçu de la photo">
            `;
        } catch (error) {
            console.error('Failed to process photo:', error);
            app.showToast('Erreur lors du traitement de l\'image', 'error');
        }
    }

    convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    // Public methods for external access
    async getStudentById(id) {
        return await Database.getStudent(id);
    }

    async getAllStudents() {
        return await Database.getAllStudents();
    }
}
