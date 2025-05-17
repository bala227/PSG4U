from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, rollno,name ,  password=None, semester_number=1, points=0.0):
        if not rollno:
            raise ValueError("Users must have a roll number")
        if not name:
            raise ValueError("Users must have a name")
        
        user = self.model(
            rollno=rollno,
            name=name,
            semester_number=semester_number,
            points=points,
        )
        user.set_password(password)  # Hash password properly
        user.save(using=self._db)
        return user

    def create_superuser(self, rollno,name, password):
        user = self.create_user(rollno,name, password)
        user.is_admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    rollno = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=100, default="tempuser")
    semester_number = models.IntegerField(default=1)
    points = models.FloatField(default=0.0)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()  # Custom manager for user creation

    USERNAME_FIELD = 'rollno'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.rollno

    @property
    def is_staff(self):
        return self.is_admin


class Semester(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,null=True,db_column='rollno')
    semester_number = models.IntegerField(default=1)

class Subject(models.Model):
    semester_number = models.ForeignKey(Semester, related_name='subjects', on_delete=models.CASCADE)
    subject_name = models.CharField(max_length=100)
    grade = models.FloatField()
    credits = models.FloatField()

class SuggestedResource(models.Model):
    subject = models.CharField(max_length=100)
    link = models.URLField()
    relevance_score = models.FloatField()
    summary = models.TextField(null=True, blank=True)  # ✅ Add this line
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.link}"


class UserGPA(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='rollno')
    gpa_sem1 = models.FloatField(null=True, blank=True)
    gpa_sem2 = models.FloatField(null=True, blank=True)
    gpa_sem3 = models.FloatField(null=True, blank=True)
    gpa_sem4 = models.FloatField(null=True, blank=True)
    gpa_sem5 = models.FloatField(null=True, blank=True)
    gpa_sem6 = models.FloatField(null=True, blank=True)
    gpa_sem7 = models.FloatField(null=True, blank=True)
    gpa_sem8 = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'user_gpa'

    def __str__(self):
        return f"GPA Record for {self.user.rollno}"


class SemesterGPA(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='rollno')
    semester = models.IntegerField()
    total_points = models.FloatField(default=0.0)  # Set default value to prevent NULL
    total_credits = models.FloatField(default=0.0)  # Set default value to prevent NULL

    class Meta:
        db_table = 'user_credits'
        unique_together = ('user', 'semester')

    def __str__(self):
        return f"Semester {self.semester} GPA for {self.user.username}"

