# 🏆 StackIt - The Private Smart Q&A Platform

> **StackIt is a private, AI-assisted Q&A platform built for students, clubs, and learning teams — where beginners feel safe to ask, grow, and become mentors.**

## 🎯 One-Liner

> StackIt is a private, AI-assisted Q&A platform built for students, clubs, and learning teams — where beginners feel safe to ask, grow, and become mentors.

## 💡 The Core Problem We Solved

> Platforms like Stack Overflow are overwhelming, public, and not beginner-friendly. Learners often feel afraid to ask. Communities lack safe spaces to learn and grow.

## ✅ What We Built (8-Hour MVP)

| Feature | Why It's Unique + Judge-Impressing |
|---------|-----------------------------------|
| 🧠 Ask Assistant (AI) | Converts messy ideas into great questions |
| 🧘 Zen Mode UI | No clutter, no noise, just focused learning |
| 🔒 Private Communities | Invite-only access — no public exposure |
| 📓 Learning Journal | Track personal growth in asking + answering |
| 💬 Confidence Meter on Answers | Users self-rate how sure they are |
| 🧑‍🏫 Mentor Mode | Tag mentors in a community — human connection |
| 🧠 AI Feedback on Answers | GPT reviews and improves what you wrote |

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stack-it
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   OPENAI_API_KEY=your-openai-api-key-here
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/
   - Username: admin, Password: (set during superuser creation)

## 🏗️ Project Structure

```
stack-it/
├── stackit_backend/          # Django project settings
├── users/                    # User management app
├── communities/              # Community management app
├── qa/                      # Q&A functionality app
├── requirements.txt          # Python dependencies
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration
- `GET /api/auth/check_auth/` - Check authentication status

### Users
- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/update_profile/` - Update user profile
- `GET /api/users/stats/` - Get user statistics
- `POST /api/users/toggle_mentor_status/` - Toggle mentor status
- `POST /api/users/toggle_zen_mode/` - Toggle zen mode

### Communities
- `GET /api/communities/` - List user's communities
- `POST /api/communities/` - Create new community
- `POST /api/communities/{id}/join/` - Join community with invite code
- `POST /api/communities/{id}/leave/` - Leave community
- `POST /api/communities/{id}/add_mentor/` - Add mentor to community
- `POST /api/communities/{id}/invite_user/` - Invite user to community
- `GET /api/communities/{id}/questions/` - Get community questions
- `GET /api/communities/{id}/members/` - Get community members
- `GET /api/communities/{id}/mentors/` - Get community mentors

### Questions
- `GET /api/questions/` - List questions
- `POST /api/questions/` - Create question with AI assistance
- `GET /api/questions/{id}/` - Get question details
- `POST /api/questions/{id}/improve_with_ai/` - Improve question with AI
- `POST /api/questions/{id}/increment_view/` - Increment view count
- `GET /api/questions/search/` - Search questions
- `GET /api/questions/featured/` - Get featured questions

### Answers
- `GET /api/answers/` - List answers
- `POST /api/answers/` - Create answer with AI feedback
- `GET /api/answers/{id}/` - Get answer details
- `POST /api/answers/{id}/upvote/` - Upvote answer
- `POST /api/answers/{id}/downvote/` - Downvote answer
- `POST /api/answers/{id}/accept/` - Accept answer
- `POST /api/answers/{id}/verify_as_mentor/` - Verify answer as mentor
- `POST /api/answers/{id}/get_ai_feedback/` - Get AI feedback

### Learning Journal
- `GET /api/learning-journal/` - Get user's learning journal
- `GET /api/learning-journal/stats/` - Get learning statistics

### User Preferences
- `GET /api/preferences/` - Get user preferences
- `POST /api/preferences/` - Create user preferences
- `POST /api/preferences/{id}/toggle_zen_mode/` - Toggle zen mode

## 🧠 AI Features

### Ask Assistant
- Automatically improves question titles and content
- Suggests relevant tags
- Finds similar questions
- Uses OpenAI GPT-3.5-turbo

### Answer Feedback
- Reviews answer quality and clarity
- Provides constructive feedback
- Suggests improvements
- Offers improved versions

### Tag Suggestions
- AI-powered tag recommendations
- Context-aware suggestions
- Improves question discoverability

## 🔒 Privacy & Security

- **Private Communities**: Invite-only access
- **User Control**: Users can leave communities anytime
- **Mentor System**: Verified mentors can verify answers
- **Confidence Meter**: Honest self-assessment of knowledge
- **Learning Journal**: Private tracking of growth

## 🎨 UI/UX Features

### Zen Mode
- Distraction-free writing environment
- Minimal interface for focused learning
- Toggle on/off per user preference

### Confidence Meter
- 0-100% confidence rating on answers
- Encourages honest self-assessment
- Tracks confidence improvement over time

### Learning Journal
- Personal growth tracking
- Activity history
- Points and achievements
- Confidence progression

## 🧑‍🏫 Mentor System

- **Mentor Verification**: Mentors can verify high-quality answers
- **Mentor Assignment**: Community owners can assign mentors
- **Mentor Recognition**: Special badges and privileges
- **Mentor Growth**: Track mentor contributions

## 📊 Learning Analytics

- **Personal Stats**: Questions asked, answers given, points earned
- **Community Stats**: Activity levels, member engagement
- **AI Usage**: Track AI assistance usage and effectiveness
- **Growth Tracking**: Monitor learning progress over time

## 🚀 Deployment

### Production Setup
1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS settings for your domain
5. Set up proper environment variables

### Environment Variables
```bash
SECRET_KEY=your-production-secret-key
DEBUG=False
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=your-database-url
ALLOWED_HOSTS=your-domain.com
```

## 🏆 Why This Will Win Hackathons

### Judge Criteria ✅

| Criteria | StackIt Checks the Box? |
|----------|------------------------|
| ✅ Real-World Problem | Yes — anxiety & confusion in Q&A is real |
| ✅ Innovation | Ask Assistant, Confidence Meter, AI Coach |
| ✅ Working MVP | Core Q&A, Ask Flow, AI, Communities = Built |
| ✅ Impact | Useful for schools, bootcamps, dev teams |
| ✅ Simplicity + UX | Zen UI, fast interactions, zero distractions |
| ✅ Bonus: Feels Polished | Smart transitions, thoughtful details |

## 🎤 Final Pitch

> ❝ We built StackIt because not everyone learns best in public.
> In coding clubs, classrooms, and bootcamps — people need a safe space to ask questions, learn from peers, and grow.
> Our platform doesn't just collect questions — it helps you ask better, gives you AI-powered coaching, and lets you track your growth as a learner.
> 
> We removed clutter. We removed fear. We added clarity, mentorship, and growth.
> That's what makes StackIt more than just a Q&A site. It's your personal learning companion — powered by community and guided by AI. ❞

## 💥 Final Mic-Drop Line

> ❝ We didn't just build a Q&A platform.
> We built a space where beginners become confident learners — and confident learners become mentors. ❞

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-3.5-turbo API
- Django REST Framework for the robust API
- The hackathon community for inspiration

---

**Built with ❤️ for hackathon success! 🏆🚀** 