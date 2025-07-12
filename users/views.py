from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import update_last_login
from .models import User
from .serializers import UserSerializer
from qa.models import LearningJournal
from qa.serializers import LearningJournalSerializer


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_queryset(self):
        """Filter users based on communities"""
        # Temporarily return all users for testing
        return User.objects.all()
        # user = self.request.user
        # return User.objects.filter(
        #     communities__in=user.communities.all()
        # ).distinct()
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user's profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user's profile"""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user's statistics"""
        # Temporarily use first user for testing
        user = User.objects.first() if User.objects.exists() else None
        if not user:
            return Response({
                'total_points': 0,
                'questions_asked': 0,
                'answers_given': 0,
                'reputation_score': 0,
                'communities_count': 0,
                'mentor_communities_count': 0,
                'total_activities': 0,
                'recent_activities': []
            })
        
        journal_entries = LearningJournal.objects.filter(user=user)
        
        stats = {
            'total_points': user.total_points,
            'questions_asked': user.questions_asked,
            'answers_given': user.answers_given,
            'reputation_score': user.get_reputation_score(),
            'communities_count': user.communities.count(),
            'mentor_communities_count': user.mentor_communities.count(),
            'total_activities': journal_entries.count(),
            'recent_activities': LearningJournalSerializer(
                journal_entries[:5], many=True
            ).data
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def toggle_mentor_status(self, request):
        """Toggle user's mentor status"""
        user = request.user
        user.is_mentor = not user.is_mentor
        user.save()
        
        return Response({
            'is_mentor': user.is_mentor,
            'message': f'Mentor status {"enabled" if user.is_mentor else "disabled"}'
        })
    
    @action(detail=False, methods=['post'])
    def toggle_zen_mode(self, request):
        """Toggle user's zen mode"""
        user = request.user
        user.zen_mode_enabled = not user.zen_mode_enabled
        user.save()
        
        return Response({
            'zen_mode_enabled': user.zen_mode_enabled,
            'message': f'Zen mode {"enabled" if user.zen_mode_enabled else "disabled"}'
        })


class AuthViewSet(viewsets.ViewSet):
    """ViewSet for authentication"""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """User login"""
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            update_last_login(None, user)
            
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """User logout"""
        logout(request)
        return Response({
            'message': 'Logout successful'
        })
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """User registration"""
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not all([username, email, password]):
            return Response({
                'error': 'Username, email, and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        login(request, user)
        
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def check_auth(self, request):
        """Check if user is authenticated"""
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response({
                'authenticated': True,
                'user': serializer.data
            })
        else:
            return Response({
                'authenticated': False
            })
