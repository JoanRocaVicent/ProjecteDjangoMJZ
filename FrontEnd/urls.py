from django.urls import path
from . import views

app_name = 'FrontEnd'

urlpatterns = [
    # ── Page ────────────────────────────────────────────────────
    path('', views.index, name='index'),

    # ── Recurs API ───────────────────────────────────────────────
    path('api/recursos/',          views.RecursListView.as_view(),   name='recurs-list'),
    path('api/recursos/<int:pk>/', views.RecursDetailView.as_view(), name='recurs-detail'),

    # ── Autor API ────────────────────────────────────────────────
    path('api/autors/',            views.AutorListView.as_view(),    name='autor-list'),
    path('api/autors/<int:pk>/',   views.AutorDetailView.as_view(),  name='autor-detail'),
]
