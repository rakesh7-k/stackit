from django.contrib import admin
from .models import Question, Answer, LearningJournal, AIService, UserPreference


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin configuration for Question model"""
    
    list_display = ('title', 'author', 'community', 'is_resolved', 'view_count', 
                   'created_at', 'is_featured')
    list_filter = ('is_resolved', 'is_featured', 'community', 'created_at')
    search_fields = ('title', 'content', 'author__username', 'community__name')
    readonly_fields = ('id', 'view_count', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'content', 'author', 'community', 'tags')
        }),
        ('AI Enhancement', {
            'fields': ('ai_improved_title', 'ai_improved_content', 'ai_suggested_tags', 'ai_similar_questions'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_resolved', 'resolved_answer', 'is_featured', 'view_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """Admin configuration for Answer model"""
    
    list_display = ('question', 'author', 'confidence_level', 'is_accepted', 
                   'mentor_verified', 'vote_score', 'created_at')
    list_filter = ('is_accepted', 'mentor_verified', 'confidence_level', 'created_at')
    search_fields = ('content', 'author__username', 'question__title')
    readonly_fields = ('id', 'vote_score', 'upvotes_count', 'downvotes_count', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    def vote_score(self, obj):
        return obj.get_vote_score()
    vote_score.short_description = 'Vote Score'
    
    def upvotes_count(self, obj):
        return obj.upvotes.count()
    upvotes_count.short_description = 'Upvotes'
    
    def downvotes_count(self, obj):
        return obj.downvotes.count()
    downvotes_count.short_description = 'Downvotes'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('question', 'author', 'content', 'confidence_level')
        }),
        ('AI Feedback', {
            'fields': ('ai_feedback', 'ai_improved_content', 'ai_suggestions'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_accepted', 'mentor_verified', 'verified_by')
        }),
        ('Voting', {
            'fields': ('upvotes', 'downvotes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LearningJournal)
class LearningJournalAdmin(admin.ModelAdmin):
    """Admin configuration for LearningJournal model"""
    
    list_display = ('user', 'activity_type', 'title', 'points_earned', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__username', 'title', 'description')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Activity Information', {
            'fields': ('user', 'activity_type', 'title', 'description')
        }),
        ('Related Content', {
            'fields': ('related_question', 'related_answer'),
            'classes': ('collapse',)
        }),
        ('Learning Metrics', {
            'fields': ('points_earned', 'confidence_before', 'confidence_after')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(AIService)
class AIServiceAdmin(admin.ModelAdmin):
    """Admin configuration for AIService model"""
    
    list_display = ('service_type', 'processing_time', 'tokens_used', 'created_at')
    list_filter = ('service_type', 'created_at')
    search_fields = ('input_text', 'output_text')
    readonly_fields = ('id', 'processing_time', 'tokens_used', 'created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Service Information', {
            'fields': ('service_type', 'input_text', 'output_text')
        }),
        ('Performance', {
            'fields': ('processing_time', 'tokens_used'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    """Admin configuration for UserPreference model"""
    
    list_display = ('user', 'zen_mode_enabled', 'dark_mode_enabled', 'email_notifications')
    list_filter = ('zen_mode_enabled', 'dark_mode_enabled', 'email_notifications', 'show_ai_suggestions')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('UI Preferences', {
            'fields': ('zen_mode_enabled', 'dark_mode_enabled')
        }),
        ('Notification Preferences', {
            'fields': ('email_notifications', 'question_notifications', 'answer_notifications', 'mentor_notifications')
        }),
        ('Learning Preferences', {
            'fields': ('auto_confidence_prompt', 'show_ai_suggestions', 'track_learning_progress')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
