// Main Application Controller
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentLanguage = 'fr';
        this.currentTheme = 'light';
        this.isOffline = !navigator.onLine;
        
        this.components = {
            dashboard: null,
            students: null,
            payments: null,
            settings: null
        };
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoading();

            // Initialize database
            await Database.init();
            
            // Load settings
            await this.loadSettings();
            
            // Initialize service worker for offline functionality
            await this.initServiceWorker();
            
            // Initialize components
            this.initComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Apply initial theme and language
            this.applyTheme(this.currentTheme);
            await this.applyLanguage(this.currentLanguage);
            
            // Show initial page
            this.showPage(this.currentPage);
            
            // Hide loading screen
            this.hideLoading();
            
            // Update offline status
            this.updateOfflineStatus();
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showToast('Erreur lors de l\'initialisation de l\'application', 'error');
        }
    }

    async loadSettings() {
        try {
            const settings = await Database.getSettings();
            this.currentLanguage = settings.language || 'fr';
            this.currentTheme = settings.theme || 'light';
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Use defaults
            this.currentLanguage = 'fr';
            this.currentTheme = 'light';
        }
    }

    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);
                
                // Listen for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showToast('Une nouvelle version est disponible. Rechargez la page.', 'info');
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    initComponents() {
        this.components.dashboard = new Dashboard();
        this.components.students = new Students();
        this.components.payments = new Payments();
        this.components.settings = new Settings();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) {
                    this.showPage(page);
                }
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Modal controls
        document.addEventListener('click', (e) => {
            if (e.target.dataset.close) {
                this.closeModal(e.target.dataset.close);
            }
            
            if (e.target.closest('.modal') && !e.target.closest('.modal-content')) {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            }

            // Quick actions
            if (e.target.dataset.action) {
                this.handleQuickAction(e.target.dataset.action);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.updateOfflineStatus();
            this.showToast('Connexion rétablie', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOffline = true;
            this.updateOfflineStatus();
            this.showToast('Mode hors ligne activé', 'warning');
        });

        // Form submissions
        document.getElementById('student-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.components.students.handleSubmit(e);
        });

        document.getElementById('payment-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.components.payments.handleSubmit(e);
        });
    }

    showPage(pageId) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === pageId) {
                btn.classList.add('active');
            }
        });

        // Show page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // Initialize page component
            if (this.components[pageId]) {
                this.components[pageId].init();
            }
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form if present
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                
                // Clear photo preview
                const photoPreview = modal.querySelector('#photo-preview');
                if (photoPreview) {
                    photoPreview.innerHTML = '';
                }
            }
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            this.closeModal(modal.id);
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'add-student':
                this.showModal('student-modal');
                break;
            case 'add-payment':
                this.showModal('payment-modal');
                // Populate student dropdown
                this.components.payments.populateStudentDropdown();
                break;
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveSettings();
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `${theme}-theme`;
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle?.querySelector('use');
        if (icon) {
            icon.setAttribute('href', `assets/icons.svg#${theme === 'light' ? 'moon' : 'sun'}`);
        }
    }

    async applyLanguage(language) {
        this.currentLanguage = language;
        await Translations.apply(language);
    }

    updateOfflineStatus() {
        const indicator = document.getElementById('offline-indicator');
        const icon = indicator?.querySelector('use');
        
        if (icon) {
            if (this.isOffline) {
                icon.setAttribute('href', 'assets/icons.svg#wifi-off');
                indicator.title = 'Hors ligne';
                indicator.style.color = 'var(--warning)';
            } else {
                icon.setAttribute('href', 'assets/icons.svg#wifi');
                indicator.title = 'En ligne';
                indicator.style.color = 'var(--success)';
            }
        }
    }

    async saveSettings() {
        try {
            await Database.updateSettings({
                language: this.currentLanguage,
                theme: this.currentTheme,
                notifications: true // Default value
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (app) app.style.display = 'block';
        }, 500); // Small delay for smooth transition
    }

    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        toast.innerHTML = `
            <svg class="toast-icon icon">
                <use href="assets/icons.svg#${iconMap[type] || 'info'}"></use>
            </svg>
            <div class="toast-content">${message}</div>
            <button class="toast-close">
                <svg class="icon">
                    <use href="assets/icons.svg#x"></use>
                </svg>
            </button>
        `;

        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Handle app installation prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Could show install button here
});
