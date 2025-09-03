// Utility Helper Functions
class Helpers {
    // Date utilities
    static formatDate(date, locale = 'fr-FR') {
        if (!date) return '';
        return new Intl.DateTimeFormat(locale).format(new Date(date));
    }

    static formatDateTime(date, locale = 'fr-FR') {
        if (!date) return '';
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    static getTimeAgo(date, language = 'fr') {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
        
        const timeStrings = {
            fr: {
                now: 'À l\'instant',
                seconds: 'Il y a {0} seconde{1}',
                minutes: 'Il y a {0} minute{1}',
                hours: 'Il y a {0} heure{1}',
                days: 'Il y a {0} jour{1}',
                months: 'Il y a {0} mois',
                years: 'Il y a {0} an{1}'
            },
            en: {
                now: 'Just now',
                seconds: '{0} second{1} ago',
                minutes: '{0} minute{1} ago',
                hours: '{0} hour{1} ago',
                days: '{0} day{1} ago',
                months: '{0} month{1} ago',
                years: '{0} year{1} ago'
            },
            de: {
                now: 'Gerade eben',
                seconds: 'Vor {0} Sekunde{1}',
                minutes: 'Vor {0} Minute{1}',
                hours: 'Vor {0} Stunde{1}',
                days: 'Vor {0} Tag{1}',
                months: 'Vor {0} Monat{1}',
                years: 'Vor {0} Jahr{1}'
            }
        };
        
        const strings = timeStrings[language] || timeStrings.fr;
        
        if (diffInSeconds < 10) return strings.now;
        if (diffInSeconds < 60) {
            const count = diffInSeconds;
            const plural = language === 'fr' ? (count > 1 ? 's' : '') : (count > 1 ? 's' : '');
            return strings.seconds.replace('{0}', count).replace('{1}', plural);
        }
        if (diffInSeconds < 3600) {
            const count = Math.floor(diffInSeconds / 60);
            const plural = language === 'fr' ? (count > 1 ? 's' : '') : (count > 1 ? 's' : '');
            return strings.minutes.replace('{0}', count).replace('{1}', plural);
        }
        if (diffInSeconds < 86400) {
            const count = Math.floor(diffInSeconds / 3600);
            const plural = language === 'fr' ? (count > 1 ? 's' : '') : (count > 1 ? 's' : '');
            return strings.hours.replace('{0}', count).replace('{1}', plural);
        }
        if (diffInSeconds < 2592000) {
            const count = Math.floor(diffInSeconds / 86400);
            const plural = language === 'fr' ? (count > 1 ? 's' : '') : (count > 1 ? 's' : '');
            return strings.days.replace('{0}', count).replace('{1}', plural);
        }
        if (diffInSeconds < 31536000) {
            const count = Math.floor(diffInSeconds / 2592000);
            const plural = language === 'fr' ? '' : (count > 1 ? 's' : '');
            return strings.months.replace('{0}', count).replace('{1}', plural);
        }
        
        const count = Math.floor(diffInSeconds / 31536000);
        const plural = language === 'fr' ? (count > 1 ? 's' : '') : (count > 1 ? 's' : '');
        return strings.years.replace('{0}', count).replace('{1}', plural);
    }

    static isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    }

    static isThisMonth(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.getMonth() === checkDate.getMonth() && 
               today.getFullYear() === checkDate.getFullYear();
    }

    // Currency utilities
    static formatCurrency(amount, currency = 'GNF', locale = 'fr-FR') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    static formatNumber(number, locale = 'fr-FR') {
        return new Intl.NumberFormat(locale).format(number || 0);
    }

    // String utilities
    static capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static capitalizeWords(str) {
        if (!str) return '';
        return str.split(' ')
            .map(word => this.capitalizeFirst(word))
            .join(' ');
    }

    static generateSlug(str) {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }

    static sanitizeFileName(fileName) {
        return fileName.replace(/[^a-z0-9\-_.]/gi, '_');
    }

    // Validation utilities
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhoneNumber(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    static validateDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    static validateRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    static validateMinLength(value, minLength) {
        return value && value.toString().length >= minLength;
    }

    static validateMaxLength(value, maxLength) {
        return !value || value.toString().length <= maxLength;
    }

    static validateNumeric(value) {
        return !isNaN(value) && isFinite(value);
    }

    static validatePositive(value) {
        return this.validateNumeric(value) && parseFloat(value) > 0;
    }

    // File utilities
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static getFileExtension(fileName) {
        return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    static isImageFile(fileName) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const extension = this.getFileExtension(fileName).toLowerCase();
        return imageExtensions.includes(extension);
    }

    // Image utilities
    static async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                let { width, height } = img;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and convert to base64
                ctx.drawImage(img, 0, 0, width, height);
                const dataURL = canvas.toDataURL('image/jpeg', quality);
                resolve(dataURL);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    // Array utilities
    static removeDuplicates(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const keyValue = item[key];
            if (seen.has(keyValue)) {
                return false;
            }
            seen.add(keyValue);
            return true;
        });
    }

    static sortBy(array, key, ascending = true) {
        return array.sort((a, b) => {
            const valueA = a[key];
            const valueB = b[key];
            
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    }

    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Object utilities
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    static isEmpty(obj) {
        return obj === null || 
               obj === undefined || 
               (typeof obj === 'string' && obj.trim() === '') ||
               (Array.isArray(obj) && obj.length === 0) ||
               (typeof obj === 'object' && Object.keys(obj).length === 0);
    }

    static pick(obj, keys) {
        const result = {};
        keys.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key];
            }
        });
        return result;
    }

    static omit(obj, keys) {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    }

    // URL and routing utilities
    static getQueryParams() {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }

    static setQueryParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }

    static removeQueryParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    }

    // Storage utilities
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    static removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    // Performance utilities
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Random utilities
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Device utilities
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 600;
    }

    static isDesktop() {
        return !this.isMobile() && !this.isTablet();
    }

    static getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    }

    // Network utilities
    static isOnline() {
        return navigator.onLine;
    }

    static async testConnection(url = '/') {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            return true;
        } catch {
            return false;
        }
    }

    // Download utilities
    static downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static downloadJSON(data, filename) {
        this.downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
    }

    static downloadCSV(data, filename) {
        const csv = this.arrayToCSV(data);
        this.downloadFile(csv, filename, 'text/csv');
    }

    static arrayToCSV(array) {
        if (!array.length) return '';
        
        const headers = Object.keys(array[0]);
        const csvContent = [
            headers.join(','),
            ...array.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }
}
