from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.core.validators import RegexValidator, EmailValidator
from django.db import IntegrityError
from .models import User, History


class HistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = History
        fields = ['id', 'id_user', 'image', 'result', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    histories = HistorySerializer(many=True, read_only=True)  # Lấy lịch sử liên quan

    # Thêm validators cho các trường
    username = serializers.CharField(
        max_length=45,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_]+$',
                message='Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
            )
        ]
    )

    email = serializers.EmailField(
        validators=[EmailValidator(message='Email không hợp lệ')]
    )

    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Mật khẩu phải có ít nhất 6 ký tự'
        }
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'full_name', 'email', 'phone', 'bio', 'role', 'avatar', 'status',
                  'histories']
        extra_kwargs = {
            'password': {'write_only': True},  # Không trả về password trong response
        }

    def validate_username(self, value):
        """
        Kiểm tra username đã tồn tại chưa
        """
        user_id = self.instance.id if self.instance else None

        if User.objects.filter(username=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Tên đăng nhập này đã được sử dụng")
        return value

    def validate_email(self, value):
        """
        Kiểm tra email đã tồn tại chưa
        """
        user_id = self.instance.id if self.instance else None

        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Email này đã được sử dụng")
        return value

    def validate_phone(self, value):
        """
        Kiểm tra định dạng số điện thoại
        """
        if value and not value.isdigit():
            raise serializers.ValidationError("Số điện thoại chỉ được chứa các chữ số")
        return value

    def validate(self, data):
        """
        Kiểm tra các ràng buộc giữa các trường
        """
        # Ví dụ: Kiểm tra nếu role là admin thì phải có full_name
        if data.get('role') == 'admin' and not data.get('full_name'):
            raise serializers.ValidationError({"full_name": "Admin phải có họ tên đầy đủ"})

        return data

    def create(self, validated_data):
        try:
            # Tạo user với mật khẩu đã mã hóa
            user = User(**validated_data)
            user.save()  # Mật khẩu sẽ được mã hóa trong phương thức save của model
            return user
        except IntegrityError as e:
            # Xử lý lỗi integrity (ví dụ: trùng unique constraint)
            if 'username' in str(e):
                raise serializers.ValidationError({"username": ["Tên đăng nhập này đã tồn tại"]})
            elif 'email' in str(e):
                raise serializers.ValidationError({"email": ["Email này đã tồn tại"]})
            raise serializers.ValidationError({"detail": ["Lỗi khi tạo người dùng"]})

    def update(self, instance, validated_data):
        try:
            # Cập nhật user, đảm bảo mật khẩu được mã hóa
            for attr, value in validated_data.items():
                if attr == 'password':
                    instance.password = make_password(value)
                else:
                    setattr(instance, attr, value)
            instance.save()
            return instance
        except IntegrityError as e:
            # Xử lý lỗi integrity (ví dụ: trùng unique constraint)
            if 'username' in str(e):
                raise serializers.ValidationError({"username": ["Tên đăng nhập này đã tồn tại"]})
            elif 'email' in str(e):
                raise serializers.ValidationError({"email": ["Email này đã tồn tại"]})
            raise serializers.ValidationError({"detail": ["Lỗi khi cập nhật người dùng"]})