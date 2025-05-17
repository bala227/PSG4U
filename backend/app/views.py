from django.http import JsonResponse
from django.views import View

from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import User,SuggestedResource,UserGPA,SemesterGPA
from rest_framework import status
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required  # ✅ correct
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from django.db import connection
from .serializers import UserSerializer
from rest_framework.response import Response
from relevance_checker import fetch_page_content, get_relevance_score, summarize_text, clean_and_summarize

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import SemesterGPA
@login_required
def calculate_cgpa(request):
    user = request.user
    
    current_semester = user.semester_number
    semester_data = SemesterGPA.objects.filter(user=user, semester__lte=current_semester)

    total_points = 0
    total_credits = 0

    for record in semester_data:
        total_points += record.total_points
        total_credits += record.total_credits

    if total_credits:
        cgpa = round(total_points / total_credits, 2)
    else:
        cgpa = '-'

    return JsonResponse({'cgpa': cgpa})


@csrf_exempt  # For testing purposes, remove for production
@login_required
def store_credits(request):
    if request.method == 'POST':
        try:
            # Load the incoming JSON data
            data = json.loads(request.body)

            semester = int(data.get('semester'))
            total_points = float(data.get('total_points'))
            total_credits = float(data.get('total_credits'))


            # Validate that data is not zero or invalid
            if total_credits <= 0 or total_points < 0:
                return JsonResponse({'error': 'Invalid data: points and credits must be positive'}, status=400)

            # Check if the semester is valid (assuming 1-8 semesters)
            if semester < 1 or semester > 8:
                return JsonResponse({'error': 'Invalid semester number'}, status=400)

            # Get the logged-in user
            user = request.user

            # Store or update credits data
            credits_record, created = SemesterGPA.objects.get_or_create(user=user, semester=semester)

            # Ensure the fields are set correctly (to avoid null issues)
            credits_record.total_points = total_points
            credits_record.total_credits = total_credits
            credits_record.save()

            return JsonResponse({'message': f'Credits for Semester {semester} stored successfully!'})

        except Exception as e:
            print(f"Error: {str(e)}")  # Debugging line to catch and print any errors
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
def get_user_gpa(request):
    try:
        user = request.user
        user_gpa = UserGPA.objects.get(user=user)

        gpa_data = {
            'user': user.rollno,  # use username unless you’ve added a rollno field to User
            'gpa_sem1': user_gpa.gpa_sem1,
            'gpa_sem2': user_gpa.gpa_sem2,
            'gpa_sem3': user_gpa.gpa_sem3,
            'gpa_sem4': user_gpa.gpa_sem4,
            'gpa_sem5': user_gpa.gpa_sem5,
            'gpa_sem6': user_gpa.gpa_sem6,
            'gpa_sem7': user_gpa.gpa_sem7,
            'gpa_sem8': user_gpa.gpa_sem8,
        }

        return JsonResponse(gpa_data)

    except UserGPA.DoesNotExist:
        return JsonResponse({'error': 'GPA data not found for this user'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@login_required
def store_gpa(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            semester_number = int(data.get('semester_number'))
            gpa = float(data.get('gpa'))

            if semester_number < 1 or semester_number > 8:
                return JsonResponse({'error': 'Invalid semester number'}, status=400)

            user = request.user
            user_gpa, created = UserGPA.objects.get_or_create(user=user)

            # Dynamically set gpa_semX field
            setattr(user_gpa, f'gpa_sem{semester_number}', gpa)
            user_gpa.save()

            return JsonResponse({'message': f'GPA for Semester {semester_number} stored successfully.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def update_semester(request):
    if request.method == "PATCH":
        data = json.loads(request.body)
        semester = data.get("semester")
        if semester and 1 <= int(semester) <= 8:
            request.user.semester_number = semester
            request.user.save()
            return JsonResponse({"message": "Semester updated."})
        return JsonResponse({"error": "Invalid semester"}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=405)


@login_required
def current_user(request):
    user = request.user
    return JsonResponse({
        'rollno': user.rollno,
        'name': user.name,
        'points': user.points,
        'semester': user.semester_number
    })

@api_view(['GET'])
def all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def list_resources(request):
    resources = SuggestedResource.objects.all().order_by("-added_at")
    data = [
        {
            "subject": r.subject,
            "link": r.link,
            "score": r.relevance_score,
            "summary": r.summary  # ✅ Return the summary
        }
        for r in resources
    ]
    return Response(data)


@api_view(["POST"])
def suggest_resource(request):
    subject = request.data.get("subject")
    link = request.data.get("link")
    rollno = request.data.get("rollno")

    if not subject or not link:
        return Response({
            "status": "rejected",
            "reason": "Missing 'subject' or 'link'."
        }, status=400)

    try:
        content = fetch_page_content(link)
        relevance = get_relevance_score(subject, content)

        # 📄 Generate summary (You can implement this with transformers or other libraries)
        summary = clean_and_summarize(content,subject)

        points_awarded = (
            20 if relevance > 0.8 else
            15 if relevance > 0.6 else
            10 if relevance > 0.4 else
            5 if relevance > 0.2 else 0
        )

        if points_awarded > 0:
            SuggestedResource.objects.create(
                subject=subject,
                link=link,
                relevance_score=relevance,
                summary=summary  # ✅ Save summary
            )

            user = User.objects.get(rollno=rollno)
            user.points += points_awarded
            user.save()

            return Response({
                "status": "accepted",
                "relevance": relevance,
                "points_awarded": points_awarded,
                "summary": summary
            })

        return Response({
            "status": "rejected",
            "reason": "Not relevant",
            "relevance": relevance
        })

    except Exception as e:
        return Response({
            "status": "error",
            "message": "Something went wrong while processing the resource.",
            "details": str(e)
        }, status=500)


data = pd.read_csv("grades_dataset.csv")



@api_view(["GET"])
def search_resources(request):
    query = request.GET.get("q", "")
    results = SuggestedResource.objects.filter(subject__icontains=query).order_by("-relevance_score")
    return Response([
        {"subject": r.subject, "link": r.link, "score": r.relevance_score}
        for r in results
    ])


class SemesterGradesView(View):
    def get(self, request, semester_number):
        # Sample grades data for each semester
        semester_data = {
            1: [
                {"subject_name": "Calculus", "credits": 4, "grade": None},
                {"subject_name": "Electronics", "credits": 3, "grade": None},
                {"subject_name": "Chemistry", "credits": 3, "grade": None},
                {"subject_name": "CT", "credits": 3, "grade": None},
                {"subject_name": "English", "credits": 3, "grade": None},
                {"subject_name": "Python Lab", "credits": 2, "grade": None},
                {"subject_name": "Engineering Practices", "credits": 1, "grade": None},
                {"subject_name": "Basic Science Lab", "credits": 2, "grade": None},
            ],
            2: [
                {"subject_name": "Transforms", "credits": 4, "grade": None},
                {"subject_name": "COA", "credits": 4, "grade": None},
                {"subject_name": "Material Science", "credits": 3, "grade": None},
                {"subject_name": "Discrete Mathematics", "credits": 3, "grade": None},
                {"subject_name": "Chemistry", "credits": 2, "grade": None},
                {"subject_name": "C Lab", "credits": 2, "grade": None},
                {"subject_name": "EG", "credits": 2, "grade": None},
            ],
            3: [
                {"subject_name": "Linear Algebra", "credits": 4, "grade": None},
                {"subject_name": "Probability", "credits": 4, "grade": None},
                {"subject_name": "Data Structures", "credits": 4, "grade": None},
                {"subject_name": "Software Engineering", "credits": 3, "grade": None},
                {"subject_name": "PPL", "credits": 4, "grade": None},
                {"subject_name": "Economics", "credits": 3, "grade": None},
                {"subject_name": "DS Lab", "credits": 2, "grade": None},
                {"subject_name": "Java Lab", "credits": 2, "grade": None},
                {"subject_name": "English", "credits": 2, "grade": None},
            ],
            4: [
                {"subject_name": "Optimization Techniques", "credits": 3, "grade": None},
                {"subject_name": "DAA", "credits": 3, "grade": None},
                {"subject_name": "Operating Systems", "credits": 4, "grade": None},
                {"subject_name": "Machine Learning - I", "credits": 3, "grade": None},
                {"subject_name": "Database Systems", "credits": 3, "grade": None},
                {"subject_name": "ML Lab", "credits": 2, "grade": None},
                {"subject_name": "DBS Lab", "credits": 2, "grade": None},
                {"subject_name": "English", "credits": 1, "grade": None},
            ],
            5: [
                {"subject_name": "Artificial Intelligence", "credits": 4, "grade": None},
                {"subject_name": "Deep Learning", "credits": 3, "grade": None},
                {"subject_name": "Computer Networks", "credits": 4, "grade": None},
                {"subject_name": "Machine Learning - II", "credits": 4, "grade": None},
                {"subject_name": "Design Thinking", "credits": 3, "grade": None},
                {"subject_name": "Deep Learning Lab", "credits": 2, "grade": None},
                {"subject_name": "App Dev Lab", "credits": 2, "grade": None},
            ],
        }

        grades = semester_data.get(semester_number, [])
        return JsonResponse({'subjects': grades})

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    def post(self, request):
        roll_no = request.data.get('username')
        password = request.data.get('password')
        name = request.data.get('name')
        semester = request.data.get('semester', 1)
        points = request.data.get('points', 0.0)

        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(rollno=roll_no).exists():
            return Response({"error": "Roll number already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(rollno=roll_no, name=name, password=password, semester_number=semester, points=points)
        UserGPA.objects.create(user=user)

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'message': 'Login successful',
                'user': {
                    'rollno': user.rollno,
                    'semester': user.semester_number,
                    'points': user.points
                }
            }, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({'message': 'Logout successful'}, status=200)

def predict_ca2_and_sem_grades(ca1_marks, current_cgpa, expected_cgpa):
    X = data[['ca1']].values.reshape(-1, 1)
    y_ca2 = data['ca2'].values
    y_semester = data['semester'].values

    model_ca2 = LinearRegression()
    model_semester = LinearRegression()

    model_ca2.fit(X, y_ca2)
    model_semester.fit(X, y_semester)

    ca2_marks = model_ca2.predict(np.array(ca1_marks).reshape(-1, 1))
    semester_grades = model_semester.predict(np.array(ca1_marks).reshape(-1, 1))

    total_marks_needed = expected_cgpa * len(ca1_marks) * 10  
    current_total_marks = current_cgpa * len(ca1_marks) * 10
    required_marks = total_marks_needed - current_total_marks

    for i in range(len(semester_grades)):
        total = ca2_marks[i] + semester_grades[i]
        if total < required_marks:
            additional_needed = required_marks - total
            semester_grades[i] += additional_needed / len(semester_grades)

    ca2_marks = np.clip(ca2_marks, 0, 50)
    semester_grades = np.clip(semester_grades, 0, 100)

    return ca2_marks.tolist(), semester_grades.tolist()

@api_view(['POST'])
def predict_grades(request):
    ca1_marks = request.data.get("ca1_marks", [])
    current_cgpa = request.data.get("current_cgpa", 7.0)
    expected_cgpa = request.data.get("expected_cgpa", 8.0)

    ca2_marks, semester_grades = predict_ca2_and_sem_grades(ca1_marks, current_cgpa, expected_cgpa)

    return Response({
        "ca2_marks": ca2_marks,
        "semester_grades": semester_grades,
    })
