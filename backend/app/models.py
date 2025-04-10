from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, rollno, password=None, semester_number=1, points=0.0):
        if not rollno:
            raise ValueError("Users must have a roll number")
        
        user = self.model(
            rollno=rollno,
            semester_number=semester_number,
            points=points,
        )
        user.set_password(password)  # Hash password properly
        user.save(using=self._db)
        return user

    def create_superuser(self, rollno, password):
        user = self.create_user(rollno, password)
        user.is_admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    rollno = models.CharField(max_length=10, unique=True, primary_key=True)
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
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.link}"