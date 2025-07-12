from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Admin configuration for custom User model"""
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_mentor', 
                   'questions_asked', 'answers_given', 'total_points', 'is_staff')
    list_filter = ('is_mentor', 'is_staff', 'is_superuser', 'is_active', 'zen_mode_enabled')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-total_points', '-questions_asked')
    
    fieldsets = UserAdmin.fieldsets + (
        ('StackIt Profile', {
            'fields': ('bio', 'avatar', 'is_mentor', 'zen_mode_enabled', 'email_notifications')
        }),
        ('Learning Stats', {
            'fields': ('questions_asked', 'answers_given', 'total_points')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('StackIt Profile', {
            'fields': ('bio', 'avatar', 'is_mentor', 'zen_mode_enabled', 'email_notifications')
        }),
    )
    
    readonly_fields = ('questions_asked', 'answers_given', 'total_points', 'created_at', 'updated_at')
