# PSG4U 🎓

**PSG4U** is a full-stack educational platform built with **React** (frontend) and **Django** (backend). It helps students manage their semester progress, predict future grades using machine learning, and contribute by suggesting useful academic resources.

---

### Still in Development ‼️

---

### 🌟 Features

### 🔐 Authentication
- User **registration**, **login**, and **logout**
- Session-based authentication using Django
- Secure endpoints with CSRF protection

### 👤 Dashboard
- View:
  - Email
  - Points (gamified score)
- CGPA
- LevelUp Link

### 📚 Suggest Educational Resources
- Students can suggest learning resources via link (e.g., articles)
- Each suggestion is:
  - Fetched and analyzed
  - Scored based on **ML based relevance checking**
- Relevant suggestions:
  - Are accepted
  - Earn the student **10 points**

### 🔍 Search Resources
- Search by subject name

### 🎓 GPA Calculator

This allows students to:

- Select a semester
- Input grades for each subject
- Instantly calculate their **GPA**
- Build a grade improvement **strategy**
- Predict **CA2 marks** and **semester grades** using a backend ML model

### 🧠 Predict Grades (ML)
- Predict:
  - CA2 (Class Assessment 2) marks
  - Semester grades
- Based on:
  - CA1 marks
  - Current and expected CGPA
- Uses **Linear Regression (scikit-learn)** 

---

### 🛠️ Tech Stack

### Frontend
- React.js
- React Router (page navigation)
- Tailwind CSS (styling)

### Backend
- Django
- Django REST Framework
- Django Auth (User model)
- scikit-learn & Pandas (Machine Learning)
- SQLite  (database)


### 🙌 Credits
- Built by **Bala Subramanian 😁✌️** — based on a student-centric idea to simplify academic tracking and boost collaborative learning.

