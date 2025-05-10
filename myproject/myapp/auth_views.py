from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password
from .models import User, BlacklistedToken
from .authentication import generate_token, extract_token, validate_token
from .utils import create_response


class LoginView(APIView):
    """
    API endpoint for user login
    """
    permission_classes = [AllowAny]

    def post(self, request):
        print('Hello world')
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return create_response(
                message="Username and password are required",
                errors={"detail": ["Username and password are required"]},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)

            # Check if user is active
            if user.status != 'active':
                return create_response(
                    message="User account is not active",
                    errors={"detail": ["User account is not active"]},
                    status_code=status.HTTP_401_UNAUTHORIZED
                )

            # Verify password
            if not check_password(password, user.password):
                return create_response(
                    message="Invalid credentials",
                    errors={"detail": ["Invalid credentials"]},
                    status_code=status.HTTP_401_UNAUTHORIZED
                )

            # Generate JWT token
            token = generate_token(user.id, user.username, user.role)

            return create_response(
                data={
                    "token": token,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role,
                        "avatar": str(user.avatar) if user.avatar else None
                    }
                },
                message="Login successful",
                status_code=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return create_response(
                message="Invalid credentials",
                errors={"detail": ["Invalid credentials"]},
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return create_response(
                message="Login failed",
                errors={"detail": [str(e)]},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """
    API endpoint for user logout

    Thêm token hiện tại vào blacklist để vô hiệu hóa nó
    """
    permission_classes = [AllowAny]
    def post(self, request):
        token = extract_token(request)

        if not token:
            return JsonResponse({
                'success': False,
                'message': 'Authentication required',
                'errors': {'detail': ['Authentication required']}
            }, status=401)

        try:
            payload = validate_token(token)
            # Add user info to request for use in views
            request.user_jwt = payload
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': 'Invalid or expired token',
                'errors': {'detail': [str(e)]}
            }, status=401)

        if not token:
            return create_response(
                message="No token provided",
                errors={"detail": ["No token provided"]},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            # lay thong tin user ra (dang k hieu tai sao no tu lay duoc!!!)
            user = request.user if hasattr(request, 'user') else None

            # Thêm token vào blacklist
            BlacklistedToken.blacklist_token(
                token=token,
                user=user,
                reason="User logout"
            )

            return create_response(
                message="Logout successful",
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return create_response(
                message="Logout failed",
                errors={"detail": [str(e)]},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
