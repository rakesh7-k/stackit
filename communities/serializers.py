from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Community, CommunityInvite, CommunityJoinRequest
from qa.serializers import UserSerializer

User = get_user_model()


class CommunitySerializer(serializers.ModelSerializer):
    """Serializer for Community model"""
    owner = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    mentors_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'owner', 'is_private', 
                 'invite_code', 'total_questions', 'total_answers', 
                 'members_count', 'mentors_count', 'created_at']
        read_only_fields = ['id', 'invite_code', 'total_questions', 
                           'total_answers', 'created_at']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_mentors_count(self, obj):
        return obj.mentors.count()


class CommunityJoinRequestSerializer(serializers.ModelSerializer):
    """Serializer for Community Join Request model"""
    user = UserSerializer(read_only=True)
    community = CommunitySerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = CommunityJoinRequest
        fields = ['id', 'community', 'user', 'status', 'message', 
                 'reviewed_by', 'reviewed_at', 'created_at']
        read_only_fields = ['id', 'status', 'reviewed_by', 'reviewed_at', 'created_at']


class CommunityInviteSerializer(serializers.ModelSerializer):
    """Serializer for Community Invite model"""
    community = CommunitySerializer(read_only=True)
    invited_by = UserSerializer(read_only=True)
    
    class Meta:
        model = CommunityInvite
        fields = ['id', 'community', 'invited_by', 'email', 'accepted', 'created_at']
        read_only_fields = ['id', 'accepted', 'created_at'] 