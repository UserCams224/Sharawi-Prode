// Multi-language Translation System
class Translations {
    static translations = {
        fr: {
            // Navigation and general
            loading: "Chargement...",
            dashboard: "Tableau de bord",
            students: "Étudiants",
            payments: "Paiements",
            settings: "Paramètres",
            subtitle: "Institut de langues et de communication",
            
            // Dashboard
            total_students: "Étudiants inscrits",
            total_revenue: "Revenus totaux",
            monthly_revenue: "Revenus ce mois",
            quick_actions: "Actions rapides",
            recent_activities: "Activités récentes",
            add_student: "Ajouter un étudiant",
            add_payment: "Enregistrer un paiement",
            
            // Students
            search_student: "Rechercher un étudiant...",
            all_classes: "Toutes les classes",
            firstname: "Prénom",
            lastname: "Nom",
            birthdate: "Date de naissance",
            class: "Classe",
            photo: "Photo",
            inscription_fee: "Frais d'inscription (GNF)",
            
            // Payments
            all_months: "Tous les mois",
            all_students: "Tous les étudiants",
            student: "Étudiant",
            amount: "Montant (GNF)",
            month: "Mois",
            reason: "Motif du paiement",
            payment_date: "Date du paiement",
            
            // Settings
            language: "Langue",
            theme: "Thème",
            light_theme: "Thème clair",
            dark_theme: "Thème sombre",
            notifications: "Notifications",
            about: "À propos",
            app_description: "Application créée par Sharawi On The Line",
            version: "Version : v1.0",
            offline_status: "Statut hors ligne :",
            
            // Actions
            save: "Enregistrer",
            cancel: "Annuler",
            edit: "Modifier",
            delete: "Supprimer",
            search: "Rechercher",
            
            // Months
            janvier: "Janvier",
            février: "Février",
            mars: "Mars",
            avril: "Avril",
            mai: "Mai",
            juin: "Juin",
            juillet: "Juillet",
            août: "Août",
            septembre: "Septembre",
            octobre: "Octobre",
            novembre: "Novembre",
            décembre: "Décembre"
        },
        
        en: {
            // Navigation and general
            loading: "Loading...",
            dashboard: "Dashboard",
            students: "Students",
            payments: "Payments",
            settings: "Settings",
            subtitle: "Language and Communication Institute",
            
            // Dashboard
            total_students: "Enrolled Students",
            total_revenue: "Total Revenue",
            monthly_revenue: "This Month's Revenue",
            quick_actions: "Quick Actions",
            recent_activities: "Recent Activities",
            add_student: "Add Student",
            add_payment: "Record Payment",
            
            // Students
            search_student: "Search student...",
            all_classes: "All Classes",
            firstname: "First Name",
            lastname: "Last Name",
            birthdate: "Date of Birth",
            class: "Class",
            photo: "Photo",
            inscription_fee: "Registration Fee (GNF)",
            
            // Payments
            all_months: "All Months",
            all_students: "All Students",
            student: "Student",
            amount: "Amount (GNF)",
            month: "Month",
            reason: "Payment Reason",
            payment_date: "Payment Date",
            
            // Settings
            language: "Language",
            theme: "Theme",
            light_theme: "Light Theme",
            dark_theme: "Dark Theme",
            notifications: "Notifications",
            about: "About",
            app_description: "Application created by Sharawi On The Line",
            version: "Version: v1.0",
            offline_status: "Offline Status:",
            
            // Actions
            save: "Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            search: "Search",
            
            // Months
            janvier: "January",
            février: "February",
            mars: "March",
            avril: "April",
            mai: "May",
            juin: "June",
            juillet: "July",
            août: "August",
            septembre: "September",
            octobre: "October",
            novembre: "November",
            décembre: "December"
        },
        
        de: {
            // Navigation and general
            loading: "Wird geladen...",
            dashboard: "Dashboard",
            students: "Studenten",
            payments: "Zahlungen",
            settings: "Einstellungen",
            subtitle: "Institut für Sprachen und Kommunikation",
            
            // Dashboard
            total_students: "Eingeschriebene Studenten",
            total_revenue: "Gesamteinnahmen",
            monthly_revenue: "Einnahmen diesen Monat",
            quick_actions: "Schnellaktionen",
            recent_activities: "Kürzliche Aktivitäten",
            add_student: "Student hinzufügen",
            add_payment: "Zahlung erfassen",
            
            // Students
            search_student: "Student suchen...",
            all_classes: "Alle Klassen",
            firstname: "Vorname",
            lastname: "Nachname",
            birthdate: "Geburtsdatum",
            class: "Klasse",
            photo: "Foto",
            inscription_fee: "Anmeldegebühr (GNF)",
            
            // Payments
            all_months: "Alle Monate",
            all_students: "Alle Studenten",
            student: "Student",
            amount: "Betrag (GNF)",
            month: "Monat",
            reason: "Zahlungsgrund",
            payment_date: "Zahlungsdatum",
            
            // Settings
            language: "Sprache",
            theme: "Design",
            light_theme: "Helles Design",
            dark_theme: "Dunkles Design",
            notifications: "Benachrichtigungen",
            about: "Über",
            app_description: "Anwendung erstellt von Sharawi On The Line",
            version: "Version: v1.0",
            offline_status: "Offline-Status:",
            
            // Actions
            save: "Speichern",
            cancel: "Abbrechen",
            edit: "Bearbeiten",
            delete: "Löschen",
            search: "Suchen",
            
            // Months
            janvier: "Januar",
            février: "Februar",
            mars: "März",
            avril: "April",
            mai: "Mai",
            juin: "Juni",
            juillet: "Juli",
            août: "August",
            septembre: "September",
            octobre: "Oktober",
            novembre: "November",
            décembre: "Dezember"
        }
    };

