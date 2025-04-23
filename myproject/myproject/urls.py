from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Khai báo router cho API
router = DefaultRouter()
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),            # API endpoints
    path('', include('myapp.urls')),               # Include URL của app chính
]
