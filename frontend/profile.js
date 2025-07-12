// Profile Page JavaScript
class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.userStats = null;
        this.recentActivity = [];
        this.init();
    }

    async init() {
        await this.loadUserInfo();
        await this.loadUserStats();
        await this.loadRecentActivity();
        await this.loadCommunities();
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
            this.populateProfileForm();
            
            // Original authentication check (commented out for testing)
            /*
            const response = await fetch('/api/auth/user/', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUserDisplay();
                this.populateProfileForm();
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
            document.getElementById('profileName').textContent = this.currentUser.username;
            document.getElementById('profileEmail').textContent = this.currentUser.email;
            document.getElementById('profileRole').textContent = this.currentUser.role || 'Member';
            
            if (this.currentUser.avatar) {
                document.getElementById('userAvatar').src = this.currentUser.avatar;
                document.getElementById('profileAvatar').src = this.currentUser.avatar;
            }
            
            document.getElementById('memberSince').textContent = this.formatDate(this.currentUser.date_joined);
        }
    }

    populateProfileForm() {
        if (!this.currentUser) return;

        document.getElementById('firstName').value = this.currentUser.first_name || '';
        document.getElementById('lastName').value = this.currentUser.last_name || '';
        document.getElementById('bio').value = this.currentUser.bio || '';
        document.getElementById('location').value = this.currentUser.location || '';
        document.getElementById('website').value = this.currentUser.website || '';
    }

    async loadUserStats() {
        try {
            const response = await fetch('/api/auth/user/stats/', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.userStats = await response.json();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    updateStats() {
        if (!this.userStats) return;

        document.getElementById('questionsAsked').textContent = this.userStats.questions_asked || 0;
        document.getElementById('answersGiven').textContent = this.userStats.answers_given || 0;
        document.getElementById('journalEntries').textContent = this.userStats.journal_entries || 0;
        document.getElementById('totalQuestions').textContent = this.userStats.questions_asked || 0;
        document.getElementById('totalAnswers').textContent = this.userStats.answers_given || 0;
        document.getElementById('totalVotes').textContent = this.userStats.votes_received || 0;
    }

    async loadRecentActivity() {
        try {
            const response = await fetch('/api/auth/user/activity/', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.recentActivity = await response.json();
                this.displayRecentActivity();
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    displayRecentActivity() {
        const container = document.getElementById('recentActivity');
        
        if (this.recentActivity.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">No recent activity</p>';
            return;
        }

        container.innerHTML = this.recentActivity.map(activity => this.createActivityHTML(activity)).join('');
    }

    createActivityHTML(activity) {
        const activityIcons = {
            'question': 'fas fa-question-circle text-blue-500',
            'answer': 'fas fa-comment text-green-500',
            'vote': 'fas fa-thumbs-up text-purple-500',
            'journal': 'fas fa-book text-orange-500'
        };

        const icon = activityIcons[activity.type] || 'fas fa-circle text-gray-400';
        
        return `
            <div class="flex items-center space-x-3">
                <i class="${icon}"></i>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500">${this.formatDate(activity.created_at)}</p>
                </div>
            </div>
        `;
    }

    async loadCommunities() {
        try {
            const response = await fetch('/api/communities/', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const communities = await response.json();
                this.populateCommunitySelect(communities);
            }
        } catch (error) {
            console.error('Error loading communities:', error);
        }
    }

    populateCommunitySelect(communities) {
        const select = document.getElementById('defaultCommunity');
        select.innerHTML = '<option value="">Select a community</option>';
        
        communities.forEach(community => {
            const option = document.createElement('option');
            option.value = community.id;
            option.textContent = community.name;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Profile form submission
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Preferences form submission
        document.getElementById('preferencesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updatePreferences();
        });

        // Password form submission
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // Modal buttons
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.showPasswordModal();
        });

        document.getElementById('closePasswordModal').addEventListener('click', () => {
            this.hidePasswordModal();
        });

        document.getElementById('cancelPassword').addEventListener('click', () => {
            this.hidePasswordModal();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Avatar change button
        document.getElementById('changeAvatarBtn').addEventListener('click', () => {
            this.changeAvatar();
        });
    }

    async updateProfile() {
        const formData = {
            first_name: document.getElementById('firstName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            location: document.getElementById('location').value.trim(),
            website: document.getElementById('website').value.trim()
        };

        try {
            const response = await fetch('/api/auth/user/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                this.currentUser = updatedUser;
                this.updateUserDisplay();
                this.showSuccess('Profile updated successfully!');
            } else {
                this.showError('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile');
        }
    }

    async updatePreferences() {
        const formData = {
            email_questions: document.getElementById('emailQuestions').checked,
            email_answers: document.getElementById('emailAnswers').checked,
            email_mentions: document.getElementById('emailMentions').checked,
            default_community: document.getElementById('defaultCommunity').value,
            ai_assistance: document.getElementById('aiAssistance').value
        };

        try {
            const response = await fetch('/api/auth/user/preferences/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showSuccess('Preferences updated successfully!');
            } else {
                this.showError('Failed to update preferences');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            this.showError('Failed to update preferences');
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            this.showError('Password must be at least 8 characters long');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            if (response.ok) {
                this.hidePasswordModal();
                this.resetPasswordForm();
                this.showSuccess('Password changed successfully!');
            } else {
                const error = await response.json();
                this.showError(error.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showError('Failed to change password');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = 'index.html';
            } else {
                this.showError('Failed to logout');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            this.showError('Failed to logout');
        }
    }

    changeAvatar() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch('/api/auth/user/avatar/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.getCsrfToken()
                    },
                    credentials: 'include',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    document.getElementById('userAvatar').src = result.avatar;
                    document.getElementById('profileAvatar').src = result.avatar;
                    this.showSuccess('Avatar updated successfully!');
                } else {
                    this.showError('Failed to update avatar');
                }
            } catch (error) {
                console.error('Error updating avatar:', error);
                this.showError('Failed to update avatar');
            }
        });

        fileInput.click();
    }

    showPasswordModal() {
        document.getElementById('passwordModal').classList.remove('hidden');
    }

    hidePasswordModal() {
        document.getElementById('passwordModal').classList.add('hidden');
        this.resetPasswordForm();
    }

    resetPasswordForm() {
        document.getElementById('passwordForm').reset();
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
            day: 'numeric'
        });
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
    new ProfilePage();
}); 