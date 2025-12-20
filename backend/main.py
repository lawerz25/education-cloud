from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import database

app = FastAPI(title="Education Cloud API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- МОДЕЛИ ----------

class LoginRequest(BaseModel):
    username: str
    password: str


class User(BaseModel):
    username: str
    password: str
    role: str = "student"


class Course(BaseModel):
    title: str
    description: Optional[str] = None
    teacher_id: int


class Grade(BaseModel):
    student_id: int
    course_id: int
    grade: int


# ---------- РОУТЫ ----------

@app.get("/")
def read_root():
    return {"message": "Education Cloud API is running"}


@app.post("/login")
def login(login_data: LoginRequest):
    with database.get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, role FROM users WHERE username = %s AND password = %s",
            (login_data.username, login_data.password)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "id": user[0],
            "username": user[1],
            "role": user[2]
        }


@app.get("/users")
def get_users():
    with database.get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, role FROM users")
        rows = cursor.fetchall()
        return [
            {"id": r[0], "username": r[1], "role": r[2]}
            for r in rows
        ]


@app.post("/users")
def create_user(user: User):
    with database.get_db() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
                (user.username, user.password, user.role)
            )
            conn.commit()
            return {"message": "User created"}
        except Exception:
            conn.rollback()
            raise HTTPException(status_code=400, detail="Username already exists")


@app.get("/courses")
def get_courses():
    with database.get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.id, c.title, c.description, u.username
            FROM courses c
            LEFT JOIN users u ON c.teacher_id = u.id
        """)
        rows = cursor.fetchall()
        return [
            {
                "id": r[0],
                "title": r[1],
                "description": r[2],
                "teacher_name": r[3]
            }
            for r in rows
        ]


@app.post("/courses")
def create_course(course: Course):
    with database.get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO courses (title, description, teacher_id) VALUES (%s, %s, %s)",
            (course.title, course.description, course.teacher_id)
        )
        conn.commit()
        return {"message": "Course created"}


@app.get("/grades/{student_id}")
def get_grades(student_id: int):
    with database.get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT g.id, g.grade, c.title
            FROM grades g
            JOIN courses c ON g.course_id = c.id
            WHERE g.student_id = %s
        """, (student_id,))
        rows = cursor.fetchall()
        return [
            {
                "id": r[0],
                "grade": r[1],
                "course_title": r[2]
            }
            for r in rows
        ]


@app.post("/grades")
def add_grade(grade: Grade):
    with database.get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO grades (student_id, course_id, grade) VALUES (%s, %s, %s)",
            (grade.student_id, grade.course_id, grade.grade)
        )
        conn.commit()
        return {"message": "Grade added"}