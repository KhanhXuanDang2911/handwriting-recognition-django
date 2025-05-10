import jwt
import datetime
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import User, BlacklistedToken

# JWT Secret Key - should be in settings.py in production
JWT_SECRET = 'hCfEau8ODmJi29gxUmS6A1t7i8A6JUcAyxIc4tInkVY='  # Replace with a strong secret key
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = datetime.timedelta(days=1000)  # Token expires after 1 day


def generate_token(user_id, username, role):
    """
    Generate a JWT token for a user
    """
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.datetime.utcnow() + JWT_EXPIRATION_DELTA,
        'iat': datetime.datetime.utcnow(),
    }

    # Đảm bảo encode trả về string, không phải bytes
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    # PyJWT >= 2.0.0 trả về string, PyJWT < 2.0.0 trả về bytes
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token


def extract_token(request):
    """
    Extract JWT token from the Authorization header
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')

    if not auth_header:
        return None

    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]
    return token


def validate_token(token):
    """
    Validate a JWT token and return the payload
    """
    # Kiểm tra xem token có trong blacklist không
    if BlacklistedToken.is_blacklisted(token):
        raise exceptions.AuthenticationFailed('Token has been revoked')

    try:
        # Decode token để lấy payload
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Lấy thông tin user_id và role từ payload
        user_id = payload.get('user_id')
        role_in_token = payload.get('role')

        # Kiểm tra user có tồn tại trong database không
        try:
            user = User.objects.get(id=user_id)

            # Kiểm tra user có active không
            if user.status != 'active':
                raise exceptions.AuthenticationFailed('User account is not active')

            # Kiểm tra role trong token có khớp với role trong database không
            if user.role != role_in_token:
                raise exceptions.AuthenticationFailed('User role has changed, please login again')

            # Cập nhật payload với thông tin mới nhất từ database
            payload['username'] = user.username
            payload['role'] = user.role

            return payload
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

    except jwt.exceptions.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Token has expired')
    except jwt.exceptions.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid token')


class JWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT authentication for DRF
    """

    def authenticate(self, request):
        token = extract_token(request)

        if not token:
            return None

        try:
            payload = validate_token(token)
            user_id = payload.get('user_id')

            try:
                user = User.objects.get(id=user_id)

                # Check if user is active
                if user.status != 'active':
                    raise exceptions.AuthenticationFailed('User account is not active')

                return (user, token)
            except User.DoesNotExist:
                raise exceptions.AuthenticationFailed('User not found')

        except exceptions.AuthenticationFailed as e:
            raise e
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
