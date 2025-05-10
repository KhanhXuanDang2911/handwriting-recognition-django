from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from cloudinary.models import CloudinaryField


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