    static currentLanguage = 'fr';

    static async apply(language = 'fr') {
        this.currentLanguage = language;
        const translations = this.translations[language] || this.translations.fr;
        
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // Update elements with data-translate-placeholder attribute
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });

        // Update month options in dropdowns
        this.updateMonthOptions(language);
        
        // Update document language attribute
        document.documentElement.lang = language;
        
        console.log(`Language changed to: ${language}`);
    }

    static updateMonthOptions(language) {
        const translations = this.translations[language] || this.translations.fr;
        const monthSelects = document.querySelectorAll('#payment-month, #payment-month-filter');
        
        monthSelects.forEach(select => {
            const selectedValue = select.value;
            const monthOptions = [
                { value: '', key: 'all_months' },
                { value: 'Janvier', key: 'janvier' },
                { value: 'Février', key: 'février' },
                { value: 'Mars', key: 'mars' },
                { value: 'Avril', key: 'avril' },
                { value: 'Mai', key: 'mai' },
                { value: 'Juin', key: 'juin' },
                { value: 'Juillet', key: 'juillet' },
                { value: 'Août', key: 'août' },
                { value: 'Septembre', key: 'septembre' },
                { value: 'Octobre', key: 'octobre' },
                { value: 'Novembre', key: 'novembre' },
                { value: 'Décembre', key: 'décembre' }
            ];
            
            // Clear existing options
            select.innerHTML = '';
            
            // Add updated options
            monthOptions.forEach(month => {
                const option = document.createElement('option');
                option.value = month.value;
                option.textContent = translations[month.key] || month.value;
                select.appendChild(option);
            });
            
            // Restore selected value
            select.value = selectedValue;
        });
    }

    static get(key, language = null) {
        const lang = language || this.currentLanguage;
        const translations = this.translations[lang] || this.translations.fr;
        return translations[key] || key;
    }

    static formatDate(date, language = null) {
        const lang = language || this.currentLanguage;
        const locale = {
            'fr': 'fr-FR',
            'en': 'en-US',
            'de': 'de-DE'
        }[lang] || 'fr-FR';
        
        return new Intl.DateTimeFormat(locale).format(new Date(date));
    }

    static formatCurrency(amount, language = null) {
        const lang = language || this.currentLanguage;
        const locale = {
            'fr': 'fr-FR',
            'en': 'en-US',
            'de': 'de-DE'
        }[lang] || 'fr-FR';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    static formatNumber(number, language = null) {
        const lang = language || this.currentLanguage;
        const locale = {
            'fr': 'fr-FR',
            'en': 'en-US',
            'de': 'de-DE'
        }[lang] || 'fr-FR';
        
        return new Intl.NumberFormat(locale).format(number || 0);
    }

    // Dynamic translation for JavaScript messages
    static getToastMessages(language = null) {
        const lang = language || this.currentLanguage;
        
        const messages = {
            fr: {
                studentAdded: "Étudiant ajouté avec succès",
                studentUpdated: "Étudiant modifié avec succès",
                studentDeleted: "Étudiant supprimé avec succès",
                paymentAdded: "Paiement enregistré avec succès",
                paymentDeleted: "Paiement supprimé avec succès",
                settingsUpdated: "Paramètres mis à jour",
                dataExported: "Données exportées avec succès",
                dataImported: "Données importées avec succès",
                connectionRestored: "Connexion rétablie",
                offlineMode: "Mode hors ligne activé",
                error: "Une erreur s'est produite",
                validationError: "Veuillez remplir tous les champs obligatoires"
            },
            en: {
                studentAdded: "Student added successfully",
                studentUpdated: "Student updated successfully",
                studentDeleted: "Student deleted successfully",
                paymentAdded: "Payment recorded successfully",
                paymentDeleted: "Payment deleted successfully",
                settingsUpdated: "Settings updated",
                dataExported: "Data exported successfully",
                dataImported: "Data imported successfully",
                connectionRestored: "Connection restored",
                offlineMode: "Offline mode activated",
                error: "An error occurred",
                validationError: "Please fill in all required fields"
            },
            de: {
                studentAdded: "Student erfolgreich hinzugefügt",
                studentUpdated: "Student erfolgreich aktualisiert",
                studentDeleted: "Student erfolgreich gelöscht",
                paymentAdded: "Zahlung erfolgreich erfasst",
                paymentDeleted: "Zahlung erfolgreich gelöscht",
                settingsUpdated: "Einstellungen aktualisiert",
                dataExported: "Daten erfolgreich exportiert",
                dataImported: "Daten erfolgreich importiert",
                connectionRestored: "Verbindung wiederhergestellt",
                offlineMode: "Offline-Modus aktiviert",
                error: "Ein Fehler ist aufgetreten",
                validationError: "Bitte füllen Sie alle Pflichtfelder aus"
            }
        };
        
        return messages[lang] || messages.fr;
    }

    // Method to add new translations dynamically
    static addTranslation(language, key, value) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        this.translations[language][key] = value;
    }

    // Method to get available languages
    static getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    // Method to check if a language is supported
    static isLanguageSupported(language) {
        return this.translations.hasOwnProperty(language);
    }
}
