const API_BASE = 'http://localhost:8000/api';

// Elements
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userMentorBadge = document.getElementById('user-mentor-badge');
const userZenBadge = document.getElementById('user-zen-badge');
const userPoints = document.getElementById('user-points');
const userQuestions = document.getElementById('user-questions');
const userAnswers = document.getElementById('user-answers');
const communitiesList = document.getElementById('communities-list');
const joinCommunityForm = document.getElementById('join-community-form');
const joinInviteCode = document.getElementById('join-invite-code');
const joinCommunityMsg = document.getElementById('join-community-msg');
const createCommunityBtn = document.getElementById('create-community-btn');
const logoutBtn = document.getElementById('logout-btn');
const zenToggle = document.getElementById('zen-toggle');
const profileBtn = document.getElementById('profile-btn');
const journalBtn = document.getElementById('journal-btn');

// Auth check
const user = JSON.parse(localStorage.getItem('stackit_user'));
if (!user) {
  window.location.href = 'index.html';
}

// Check if user is still authenticated on server
async function checkAuth() {
  try {
    // Temporarily bypass authentication check for testing
    console.log('Bypassing authentication check for testing...');
    return true;
    
    // Original authentication check (commented out for testing)
    /*
    const res = await fetch(`${API_BASE}/auth/check_auth/`, {
      method: 'GET',
      credentials: 'include', // This is crucial for sending cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log('Auth check response:', data);
    
    if (!data.authenticated) {
      console.log('User not authenticated, redirecting to login');
      localStorage.removeItem('stackit_user');
      window.location.href = 'index.html';
    } else {
      console.log('User authenticated successfully');
      // Update user data from server
      if (data.user) {
        localStorage.setItem('stackit_user', JSON.stringify(data.user));
        renderUserInfo(data.user);
      }
    }
    */
  } catch (err) {
    console.error('Auth check failed:', err);
    // Don't redirect on network errors, just log the error
  }
}

// Check auth on page load
checkAuth();

// Load user info
function renderUserInfo(user) {
  userName.textContent = user.first_name || user.username;
  userEmail.textContent = user.email;
  userPoints.textContent = user.total_points;
  userQuestions.textContent = user.questions_asked;
  userAnswers.textContent = user.answers_given;
  if (user.is_mentor) userMentorBadge.style.display = '';
  else userMentorBadge.style.display = 'none';
  if (user.zen_mode_enabled) userZenBadge.style.display = '';
  else userZenBadge.style.display = 'none';
  // Avatar: use initials or emoji
  if (user.avatar) {
    userAvatar.innerHTML = `<img src="${user.avatar}" class="w-20 h-20 rounded-full">`;
  } else {
    const initials = (user.first_name ? user.first_name[0] : user.username[0]).toUpperCase();
    userAvatar.textContent = initials;
  }
}
renderUserInfo(user);

// Load communities
async function loadCommunities() {
  communitiesList.innerHTML = '<div class="text-gray-400 text-sm">Loading...</div>';
  try {
    const res = await fetch(`${API_BASE}/communities/my_communities/`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to load communities');
    const communities = await res.json();
    if (communities.length === 0) {
      communitiesList.innerHTML = '<div class="text-gray-400 text-sm">You have not joined any communities yet.</div>';
      return;
    }
    communitiesList.innerHTML = '';
    communities.forEach(c => {
      const el = document.createElement('div');
      el.className = 'p-4 bg-white rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-2';
      
      // Check if user is the owner to show invite code
      const isOwner = c.owner && c.owner.id === user.id;
      const inviteCodeSection = isOwner ? `
        <div class="mt-2 flex items-center gap-2">
          <span class="text-xs text-gray-500">Invite Code:</span>
          <span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded" id="invite-${c.id}">${c.invite_code}</span>
          <button onclick="copyInviteCode('${c.invite_code}')" class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">Copy</button>
        </div>
      ` : '';
      
      el.innerHTML = `
        <div>
          <div class="font-semibold text-lg text-gray-800">${c.name}</div>
          <div class="text-sm text-gray-500">${c.description}</div>
          <div class="mt-1 flex gap-2 text-xs">
            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">${c.members_count} members</span>
            <span class="bg-green-100 text-green-700 px-2 py-1 rounded">${c.mentors_count} mentors</span>
            <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded">${c.total_questions} questions</span>
            ${isOwner ? '<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Owner</span>' : ''}
          </div>
          ${inviteCodeSection}
        </div>
        <div class="flex gap-2 mt-2 md:mt-0">
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold" onclick="window.location.href='community.html?id=${c.id}'">Enter</button>
        </div>
      `;
      communitiesList.appendChild(el);
    });
  } catch (err) {
    communitiesList.innerHTML = '<div class="text-red-500 text-sm">Failed to load communities.</div>';
  }
}

// Copy invite code to clipboard
function copyInviteCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showMessage('Invite code copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showMessage('Invite code copied to clipboard!', 'success');
  });
}

