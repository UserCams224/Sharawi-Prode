// Dashboard Component
class Dashboard {
    constructor() {
        this.stats = {
            totalStudents: 0,
            totalRevenue: 0,
            monthlyRevenue: 0
        };
        this.recentActivities = [];
    }

    async init() {
        await this.updateStats();
        await this.loadRecentActivities();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Quick action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    async updateStats() {
        try {
            // Get total students
            this.stats.totalStudents = await Database.getStudentCount();
            
            // Get total revenue (including inscription fees)
            this.stats.totalRevenue = await Database.getTotalRevenue();
            
            // Get current month revenue
            const now = new Date();
            this.stats.monthlyRevenue = await Database.getMonthlyRevenue(
                now.getFullYear(),
                now.getMonth() + 1
            );

            this.displayStats();
        } catch (error) {
            console.error('Failed to update stats:', error);
            app.showToast('Erreur lors de la mise à jour des statistiques', 'error');
        }
    }

    displayStats() {
        // Update total students
        const totalStudentsEl = document.getElementById('total-students');
        if (totalStudentsEl) {
            totalStudentsEl.textContent = this.stats.totalStudents.toLocaleString('fr-FR');
        }

        // Update total revenue
        const totalRevenueEl = document.getElementById('total-revenue');
        if (totalRevenueEl) {
            totalRevenueEl.textContent = this.formatCurrency(this.stats.totalRevenue);
        }

        // Update monthly revenue
        const monthlyRevenueEl = document.getElementById('monthly-revenue');
        if (monthlyRevenueEl) {
            monthlyRevenueEl.textContent = this.formatCurrency(this.stats.monthlyRevenue);
        }
    }

    async loadRecentActivities() {
        try {
            this.recentActivities = await Database.getRecentActivities(10);
            this.displayRecentActivities();
        } catch (error) {
            console.error('Failed to load recent activities:', error);
            app.showToast('Erreur lors du chargement des activités récentes', 'error');
        }
    }

    displayRecentActivities() {
        const container = document.getElementById('recent-activities-list');
        if (!container) return;

        if (this.recentActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="icon">
                        <use href="assets/icons.svg#activity"></use>
                    </svg>
                    <p>Aucune activité récente</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentActivities
            .map(activity => this.createActivityItem(activity))
            .join('');
    }

    createActivityItem(activity) {
        const date = new Date(activity.date);
        const timeAgo = this.formatTimeAgo(date);
        
        let icon, description;
        
        switch (activity.type) {
            case 'registration':
                icon = 'user-plus';
                description = `Nouvel étudiant inscrit : ${activity.studentName}`;
                break;
            case 'payment':
                icon = 'credit-card';
                const amount = this.formatCurrency(activity.data.amount);
                description = `Paiement reçu de ${activity.studentName} : ${amount}`;
                break;
            default:
                icon = 'activity';
                description = 'Activité inconnue';
        }

        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <svg class="icon">
                        <use href="assets/icons.svg#${icon}"></use>
                    </svg>
                </div>
                <div class="activity-content">
                    <p>${description}</p>
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-student':
                app.showModal('student-modal');
                break;
            case 'add-payment':
                if (app.components.payments) {
                    app.components.payments.populateStudentDropdown();
                }
                app.showModal('payment-modal');
                break;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Il y a quelques secondes';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }

    // Advanced statistics methods
    async getClassDistribution() {
        try {
            const distribution = await Database.getStudentCountByClass();
            return distribution;
        } catch (error) {
            console.error('Failed to get class distribution:', error);
            return { A1: 0, A2: 0, B1: 0, B2: 0 };
        }
    }

    async getRevenueByMonth(year = new Date().getFullYear()) {
        try {
            const revenueByMonth = {};
            const monthNames = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ];

            for (let month = 1; month <= 12; month++) {
                const monthName = monthNames[month - 1];
                const revenue = await Database.getMonthlyRevenue(year, month);
                revenueByMonth[monthName] = revenue;
            }

            return revenueByMonth;
        } catch (error) {
            console.error('Failed to get revenue by month:', error);
            return {};
        }
    }

    async getPaymentTrends() {
        try {
            const payments = await Database.getAllPayments();
            const trends = {};
            
            payments.forEach(payment => {
                const date = new Date(payment.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!trends[monthKey]) {
                    trends[monthKey] = {
                        count: 0,
                        total: 0
                    };
                }
                
                trends[monthKey].count++;
                trends[monthKey].total += payment.amount || 0;
            });
            
            return trends;
        } catch (error) {
            console.error('Failed to get payment trends:', error);
            return {};
        }
    }

    // Export functionality
    async exportReport() {
        try {
            const data = await Database.exportData();
            const stats = {
                totalStudents: this.stats.totalStudents,
                totalRevenue: this.stats.totalRevenue,
                monthlyRevenue: this.stats.monthlyRevenue,
                classDistribution: await this.getClassDistribution(),
                revenueByMonth: await this.getRevenueByMonth(),
                paymentTrends: await this.getPaymentTrends()
            };

            const report = {
                ...data,
                statistics: stats,
                reportGeneratedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ilc-institut-rapport-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            app.showToast('Rapport exporté avec succès', 'success');
        } catch (error) {
            console.error('Failed to export report:', error);
            app.showToast('Erreur lors de l\'export du rapport', 'error');
        }
    }

    // Public method to refresh dashboard
    async refresh() {
        await this.updateStats();
        await this.loadRecentActivities();
    }
}
