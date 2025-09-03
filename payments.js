// Payments Component
class Payments {
    constructor() {
        this.payments = [];
        this.students = [];
        this.filteredPayments = [];
        this.currentFilters = {
            month: '',
            student: ''
        };
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.populateStudentDropdown();
        this.displayPayments();
    }

    async loadData() {
        try {
            this.payments = await Database.getAllPayments();
            this.students = await Database.getAllStudents();
            this.filteredPayments = [...this.payments];
        } catch (error) {
            console.error('Failed to load payments data:', error);
            app.showToast('Erreur lors du chargement des données', 'error');
        }
    }

    setupEventListeners() {
        // Add payment button
        document.getElementById('add-payment-btn')?.addEventListener('click', () => {
            this.showAddPaymentModal();
        });

        // Filter controls
        document.getElementById('payment-month-filter')?.addEventListener('change', (e) => {
            this.currentFilters.month = e.target.value;
            this.applyFilters();
        });

        document.getElementById('payment-student-filter')?.addEventListener('change', (e) => {
            this.currentFilters.student = e.target.value;
            this.applyFilters();
        });

        // Set default payment date to today
        const paymentDateInput = document.getElementById('payment-date');
        if (paymentDateInput) {
            paymentDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    showAddPaymentModal() {
        document.getElementById('payment-form').reset();
        
        // Set default date to today
        const paymentDateInput = document.getElementById('payment-date');
        if (paymentDateInput) {
            paymentDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        this.populateStudentDropdown();
        app.showModal('payment-modal');
    }

    populateStudentDropdown() {
        const select = document.getElementById('payment-student');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un étudiant</option>';
        
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.firstName} ${student.lastName} (${student.id})`;
            select.appendChild(option);
        });

        // Also populate filter dropdown
        const filterSelect = document.getElementById('payment-student-filter');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Tous les étudiants</option>';
            this.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.firstName} ${student.lastName}`;
                filterSelect.appendChild(option);
            });
        }
    }

    applyFilters() {
        this.filteredPayments = this.payments.filter(payment => {
            let matches = true;

            if (this.currentFilters.month && payment.month !== this.currentFilters.month) {
                matches = false;
            }

            if (this.currentFilters.student && payment.studentId !== this.currentFilters.student) {
                matches = false;
            }

            return matches;
        });

        this.displayPayments();
    }

    displayPayments() {
        const container = document.getElementById('payments-table');
        if (!container) return;

        if (this.filteredPayments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="icon empty-icon">
                        <use href="assets/icons.svg#credit-card"></use>
                    </svg>
                    <h3>Aucun paiement trouvé</h3>
                    <p>Commencez par enregistrer votre premier paiement.</p>
                    <button class="btn btn-primary" onclick="app.components.payments.showAddPaymentModal()">
                        <svg class="icon">
                            <use href="assets/icons.svg#plus"></use>
                        </svg>
                        Enregistrer un paiement
                    </button>
                </div>
            `;
            return;
        }

        // Sort payments by date (newest first)
        const sortedPayments = [...this.filteredPayments].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Étudiant</th>
                        <th>Montant</th>
                        <th>Mois</th>
                        <th>Motif</th>
                        <th>Date de paiement</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedPayments.map(payment => this.createPaymentRow(payment)).join('')}
                </tbody>
            </table>
        `;
    }

    createPaymentRow(payment) {
        const student = this.students.find(s => s.id === payment.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu';
        const formattedAmount = this.formatCurrency(payment.amount);
        const formattedDate = new Date(payment.date).toLocaleDateString('fr-FR');

        return `
            <tr data-payment-id="${payment.id}">
                <td>
                    <div class="student-info">
                        <strong>${studentName}</strong>
                        ${student ? `<br><small class="text-secondary">${student.id}</small>` : ''}
                    </div>
                </td>
                <td>
                    <strong class="amount">${formattedAmount}</strong>
                </td>
                <td>
                    <span class="month-badge">${payment.month}</span>
                </td>
                <td>${payment.reason}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-small" onclick="app.components.payments.editPayment('${payment.id}')" title="Modifier">
                            <svg class="icon">
                                <use href="assets/icons.svg#edit"></use>
                            </svg>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="app.components.payments.deletePayment('${payment.id}')" title="Supprimer">
                            <svg class="icon">
                                <use href="assets/icons.svg#trash"></use>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const paymentData = {
                id: Database.generatePaymentId(),
                studentId: document.getElementById('payment-student').value,
                amount: parseFloat(document.getElementById('payment-amount').value) || 0,
                month: document.getElementById('payment-month').value,
                reason: document.getElementById('payment-reason').value,
                date: document.getElementById('payment-date').value,
                createdAt: new Date().toISOString()
            };

            // Validate required fields
            if (!paymentData.studentId || !paymentData.amount || !paymentData.month || 
                !paymentData.reason || !paymentData.date) {
                app.showToast('Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }

            // Validate amount
            if (paymentData.amount <= 0) {
                app.showToast('Le montant doit être supérieur à zéro', 'error');
                return;
            }

            // Check if student exists
            const student = this.students.find(s => s.id === paymentData.studentId);
            if (!student) {
                app.showToast('Étudiant sélectionné non valide', 'error');
                return;
            }

            // Save payment
            await Database.addPayment(paymentData);
            
            // Refresh data and display
            await this.loadData();
            this.applyFilters();
            
            app.closeModal('payment-modal');
            app.showToast('Paiement enregistré avec succès', 'success');
            
            // Update dashboard stats
            if (app.components.dashboard) {
                app.components.dashboard.updateStats();
            }
            
        } catch (error) {
            console.error('Failed to save payment:', error);
            app.showToast('Erreur lors de l\'enregistrement du paiement', 'error');
        }
    }

    async editPayment(paymentId) {
        try {
            const payment = await Database.getPayment(paymentId);
            if (!payment) {
                app.showToast('Paiement non trouvé', 'error');
                return;
            }

            // Fill form with payment data
            document.getElementById('payment-student').value = payment.studentId;
            document.getElementById('payment-amount').value = payment.amount;
            document.getElementById('payment-month').value = payment.month;
            document.getElementById('payment-reason').value = payment.reason;
            document.getElementById('payment-date').value = payment.date;
            
            // Store original payment ID for update
            document.getElementById('payment-form').dataset.editingId = payment.id;
            
            app.showModal('payment-modal');
        } catch (error) {
            console.error('Failed to load payment for editing:', error);
            app.showToast('Erreur lors du chargement du paiement', 'error');
        }
    }

    async deletePayment(paymentId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
            return;
        }

        try {
            await Database.deletePayment(paymentId);
            await this.loadData();
            this.applyFilters();
            app.showToast('Paiement supprimé avec succès', 'success');
            
            // Update dashboard stats
            if (app.components.dashboard) {
                app.components.dashboard.updateStats();
            }
        } catch (error) {
            console.error('Failed to delete payment:', error);
            app.showToast('Erreur lors de la suppression du paiement', 'error');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    // Statistics methods
    async getTotalRevenue() {
        const total = this.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        return total;
    }

    async getMonthlyRevenue(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
        const monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        const targetMonth = monthNames[month - 1];
        const currentYear = year;
        
        const monthlyPayments = this.payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            const paymentYear = paymentDate.getFullYear();
            return payment.month === targetMonth && paymentYear === currentYear;
        });
        
        return monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }

    async getRecentPayments(limit = 5) {
        return [...this.payments]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    // Public methods for external access
    async getPaymentsByStudent(studentId) {
        return this.payments.filter(payment => payment.studentId === studentId);
    }

    async refreshData() {
        await this.loadData();
        this.applyFilters();
    }
}
