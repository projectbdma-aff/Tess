// Global State
let todos = [];
let currentFilter = 'all';
let currentSearchTerm = '';
let currentSort = 'date-desc';
let editingTodoId = null;
let currentTheme = 'light';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadTodos();
    renderTodos();
    setupEventListeners();
    updateStats();
});

// Setup Event Listeners
function setupEventListeners() {
    // Add Todo Form
    document.getElementById('addTodoForm').addEventListener('submit', handleAddTodo);
    
    // Edit Todo Form
    document.getElementById('editTodoForm').addEventListener('submit', handleEditTodo);
    
    // Search Input
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        renderTodos();
    });
    
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    // Sort Select
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTodos();
    });
}

// Handle Add Todo
function handleAddTodo(e) {
    e.preventDefault();
    
    const title = document.getElementById('todoInput').value.trim();
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const dueDate = document.getElementById('dueDateInput').value;
    
    if (!title) {
        showNotification('Tulis tugas terlebih dahulu', 'error');
        return;
    }
    
    const newTodo = {
        id: generateId(),
        title: title,
        priority: priority,
        category: category,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateStats();
    
    // Reset Form
    document.getElementById('addTodoForm').reset();
    document.getElementById('prioritySelect').value = 'medium';
    document.getElementById('categorySelect').value = 'personal';
    
    showNotification('✅ Tugas berhasil ditambahkan');
}

// Handle Edit Todo
function handleEditTodo(e) {
    e.preventDefault();
    
    const title = document.getElementById('editTodoInput').value.trim();
    const priority = document.getElementById('editPrioritySelect').value;
    const category = document.getElementById('editCategorySelect').value;
    const dueDate = document.getElementById('editDueDateInput').value;
    
    if (!title) {
        showNotification('Judul tugas tidak boleh kosong', 'error');
        return;
    }
    
    const todoIndex = todos.findIndex(t => t.id === editingTodoId);
    if (todoIndex !== -1) {
        todos[todoIndex].title = title;
        todos[todoIndex].priority = priority;
        todos[todoIndex].category = category;
        todos[todoIndex].dueDate = dueDate;
        
        saveTodos();
        renderTodos();
        updateStats();
        closeEditModal();
        
        showNotification('✏️ Tugas berhasil diperbarui');
    }
}

// Handle Filter Change
function handleFilterChange(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.getAttribute('data-filter');
    renderTodos();
}

// Toggle Todo Completion
function toggleTodo(id) {
    const todoIndex = todos.findIndex(t => t.id === id);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete Todo
function deleteTodo(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('🗑️ Tugas berhasil dihapus');
    }
}

// Open Edit Modal
function openEditModal(id) {
    editingTodoId = id;
    const todo = todos.find(t => t.id === id);
    
    if (todo) {
        document.getElementById('editTodoInput').value = todo.title;
        document.getElementById('editPrioritySelect').value = todo.priority;
        document.getElementById('editCategorySelect').value = todo.category;
        document.getElementById('editDueDateInput').value = todo.dueDate || '';
        
        document.getElementById('editModal').style.display = 'flex';
    }
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingTodoId = null;
}

// Clear Completed
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('Tidak ada tugas selesai untuk dihapus', 'info');
        return;
    }
    
    if (confirm(`Hapus ${completedCount} tugas selesai?`)) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('✨ Tugas selesai berhasil dihapus');
    }
}

// Export Todos
function exportTodos() {
    const data = JSON.stringify(todos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📥 Tugas berhasil diekspor');
}

// Import Todos
function importTodos() {
    document.getElementById('importFile').click();
}

document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const imported = JSON.parse(event.target.result);
            if (!Array.isArray(imported)) {
                showNotification('Format file tidak valid', 'error');
                return;
            }
            
            const addNew = confirm(`Tambahkan ${imported.length} tugas ke daftar saat ini?\n\nKlik OK untuk menambah, atau Batal untuk mengganti.`);
            
            if (addNew) {
                todos = [...todos, ...imported];
            } else {
                todos = imported;
            }
            
            saveTodos();
            renderTodos();
            updateStats();
            showNotification('📤 Tugas berhasil diimpor');
        } catch (error) {
            showNotification('Gagal mengimpor file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
});

// Render Todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    
    // Filter and sort
    let filtered = filterTodos(todos, currentFilter, currentSearchTerm);
    let sorted = sortTodos(filtered, currentSort);
    
    if (sorted.length === 0) {
        todoList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    todoList.innerHTML = sorted.map(todo => createTodoElement(todo)).join('');
    
    // Add event listeners
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => toggleTodo(checkbox.dataset.id));
    });
    
    document.querySelectorAll('.todo-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.todo-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTodo(btn.dataset.id));
    });
}

// Create Todo Element
function createTodoElement(todo) {
    const dateStatus = getDateStatus(todo.dueDate);
    const priorityLabel = TODO_CONFIG.PRIORITIES[todo.priority].label;
    const categoryLabel = TODO_CONFIG.CATEGORIES[todo.category].label;
    const dateLabel = getDateLabel(todo.dueDate);
    
    let dateClass = 'date-' + dateStatus;
    if (todo.completed) dateClass += ' date-completed';
    
    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-checkbox-wrapper">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    data-id="${todo.id}"
                    ${todo.completed ? 'checked' : ''}
                >
            </div>
            
            <div class="todo-content">
                <div class="todo-header">
                    <h3 class="todo-title">${todo.title}</h3>
                    <span class="priority-badge priority-${todo.priority}">${priorityLabel}</span>
                </div>
                
                <div class="todo-meta">
                    <span class="category-badge category-${todo.category}">${categoryLabel}</span>
                    <span class="date-badge ${dateClass}" title="${formatDate(todo.dueDate)}">
                        📅 ${dateLabel}
                    </span>
                </div>
            </div>
            
            <div class="todo-actions">
                <button class="todo-edit-btn btn-icon" data-id="${todo.id}" title="Edit">
                    ✏️
                </button>
                <button class="todo-delete-btn btn-icon" data-id="${todo.id}" title="Hapus">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

// Update Statistics
function updateStats() {
    const stats = calculateStats(todos);
    
    document.getElementById('totalTodos').textContent = stats.total;
    document.getElementById('completedTodos').textContent = stats.completed;
    document.getElementById('activeTodos').textContent = stats.active;
    document.getElementById('completionRate').textContent = stats.rate + '%';
}

// Save Todos to LocalStorage
function saveTodos() {
    localStorage.setItem(TODO_CONFIG.STORAGE_KEY, JSON.stringify(todos));
}

// Load Todos from LocalStorage
function loadTodos() {
    const stored = localStorage.getItem(TODO_CONFIG.STORAGE_KEY);
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (error) {
            console.error('Gagal memuat todos:', error);
            todos = [];
        }
    }
}

// Toggle Theme
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveTheme();
}

// Apply Theme
function applyTheme() {
    const root = document.documentElement;
    const icon = document.querySelector('.theme-icon');
    
    if (currentTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        icon.textContent = '☀️';
    } else {
        root.setAttribute('data-theme', 'light');
        icon.textContent = '🌙';
    }
}

// Save Theme
function saveTheme() {
    localStorage.setItem(TODO_CONFIG.THEME_KEY, currentTheme);
}

// Load Theme
function loadTheme() {
    const saved = localStorage.getItem(TODO_CONFIG.THEME_KEY);
    if (saved) {
        currentTheme = saved;
    } else {
        // Check system preference
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme();
}

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// Export functions
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.clearCompleted = clearCompleted;
window.exportTodos = exportTodos;
window.importTodos = importTodos;
window.toggleTheme = toggleTheme;