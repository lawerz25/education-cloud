import sqlite3
import os
from contextlib import contextmanager

DATABASE_PATH = os.getenv("DATABASE_PATH", "/data/education.db")


def init_db():
    """Создание базы данных и таблиц при старте приложения"""
    with get_db() as conn:
        cursor = conn.cursor()

        # Таблица пользователей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student'
            )
        ''')

        # Таблица курсов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                teacher_id INTEGER,
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            )
        ''')

        # Таблица оценок
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS grades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                grade INTEGER NOT NULL,
                date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id),
                FOREIGN KEY (course_id) REFERENCES courses(id)
            )
        ''')

        # Добавляем тестовые данные (idempotent)
        cursor.execute("""
            INSERT OR IGNORE INTO users (id, username, password, role)
            VALUES (1, 'teacher', '123', 'teacher')
        """)

        cursor.execute("""
            INSERT OR IGNORE INTO users (id, username, password, role)
            VALUES (2, 'student', '123', 'student')
        """)

        cursor.execute("""
            INSERT OR IGNORE INTO users (id, username, password, role)
            VALUES (3, 'admin', '123', 'admin')
        """)

        cursor.execute("""
            INSERT OR IGNORE INTO courses (id, title, description, teacher_id)
            VALUES (1, 'Введение в Docker', 'Основы контейнеризации', 1)
        """)

        conn.commit()


@contextmanager
def get_db():
    """Контекстный менеджер для работы с БД"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()