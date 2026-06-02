// Utility Functions

// Format Date
function formatDate(date) {
    if (!date) return 'Tidak ada batas';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Is Date Overdue
function isDateOverdue(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
}

// Is Date Today
function isDateToday(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return today.toDateString() === due.toDateString();
}

// Is Date Tomorrow
function isDateTomorrow(dueDate) {
    if (!dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const due = new Date(dueDate);
    return tomorrow.toDateString() === due.toDateString();
}

// Get Date Status
function getDateStatus(dueDate) {
    if (!dueDate) return 'no-date';
    if (isDateOverdue(dueDate)) return 'overdue';
    if (isDateToday(dueDate)) return 'today';
    if (isDateTomorrow(dueDate)) return 'tomorrow';
    return 'scheduled';
}

// Get Date Label
function getDateLabel(dueDate) {
    if (!dueDate) return 'Tidak ada batas';
    if (isDateOverdue(dueDate) && !isDateToday(dueDate)) return `Lewat ${formatDate(dueDate)}`;
    if (isDateToday(dueDate)) return 'Hari ini';
    if (isDateTomorrow(dueDate)) return 'Besok';
    return formatDate(dueDate);
}

// Calculate Statistics
function calculateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return {
        total,
        completed,
        active,
        rate
    };
}

// Filter Todos
function filterTodos(todos, filterType, searchTerm) {
    let filtered = [...todos];
    
    // Apply search
    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(search) ||
            t.category.toLowerCase().includes(search)
        );
    }
    
    // Apply filter
    switch(filterType) {
        case 'active':
            filtered = filtered.filter(t => !t.completed);
            break;
        case 'completed':
            filtered = filtered.filter(t => t.completed);
            break;
        case 'high':
        case 'medium':
        case 'low':
            filtered = filtered.filter(t => t.priority === filterType);
            break;
    }
    
    return filtered;
}

// Sort Todos
function sortTodos(todos, sortType) {
    const sorted = [...todos];
    
    switch(sortType) {
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'priority':
            sorted.sort((a, b) => 
                TODO_CONFIG.PRIORITIES[a.priority].order - 
                TODO_CONFIG.PRIORITIES[b.priority].order
            );
            break;
        case 'name':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    return sorted;
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate UUID
function generateId() {
    return 'todo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

window.formatDate = formatDate;
window.isDateOverdue = isDateOverdue;
window.isDateToday = isDateToday;
window.isDateTomorrow = isDateTomorrow;
window.getDateStatus = getDateStatus;
window.getDateLabel = getDateLabel;
window.calculateStats = calculateStats;
window.filterTodos = filterTodos;
window.sortTodos = sortTodos;
window.showNotification = showNotification;
window.generateId = generateId;