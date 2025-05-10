from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import exception_handler
from django.http import Http404
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied, AuthenticationFailed
from django.db import IntegrityError


def create_response(data=None, message="", status_code=status.HTTP_200_OK, errors=None):
    """
    Tạo response chuẩn RESTful
    """
    response_data = {
        "status": "success" if status.is_success(status_code) else "error",
        "message": message,
    }

    # Thêm dữ liệu nếu có
    if data is not None:
        response_data["data"] = data

    # Thêm thông tin lỗi nếu có
    if errors is not None:
        response_data["errors"] = errors

    return Response(response_data, status=status_code)


def format_validation_errors(errors):
    """
    Format lỗi validation để dễ đọc hơn
    """
    formatted_errors = {}

    for field, error_list in errors.items():
        if isinstance(error_list, dict):
            # Xử lý lỗi lồng nhau
            formatted_errors[field] = format_validation_errors(error_list)
        else:
            # Xử lý lỗi đơn giản
            if isinstance(error_list, str):
                formatted_errors[field] = [error_list]
            else:
                formatted_errors[field] = error_list

    return formatted_errors


def custom_exception_handler(exc, context):
    """
    Xử lý exception và trả về response chuẩn
    """
    # Gọi exception handler mặc định trước
    response = exception_handler(exc, context)

    # Xử lý lỗi IntegrityError (thường là lỗi unique constraint)
    if isinstance(exc, IntegrityError):
        error_message = str(exc)
        errors = {}

        if 'username' in error_message:
            errors['username'] = ["Tên đăng nhập này đã tồn tại"]
        elif 'email' in error_message:
            errors['email'] = ["Email này đã tồn tại"]
        else:
            errors['detail'] = ["Lỗi dữ liệu, vui lòng kiểm tra lại thông tin"]

        return create_response(
            message="Lỗi dữ liệu",
            errors=errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # Nếu là exception không được xử lý bởi DRF
    if response is None:
        if isinstance(exc, Http404):
            return create_response(
                message="Không tìm thấy tài nguyên yêu cầu",
                status_code=status.HTTP_404_NOT_FOUND
            )
        # Xử lý các exception khác
        return create_response(
            message=str(exc),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Xử lý ValidationError
    if isinstance(exc, ValidationError):
        return create_response(
            message="Dữ liệu không hợp lệ",
            errors=format_validation_errors(exc.detail),
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # Xử lý các exception của DRF
    if isinstance(exc, NotFound):
        return create_response(
            message="Không tìm thấy tài nguyên yêu cầu",
            status_code=status.HTTP_404_NOT_FOUND
        )
    elif isinstance(exc, PermissionDenied):
        return create_response(
            message="Bạn không có quyền thực hiện hành động này",
            status_code=status.HTTP_403_FORBIDDEN
        )
    elif isinstance(exc, AuthenticationFailed):
        return create_response(
            message="Xác thực không thành công",
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    # Trường hợp khác
    return create_response(
        message=response.data.get('detail', 'Đã xảy ra lỗi'),
        errors=response.data if not response.data.get('detail') else None,
        status_code=response.status_code
    )