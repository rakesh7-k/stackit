from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom User model for StackIt platform"""
    
    # Profile fields
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.URLField(blank=True)
    is_mentor = models.BooleanField(default=False)
    
    # Learning stats
    questions_asked = models.IntegerField(default=0)
    answers_given = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)
    
    # Preferences
    zen_mode_enabled = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username
    
    def get_reputation_score(self):
        """Calculate user's reputation score"""
        return self.total_points + (self.questions_asked * 5) + (self.answers_given * 10)
    
    def increment_questions_asked(self):
        """Increment questions asked counter"""
        self.questions_asked += 1
        self.save()
    
    def increment_answers_given(self):
        """Increment answers given counter"""
        self.answers_given += 1
        self.save()
    
    def add_points(self, points):
        """Add points to user's total"""
        self.total_points += points
        self.save()
