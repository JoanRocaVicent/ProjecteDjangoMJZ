# Django JWT setup — add to your project
# Run: pip install djangorestframework-simplejwt

# ── settings.py additions ────────────────────────────────────────

INSTALLED_APPS = [
    # ... existing apps ...
    'rest_framework',
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}


# ── main project urls.py additions ──────────────────────────────
# Add these two lines to your main urls.py urlpatterns:

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('FrontEnd.urls')),
    path('api/token/',         TokenObtainPairView.as_view(),  name='token_obtain_pair'),  # login
    path('api/token/refresh/', TokenRefreshView.as_view(),    name='token_refresh'),       # refresh
]
