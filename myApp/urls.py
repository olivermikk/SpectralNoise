# urls.py
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

from .views import admin_login, admin_logout, admin_panel, delete_algorithm, delete_variation, get_variations_by_algorithm, get_visualizer_script


urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('landing/', views.landing_page, name='landing'),

    path('about/', views.about_page, name='about'),
    path('faq/', views.faq_page, name='faq'),
    path('visualizer/', views.visualizer_page, name='visualizer'),

    path("admin-login/", admin_login, name="admin_login"),
    path("admin-logout/", admin_logout, name="admin_logout"),

    path('admin-panel/', admin_panel, name='admin_panel'),
    path("delete-algorithm/<int:algorithm_id>/", delete_algorithm, name="delete_algorithm"),
    path("delete-variation/<int:variation_id>/", delete_variation, name="delete_variation"),

    path('get-variations-by-algorithm/', get_variations_by_algorithm, name='get_variations_by_algorithm'),
    path('get_visualizer_script/<int:variation_id>/', get_visualizer_script, name='get_visualizer_script'),
    path('update_variation_availability/<int:variation_id>/', views.update_variation_availability, name='update_variation_availability'),
    ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
