// Community page functionality
const API_BASE = 'http://127.0.0.1:8000/api';

// Mock user data for testing (since auth is disabled)
const user = {
    id: 1,
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User'
};

// AI Features
let aiFeaturesEnabled = true;
let currentQuestionId = null;
let aiImprovementData = null;

// Store user's joined community IDs for quick lookup
let userCommunityIds = new Set();

// Helper: check if user is a member (set in loadSpecificCommunity)
let isCommunityMember = false;

// Get community ID from URL
const urlParams = new URLSearchParams(window.location.search);
const communityId = urlParams.get('id');

// DOM elements
const communityName = document.getElementById('community-name');
const communityDescription = document.getElementById('community-description');
const communityMemberCount = document.getElementById('community-member-count');
const communityQuestionsCount = document.getElementById('community-questions-count');
const communityMembers = document.getElementById('community-members');
const communityQuestions = document.getElementById('community-questions');
const inviteCode = document.getElementById('invite-code');
const joinCommunityBtn = document.getElementById('join-community-btn');
const leaveCommunityBtn = document.getElementById('leave-community-btn');
const requestJoinBtn = document.getElementById('request-join-btn');
const joinRequestsSection = document.getElementById('join-requests-section');
const joinRequestsList = document.getElementById('join-requests-list');
const communitiesGrid = document.getElementById('communities-grid');
const communitiesList = document.getElementById('communities-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const questionForm = document.getElementById('question-form');
const questionTitle = document.getElementById('question-title');
const questionContent = document.getElementById('question-content');
const questionsList = document.getElementById('questions-list');
const messageContainer = document.getElementById('message-container');
const allCommunitiesView = document.getElementById('all-communities-view');
const specificCommunityView = document.getElementById('specific-community-view');
const joinRequestModal = document.getElementById('joinRequestModal');
const joinRequestForm = document.getElementById('join-request-form');
const joinRequestMessage = document.getElementById('join-request-message');
const closeJoinRequestModal = document.getElementById('closeJoinRequestModal');
const cancelJoinRequest = document.getElementById('cancelJoinRequest');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    if (communityId) {
        // Show specific community
        allCommunitiesView.style.display = 'none';
        specificCommunityView.style.display = 'flex';
        loadSpecificCommunity();
    } else {
        // Show all communities
        allCommunitiesView.style.display = 'block';
        specificCommunityView.style.display = 'none';
        loadAllCommunities();
    }
});

// Load user's joined communities
async function loadUserCommunities() {
    try {
        const res = await fetch(`${API_BASE}/communities/my_communities/`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const communities = data.results || data;
        userCommunityIds = new Set(communities.map(c => c.id));
    } catch (err) {
        userCommunityIds = new Set();
    }
}

// Load all communities
async function loadAllCommunities() {
    await loadUserCommunities();
    try {
        const res = await fetch(`${API_BASE}/communities/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load communities');
        const data = await res.json();
        
        // Handle paginated response
        const communities = data.results || data;
        
        if (communities.length === 0) {
            communitiesGrid.innerHTML = '<div class="text-gray-400 text-center py-8">No communities available.</div>';
            return;
        }
        
        communitiesGrid.innerHTML = '';
        communities.forEach(community => {
            const isMember = userCommunityIds.has(community.id);
            const isOwner = community.owner && community.owner.id === user.id;
            const el = document.createElement('div');
            el.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
            el.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">${community.name}</h3>
                        <p class="text-gray-600 text-sm mb-3">${community.description || 'No description available'}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">Created by</div>
                        <div class="text-sm font-medium">${community.owner ? community.owner.username : 'Unknown'}</div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">${community.members_count || 0} members</span>
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">${community.mentors_count || 0} mentors</span>
                    <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${community.total_questions || 0} questions</span>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="window.location.href='community.html?id=${community.id}'" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        View Details
                    </button>
                    ${(!isMember && !isOwner) ? `<button onclick="requestJoinCommunity('${community.id}')" 
                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Request Join
                    </button>` : ''}
                </div>
            `;
            communitiesGrid.appendChild(el);
        });
    } catch (err) {
        console.error('Failed to load communities:', err);
        communitiesGrid.innerHTML = '<div class="text-red-500 text-center py-8">Failed to load communities.</div>';
    }
}

