from django.shortcuts import render

# Frontend views
def home(request):
    return render(request, 'myapp/home.html')

def profile(request):
    return render(request, 'myapp/profile.html')

def history(request):
    return render(request, 'myapp/history.html')

def myadmin(request):
    return render(request, 'myapp/admin.html')
def history_detail(request):
    return render(request, 'myapp/history_detail.html')
def login(request):
    return render(request, 'myapp/login.html')

def register(request):
    return render(request, 'myapp/register.html')