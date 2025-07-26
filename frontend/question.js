// Question Detail Page JavaScript
class QuestionPage {
    constructor() {
        this.questionId = this.getQuestionIdFromUrl();
        this.currentUser = null;
        this.question = null;
        this.answers = [];
        this.init();
    }

    async init() {
        await this.loadUserInfo();
        await this.loadQuestion();
        await this.loadAnswers();
        this.setupEventListeners();
        this.setupZenMode();
    }

    getQuestionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || '1'; // Default to question 1 for demo
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

    async loadQuestion() {
        try {
            const response = await fetch(`/api/questions/${this.questionId}/`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.question = await response.json();
                this.displayQuestion();
            } else {
                this.showError('Failed to load question');
            }
        } catch (error) {
            console.error('Error loading question:', error);
            this.showError('Failed to load question');
        }
    }

    displayQuestion() {
        if (!this.question) return;

        document.getElementById('questionTitle').textContent = this.question.title;
        document.getElementById('questionContent').innerHTML = this.question.content;
        document.getElementById('questionAuthor').textContent = this.question.author.username;
        document.getElementById('questionDate').textContent = this.formatDate(this.question.created_at);
        document.getElementById('questionViews').textContent = `${this.question.views || 0} views`;
        
        // Update status and confidence
        const statusElement = document.getElementById('questionStatus');
        if (this.question.is_resolved) {
            statusElement.textContent = 'Resolved';
            statusElement.className = 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
        } else {
            statusElement.textContent = 'Open';
            statusElement.className = 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
        }

        document.getElementById('questionConfidence').textContent = `Confidence: ${this.question.confidence || 0}%`;
        
        // Display tags
        this.displayTags(this.question.tags || []);
    }

