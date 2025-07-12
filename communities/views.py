from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from .models import Community, CommunityInvite, CommunityJoinRequest
from .serializers import CommunitySerializer, CommunityInviteSerializer, CommunityJoinRequestSerializer
from qa.serializers import QuestionSerializer, UserSerializer
from qa.models import Question

User = get_user_model()


class CommunityViewSet(viewsets.ModelViewSet):
    """ViewSet for Community model"""
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_queryset(self):
        """Filter communities based on user membership"""
        # Temporarily return all communities for testing
        return Community.objects.all().select_related('owner').prefetch_related('members', 'mentors')
        # user = self.request.user
        # return Community.objects.filter(
        #     Q(members=user) | Q(owner=user) | Q(mentors=user)
        # ).select_related('owner').prefetch_related('members', 'mentors')
    
    def perform_create(self, serializer):
        """Create community and add owner as member"""
        # Temporarily use first user for testing
        user = User.objects.first() if User.objects.exists() else None
        if user:
            community = serializer.save(owner=user)
            community.members.add(user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def request_join(self, request, pk=None):
        """Request to join a community (requires approval)"""
        community = self.get_object()
        message = request.data.get('message', '')
        
        # Temporarily use first user for testing since auth is disabled
        user = User.objects.first() if User.objects.exists() else None
        if not user:
            return Response({
                'error': 'No users available for testing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Original code (commented out for testing)
        # user = request.user
        
        # Check if user is already a member
        if user in community.members.all():
            return Response({
                'error': 'Already a member of this community'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if there's already a pending request
        existing_request = CommunityJoinRequest.objects.filter(
            community=community, 
            user=user, 
            status='pending'
        ).first()
        
        if existing_request:
            return Response({
                'error': 'You already have a pending request for this community'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create join request
        join_request = CommunityJoinRequest.objects.create(
            community=community,
            user=user,
            message=message
        )
        
        return Response({
            'message': f'Join request sent to {community.name}. Waiting for approval.',
            'request_id': join_request.id
        })
    
    @action(detail=True, methods=['post'])
    def approve_join_request(self, request, pk=None):
        """Approve a join request (community owner only)"""
        community = self.get_object()
        request_id = request.data.get('request_id')
        
        # Temporarily use first user for testing since auth is disabled
        user = User.objects.first() if User.objects.exists() else None
        if not user:
            return Response({
                'error': 'No users available for testing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Original code (commented out for testing)
        # user = request.user
        
        # Check if user is the community owner
        if user != community.owner:
            return Response({
                'error': 'Only community owner can approve join requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            join_request = CommunityJoinRequest.objects.get(
                id=request_id,
                community=community,
                status='pending'
            )
            
            # Approve the request
            join_request.status = 'approved'
            join_request.reviewed_by = user
            join_request.reviewed_at = timezone.now()
            join_request.save()
            
            # Add user to community
            community.members.add(join_request.user)
            
            return Response({
                'message': f'Approved {join_request.user.username}\'s join request'
            })
            
        except CommunityJoinRequest.DoesNotExist:
            return Response({
                'error': 'Join request not found or already processed'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def reject_join_request(self, request, pk=None):
        """Reject a join request (community owner only)"""
        community = self.get_object()
        request_id = request.data.get('request_id')
        
        # Temporarily use first user for testing since auth is disabled
        user = User.objects.first() if User.objects.exists() else None
        if not user:
            return Response({
                'error': 'No users available for testing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Original code (commented out for testing)
        # user = request.user
        
        # Check if user is the community owner
        if user != community.owner:
            return Response({
                'error': 'Only community owner can reject join requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            join_request = CommunityJoinRequest.objects.get(
                id=request_id,
                community=community,
                status='pending'
            )
            
            # Reject the request
            join_request.status = 'rejected'
            join_request.reviewed_by = user
            join_request.reviewed_at = timezone.now()
            join_request.save()
            
            return Response({
                'message': f'Rejected {join_request.user.username}\'s join request'
            })
            
        except CommunityJoinRequest.DoesNotExist:
            return Response({
                'error': 'Join request not found or already processed'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def join_requests(self, request, pk=None):
        """Get pending join requests for a community (owner only)"""
        community = self.get_object()
        
        # Temporarily use first user for testing since auth is disabled
        user = User.objects.first() if User.objects.exists() else None
        if not user:
            return Response({
                'error': 'No users available for testing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Original code (commented out for testing)
        # user = request.user
        
        # Check if user is the community owner
        if user != community.owner:
            return Response({
                'error': 'Only community owner can view join requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        join_requests = CommunityJoinRequest.objects.filter(
            community=community,
            status='pending'
        ).select_related('user')
        
        serializer = CommunityJoinRequestSerializer(join_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a community"""
        community = self.get_object()
        
        # Temporarily use first user for testing since auth is disabled
        user = User.objects.first() if User.objects.exists() else None
        if not user:
            return Response({
                'error': 'No users available for testing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Original code (commented out for testing)
        # user = request.user
        
        if user == community.owner:
            return Response({
                'error': 'Community owner cannot leave'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        community.members.remove(user)
        community.mentors.remove(user)
        
        return Response({
            'message': f'Successfully left {community.name}'
        })
    
    @action(detail=True, methods=['post'])
    def add_mentor(self, request, pk=None):
        """Add a mentor to the community"""
        community = self.get_object()
        user_id = request.data.get('user_id')
        
        if request.user != community.owner:
            return Response({
                'error': 'Only community owner can add mentors'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=user_id)
            if user not in community.members.all():
                return Response({
                    'error': 'User must be a member before becoming a mentor'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            community.mentors.add(user)
            user.is_mentor = True
            user.save()
            
            return Response({
                'message': f'{user.username} added as mentor'
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def remove_mentor(self, request, pk=None):
        """Remove a mentor from the community"""
        community = self.get_object()
        user_id = request.data.get('user_id')
        
        if request.user != community.owner:
            return Response({
                'error': 'Only community owner can remove mentors'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(id=user_id)
            community.mentors.remove(user)
            
            # Check if user is mentor in other communities
            if not user.mentor_communities.exists():
                user.is_mentor = False
                user.save()
            
            return Response({
                'message': f'{user.username} removed as mentor'
            })
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions in this community"""
        community = self.get_object()
        questions = Question.objects.filter(community=community).select_related('author')
        serializer = QuestionSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get community members"""
        community = self.get_object()
        members = community.members.all()
        serializer = UserSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def mentors(self, request, pk=None):
        """Get community mentors"""
        community = self.get_object()
        mentors = community.mentors.all()
        serializer = UserSerializer(mentors, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def invite_user(self, request, pk=None):
        """Invite a user to the community"""
        community = self.get_object()
        email = request.data.get('email')
        
        if request.user != community.owner:
            return Response({
                'error': 'Only community owner can send invites'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if invite already exists
        if CommunityInvite.objects.filter(community=community, email=email).exists():
            return Response({
                'error': 'Invite already sent to this email'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invite = CommunityInvite.objects.create(
            community=community,
            invited_by=request.user,
            email=email
        )
        
        return Response({
            'message': f'Invite sent to {email}',
            'invite_id': invite.id
        })
    
    @action(detail=False, methods=['get'])
    def my_communities(self, request):
        """Get user's communities"""
        # Temporarily return all communities for testing since auth is disabled
        communities = Community.objects.all().select_related('owner')
        serializer = self.get_serializer(communities, many=True)
        return Response(serializer.data)
        
        # Original code (commented out for testing)
        # user = request.user
        # communities = Community.objects.filter(
        #     Q(members=user) | Q(owner=user)
        # ).select_related('owner')
        # serializer = self.get_serializer(communities, many=True)
        # return Response(serializer.data)


class CommunityJoinRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for Community Join Requests"""
    queryset = CommunityJoinRequest.objects.all()
    serializer_class = CommunityJoinRequestSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_queryset(self):
        """Filter requests based on user"""
        # Temporarily return all requests for testing
        return CommunityJoinRequest.objects.all().select_related('community', 'user', 'reviewed_by')
        
        # Original code (commented out for testing)
        # user = self.request.user
        # return CommunityJoinRequest.objects.filter(
        #     Q(user=user) | Q(community__owner=user)
        # ).select_related('community', 'user', 'reviewed_by')


class CommunityInviteViewSet(viewsets.ModelViewSet):
    """ViewSet for Community Invites"""
    queryset = CommunityInvite.objects.all()
    serializer_class = CommunityInviteSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_queryset(self):
        """Filter invites based on user"""
        user = self.request.user
        return CommunityInvite.objects.filter(
            Q(invited_by=user) | Q(email=user.email)
        ).select_related('community', 'invited_by')
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a community invite"""
        invite = self.get_object()
        
        if invite.email != request.user.email:
            return Response({
                'error': 'This invite is not for you'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if invite.accepted:
            return Response({
                'error': 'Invite already accepted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invite.accepted = True
        invite.save()
        
        # Add user to community
        invite.community.members.add(request.user)
        
        return Response({
            'message': f'Successfully joined {invite.community.name}'
        })
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a community invite"""
        invite = self.get_object()
        
        if invite.email != request.user.email:
            return Response({
                'error': 'This invite is not for you'
            }, status=status.HTTP_403_FORBIDDEN)
        
        invite.delete()
        
        return Response({
            'message': 'Invite declined'
        })
