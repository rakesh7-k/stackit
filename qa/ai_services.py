import google.generativeai as genai
from django.conf import settings
from django.utils import timezone
import time
import json
import re
from .models import AIService


class AIServiceManager:
    """Manager for AI services in StackIt using Gemini API"""
    
    def __init__(self):
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        except Exception as e:
            print(f"Warning: AI services not available - {e}")
            self.model = None
    
    def improve_question(self, title, content):
        """Improve question title and content using AI"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        prompt = f"""
        You are an expert at helping learners ask better questions. Improve this question to make it clearer, more specific, and more likely to get helpful answers.
        
        Original Title: {title}
        Original Content: {content}
        
        Please provide a JSON response with:
        1. An improved title (max 200 characters, clear and specific)
        2. Improved content that's detailed and well-structured
        3. 3-5 relevant tags (programming languages, frameworks, concepts)
        4. Similar questions that might help the user
        5. Confidence level for the improvement (1-10)
        
        Format as JSON:
        {{
            "improved_title": "Clear, specific title",
            "improved_content": "Detailed, well-structured content with context",
            "suggested_tags": ["tag1", "tag2", "tag3"],
            "similar_questions": ["question1", "question2"],
            "confidence_score": 8,
            "improvement_notes": "Brief explanation of what was improved"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Clean the response to extract JSON
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                result = json_match.group()
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='question_improvement',
                input_text=f"Title: {title}\nContent: {content}",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI question improvement failed: {e}")
            return None, None
    
    def provide_answer_feedback(self, answer_content, question_context=""):
        """Provide AI feedback on answer quality"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        prompt = f"""
        You are an expert mentor reviewing a student's answer. Provide constructive feedback to help them improve.
        
        Question Context: {question_context}
        Student's Answer: {answer_content}
        
        Please provide a JSON response with:
        1. Overall assessment score (1-10 scale)
        2. Specific feedback on clarity, accuracy, and helpfulness
        3. Suggestions for improvement
        4. An improved version of the answer
        5. Learning points for the student
        
        Format as JSON:
        {{
            "assessment_score": 8,
            "feedback": "Detailed, constructive feedback",
            "suggestions": ["suggestion1", "suggestion2"],
            "improved_answer": "Enhanced version of the answer",
            "learning_points": ["key learning point 1", "key learning point 2"],
            "confidence_boost": "How this answer shows growth"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Clean the response to extract JSON
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                result = json_match.group()
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='answer_feedback',
                input_text=f"Question: {question_context}\nAnswer: {answer_content}",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI answer feedback failed: {e}")
            return None, None
    
    def suggest_tags(self, title, content):
        """Suggest relevant tags for a question"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        prompt = f"""
        Suggest 3-5 relevant tags for this question. Focus on programming languages, frameworks, tools, and concepts.
        
        Title: {title}
        Content: {content}
        
        Return only a JSON array of tag strings:
        ["tag1", "tag2", "tag3", "tag4"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Clean the response to extract JSON array
            array_match = re.search(r'\[.*\]', result)
            if array_match:
                result = array_match.group()
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='tag_suggestion',
                input_text=f"Title: {title}\nContent: {content}",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI tag suggestion failed: {e}")
            return None, None
    
    def find_similar_questions(self, title, content, community_questions):
        """Find similar questions in the community"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        # Create a list of existing questions for context
        existing_questions = "\n".join([
            f"ID: {q.id} - Q: {q.title}\nA: {q.content[:200]}..." 
            for q in community_questions[:10]  # Limit to 10 for context
        ])
        
        prompt = f"""
        Find similar questions to this one from the existing questions. Return the IDs of the most similar questions.
        
        New Question:
        Title: {title}
        Content: {content}
        
        Existing Questions:
        {existing_questions}
        
        Return a JSON array of the most similar question IDs:
        ["question_id_1", "question_id_2", "question_id_3"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Clean the response to extract JSON array
            array_match = re.search(r'\[.*\]', result)
            if array_match:
                result = array_match.group()
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='similar_questions',
                input_text=f"Title: {title}\nContent: {content}",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI similar questions failed: {e}")
            return None, None
    
    def improve_answer(self, answer_content, question_context):
        """Improve an answer using AI assistance"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        prompt = f"""
        Improve this answer to make it more helpful, comprehensive, and well-structured.
        
        Question Context: {question_context}
        Current Answer: {answer_content}
        
        Please provide an improved version that:
        1. Is more detailed and comprehensive
        2. Includes examples where relevant
        3. Is well-structured and easy to read
        4. Addresses the question more thoroughly
        5. Uses clear, beginner-friendly language
        
        Return the improved answer directly.
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='answer_improvement',
                input_text=f"Question: {question_context}\nAnswer: {answer_content}",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI answer improvement failed: {e}")
            return None, None
    
    def analyze_confidence_trend(self, user_answers):
        """Analyze user's confidence trends and provide insights"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        # Create a summary of user's answer history
        confidence_data = []
        for answer in user_answers:
            confidence_data.append({
                'confidence': answer.confidence_level,
                'date': answer.created_at.strftime('%Y-%m-%d'),
                'question_title': answer.question.title[:50]
            })
        
        prompt = f"""
        Analyze this user's confidence trends in their answers and provide insights for their learning journey.
        
        User's Answer History:
        {json.dumps(confidence_data, indent=2)}
        
        Please provide a JSON response with:
        1. Overall confidence trend analysis
        2. Specific insights about their learning progress
        3. Recommendations for improvement
        4. Encouragement based on their progress
        
        Format as JSON:
        {{
            "trend_analysis": "Analysis of confidence patterns",
            "learning_insights": ["insight1", "insight2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "encouragement": "Motivational message based on progress",
            "growth_score": 7
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Clean the response to extract JSON
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                result = json_match.group()
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='confidence_analysis',
                input_text=f"User answers: {len(user_answers)} answers analyzed",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI confidence analysis failed: {e}")
            return None, None
    
    def suggest_learning_path(self, user_profile, community_questions):
        """Suggest personalized learning path based on user activity"""
        if not self.model:
            return None, None
            
        start_time = time.time()
        
        # Create user profile summary
        user_summary = {
            'questions_asked': user_profile.questions_asked,
            'answers_given': user_profile.answers_given,
            'confidence_avg': user_profile.average_confidence,
            'mentor_status': user_profile.is_mentor,
            'communities_joined': user_profile.communities_joined
        }
        
        # Sample of community questions
        question_topics = [q.title for q in community_questions[:20]]
        
        prompt = f"""
        Suggest a personalized learning path for this user based on their activity and community questions.
        
        User Profile:
        {json.dumps(user_summary, indent=2)}
        
        Community Questions (sample):
        {question_topics}
        
        Please provide a JSON response with:
        1. Current skill level assessment
        2. Recommended next steps
        3. Specific topics to focus on
        4. Learning goals for the next month
        5. Mentor recommendations
        
        Format as JSON:
        {{
            "skill_level": "beginner/intermediate/advanced",
            "next_steps": ["step1", "step2", "step3"],
            "focus_topics": ["topic1", "topic2"],
            "learning_goals": ["goal1", "goal2"],
            "mentor_advice": "Personalized mentor guidance"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text
            processing_time = time.time() - start_time
            
            # Clean the response to extract JSON
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                result = json_match.group()
            
            # Save AI service record
            ai_service = AIService.objects.create(
                service_type='learning_path',
                input_text=f"User profile analysis",
                output_text=result,
                processing_time=processing_time,
                tokens_used=len(result.split())  # Approximate token count
            )
            
            return result, ai_service
            
        except Exception as e:
            print(f"AI learning path suggestion failed: {e}")
            return None, None


# Global AI service manager instance
ai_manager = AIServiceManager() 