"""
URL configuration for stackit_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, AuthViewSet
from qa.views import (
    QuestionViewSet, AnswerViewSet, LearningJournalViewSet, 
    UserPreferenceViewSet, AIServiceViewSet
)
from communities.views import CommunityViewSet, CommunityInviteViewSet, CommunityJoinRequestViewSet
from .views import serve_frontend

# Create router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'answers', AnswerViewSet, basename='answer')
router.register(r'learning-journal', LearningJournalViewSet, basename='learning-journal')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')
router.register(r'ai-services', AIServiceViewSet, basename='ai-service')
router.register(r'communities', CommunityViewSet, basename='community')
router.register(r'community-invites', CommunityInviteViewSet, basename='community-invite')
router.register(r'community-join-requests', CommunityJoinRequestViewSet, basename='community-join-request')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # Frontend routes - serve HTML files
    path('', serve_frontend, {'page_name': 'index'}, name='home'),
    path('dashboard/', serve_frontend, {'page_name': 'dashboard'}, name='dashboard'),
    path('community/', serve_frontend, {'page_name': 'community'}, name='community'),
    path('question/', serve_frontend, {'page_name': 'question'}, name='question'),
    path('journal/', serve_frontend, {'page_name': 'journal'}, name='journal'),
    path('profile/', serve_frontend, {'page_name': 'profile'}, name='profile'),
    # Add this line to catch *.html URLs
    re_path(r'^(?P<page_name>\w+)\.html$', serve_frontend),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
