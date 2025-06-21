from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from django.shortcuts import redirect
from django.http import JsonResponse
from .models import StudentHealth
import os
import json
from openai import OpenAI
import logging
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class HomeView(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Convert QuerySet to a list of dicts for JSON serialization
        context['student_health_list'] = list(StudentHealth.objects.values())
        return context

    def post(self, request, *args, **kwargs):
        # Parse JSON data from JS
        data = json.loads(request.body)
        name = data.get('name')
        age = data.get('age')
        gender = data.get('gender')
        week = data.get('week')
        height = data.get('height')
        weight = data.get('weight')
        if name and age and gender and week and height and weight:
            StudentHealth.objects.update_or_create(
                name=name,
                week=week,
                defaults={
                    'age': age,
                    'gender': gender,
                    'height': height,
                    'weight': weight
                }
            )
        # Get all data to send back to JS
        student_health_list = list(StudentHealth.objects.values())
        return JsonResponse({'student_health_list': student_health_list})

@method_decorator(csrf_exempt, name='dispatch')
class ChatGPTAdviceView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        prompt = data.get('prompt')
        client = OpenAI(api_key=OPENAI_API_KEY)
        if not prompt:
            return JsonResponse({'error': 'No prompt provided'}, status=400)
        try:
            # Use a valid model name
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            return JsonResponse({"answer": response.choices[0].message.content})
        except Exception as e:
            logging.exception("ChatGPT API error")
            # Return error message for debugging
            return JsonResponse({'error': str(e)}, status=500)