// Show message function
function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  messageEl.textContent = message;
  
  // Add to page
  document.body.appendChild(messageEl);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 3000);
}

// Join community
joinCommunityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  joinCommunityMsg.textContent = '';
  const code = joinInviteCode.value.trim();
  if (!code) return;
  joinCommunityMsg.textContent = 'Joining...';
  try {
    // Find all communities to get the id by invite code
    const res = await fetch(`${API_BASE}/communities/`, { credentials: 'include' });
    const allCommunities = await res.json();
    const community = allCommunities.find(c => c.invite_code === code.toUpperCase());
    if (!community) {
      joinCommunityMsg.textContent = 'Invalid invite code.';
      joinCommunityMsg.className = 'text-red-500 text-sm';
      return;
    }
    // Join
    const joinRes = await fetch(`${API_BASE}/communities/${community.id}/join/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ invite_code: code })
    });
    const joinData = await joinRes.json();
    if (joinRes.ok) {
      joinCommunityMsg.textContent = joinData.message;
      joinCommunityMsg.className = 'text-green-600 text-sm';
      loadCommunities();
    } else {
      joinCommunityMsg.textContent = joinData.error || 'Failed to join.';
      joinCommunityMsg.className = 'text-red-500 text-sm';
    }
  } catch (err) {
    joinCommunityMsg.textContent = 'Network error.';
    joinCommunityMsg.className = 'text-red-500 text-sm';
  }
});

// Create community (simple modal prompt)
createCommunityBtn.addEventListener('click', async () => {
  // Show the create community form instead of using prompts
  const createForm = document.getElementById('create-community-form');
  createForm.style.display = 'block';
  document.getElementById('community-name').focus();
});

// Handle create community form submission
document.getElementById('new-community-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('community-name').value.trim();
  const description = document.getElementById('community-description').value.trim();
  
  if (!name || !description) {
    showMessage('Please fill in all fields.', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/communities/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description })
    });
    const data = await res.json();
    if (res.ok) {
      showMessage('Community created successfully!', 'success');
      // Hide the form
      document.getElementById('create-community-form').style.display = 'none';
      // Clear the form
      document.getElementById('new-community-form').reset();
      // Reload communities
      loadCommunities();
    } else {
      showMessage(data.error || 'Failed to create community.', 'error');
    }
  } catch (err) {
    showMessage('Network error.', 'error');
  }
});

// Handle cancel create community
document.getElementById('cancel-create-community').addEventListener('click', () => {
  document.getElementById('create-community-form').style.display = 'none';
  document.getElementById('new-community-form').reset();
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await fetch(`${API_BASE}/auth/logout/`, { method: 'POST', credentials: 'include' });
  localStorage.removeItem('stackit_user');
  window.location.href = 'index.html';
});

// Zen Mode toggle (UI only)
zenToggle.addEventListener('click', () => {
  document.body.classList.toggle('zen-bg');
  userZenBadge.style.display = userZenBadge.style.display === 'none' ? '' : 'none';
});

// Navigation
profileBtn.addEventListener('click', () => {
  window.location.href = 'profile.html';
});
journalBtn.addEventListener('click', () => {
  window.location.href = 'journal.html';
}); 