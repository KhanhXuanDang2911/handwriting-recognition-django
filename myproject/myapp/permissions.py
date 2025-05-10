from rest_framework import permissions
from .authentication import extract_token, validate_token
from .models import BlacklistedToken


class IsAuthenticated(permissions.BasePermission):
    """
    Custom permission to only allow authenticated users
    """

    def has_permission(self, request, view):
        token = extract_token(request)
        if not token:
            return False

        try:
            # Sử dụng validate_token để kiểm tra token (bao gồm kiểm tra blacklist)
            payload = validate_token(token)
            # Lưu payload vào request để sử dụng sau này
            request.user_jwt = payload
            return True
        except:
            return False


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users
    """

    def has_permission(self, request, view):
        token = extract_token(request)
        if not token:
            return False

        try:
            # Sử dụng validate_token để kiểm tra token (bao gồm kiểm tra blacklist)
            payload = validate_token(token)
            # Lưu payload vào request để sử dụng sau này
            request.user_jwt = payload
            return payload.get('role') == 'admin'
        except:
            return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it
    """

    def has_permission(self, request, view):
        token = extract_token(request)
        if not token:
            return False

        try:
            # Sử dụng validate_token để kiểm tra token (bao gồm kiểm tra blacklist)
            payload = validate_token(token)
            # Lưu thông tin user vào request để sử dụng trong has_object_permission
            request.user_jwt = payload
            return True
        except:
            return False

    def has_object_permission(self, request, view, obj):
        # Kiểm tra xem user có phải là admin không
        if request.user_jwt.get('role') == 'admin':
            return True

        # Kiểm tra xem user có phải là chủ sở hữu không
        if hasattr(obj, 'id_user'):
            # Trường hợp đối tượng History
            return obj.id_user.id == request.user_jwt.get('user_id')
        else:
            # Trường hợp đối tượng User
            return obj.id == request.user_jwt.get('user_id')


class CanCreateHistory(permissions.BasePermission):
    """
    Custom permission to check if user can create history
    - Admin can create history for any user
    - Regular users can only create history for themselves
    """

    def has_permission(self, request, view):
        token = extract_token(request)
        if not token:
            return False

        try:
            # Sử dụng validate_token để kiểm tra token (bao gồm kiểm tra blacklist)
            payload = validate_token(token)
            request.user_jwt = payload

            # Admin có thể tạo lịch sử cho bất kỳ ai
            if payload.get('role') == 'admin':
                return True

            # User thường chỉ có thể tạo lịch sử cho chính mình
            user_id = request.data.get('id_user')
            if user_id and int(user_id) != payload.get('user_id'):
                return False

            return True
        except:
            return False


class AllowAny(permissions.BasePermission):
    """
    Allow any access.
    """

    def has_permission(self, request, view):
        return True
