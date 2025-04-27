from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings

urlpatterns = [
    path('admin/clearcache/', include('clearcache.urls')),
    path('admin/', admin.site.urls),
    path('', include('myApp.urls')),  # Include app URLs
    path('favicon.ico', RedirectView.as_view(url=settings.STATIC_URL + 'images/favicon.ico')),
]