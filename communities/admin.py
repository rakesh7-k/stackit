from django.contrib import admin
from .models import Community, CommunityInvite, CommunityJoinRequest


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    """Admin configuration for Community model"""
    
    list_display = ('name', 'owner', 'is_private', 'members_count', 'mentors_count', 
                   'total_questions', 'total_answers', 'created_at')
    list_filter = ('is_private', 'created_at')
    search_fields = ('name', 'description', 'owner__username')
    readonly_fields = ('id', 'invite_code', 'total_questions', 'total_answers', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    def members_count(self, obj):
        return obj.members.count()
    members_count.short_description = 'Members'
    
    def mentors_count(self, obj):
        return obj.mentors.count()
    mentors_count.short_description = 'Mentors'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'owner')
        }),
        ('Privacy Settings', {
            'fields': ('is_private', 'invite_code')
        }),
        ('Members', {
            'fields': ('members', 'mentors'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('total_questions', 'total_answers'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ('members', 'mentors')


@admin.register(CommunityJoinRequest)
class CommunityJoinRequestAdmin(admin.ModelAdmin):
    """Admin configuration for Community Join Request model"""
    
    list_display = ('user', 'community', 'status', 'created_at', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'created_at', 'reviewed_at')
    search_fields = ('user__username', 'community__name', 'message')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Request Information', {
            'fields': ('community', 'user', 'status', 'message')
        }),
        ('Review Information', {
            'fields': ('reviewed_by', 'reviewed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('community', 'user', 'reviewed_by')


@admin.register(CommunityInvite)
class CommunityInviteAdmin(admin.ModelAdmin):
    """Admin configuration for Community Invite model"""
    
    list_display = ('community', 'invited_by', 'email', 'accepted', 'created_at')
    list_filter = ('accepted', 'created_at')
    search_fields = ('community__name', 'invited_by__username', 'email')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Invite Information', {
            'fields': ('community', 'invited_by', 'email', 'accepted')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('community', 'invited_by')
