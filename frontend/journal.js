// Learning Journal Page JavaScript
class JournalPage {
    constructor() {
        this.currentUser = null;
        this.entries = [];
        this.currentPage = 1;
        this.hasMore = true;
        this.filters = {
            category: '',
            rating: '',
            search: ''
        };
        this.init();
    }

    async init() {
        await this.loadUserInfo();
        await this.loadStats();
        await this.loadEntries();
        this.setupEventListeners();
        this.setupZenMode();
    }

    async loadUserInfo() {
        try {
            // Temporarily bypass authentication check for testing
            console.log('Bypassing authentication check for testing...');
            
            // Use mock user data
            this.currentUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                bio: 'Test user for development',
                avatar: '',
                is_mentor: false,
                questions_asked: 0,
                answers_given: 0,
                total_points: 0,
                reputation_score: 0,
                zen_mode_enabled: false,
                created_at: new Date().toISOString()
            };
            
            this.updateUserDisplay();
            
            // Original authentication check (commented out for testing)
            /*
            const response = await fetch('/api/auth/user/', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUserDisplay();
            } else {
                window.location.href = 'index.html';
            }
            */
        } catch (error) {
            console.error('Error loading user info:', error);
            // Don't redirect for testing
            // window.location.href = 'index.html';
        }
    }

    updateUserDisplay() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.username;
            if (this.currentUser.avatar) {
                document.getElementById('userAvatar').src = this.currentUser.avatar;
            }
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/journal/stats/', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const stats = await response.json();
                this.updateStats(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStats(stats) {
        document.getElementById('totalEntries').textContent = stats.total_entries || 0;
        document.getElementById('weeklyEntries').textContent = stats.weekly_entries || 0;
        document.getElementById('learningStreak').textContent = `${stats.learning_streak || 0} days`;
        document.getElementById('avgRating').textContent = (stats.avg_rating || 0).toFixed(1);
    }

    async loadEntries(append = false) {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                ...this.filters
            });

            const response = await fetch(`/api/journal/entries/?${params}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (append) {
                    this.entries = [...this.entries, ...data.results];
                } else {
                    this.entries = data.results;
                }
                
                this.hasMore = data.next !== null;
                this.displayEntries();
                this.updateLoadMoreButton();
            } else {
                this.showError('Failed to load entries');
            }
        } catch (error) {
            console.error('Error loading entries:', error);
            this.showError('Failed to load entries');
        }
    }

    displayEntries() {
        const container = document.getElementById('entriesContainer');
        
        if (this.entries.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No journal entries yet</h3>
                    <p class="text-gray-500 mb-6">Start tracking your learning journey by adding your first entry</p>
                    <button id="emptyStateAddBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-plus mr-2"></i>
                        Add Your First Entry
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.entries.map(entry => this.createEntryHTML(entry)).join('');
    }

    createEntryHTML(entry) {
        const categoryColors = {
            programming: 'bg-blue-100 text-blue-800',
            mathematics: 'bg-green-100 text-green-800',
            science: 'bg-purple-100 text-purple-800',
            language: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800'
        };

        const categoryColor = categoryColors[entry.category] || categoryColors.other;
        
        return `
            <div class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer" data-entry-id="${entry.id}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <span class="px-3 py-1 text-xs font-medium rounded-full ${categoryColor}">
                            ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                        </span>
                        <div class="flex items-center space-x-1">
                            ${this.createStarRating(entry.rating)}
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-gray-500">
                        <span>${this.formatDate(entry.created_at)}</span>
                        ${entry.is_public ? '<i class="fas fa-globe text-blue-500" title="Public"></i>' : ''}
                    </div>
                </div>
                
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${entry.title}</h3>
                
                <div class="prose max-w-none text-gray-600 mb-4">
                    <p>${this.truncateText(entry.content, 200)}</p>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Confidence: <span class="font-medium">${entry.confidence}%</span></span>
                        <span>${entry.word_count || 0} words</span>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button class="text-gray-500 hover:text-blue-500 transition-colors" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-gray-500 hover:text-green-500 transition-colors" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createStarRating(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push('<i class="fas fa-star text-yellow-400"></i>');
            } else {
                stars.push('<i class="far fa-star text-gray-300"></i>');
            }
        }
        return stars.join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    setupEventListeners() {
        // Add entry button
        document.getElementById('addEntryBtn').addEventListener('click', () => {
            this.showAddEntryModal();
        });

        // Entry form submission
        document.getElementById('entryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitEntry();
        });

        // Modal close buttons
        document.getElementById('closeAddEntryModal').addEventListener('click', () => {
            this.hideAddEntryModal();
        });

        document.getElementById('cancelEntry').addEventListener('click', () => {
            this.hideAddEntryModal();
        });

        // Entry detail modal
        document.getElementById('closeEntryDetailModal').addEventListener('click', () => {
            this.hideEntryDetailModal();
        });

        document.getElementById('closeEntryDetail').addEventListener('click', () => {
            this.hideEntryDetailModal();
        });

        // Filters
        document.getElementById('filterCategory').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterRating').addEventListener('change', (e) => {
            this.filters.rating = e.target.value;
            this.applyFilters();
        });

        document.getElementById('searchEntries').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.debounce(() => this.applyFilters(), 300);
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Load more button
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.loadMoreEntries();
        });

        // Entry interactions (delegated)
        document.addEventListener('click', (e) => {
            const entryCard = e.target.closest('[data-entry-id]');
            if (entryCard) {
                const entryId = entryCard.dataset.entryId;
                
                if (e.target.closest('.fa-eye')) {
                    this.showEntryDetail(entryId);
                } else if (e.target.closest('.fa-edit')) {
                    this.editEntry(entryId);
                } else if (e.target.closest('.fa-trash')) {
                    this.deleteEntry(entryId);
                } else {
                    this.showEntryDetail(entryId);
                }
            }
        });

        // Form range inputs
        document.getElementById('entryRating').addEventListener('input', (e) => {
            document.getElementById('ratingValue').textContent = e.target.value;
        });

        document.getElementById('entryConfidence').addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = `${e.target.value}%`;
        });
    }

    async submitEntry() {
        const formData = {
            title: document.getElementById('entryTitle').value.trim(),
            category: document.getElementById('entryCategory').value,
            content: document.getElementById('entryContent').value.trim(),
            reflection: document.getElementById('entryReflection').value.trim(),
            rating: parseInt(document.getElementById('entryRating').value),
            confidence: parseInt(document.getElementById('entryConfidence').value),
            is_public: document.getElementById('entryPublic').checked
        };

        if (!formData.title || !formData.content) {
            this.showError('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/journal/entries/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newEntry = await response.json();
                this.entries.unshift(newEntry);
                this.displayEntries();
                this.hideAddEntryModal();
                this.resetEntryForm();
                this.loadStats();
                this.showSuccess('Journal entry saved successfully!');
            } else {
                this.showError('Failed to save entry');
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            this.showError('Failed to save entry');
        }
    }

    async showEntryDetail(entryId) {
        try {
            const response = await fetch(`/api/journal/entries/${entryId}/`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const entry = await response.json();
                this.displayEntryDetail(entry);
                this.showEntryDetailModal();
            } else {
                this.showError('Failed to load entry details');
            }
        } catch (error) {
            console.error('Error loading entry details:', error);
            this.showError('Failed to load entry details');
        }
    }

    displayEntryDetail(entry) {
        document.getElementById('detailTitle').textContent = entry.title;
        
        const content = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">Category</h4>
                    <span class="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                        ${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                    </span>
                </div>
                
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">What I Learned</h4>
                    <div class="prose max-w-none text-gray-600">
                        ${entry.content}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-medium text-gray-900 mb-2">Reflection</h4>
                    <div class="prose max-w-none text-gray-600">
                        ${entry.reflection}
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-medium text-gray-900 mb-2">Rating</h4>
                        <div class="flex items-center space-x-1">
                            ${this.createStarRating(entry.rating)}
                            <span class="ml-2 text-sm text-gray-600">${entry.rating}/5</span>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-900 mb-2">Confidence</h4>
                        <span class="text-sm text-gray-600">${entry.confidence}%</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: ${this.formatDate(entry.created_at)}</span>
                    ${entry.is_public ? '<span class="text-blue-600"><i class="fas fa-globe mr-1"></i>Public</span>' : ''}
                </div>
            </div>
        `;
        
        document.getElementById('entryDetailContent').innerHTML = content;
    }

    async deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/journal/entries/${entryId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include'
            });

            if (response.ok) {
                this.entries = this.entries.filter(entry => entry.id !== entryId);
                this.displayEntries();
                this.loadStats();
                this.showSuccess('Entry deleted successfully');
            } else {
                this.showError('Failed to delete entry');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            this.showError('Failed to delete entry');
        }
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadEntries();
    }

    clearFilters() {
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterRating').value = '';
        document.getElementById('searchEntries').value = '';
        
        this.filters = {
            category: '',
            rating: '',
            search: ''
        };
        
        this.applyFilters();
    }

    loadMoreEntries() {
        this.currentPage++;
        this.loadEntries(true);
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (this.hasMore) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }

    showAddEntryModal() {
        document.getElementById('addEntryModal').classList.remove('hidden');
    }

    hideAddEntryModal() {
        document.getElementById('addEntryModal').classList.add('hidden');
        this.resetEntryForm();
    }

    showEntryDetailModal() {
        document.getElementById('entryDetailModal').classList.remove('hidden');
    }

    hideEntryDetailModal() {
        document.getElementById('entryDetailModal').classList.add('hidden');
    }

    resetEntryForm() {
        document.getElementById('entryForm').reset();
        document.getElementById('ratingValue').textContent = '3';
        document.getElementById('confidenceValue').textContent = '50%';
    }

    setupZenMode() {
        const zenBtn = document.getElementById('zenModeBtn');
        let zenMode = false;

        zenBtn.addEventListener('click', () => {
            zenMode = !zenMode;
            const icon = zenBtn.querySelector('i');
            
            if (zenMode) {
                icon.className = 'fas fa-eye';
                document.body.classList.add('zen-mode');
            } else {
                icon.className = 'fas fa-eye-slash';
                document.body.classList.remove('zen-mode');
            }
        });
    }

    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JournalPage();
}); 