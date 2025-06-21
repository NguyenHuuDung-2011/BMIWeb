from django.contrib import admin
from django.urls import path
from .views import HomeView, ChatGPTAdviceView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('api/chatgpt/', ChatGPTAdviceView.as_view(), name='chatgpt_advice'),
]