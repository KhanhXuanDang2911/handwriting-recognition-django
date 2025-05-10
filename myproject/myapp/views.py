from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status, viewsets, filters
from django.shortcuts import get_object_or_404
from .models import User, History
from .serializers import UserSerializer, HistorySerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from .utils import create_response
# Thêm vào phần import
from django.db import IntegrityError, models
from rest_framework.exceptions import ValidationError
from .utils import create_response, format_validation_errors


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


# API Pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# API ViewSets
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'full_name']
    ordering_fields = ['id', 'username', 'email', 'role', 'status']

    def get_permissions(self):
        return [AllowAny()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Apply search filter if provided
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(username__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(full_name__icontains=search)
            )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
        else:
            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data

        return create_response(
            data=data,
            message="Lấy danh sách người dùng thành công",
            status_code=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return create_response(
            data=serializer.data,
            message=f"Lấy thông tin người dùng {instance.username} thành công",
            status_code=status.HTTP_200_OK
        )

    # Cập nhật phương thức create trong UserViewSet
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid(raise_exception=True):
                self.perform_create(serializer)
                return create_response(
                    data=serializer.data,
                    message="Tạo người dùng mới thành công",
                    status_code=status.HTTP_201_CREATED
                )
        except ValidationError as e:
            return create_response(
                message="Lỗi khi tạo người dùng",
                errors=format_validation_errors(e.detail),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            errors = {}
            if 'username' in str(e):
                errors['username'] = ["Tên đăng nhập này đã tồn tại"]
            elif 'email' in str(e):
                errors['email'] = ["Email này đã tồn tại"]
            else:
                errors['detail'] = ["Lỗi dữ liệu, vui lòng kiểm tra lại thông tin"]

            return create_response(
                message="Lỗi dữ liệu",
                errors=errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return create_response(
                message="Đã xảy ra lỗi không mong muốn",
                errors={"detail": [str(e)]},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Cập nhật phương thức update trong UserViewSet
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        try:
            if serializer.is_valid(raise_exception=True):
                self.perform_update(serializer)
                return create_response(
                    data=serializer.data,
                    message=f"Cập nhật thông tin người dùng {instance.username} thành công",
                    status_code=status.HTTP_200_OK
                )
        except ValidationError as e:
            return create_response(
                message="Lỗi khi cập nhật thông tin người dùng",
                errors=format_validation_errors(e.detail),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            errors = {}
            if 'username' in str(e):
                errors['username'] = ["Tên đăng nhập này đã tồn tại"]
            elif 'email' in str(e):
                errors['email'] = ["Email này đã tồn tại"]
            else:
                errors['detail'] = ["Lỗi dữ liệu, vui lòng kiểm tra lại thông tin"]

            return create_response(
                message="Lỗi dữ liệu",
                errors=errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return create_response(
                message="Đã xảy ra lỗi không mong muốn",
                errors={"detail": [str(e)]},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        username = instance.username
        self.perform_destroy(instance)
        return create_response(
            message=f"Xóa người dùng {username} thành công",
            status_code=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'])
    def histories(self, request, pk=None):
        """Lấy lịch sử của một người dùng cụ thể"""
        user = self.get_object()
        histories = History.objects.filter(id_user=user)
        page = self.paginate_queryset(histories)

        if page is not None:
            serializer = HistorySerializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
        else:
            serializer = HistorySerializer(histories, many=True)
            data = serializer.data

        return create_response(
            data=data,
            message=f"Lấy lịch sử của người dùng {user.username} thành công",
            status_code=status.HTTP_200_OK
        )


class HistoryViewSet(viewsets.ModelViewSet):
    queryset = History.objects.all()
    serializer_class = HistorySerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['result']
    ordering_fields = ['id', 'created_at']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Filter by user_id if provided
        user_id = request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(id_user__id=user_id)

        # Apply date filtering if provided
        created_at__gte = request.query_params.get('created_at__gte', None)
        if created_at__gte:
            queryset = queryset.filter(created_at__gte=created_at__gte)

        # Apply search filter if provided
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(result__icontains=search)

        # Apply pagination
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
        else:
            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data

        return create_response(
            data=data,
            message="Lấy danh sách lịch sử thành công",
            status_code=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return create_response(
            data=serializer.data,
            message=f"Lấy thông tin lịch sử ID {instance.id} thành công",
            status_code=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return create_response(
                data=serializer.data,
                message="Tạo lịch sử mới thành công",
                status_code=status.HTTP_201_CREATED
            )
        return create_response(
            message="Lỗi khi tạo lịch sử",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            self.perform_update(serializer)
            return create_response(
                data=serializer.data,
                message=f"Cập nhật lịch sử ID {instance.id} thành công",
                status_code=status.HTTP_200_OK
            )
        return create_response(
            message="Lỗi khi cập nhật lịch sử",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        history_id = instance.id
        self.perform_destroy(instance)
        return create_response(
            message=f"Xóa lịch sử ID {history_id} thành công",
            status_code=status.HTTP_200_OK
        )
