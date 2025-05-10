from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
schema_view = get_schema_view(
   openapi.Info(
      title="Handwriting Recognition API",
      default_version='v1',
      description="API cho đồ án nhận diện chữ viết tay",
      contact=openapi.Contact(email="your-email@example.com"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)
# Khai báo router cho API
router = DefaultRouter()
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),            # API endpoints
    path('', include('myapp.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # Include URL của app chính
]