// Request to join a community
async function requestJoinCommunity(communityId) {
    try {
        const message = prompt('Optional: Add a message to your join request:') || '';
        
        const res = await fetch(`${API_BASE}/communities/${communityId}/request_join/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message: message })
        });
        
        if (res.ok) {
            const data = await res.json();
            showMessage(data.message, 'success');
        } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to send join request', 'error');
        }
    } catch (err) {
        showMessage('Failed to send join request', 'error');
    }
}

// Load specific community
async function loadSpecificCommunity() {
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load community');
        const community = await res.json();
        
        // Update community info
        communityName.textContent = community.name;
        communityDescription.textContent = community.description || 'No description available';
        communityMemberCount.textContent = `${community.members_count || 0} members`;
        communityQuestionsCount.textContent = `${community.total_questions || 0} questions`;
        communityMembers.textContent = community.members_count || 0;
        communityQuestions.textContent = community.total_questions || 0;
        
        // Set invite code
        inviteCode.textContent = community.invite_code || 'N/A';
        
        // Check if user is member
        const isMember = community.members && community.members.some(m => m.id === user.id);
        const isOwner = community.owner && community.owner.id === user.id;
        isCommunityMember = isMember || isOwner;
        
        if (isMember || isOwner) {
            requestJoinBtn.style.display = 'none';
            leaveCommunityBtn.style.display = 'block';
            
            // If user is owner, show join requests section
            if (isOwner) {
                loadJoinRequests();
                joinRequestsSection.style.display = 'block';
            } else {
                joinRequestsSection.style.display = 'none';
            }
        } else {
            requestJoinBtn.style.display = 'block';
            leaveCommunityBtn.style.display = 'none';
            joinRequestsSection.style.display = 'none';
        }
        
        // Load questions
        loadQuestions();
        
    } catch (err) {
        console.error('Failed to load community:', err);
        showMessage('Failed to load community', 'error');
    }
}

// Load join requests for community owner
async function loadJoinRequests() {
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/join_requests/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load join requests');
        const requests = await res.json();
        
        if (requests.length === 0) {
            joinRequestsList.innerHTML = '<div class="text-gray-400 text-sm">No pending join requests.</div>';
            return;
        }
        
        joinRequestsList.innerHTML = '';
        requests.forEach(request => {
            const el = document.createElement('div');
            el.className = 'bg-white rounded-lg shadow p-4 mb-3';
            el.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="font-semibold text-gray-800">${request.user.username}</div>
                        <div class="text-sm text-gray-500">${request.user.email || 'No email'}</div>
                        ${request.message ? `<div class="text-sm text-gray-600 mt-1">"${request.message}"</div>` : ''}
                    </div>
                    <div class="text-xs text-gray-400">${new Date(request.created_at).toLocaleDateString()}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick="approveJoinRequest('${request.id}')" 
                            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                        Approve
                    </button>
                    <button onclick="rejectJoinRequest('${request.id}')" 
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                        Reject
                    </button>
                </div>
            `;
            joinRequestsList.appendChild(el);
        });
    } catch (err) {
        console.error('Failed to load join requests:', err);
        joinRequestsList.innerHTML = '<div class="text-red-500 text-sm">Failed to load join requests.</div>';
    }
}

// Approve join request
async function approveJoinRequest(requestId) {
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/approve_join_request/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ request_id: requestId })
        });
        
        if (res.ok) {
            const data = await res.json();
            showMessage(data.message, 'success');
            loadJoinRequests(); // Reload requests
        } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to approve request', 'error');
        }
    } catch (err) {
        showMessage('Failed to approve request', 'error');
    }
}

