from django.views.generic import TemplateView
from django.shortcuts import redirect
from django.http import JsonResponse
from .models import StudentHealth
import json

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