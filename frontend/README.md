# StackIt Frontend

A modern, responsive frontend for the StackIt Q&A platform built with HTML, Tailwind CSS, and vanilla JavaScript.

## Pages

### 1. `index.html` - Login/Register Page
- User authentication with login and registration forms
- Modern, clean design with gradient backgrounds
- Form validation and error handling
- Responsive design for all devices

### 2. `dashboard.html` - Main Dashboard
- Overview of user's activity and communities
- Quick access to recent questions and answers
- Statistics and progress tracking
- Navigation to other sections

### 3. `community.html` - Community Management
- Browse and join communities
- Create new communities
- View community details and members
- Search and filter communities

### 4. `question.html` - Question Detail Page
- View full question with answers
- Vote on questions and answers
- Add new answers with AI assistance
- Confidence meters and rating systems
- Preview and AI enhancement features

### 5. `journal.html` - Learning Journal
- Track learning progress with journal entries
- Filter and search entries by category/rating
- Add new entries with reflection and confidence tracking
- View learning statistics and streaks
- Share entries with learning community

### 6. `profile.html` - User Profile
- Edit profile information and avatar
- Manage preferences and notifications
- View activity statistics and recent activity
- Change password functionality
- User preferences for AI assistance

## Features

### Core Functionality
- **Authentication**: Secure login/logout with session management
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Real-time Updates**: Dynamic content loading and updates
- **Error Handling**: User-friendly error messages and notifications

### AI Integration
- **Question Improvement**: AI suggests improvements to questions
- **Answer Enhancement**: AI helps improve answer quality
- **Tag Suggestions**: Automatic tag recommendations
- **Confidence Tracking**: Users rate their confidence levels

### Learning Features
- **Learning Journal**: Track learning progress and reflections
- **Confidence Meters**: Rate understanding and confidence
- **Learning Streaks**: Track consecutive learning days
- **Community Sharing**: Share learning experiences

### User Experience
- **Zen Mode**: Distraction-free reading mode
- **Breadcrumb Navigation**: Easy navigation between pages
- **Modal Dialogs**: Clean, accessible modal interfaces
- **Loading States**: Smooth loading indicators
- **Success/Error Notifications**: Clear feedback for user actions

## JavaScript Files

### `app.js` - Authentication
- Handles login/register functionality
- Form validation and error handling
- Session management

### `dashboard.js` - Dashboard
- Loads user statistics and recent activity
- Manages community listings
- Handles navigation and user interactions

### `community.js` - Community Management
- Community listing and filtering
- Join/leave community functionality
- Create new communities
- Search and pagination

### `question.js` - Question Details
- Loads question and answer data
- Handles voting and answer submission
- AI assistance integration
- Preview and enhancement features

### `journal.js` - Learning Journal
- Journal entry management
- Filtering and search functionality
- Statistics and progress tracking
- Entry creation and editing

### `profile.js` - User Profile
- Profile information management
- Preferences and settings
- Avatar upload functionality
- Password change and logout

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icons for better UX
- **Responsive Design**: Mobile-first approach
- **Consistent Theming**: Blue/purple gradient theme
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Getting Started

1. Ensure the Django backend is running
2. Open `index.html` in a web browser
3. Register or login to access the platform
4. Navigate through the different pages using the interface

## API Integration

All pages communicate with the Django REST API endpoints:
- Authentication: `/api/auth/`
- Communities: `/api/communities/`
- Questions: `/api/questions/`
- Journal: `/api/journal/`
- User Profile: `/api/auth/user/`

## Development Notes

- No build process required - pure HTML/CSS/JS
- All API calls use fetch with credentials
- CSRF tokens handled automatically
- Error handling with user-friendly messages
- Modular JavaScript classes for maintainability 