// Reject join request
async function rejectJoinRequest(requestId) {
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/reject_join_request/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ request_id: requestId })
        });
        
        if (res.ok) {
            const data = await res.json();
            showMessage(data.message, 'success');
            loadJoinRequests(); // Reload requests
        } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to reject request', 'error');
        }
    } catch (err) {
        showMessage('Failed to reject request', 'error');
    }
}

// Show join request modal
requestJoinBtn.addEventListener('click', () => {
    joinRequestModal.classList.remove('hidden');
    joinRequestMessage.value = '';
    joinRequestMessage.focus();
});

// Hide join request modal
function hideJoinRequestModal() {
    joinRequestModal.classList.add('hidden');
}
closeJoinRequestModal.addEventListener('click', hideJoinRequestModal);
cancelJoinRequest.addEventListener('click', hideJoinRequestModal);

// Submit join request form
joinRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = joinRequestMessage.value.trim();
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/request_join/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ message })
        });
        if (res.ok) {
            const data = await res.json();
            showMessage(data.message, 'success');
            requestJoinBtn.style.display = 'none';
            hideJoinRequestModal();
        } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to send join request', 'error');
        }
    } catch (err) {
        showMessage('Failed to send join request', 'error');
    }
});

// Leave community
leaveCommunityBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/leave/`, {
            method: 'POST',
            credentials: 'include'
        });
        if (res.ok) {
            showMessage('Successfully left community!', 'success');
            requestJoinBtn.style.display = 'block';
            leaveCommunityBtn.style.display = 'none';
            // Reload community data
            loadSpecificCommunity();
        } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to leave community', 'error');
        }
    } catch (err) {
        showMessage('Failed to leave community', 'error');
    }
});

// Load answers for a question
async function loadAnswers(questionId, answersContainer) {
    try {
        const res = await fetch(`${API_BASE}/answers/?question=${questionId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load answers');
        const answers = await res.json();
        if (!answers.length) {
            answersContainer.innerHTML = '<div class="text-gray-400 text-xs">No answers yet.</div>';
            return;
        }
        answersContainer.innerHTML = '';
        answers.forEach(answer => {
            const el = document.createElement('div');
            el.className = 'bg-gray-50 rounded p-3 mb-2 border border-gray-100';
            el.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <span class="font-medium text-gray-700">${answer.author ? answer.author.username : 'Unknown'}</span>
                    <span class="text-xs text-gray-400">${new Date(answer.created_at).toLocaleDateString()}</span>
                </div>
                <div class="text-gray-700 text-sm">${answer.content}</div>
            `;
            answersContainer.appendChild(el);
        });
    } catch (err) {
        answersContainer.innerHTML = '<div class="text-red-500 text-xs">Failed to load answers.</div>';
    }
}

// Load questions (with answers and answer form)
async function loadQuestions() {
    try {
        const res = await fetch(`${API_BASE}/communities/${communityId}/questions/`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load questions');
        const questions = await res.json();
        if (questions.length === 0) {
            questionsList.innerHTML = '<div class="text-gray-400 text-center py-8">No questions yet. Be the first to ask!</div>';
            return;
        }
        questionsList.innerHTML = '';
        questions.forEach(question => {
            const el = document.createElement('div');
            el.className = 'bg-white rounded-lg shadow p-4 mb-4';
            el.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">${question.title}</h3>
                    <span class="text-xs text-gray-500">${new Date(question.created_at).toLocaleDateString()}</span>
                </div>
                <p class="text-gray-600 mb-3">${question.content}</p>
                <div class="flex justify-between items-center mb-2">
                    <div class="text-sm text-gray-500">
                        Asked by ${question.author ? question.author.username : 'Unknown'}
                    </div>
                    <div class="flex gap-2 text-xs">
                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">${question.answers_count || 0} answers</span>
                        <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">${question.views || 0} views</span>
                    </div>
                </div>
                <div class="answers-section mb-2"></div>
                ${isCommunityMember ? `
                <form class="answer-form mt-2 flex flex-col gap-2">
                    <textarea class="answer-input px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows="2" placeholder="Write your answer..."></textarea>
                    <button type="submit" class="self-end bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-1 rounded-lg text-sm font-semibold">Post Answer</button>
                </form>
                ` : ''}
            `;
            questionsList.appendChild(el);
            // Load answers
            const answersContainer = el.querySelector('.answers-section');
            loadAnswers(question.id, answersContainer);
            // Handle answer form submission
            if (isCommunityMember) {
                const answerForm = el.querySelector('.answer-form');
                const answerInput = el.querySelector('.answer-input');
                answerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const content = answerInput.value.trim();
                    if (!content) {
                        showMessage('Please write an answer.', 'error');
                        return;
                    }
                    try {
                        const res = await fetch(`${API_BASE}/answers/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                content,
                                question: question.id
                            })
                        });
                        if (res.ok) {
                            showMessage('Answer posted!', 'success');
                            answerInput.value = '';
                            loadAnswers(question.id, answersContainer);
                        } else {
                            const data = await res.json();
                            showMessage(data.error || 'Failed to post answer', 'error');
                        }
                    } catch (err) {
                        showMessage('Failed to post answer', 'error');
                    }
                });
            }
        });
    } catch (err) {
        console.error('Failed to load questions:', err);
        questionsList.innerHTML = '<div class="text-red-500 text-center py-8">Failed to load questions.</div>';
    }
}

// Ask question
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = questionTitle.value.trim();
    const content = questionContent.value.trim();
    
    if (!title || !content) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/questions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                title: title,
                content: content,
                community: communityId
            })
        });
        
        if (res.ok) {
            showMessage('Question posted successfully!', 'success');
            questionTitle.value = '';
            questionContent.value = '';
            loadQuestions();
        } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to post question', 'error');
        }
    } catch (err) {
        showMessage('Failed to post question', 'error');
    }
});

// Search communities
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const communityCards = communitiesGrid.querySelectorAll('.bg-white');
    
    communityCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Show message
function showMessage(message, type = 'info') {
    messageContainer.textContent = message;
    messageContainer.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    messageContainer.style.display = 'block';
    
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}

// Copy invite code
function copyInviteCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showMessage('Invite code copied to clipboard!', 'success');
    }).catch(() => {
        showMessage('Failed to copy invite code', 'error');
    });
}

// AI Features
function enableAIFeatures() {
    if (!aiFeaturesEnabled) return;
    
    // Add AI improvement button to question form
    const questionForm = document.getElementById('question-form');
    if (questionForm) {
        const aiButton = document.createElement('button');
        aiButton.type = 'button';
        aiButton.id = 'ai-improve-question';
        aiButton.className = 'bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors mr-2';
        aiButton.innerHTML = '<i class="fas fa-magic mr-2"></i>Improve with AI';
        aiButton.onclick = improveQuestionWithAI;
        
        const submitButton = questionForm.querySelector('button[type="submit"]');
        submitButton.parentNode.insertBefore(aiButton, submitButton);
    }
}

async function improveQuestionWithAI() {
    const title = document.getElementById('question-title').value.trim();
    const content = document.getElementById('question-content').value.trim();
    
    if (!title || !content) {
        showMessage('Please enter both title and content first', 'error');
        return;
    }
    
    const aiButton = document.getElementById('ai-improve-question');
    const originalText = aiButton.innerHTML;
    aiButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Improving...';
    aiButton.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/questions/improve_draft_with_ai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, content })
        });
        
        if (res.ok) {
            const data = await res.json();
            aiImprovementData = data;
            
            // Show AI improvements
            showAIImprovements(data);
        } else {
            const error = await res.json();
            showMessage(error.error || 'Failed to improve question with AI', 'error');
        }
    } catch (err) {
        showMessage('Failed to improve question with AI', 'error');
    } finally {
        aiButton.innerHTML = originalText;
        aiButton.disabled = false;
    }
}

function showAIImprovements(data) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-2xl bg-white">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-magic mr-2 text-purple-500"></i>AI Improvements
                </h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-6">
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Improved Title</h4>
                    <div class="bg-gray-50 p-3 rounded-lg border">
                        <div class="text-sm text-gray-600 mb-1">Original:</div>
                        <div class="text-gray-800 mb-3">${document.getElementById('question-title').value}</div>
                        <div class="text-sm text-gray-600 mb-1">Improved:</div>
                        <div class="text-blue-600 font-medium">${data.improved_title}</div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Improved Content</h4>
                    <div class="bg-gray-50 p-3 rounded-lg border">
                        <div class="text-sm text-gray-600 mb-1">Original:</div>
                        <div class="text-gray-800 mb-3">${document.getElementById('question-content').value}</div>
                        <div class="text-sm text-gray-600 mb-1">Improved:</div>
                        <div class="text-blue-600">${data.improved_content}</div>
                    </div>
                </div>
                
                ${data.suggested_tags && data.suggested_tags.length > 0 ? `
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Suggested Tags</h4>
                    <div class="flex flex-wrap gap-2">
                        ${data.suggested_tags.map(tag => 
                            `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.confidence_score ? `
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">AI Confidence</h4>
                    <div class="flex items-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mr-3">
                            <div class="bg-purple-600 h-2 rounded-full" style="width: ${data.confidence_score * 10}%"></div>
                        </div>
                        <span class="text-sm font-medium text-purple-600">${data.confidence_score}/10</span>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="flex gap-3 mt-6">
                <button onclick="applyAIImprovements()" 
                        class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    <i class="fas fa-check mr-2"></i>Apply Improvements
                </button>
                <button onclick="this.closest('.fixed').remove()" 
                        class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors">
                    Keep Original
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function applyAIImprovements() {
    if (!aiImprovementData) return;
    
    document.getElementById('question-title').value = aiImprovementData.improved_title;
    document.getElementById('question-content').value = aiImprovementData.improved_content;
    
    // Close modal
    document.querySelector('.fixed').remove();
    showMessage('AI improvements applied!', 'success');
}

// AI Answer Feedback
async function getAIAnswerFeedback(answerId) {
    try {
        const res = await fetch(`${API_BASE}/answers/${answerId}/get_ai_feedback/`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (res.ok) {
            const data = await res.json();
            showAIAnswerFeedback(data);
        } else {
            const error = await res.json();
            showMessage(error.error || 'Failed to get AI feedback', 'error');
        }
    } catch (err) {
        showMessage('Failed to get AI feedback', 'error');
    }
}

function showAIAnswerFeedback(data) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-8 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-2xl bg-white">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">
                    <i class="fas fa-robot mr-2 text-blue-500"></i>AI Feedback
                </h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="flex items-center">
                    <span class="font-semibold text-gray-800 mr-3">Assessment Score:</span>
                    <div class="flex items-center">
                        <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${data.assessment_score * 10}%"></div>
                        </div>
                        <span class="text-sm font-medium text-green-600">${data.assessment_score}/10</span>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Feedback</h4>
                    <div class="bg-gray-50 p-3 rounded-lg border text-gray-700">
                        ${data.feedback}
                    </div>
                </div>
                
                ${data.suggestions && data.suggestions.length > 0 ? `
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Suggestions</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-700">
                        ${data.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${data.improved_answer ? `
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Improved Version</h4>
                    <div class="bg-blue-50 p-3 rounded-lg border text-blue-800">
                        ${data.improved_answer}
                    </div>
                </div>
                ` : ''}
                
                ${data.learning_points && data.learning_points.length > 0 ? `
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Learning Points</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-700">
                        ${data.learning_points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Initialize AI features when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Enable AI features if user is a member
    if (communityId) {
        setTimeout(() => {
            enableAIFeatures();
        }, 1000); // Wait for community data to load
    }
}); 