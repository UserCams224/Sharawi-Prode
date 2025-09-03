// Settings Component
class Settings {
    constructor() {
        this.settings = {
            language: 'fr',
            theme: 'light',
            notifications: true
        };
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
    }

    async loadSettings() {
        try {
            this.settings = await Database.getSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Use default settings
            this.settings = {
                language: 'fr',
                theme: 'light',
                notifications: true
            };
        }
    }

    setupEventListeners() {
        // Language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                await this.updateLanguage(e.target.value);
            });
        }

        // Theme radio buttons
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.updateTheme(e.target.value);
                }
            });
        });

        // Notifications toggle
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.updateNotifications(e.target.checked);
            });
        }

        // Update offline status
        this.updateOfflineStatus();
    }

    updateUI() {
        // Set language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.settings.language || 'fr';
        }

        // Set theme radio buttons
        const themeRadio = document.querySelector(`input[name="theme"][value="${this.settings.theme || 'light'}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }

        // Set notifications toggle
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.checked = this.settings.notifications !== false;
        }
    }

    async updateLanguage(language) {
        try {
            this.settings.language = language;
            await this.saveSettings();
            
            // Apply language change
            await app.applyLanguage(language);
            
            app.showToast('Langue mise à jour', 'success');
        } catch (error) {
            console.error('Failed to update language:', error);
            app.showToast('Erreur lors de la mise à jour de la langue', 'error');
        }
    }

    updateTheme(theme) {
        try {
            this.settings.theme = theme;
            this.saveSettings();
            
            // Apply theme change
            app.applyTheme(theme);
            
            app.showToast('Thème mis à jour', 'success');
        } catch (error) {
            console.error('Failed to update theme:', error);
            app.showToast('Erreur lors de la mise à jour du thème', 'error');
        }
    }

    updateNotifications(enabled) {
        try {
            this.settings.notifications = enabled;
            this.saveSettings();
            
            if (enabled) {
                this.requestNotificationPermission();
                app.showToast('Notifications activées', 'success');
            } else {
                app.showToast('Notifications désactivées', 'success');
            }
        } catch (error) {
            console.error('Failed to update notifications:', error);
            app.showToast('Erreur lors de la mise à jour des notifications', 'error');
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window && this.settings.notifications) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                } else {
                    console.log('Notification permission denied');
                    this.settings.notifications = false;
                    await this.saveSettings();
                    this.updateUI();
                }
            } catch (error) {
                console.error('Failed to request notification permission:', error);
            }
        }
    }

    updateOfflineStatus() {
        const offlineStatus = document.getElementById('offline-status');
        if (offlineStatus) {
            const isOffline = !navigator.onLine;
            offlineStatus.textContent = isOffline ? 'Hors ligne' : 'En ligne';
            offlineStatus.style.color = isOffline ? 'var(--warning)' : 'var(--success)';
        }
    }

    async saveSettings() {
        try {
            await Database.updateSettings(this.settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
            throw error;
        }
    }

    // Data management methods
    async exportData() {
        try {
            const data = await Database.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ilc-institut-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            app.showToast('Données exportées avec succès', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            app.showToast('Erreur lors de l\'export des données', 'error');
        }
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Validate data structure
                if (!data.students || !data.payments) {
                    throw new Error('Format de fichier invalide');
                }
                
                const confirmed = confirm(
                    'Êtes-vous sûr de vouloir importer ces données ? ' +
                    'Cela remplacera toutes les données existantes.'
                );
                
                if (confirmed) {
                    await Database.importData(data);
                    app.showToast('Données importées avec succès', 'success');
                    
                    // Refresh all components
                    if (app.components.students) await app.components.students.loadStudents();
                    if (app.components.payments) await app.components.payments.refreshData();
                    if (app.components.dashboard) await app.components.dashboard.refresh();
                }
            } catch (error) {
                console.error('Failed to import data:', error);
                app.showToast('Erreur lors de l\'import des données', 'error');
            }
        };
        
        input.click();
    }

    async clearAllData() {
        const confirmed = confirm(
            'Êtes-vous sûr de vouloir supprimer toutes les données ? ' +
            'Cette action est irréversible.'
        );
        
        if (confirmed) {
            const doubleConfirmed = confirm(
                'Cette action supprimera tous les étudiants et paiements. ' +
                'Êtes-vous vraiment sûr ?'
            );
            
            if (doubleConfirmed) {
                try {
                    await Database.clearAllData();
                    app.showToast('Toutes les données ont été supprimées', 'success');
                    
                    // Refresh all components
                    if (app.components.students) await app.components.students.loadStudents();
                    if (app.components.payments) await app.components.payments.refreshData();
                    if (app.components.dashboard) await app.components.dashboard.refresh();
                } catch (error) {
                    console.error('Failed to clear data:', error);
                    app.showToast('Erreur lors de la suppression des données', 'error');
                }
            }
        }
    }

    // Notification methods
    showNotification(title, body, options = {}) {
        if (!this.settings.notifications || !('Notification' in window)) {
            return;
        }
        
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/assets/logo.svg',
                badge: '/assets/logo.svg',
                ...options
            });
        }
    }

    // Cache management
    async clearCache() {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                app.showToast('Cache vidé avec succès', 'success');
            } catch (error) {
                console.error('Failed to clear cache:', error);
                app.showToast('Erreur lors de la suppression du cache', 'error');
            }
        }
    }

    // Service Worker methods
    async updateServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    app.showToast('Service Worker mis à jour', 'success');
                }
            } catch (error) {
                console.error('Failed to update service worker:', error);
                app.showToast('Erreur lors de la mise à jour du Service Worker', 'error');
            }
        }
    }

    // Application info
    getApplicationInfo() {
        return {
            name: 'I.L.C Institut - Gestion des Étudiants',
            version: '1.0.0',
            author: 'Sharawi On The Line',
            description: 'Système de gestion des étudiants pour institut linguistique',
            technologies: [
                'HTML5',
                'CSS3',
                'JavaScript ES6+',
                'IndexedDB',
                'Service Worker',
                'PWA'
            ],
            features: [
                'Gestion des étudiants',
                'Suivi des paiements',
                'Fonctionnement hors ligne',
                'Interface multilingue',
                'Thèmes clair/sombre',
                'Export/Import des données'
            ]
        };
    }
}
