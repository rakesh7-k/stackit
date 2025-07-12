from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum, Avg
from .models import Question, Answer, LearningJournal, AIService, UserPreference
from .serializers import (
    QuestionSerializer, QuestionCreateSerializer, AnswerSerializer, AnswerCreateSerializer,
    LearningJournalSerializer, UserPreferenceSerializer, AIServiceSerializer
)
from communities.models import Community
from .ai_services import ai_manager
import json

User = get_user_model()


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for Question model with AI assistance"""
    queryset = Question.objects.all()
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuestionCreateSerializer
        return QuestionSerializer
    
    def get_queryset(self):
        """Filter questions based on user's communities"""
        # Temporarily return all questions for testing
        return Question.objects.all().select_related('author', 'community').prefetch_related('answers', 'tags')
        # user = self.request.user
        # return Question.objects.filter(
        #     community__members=user
        # ).select_related('author', 'community').prefetch_related('answers', 'tags')
    
    def perform_create(self, serializer):
        """Create question with AI assistance"""
        question = serializer.save()
        
        # Automatically improve question with AI
        ai_result, ai_service = ai_manager.improve_question(
            question.title, question.content
        )
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                question.ai_improved_title = ai_data.get('improved_title', '')
                question.ai_improved_content = ai_data.get('improved_content', '')
                question.ai_suggested_tags = ai_data.get('suggested_tags', [])
                question.ai_similar_questions = ai_data.get('similar_questions', [])
                question.save()
            except json.JSONDecodeError:
                pass  # Continue without AI improvement if parsing fails
    
    @action(detail=True, methods=['post'])
    def improve_with_ai(self, request, pk=None):
        """Improve question using AI"""
        question = self.get_object()
        
        ai_result, ai_service = ai_manager.improve_question(
            question.title, question.content
        )
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                question.ai_improved_title = ai_data.get('improved_title', '')
                question.ai_improved_content = ai_data.get('improved_content', '')
                question.ai_suggested_tags = ai_data.get('suggested_tags', [])
                question.ai_similar_questions = ai_data.get('similar_questions', [])
                question.save()
                
                return Response({
                    'message': 'Question improved with AI',
                    'improved_title': question.ai_improved_title,
                    'improved_content': question.ai_improved_content,
                    'suggested_tags': question.ai_suggested_tags,
                    'confidence_score': ai_data.get('confidence_score', 0),
                    'improvement_notes': ai_data.get('improvement_notes', '')
                })
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse AI response'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Failed to improve question with AI'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def improve_draft_with_ai(self, request):
        """Improve question draft using AI before creating"""
        title = request.data.get('title', '')
        content = request.data.get('content', '')
        
        if not title or not content:
            return Response({
                'error': 'Title and content are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        ai_result, ai_service = ai_manager.improve_question(title, content)
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                return Response({
                    'message': 'Question draft improved with AI',
                    'improved_title': ai_data.get('improved_title', ''),
                    'improved_content': ai_data.get('improved_content', ''),
                    'suggested_tags': ai_data.get('suggested_tags', []),
                    'confidence_score': ai_data.get('confidence_score', 0),
                    'improvement_notes': ai_data.get('improvement_notes', '')
                })
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse AI response'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Failed to improve question draft with AI'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment question view count"""
        question = self.get_object()
        question.increment_view_count()
        return Response({'message': 'View count incremented'})
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search questions by title and content"""
        query = request.query_params.get('q', '')
        if query:
            questions = self.get_queryset().filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
        else:
            questions = self.get_queryset()
        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured questions"""
        questions = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def suggest_tags(self, request, pk=None):
        """Get AI-suggested tags for a question"""
        question = self.get_object()
        
        ai_result, ai_service = ai_manager.suggest_tags(
            question.title, question.content
        )
        
        if ai_result:
            try:
                tags = json.loads(ai_result)
                return Response({
                    'suggested_tags': tags
                })
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse AI response'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Failed to get tag suggestions'
        }, status=status.HTTP_400_BAD_REQUEST)


class AnswerViewSet(viewsets.ModelViewSet):
    """ViewSet for Answer model with AI feedback"""
    queryset = Answer.objects.all()
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AnswerCreateSerializer
        return AnswerSerializer
    
    def get_queryset(self):
        """Filter answers based on user's communities"""
        # Temporarily return all answers for testing
        return Answer.objects.all().select_related('author', 'question', 'verified_by')
        # user = self.request.user
        # return Answer.objects.filter(
        #     question__community__members=user
        # ).select_related('author', 'question', 'verified_by')
    
    def perform_create(self, serializer):
        """Create answer with AI feedback"""
        answer = serializer.save()
        
        # Automatically get AI feedback on the answer
        ai_result, ai_service = ai_manager.provide_answer_feedback(
            answer.content, answer.question.title
        )
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                answer.ai_feedback = ai_data.get('feedback', '')
                answer.ai_improved_content = ai_data.get('improved_answer', '')
                answer.ai_assessment_score = ai_data.get('assessment_score', 0)
                answer.save()
            except json.JSONDecodeError:
                pass  # Continue without AI feedback if parsing fails
    
    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        """Upvote an answer"""
        answer = self.get_object()
        user = request.user
        
        if user in answer.downvotes.all():
            answer.downvotes.remove(user)
        
        if user in answer.upvotes.all():
            answer.upvotes.remove(user)
            message = 'Upvote removed'
        else:
            answer.upvotes.add(user)
            message = 'Answer upvoted'
        
        return Response({
            'message': message,
            'vote_score': answer.get_vote_score()
        })
    
    @action(detail=True, methods=['post'])
    def downvote(self, request, pk=None):
        """Downvote an answer"""
        answer = self.get_object()
        user = request.user
        
        if user in answer.upvotes.all():
            answer.upvotes.remove(user)
        
        if user in answer.downvotes.all():
            answer.downvotes.remove(user)
            message = 'Downvote removed'
        else:
            answer.downvotes.add(user)
            message = 'Answer downvoted'
        
        return Response({
            'message': message,
            'vote_score': answer.get_vote_score()
        })
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept an answer"""
        answer = self.get_object()
        question = answer.question
        
        # Check if user is question author or community mentor
        if (request.user == question.author or 
            request.user in question.community.mentors.all()):
            answer.accept_answer()
            return Response({'message': 'Answer accepted'})
        
        return Response({
            'error': 'Only question author or mentors can accept answers'
        }, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def verify_as_mentor(self, request, pk=None):
        """Verify answer as mentor"""
        answer = self.get_object()
        user = request.user
        
        if user.is_mentor and user in answer.question.community.mentors.all():
            answer.mentor_verified = True
            answer.verified_by = user
            answer.save()
            
            # Create learning journal entry
            LearningJournal.objects.create(
                user=answer.author,
                activity_type='mentor_verified',
                title=f"Mentor verified your answer",
                description=f"Your answer to '{answer.question.title}' was verified by a mentor",
                points_earned=50
            )
            
            return Response({'message': 'Answer verified as mentor'})
        
        return Response({
            'error': 'Only mentors can verify answers'
        }, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['post'])
    def get_ai_feedback(self, request, pk=None):
        """Get AI feedback on an answer"""
        answer = self.get_object()
        
        ai_result, ai_service = ai_manager.provide_answer_feedback(
            answer.content, answer.question.title
        )
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                return Response({
                    'assessment_score': ai_data.get('assessment_score', 0),
                    'feedback': ai_data.get('feedback', ''),
                    'suggestions': ai_data.get('suggestions', []),
                    'improved_answer': ai_data.get('improved_answer', ''),
                    'learning_points': ai_data.get('learning_points', []),
                    'confidence_boost': ai_data.get('confidence_boost', '')
                })
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse AI response'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Failed to get AI feedback'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def improve_with_ai(self, request, pk=None):
        """Improve answer using AI"""
        answer = self.get_object()
        
        ai_result, ai_service = ai_manager.improve_answer(
            answer.content, answer.question.title
        )
        
        if ai_result:
            answer.ai_improved_content = ai_result
            answer.save()
            
            return Response({
                'message': 'Answer improved with AI',
                'improved_content': ai_result
            })
        
        return Response({
            'error': 'Failed to improve answer with AI'
        }, status=status.HTTP_400_BAD_REQUEST)


class LearningJournalViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Learning Journal"""
    serializer_class = LearningJournalSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_queryset(self):
        # Temporarily return all journals for testing
        return LearningJournal.objects.all().select_related('user')
        # user = self.request.user
        # return LearningJournal.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get learning statistics"""
        user = request.user
        journals = self.get_queryset().filter(user=user)
        
        total_points = journals.aggregate(Sum('points_earned'))['points_earned__sum'] or 0
        total_activities = journals.count()
        
        # Activity breakdown
        activity_types = journals.values('activity_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_points': total_points,
            'total_activities': total_activities,
            'activity_breakdown': activity_types
        })
    
    @action(detail=False, methods=['post'])
    def analyze_confidence_trend(self, request):
        """Analyze user's confidence trends using AI"""
        user = request.user
        user_answers = Answer.objects.filter(author=user).order_by('created_at')
        
        ai_result, ai_service = ai_manager.analyze_confidence_trend(user_answers)
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                return Response({
                    'trend_analysis': ai_data.get('trend_analysis', ''),
                    'learning_insights': ai_data.get('learning_insights', []),
                    'recommendations': ai_data.get('recommendations', []),
                    'encouragement': ai_data.get('encouragement', ''),
                    'growth_score': ai_data.get('growth_score', 0)
                })
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse AI response'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Failed to analyze confidence trends'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def suggest_learning_path(self, request):
        """Get AI-suggested learning path"""
        user = request.user
        community_questions = Question.objects.filter(
            community__members=user
        ).order_by('-created_at')[:50]
        
        ai_result, ai_service = ai_manager.suggest_learning_path(user, community_questions)
        
        if ai_result:
            try:
                ai_data = json.loads(ai_result)
                return Response({
                    'skill_level': ai_data.get('skill_level', 'beginner'),
                    'next_steps': ai_data.get('next_steps', []),
                    'focus_topics': ai_data.get('focus_topics', []),
                    'learning_goals': ai_data.get('learning_goals', []),
                    'mentor_advice': ai_data.get('mentor_advice', '')
                })
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse AI response'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Failed to generate learning path'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for User Preferences"""
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    def get_queryset(self):
        # Temporarily return all preferences for testing
        return UserPreference.objects.all().select_related('user')
        # user = self.request.user
        # return UserPreference.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def toggle_zen_mode(self, request, pk=None):
        """Toggle zen mode for user"""
        preference = self.get_object()
        preference.zen_mode = not preference.zen_mode
        preference.save()
        
        return Response({
            'message': f"Zen mode {'enabled' if preference.zen_mode else 'disabled'}",
            'zen_mode': preference.zen_mode
        })


class AIServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI Service records (admin only)"""
    queryset = AIService.objects.all()
    serializer_class = AIServiceSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all access
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get AI service statistics"""
        total_services = AIService.objects.count()
        avg_processing_time = AIService.objects.aggregate(
            Avg('processing_time')
        )['processing_time__avg'] or 0
        
        service_types = AIService.objects.values('service_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_services': total_services,
            'avg_processing_time': avg_processing_time,
            'service_types': service_types
        })
