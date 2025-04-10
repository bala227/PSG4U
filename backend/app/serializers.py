# serializers.py
from rest_framework import serializers
from .models import Semester, Subject
from .models import User

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['subject_name', 'grade', 'credits']

class SemesterSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True)

    class Meta:
        model = Semester
        fields = ['semester_number', 'subjects']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['rollno', 'points']