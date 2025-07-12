from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Question(models.Model):
    """Question model with AI assistance and learning features"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='questions')
    community = models.ForeignKey('communities.Community', on_delete=models.CASCADE, related_name='questions')
    
    # AI-enhanced fields
    ai_improved_title = models.CharField(max_length=200, blank=True)
    ai_improved_content = models.TextField(blank=True)
    ai_suggested_tags = models.JSONField(default=list, blank=True)
    ai_similar_questions = models.JSONField(default=list, blank=True)
    
    # Learning features
    tags = models.JSONField(default=list)
    is_featured = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    
    # Status
    is_resolved = models.BooleanField(default=False)
    resolved_answer = models.ForeignKey('Answer', on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_for')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save()
    
    def get_answers_count(self):
        """Get number of answers"""
        return self.answers.count()


class Answer(models.Model):
    """Answer model with confidence meter and AI feedback"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    
    # Confidence meter (0-100)
    confidence_level = models.IntegerField(default=50, help_text="How confident are you in this answer? (0-100)")
    
    # AI feedback
    ai_feedback = models.TextField(blank=True)
    ai_improved_content = models.TextField(blank=True)
    ai_suggestions = models.JSONField(default=list, blank=True)
    
    # Learning features
    is_accepted = models.BooleanField(default=False)
    upvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='upvoted_answers', blank=True)
    downvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='downvoted_answers', blank=True)
    
    # Mentor features
    mentor_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_answers')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Answer to: {self.question.title[:50]}"
    
    def get_vote_score(self):
        """Calculate vote score"""
        return self.upvotes.count() - self.downvotes.count()
    
    def accept_answer(self):
        """Mark answer as accepted"""
        self.is_accepted = True
        self.question.is_resolved = True
        self.question.resolved_answer = self
        self.question.save()
        self.save()
        
        # Award points to author
        self.author.add_points(50)
        self.author.increment_answers_given()


class LearningJournal(models.Model):
    """Learning journal to track user's growth"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_journal')
    
    # Learning activity
    activity_type = models.CharField(max_length=50, choices=[
        ('question_asked', 'Question Asked'),
        ('answer_given', 'Answer Given'),
        ('answer_accepted', 'Answer Accepted'),
        ('mentor_verified', 'Mentor Verified'),
        ('community_joined', 'Community Joined'),
        ('confidence_improved', 'Confidence Improved'),
    ])
    
    # Activity details
    title = models.CharField(max_length=200)
    description = models.TextField()
    related_question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True, blank=True)
    related_answer = models.ForeignKey(Answer, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Learning metrics
    points_earned = models.IntegerField(default=0)
    confidence_before = models.IntegerField(null=True, blank=True)
    confidence_after = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"
    
    class Meta:
        ordering = ['-created_at']


class AIService(models.Model):
    """AI service for question improvement and feedback"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Service type
    service_type = models.CharField(max_length=50, choices=[
        ('question_improvement', 'Question Improvement'),
        ('answer_feedback', 'Answer Feedback'),
        ('tag_suggestion', 'Tag Suggestion'),
        ('similar_questions', 'Similar Questions'),
    ])
    
    # Request/Response
    input_text = models.TextField()
    output_text = models.TextField()
    metadata = models.JSONField(default=dict)
    
    # Performance
    processing_time = models.FloatField(default=0.0)
    tokens_used = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.service_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['-created_at']


class UserPreference(models.Model):
    """User preferences for the platform"""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    
    # UI preferences
    zen_mode_enabled = models.BooleanField(default=False)
    dark_mode_enabled = models.BooleanField(default=False)
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    question_notifications = models.BooleanField(default=True)
    answer_notifications = models.BooleanField(default=True)
    mentor_notifications = models.BooleanField(default=True)
    
    # Learning preferences
    auto_confidence_prompt = models.BooleanField(default=True)
    show_ai_suggestions = models.BooleanField(default=True)
    track_learning_progress = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"
