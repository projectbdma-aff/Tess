// Configuration
const TODO_CONFIG = {
    STORAGE_KEY: 'todos_app_data',
    THEME_KEY: 'todos_app_theme',
    PRIORITIES: {
        high: { label: '🔴 Tinggi', value: 'high', order: 1 },
        medium: { label: '🟡 Sedang', value: 'medium', order: 2 },
        low: { label: '🟢 Rendah', value: 'low', order: 3 }
    },
    CATEGORIES: {
        personal: { label: '👤 Personal', icon: '👤' },
        work: { label: '💼 Kerja', icon: '💼' },
        shopping: { label: '🛒 Belanja', icon: '🛒' },
        health: { label: '🏥 Kesehatan', icon: '🏥' },
        other: { label: '📌 Lainnya', icon: '📌' }
    },
    FILTERS: {
        all: 'Semua',
        active: 'Aktif',
        completed: 'Selesai',
        high: 'Prioritas Tinggi',
        medium: 'Prioritas Sedang',
        low: 'Prioritas Rendah'
    }
};

// Themes
const THEMES = {
    light: {
        name: 'light',
        icon: '🌙'
    },
    dark: {
        name: 'dark',
        icon: '☀️'
    }
};

window.TODO_CONFIG = TODO_CONFIG;
window.THEMES = THEMES;