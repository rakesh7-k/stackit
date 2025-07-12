from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    reputation_score = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 
                 'avatar', 'is_mentor', 'questions_asked', 'answers_given', 
                 'total_points', 'reputation_score', 'zen_mode_enabled', 
                 'created_at']
        read_only_fields = ['id', 'questions_asked', 'answers_given', 
                           'total_points', 'reputation_score', 'created_at']
    
    def get_reputation_score(self, obj):
        return obj.get_reputation_score() 