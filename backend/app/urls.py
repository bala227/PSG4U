# cgpa/urls.py

from django.urls import path
from .views import SemesterGradesView,RegisterView, LoginView, LogoutView,list_resources, predict_grades,suggest_resource, search_resources,current_user,all_users

urlpatterns = [
    path('semester/<int:semester_number>/', SemesterGradesView.as_view(), name='semester-grades'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('predict/', predict_grades, name='predict_grades'),
    path("suggest-resource/", suggest_resource, name="suggest-resource"),
    path("search-resources/", search_resources, name="search-resources"),
    path("resources/", list_resources, name="list-resources"),
    path('me/', current_user),
    path("users/", all_users),
]
