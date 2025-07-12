from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Community(models.Model):
    """Private community for Q&A discussions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_communities')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='communities')
    mentors = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='mentor_communities', blank=True)
    
    # Privacy settings
    is_private = models.BooleanField(default=True)
    invite_code = models.CharField(max_length=20, unique=True, blank=True)
    
    # Stats
    total_questions = models.IntegerField(default=0)
    total_answers = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
    
    def increment_questions(self):
        """Increment total questions counter"""
        self.total_questions += 1
        self.save()
    
    def increment_answers(self):
        """Increment total answers counter"""
        self.total_answers += 1
        self.save()


class CommunityJoinRequest(models.Model):
    """Model for community join requests that need approval"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='join_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(max_length=500, blank=True, help_text="Optional message from the user")
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_requests')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['community', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} -> {self.community.name} ({self.status})"


class CommunityInvite(models.Model):
    """Invite model for private communities"""
    
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='invites')
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invites')
    email = models.EmailField()
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Invite to {self.community.name} for {self.email}"
