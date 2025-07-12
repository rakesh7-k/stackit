from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Question, Answer, LearningJournal, AIService, UserPreference
from communities.models import Community, CommunityInvite
import json

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


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for Answer model"""
    author = UserSerializer(read_only=True)
    vote_score = serializers.SerializerMethodField()
    upvotes_count = serializers.SerializerMethodField()
    downvotes_count = serializers.SerializerMethodField()
    is_upvoted_by_user = serializers.SerializerMethodField()
    is_downvoted_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'author', 'content', 'confidence_level',
                 'ai_feedback', 'ai_improved_content', 'ai_suggestions',
                 'is_accepted', 'mentor_verified', 'verified_by',
                 'vote_score', 'upvotes_count', 'downvotes_count',
                 'is_upvoted_by_user', 'is_downvoted_by_user',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'ai_feedback', 'ai_improved_content',
                           'ai_suggestions', 'mentor_verified', 'verified_by',
                           'vote_score', 'upvotes_count', 'downvotes_count',
                           'created_at', 'updated_at']
    
    def get_vote_score(self, obj):
        return obj.get_vote_score()
    
    def get_upvotes_count(self, obj):
        return obj.upvotes.count()
    
    def get_downvotes_count(self, obj):
        return obj.downvotes.count()
    
    def get_is_upvoted_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.upvotes.all()
        return False
    
    def get_is_downvoted_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.downvotes.all()
        return False


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model"""
    author = UserSerializer(read_only=True)
    community = CommunitySerializer(read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    answers_count = serializers.SerializerMethodField()
    is_resolved = serializers.BooleanField(read_only=True)
    resolved_answer = AnswerSerializer(read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'title', 'content', 'author', 'community',
                 'ai_improved_title', 'ai_improved_content', 
                 'ai_suggested_tags', 'ai_similar_questions',
                 'tags', 'is_featured', 'view_count', 'is_resolved',
                 'resolved_answer', 'answers', 'answers_count',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'ai_improved_title', 
                           'ai_improved_content', 'ai_suggested_tags',
                           'ai_similar_questions', 'is_resolved',
                           'resolved_answer', 'view_count', 'created_at', 'updated_at']
    
    def get_answers_count(self, obj):
        return obj.get_answers_count()


class QuestionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating questions with AI assistance"""
    use_ai_assistance = serializers.BooleanField(default=True, write_only=True)
    
    class Meta:
        model = Question
        fields = ['title', 'content', 'community', 'tags', 'use_ai_assistance']
    
    def create(self, validated_data):
        use_ai = validated_data.pop('use_ai_assistance', True)
        user = self.context['request'].user
        
        # Create the question
        question = Question.objects.create(
            author=user,
            **validated_data
        )
        
        # Increment user's questions asked
        user.increment_questions_asked()
        
        # Use AI assistance if requested
        if use_ai:
            from .ai_services import ai_manager
            ai_result, ai_service = ai_manager.improve_question(
                question.title, question.content
            )
            
            if ai_result:
                try:
                    # Parse AI result (assuming it returns JSON)
                    ai_data = json.loads(ai_result)
                    question.ai_improved_title = ai_data.get('improved_title', '')
                    question.ai_improved_content = ai_data.get('improved_content', '')
                    question.ai_suggested_tags = ai_data.get('suggested_tags', [])
                    question.ai_similar_questions = ai_data.get('similar_questions', [])
                    question.save()
                except json.JSONDecodeError:
                    pass  # If AI result is not valid JSON, keep original
        
        # Increment community questions count
        question.community.increment_questions()
        
        # Create learning journal entry
        LearningJournal.objects.create(
            user=user,
            activity_type='question_asked',
            title=f"Asked: {question.title}",
            description=f"Asked a question in {question.community.name}",
            related_question=question,
            points_earned=10
        )
        
        return question


class AnswerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating answers with AI feedback"""
    use_ai_feedback = serializers.BooleanField(default=True, write_only=True)
    
    class Meta:
        model = Answer
        fields = ['question', 'content', 'confidence_level', 'use_ai_feedback']
    
    def create(self, validated_data):
        use_ai = validated_data.pop('use_ai_feedback', True)
        user = self.context['request'].user
        
        # Create the answer
        answer = Answer.objects.create(
            author=user,
            **validated_data
        )
        
        # Increment user's answers given
        user.increment_answers_given()
        
        # Use AI feedback if requested
        if use_ai:
            from .ai_services import ai_manager
            ai_result, ai_service = ai_manager.provide_answer_feedback(
                answer.content
            )
            
            if ai_result:
                try:
                    # Parse AI result
                    ai_data = json.loads(ai_result)
                    answer.ai_feedback = ai_data.get('feedback', '')
                    answer.ai_improved_content = ai_data.get('improved_answer', '')
                    answer.ai_suggestions = ai_data.get('suggestions', [])
                    answer.save()
                except json.JSONDecodeError:
                    pass
        
        # Increment community answers count
        answer.question.community.increment_answers()
        
        # Create learning journal entry
        LearningJournal.objects.create(
            user=user,
            activity_type='answer_given',
            title=f"Answered: {answer.question.title}",
            description=f"Provided an answer with {answer.confidence_level}% confidence",
            related_question=answer.question,
            related_answer=answer,
            points_earned=15,
            confidence_after=answer.confidence_level
        )
        
        return answer


class LearningJournalSerializer(serializers.ModelSerializer):
    """Serializer for Learning Journal"""
    user = UserSerializer(read_only=True)
    related_question = QuestionSerializer(read_only=True)
    related_answer = AnswerSerializer(read_only=True)
    
    class Meta:
        model = LearningJournal
        fields = ['id', 'user', 'activity_type', 'title', 'description',
                 'related_question', 'related_answer', 'points_earned',
                 'confidence_before', 'confidence_after', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for User Preferences"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserPreference
        fields = ['id', 'user', 'zen_mode_enabled', 'dark_mode_enabled',
                 'email_notifications', 'question_notifications',
                 'answer_notifications', 'mentor_notifications',
                 'auto_confidence_prompt', 'show_ai_suggestions',
                 'track_learning_progress', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class AIServiceSerializer(serializers.ModelSerializer):
    """Serializer for AI Service records"""
    
    class Meta:
        model = AIService
        fields = ['id', 'service_type', 'input_text', 'output_text',
                 'metadata', 'processing_time', 'tokens_used', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommunityInviteSerializer(serializers.ModelSerializer):
    """Serializer for Community Invites"""
    community = CommunitySerializer(read_only=True)
    invited_by = UserSerializer(read_only=True)
    
    class Meta:
        model = CommunityInvite
        fields = ['id', 'community', 'invited_by', 'email', 'accepted', 'created_at']
        read_only_fields = ['id', 'invited_by', 'accepted', 'created_at'] 