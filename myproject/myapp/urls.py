from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home, name='home'),
    path('profile/', views.profile, name='profile'),
    path('history/', views.history, name='history'),
    path('myadmin/', views.myadmin, name='myadmin'),
    path('history-detail/', views.history_detail, name='history_detail'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
]
