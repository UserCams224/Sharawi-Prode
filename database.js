// IndexedDB Database Management
class Database {
    static dbName = 'ILCInstitut';
    static version = 1;
    static db = null;

    static async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                console.log('Database upgrade needed');

                // Create students object store
                if (!db.objectStoreNames.contains('students')) {
                    const studentsStore = db.createObjectStore('students', { keyPath: 'id' });
                    studentsStore.createIndex('firstName', 'firstName', { unique: false });
                    studentsStore.createIndex('lastName', 'lastName', { unique: false });
                    studentsStore.createIndex('classe', 'classe', { unique: false });
                    studentsStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Create payments object store
                if (!db.objectStoreNames.contains('payments')) {
                    const paymentsStore = db.createObjectStore('payments', { keyPath: 'id' });
                    paymentsStore.createIndex('studentId', 'studentId', { unique: false });
                    paymentsStore.createIndex('date', 'date', { unique: false });
                    paymentsStore.createIndex('month', 'month', { unique: false });
                    paymentsStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Create settings object store
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                    
                    // Add default settings
                    const defaultSettings = [
                        { key: 'language', value: 'fr' },
                        { key: 'theme', value: 'light' },
                        { key: 'notifications', value: true }
                    ];

                    settingsStore.transaction.oncomplete = () => {
                        const transaction = db.transaction(['settings'], 'readwrite');
                        const store = transaction.objectStore('settings');
                        defaultSettings.forEach(setting => {
                            store.add(setting);
                        });
                    };
                }
            };
        });
    }

    // Student operations
    static async addStudent(student) {
        return this.performTransaction('students', 'readwrite', (store) => {
            return store.add(student);
        });
    }

    static async getStudent(id) {
        return this.performTransaction('students', 'readonly', (store) => {
            return store.get(id);
        });
    }

    static async getAllStudents() {
        return this.performTransaction('students', 'readonly', (store) => {
            return store.getAll();
        });
    }

    static async updateStudent(student) {
        return this.performTransaction('students', 'readwrite', (store) => {
            return store.put(student);
        });
    }

    static async deleteStudent(id) {
        // Also delete associated payments
        const payments = await this.getPaymentsByStudent(id);
        for (const payment of payments) {
            await this.deletePayment(payment.id);
        }
        
        return this.performTransaction('students', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    static async getStudentsByClass(classe) {
        return this.performTransaction('students', 'readonly', (store) => {
            const index = store.index('classe');
            return index.getAll(classe);
        });
    }

    static async searchStudents(query) {
        const students = await this.getAllStudents();
        const lowercaseQuery = query.toLowerCase();
        
        return students.filter(student => 
            student.firstName.toLowerCase().includes(lowercaseQuery) ||
            student.lastName.toLowerCase().includes(lowercaseQuery) ||
            student.id.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Payment operations
    static async addPayment(payment) {
        return this.performTransaction('payments', 'readwrite', (store) => {
            return store.add(payment);
        });
    }

    static async getPayment(id) {
        return this.performTransaction('payments', 'readonly', (store) => {
            return store.get(id);
        });
    }

    static async getAllPayments() {
        return this.performTransaction('payments', 'readonly', (store) => {
            return store.getAll();
        });
    }

    static async updatePayment(payment) {
        return this.performTransaction('payments', 'readwrite', (store) => {
            return store.put(payment);
        });
    }

    static async deletePayment(id) {
        return this.performTransaction('payments', 'readwrite', (store) => {
            return store.delete(id);
        });
    }

    static async getPaymentsByStudent(studentId) {
        return this.performTransaction('payments', 'readonly', (store) => {
            const index = store.index('studentId');
            return index.getAll(studentId);
        });
    }

    static async getPaymentsByMonth(month) {
        return this.performTransaction('payments', 'readonly', (store) => {
            const index = store.index('month');
            return index.getAll(month);
        });
    }

    static async getRecentPayments(limit = 10) {
        const payments = await this.getAllPayments();
        return payments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    // Settings operations
    static async getSetting(key) {
        const result = await this.performTransaction('settings', 'readonly', (store) => {
            return store.get(key);
        });
        return result ? result.value : null;
    }

    static async getSettings() {
        const results = await this.performTransaction('settings', 'readonly', (store) => {
            return store.getAll();
        });
        
        const settings = {};
        results.forEach(item => {
            settings[item.key] = item.value;
        });
        
        return settings;
    }

    static async setSetting(key, value) {
        return this.performTransaction('settings', 'readwrite', (store) => {
            return store.put({ key, value });
        });
    }

    static async updateSettings(settings) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        
        const promises = Object.entries(settings).map(([key, value]) => {
            return new Promise((resolve, reject) => {
                const request = store.put({ key, value });
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
        
        return Promise.all(promises);
    }

    // Statistics and analytics
    static async getStudentCount() {
        const students = await this.getAllStudents();
        return students.length;
    }

    static async getStudentCountByClass() {
        const students = await this.getAllStudents();
        const counts = { A1: 0, A2: 0, B1: 0, B2: 0 };
        
        students.forEach(student => {
            if (counts.hasOwnProperty(student.classe)) {
                counts[student.classe]++;
            }
        });
        
        return counts;
    }

    static async getTotalRevenue() {
        const payments = await this.getAllPayments();
        const students = await this.getAllStudents();
        
        let total = 0;
        
        // Add inscription fees
        students.forEach(student => {
            total += student.inscriptionFee || 0;
        });
        
        // Add payments
        payments.forEach(payment => {
            total += payment.amount || 0;
        });
        
        return total;
    }

    static async getMonthlyRevenue(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
        const payments = await this.getAllPayments();
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        return payments
            .filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate >= startDate && paymentDate <= endDate;
            })
            .reduce((total, payment) => total + (payment.amount || 0), 0);
    }

    static async getRecentActivities(limit = 10) {
        const students = await this.getAllStudents();
        const payments = await this.getAllPayments();
        
        const activities = [];
        
        // Add student registrations
        students.forEach(student => {
            activities.push({
                type: 'registration',
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                date: student.createdAt,
                data: student
            });
        });
        
        // Add payments
        payments.forEach(payment => {
            const student = students.find(s => s.id === payment.studentId);
            activities.push({
                type: 'payment',
                studentId: payment.studentId,
                studentName: student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu',
                date: payment.createdAt,
                data: payment
            });
        });
        
        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Utility methods
    static async performTransaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            const request = operation(store);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    static generateStudentId(firstName, classe) {
        const timestamp = Date.now().toString();
        const lastFourDigits = timestamp.slice(-4);
        const cleanFirstName = firstName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
        return `ILC-${classe}-${cleanFirstName}-${lastFourDigits}`;
    }

    static generatePaymentId() {
        return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Data export/import for backup
    static async exportData() {
        const students = await this.getAllStudents();
        const payments = await this.getAllPayments();
        const settings = await this.getSettings();
        
        return {
            students,
            payments,
            settings,
            exportDate: new Date().toISOString(),
            version: this.version
        };
    }

    static async importData(data) {
        if (!data || !data.students || !data.payments) {
            throw new Error('Invalid data format');
        }
        
        // Clear existing data
        await this.clearAllData();
        
        // Import students
        for (const student of data.students) {
            await this.addStudent(student);
        }
        
        // Import payments
        for (const payment of data.payments) {
            await this.addPayment(payment);
        }
        
        // Import settings
        if (data.settings) {
            await this.updateSettings(data.settings);
        }
    }

    static async clearAllData() {
        const storeNames = ['students', 'payments'];
        
        for (const storeName of storeNames) {
            await this.performTransaction(storeName, 'readwrite', (store) => {
                return store.clear();
            });
        }
    }
}