    displayTags(tags) {
        const tagsContainer = document.getElementById('questionTags');
        tagsContainer.innerHTML = '';
        
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full';
            tagElement.textContent = tag.name;
            tagsContainer.appendChild(tagElement);
        });
    }

    async loadAnswers() {
        try {
            const response = await fetch(`/api/questions/${this.questionId}/answers/`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.answers = await response.json();
                this.displayAnswers();
            } else {
                this.showError('Failed to load answers');
            }
        } catch (error) {
            console.error('Error loading answers:', error);
            this.showError('Failed to load answers');
        }
    }

    displayAnswers() {
        const container = document.getElementById('answersContainer');
        const countElement = document.getElementById('answerCount');
        
        countElement.textContent = this.answers.length;
        
        if (this.answers.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <i class="fas fa-comments text-4xl mb-4"></i>
                    <p>No answers yet. Be the first to help!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.answers.map(answer => this.createAnswerHTML(answer)).join('');
    }

    createAnswerHTML(answer) {
        const isAuthor = this.currentUser && answer.author.id === this.currentUser.id;
        const isAccepted = answer.is_accepted;
        
        return `
            <div class="p-6" data-answer-id="${answer.id}">
                <div class="flex items-start space-x-4">
                    <!-- Voting -->
                    <div class="flex flex-col items-center space-y-2">
                        <button class="vote-btn text-gray-400 hover:text-blue-500 transition-colors" data-vote="up" data-answer-id="${answer.id}">
                            <i class="fas fa-chevron-up text-xl"></i>
                        </button>
                        <span class="text-lg font-semibold text-gray-700 vote-count">${answer.votes || 0}</span>
                        <button class="vote-btn text-gray-400 hover:text-red-500 transition-colors" data-vote="down" data-answer-id="${answer.id}">
                            <i class="fas fa-chevron-down text-xl"></i>
                        </button>
                        ${isAccepted ? '<div class="text-green-500"><i class="fas fa-check-circle text-xl"></i></div>' : ''}
                    </div>
                    
                    <!-- Answer Content -->
                    <div class="flex-1">
                        <div class="prose max-w-none mb-4">
                            ${answer.content}
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Answered by <span class="font-medium">${answer.author.username}</span></span>
                                <span>${this.formatDate(answer.created_at)}</span>
                                ${answer.confidence ? `<span>Confidence: ${answer.confidence}%</span>` : ''}
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                ${isAuthor ? `
                                    <button class="text-gray-500 hover:text-blue-500 transition-colors edit-answer-btn" data-answer-id="${answer.id}">
                                        <i class="fas fa-edit mr-1"></i>
                                        Edit
                                    </button>
                                ` : ''}
                                <button class="text-gray-500 hover:text-red-500 transition-colors">
                                    <i class="fas fa-flag mr-1"></i>
                                    Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Answer form submission
        document.getElementById('answerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAnswer();
        });

        // Preview button
        document.getElementById('preview-answer').addEventListener('click', () => {
            this.showPreview();
        });

        // AI assistance checkbox
        document.getElementById('aiAssist').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.showAiAssistance();
            }
        });

        // Confidence meter
        document.getElementById('confidenceMeter').addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = e.target.value;
        });

        // Modal close buttons
        document.getElementById('closePreviewModal').addEventListener('click', () => {
            this.hidePreviewModal();
        });

        document.getElementById('cancel-preview').addEventListener('click', () => {
            this.hidePreviewModal();
        });

        // Preview modal confirm button
        document.getElementById('confirm-post').addEventListener('click', () => {
            this.hidePreviewModal();
            this.submitAnswer();
        });

        // Voting (delegated event handling)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.vote-btn')) {
                const button = e.target.closest('.vote-btn');
                const voteType = button.dataset.vote;
                const answerId = button.dataset.answerId;
                this.handleVote(answerId, voteType);
            }
        });
    }

    async submitAnswer() {
        const content = document.getElementById('answerContent').value.trim();
        const confidence = document.getElementById('confidenceMeter').value;
        
        if (!content) {
            this.showError('Please enter your answer');
            return;
        }

        try {
            const response = await fetch(`/api/questions/${this.questionId}/answers/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: content,
                    confidence: parseInt(confidence)
                })
            });

            if (response.ok) {
                const newAnswer = await response.json();
                this.answers.unshift(newAnswer);
                this.displayAnswers();
                document.getElementById('answerContent').value = '';
                document.getElementById('confidenceMeter').value = '50';
                document.getElementById('confidenceValue').textContent = '50';
                this.showSuccess('Answer posted successfully!');
            } else {
                this.showError('Failed to post answer');
            }
        } catch (error) {
            console.error('Error posting answer:', error);
            this.showError('Failed to post answer');
        }
    }

    async handleVote(answerId, voteType) {
        try {
            const response = await fetch(`/api/answers/${answerId}/vote/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify({
                    vote_type: voteType
                })
            });

            if (response.ok) {
                const result = await response.json();
                const voteCountElement = document.querySelector(`[data-answer-id="${answerId}"] .vote-count`);
                if (voteCountElement) {
                    voteCountElement.textContent = result.votes;
                }
            } else {
                this.showError('Failed to vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            this.showError('Failed to vote');
        }
    }

    async showAiAssistance() {
        const content = document.getElementById('answerContent').value.trim();
        
        if (!content) {
            this.showError('Please write your answer first');
            document.getElementById('aiAssist').checked = false;
            return;
        }

        try {
            const response = await fetch('/api/ai/improve-answer/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: content,
                    question_id: this.questionId
                })
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('enhancedAnswer').innerHTML = result.improved_content;
                this.showAiModal();
            } else {
                this.showError('Failed to get AI assistance');
                document.getElementById('aiAssist').checked = false;
            }
        } catch (error) {
            console.error('Error getting AI assistance:', error);
            this.showError('Failed to get AI assistance');
            document.getElementById('aiAssist').checked = false;
        }
    }

    showAiModal() {
        document.getElementById('aiModal').classList.remove('hidden');
    }

    hideAiModal() {
        document.getElementById('aiModal').classList.add('hidden');
        document.getElementById('aiAssist').checked = false;
    }

    acceptAiSuggestion() {
        const enhancedContent = document.getElementById('enhancedAnswer').textContent;
        document.getElementById('answerContent').value = enhancedContent;
        this.hideAiModal();
        this.showSuccess('AI-enhanced answer applied!');
    }

    rejectAiSuggestion() {
        this.hideAiModal();
    }

    showPreview() {
        const content = document.getElementById('answerContent').value.trim();
        
        if (!content) {
            this.showError('Please write your answer first');
            return;
        }

        // Convert line breaks to HTML and sanitize basic formatting
        const formattedContent = content.replace(/\n/g, '<br>');
        document.getElementById('preview-content').innerHTML = formattedContent;
        document.getElementById('previewModal').classList.remove('hidden');
    }

    hidePreviewModal() {
        document.getElementById('previewModal').classList.add('hidden');
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

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Simple error notification
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
    new QuestionPage();
}); 