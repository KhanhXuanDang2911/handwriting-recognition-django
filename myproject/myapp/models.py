from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from cloudinary.models import CloudinaryField
import datetime


class User(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    STATUS_CHOICE = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended')
    )

    username = models.CharField(max_length=45, unique=True)
    password = models.CharField(max_length=255)  # Mật khẩu sẽ được mã hóa
    full_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    phone = models.CharField(max_length=45, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default='active')
    avatar = CloudinaryField('image', blank=True, null=True)  # Trường avatar dùng Cloudinary

    def save(self, *args, **kwargs):
        # Mã hóa mật khẩu trước khi lưu
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class History(models.Model):
    id_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='histories')
    image = CloudinaryField('image', blank=True, null=True)  # Trường image dùng Cloudinary
    result = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History {self.id} for {self.id_user.username}"


class BlacklistedToken(models.Model):
    """
    Model để lưu trữ các token đã bị vô hiệu hóa (blacklisted)
    """
    token = models.TextField(unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blacklisted_tokens', null=True, blank=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    reason = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['token']),  # Tạo index cho trường token để tìm kiếm nhanh hơn
            models.Index(fields=['expires_at']),  # Tạo index cho trường expires_at để cleanup nhanh hơn
        ]
        verbose_name = 'Blacklisted Token'
        verbose_name_plural = 'Blacklisted Tokens'

    def __str__(self):
        if self.user:
            return f"Blacklisted token for {self.user.username} ({self.blacklisted_at})"
        return f"Blacklisted token ({self.blacklisted_at})"

    @classmethod
    def is_blacklisted(cls, token):
        """
        Kiểm tra xem token có trong blacklist không
        """
        return cls.objects.filter(token=token).exists()

    @classmethod
    def blacklist_token(cls, token, user=None, reason=None, expires_at=None):
        """
        Thêm token vào blacklist
        """
        if not expires_at:
            # Nếu không cung cấp thời gian hết hạn, lấy từ token
            import jwt
            from .authentication import JWT_SECRET, JWT_ALGORITHM
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                expires_at = datetime.datetime.fromtimestamp(payload.get('exp'))
            except:
                # Nếu không thể decode token, đặt thời gian hết hạn là 1 ngày
                expires_at = datetime.datetime.now() + datetime.timedelta(days=1)

        return cls.objects.create(
            token=token,
            user=user,
            reason=reason,
            expires_at=expires_at
        )

    @classmethod
    def cleanup_expired_tokens(cls):
        """
        Xóa các token đã hết hạn khỏi blacklist
        """
        now = datetime.datetime.now()
        return cls.objects.filter(expires_at__lt=now).delete()
