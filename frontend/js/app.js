const API_URL = 'http://localhost/api';

let currentUser = null;

// Функции для переключения секций
function showSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    // Показать выбранную
    document.getElementById(sectionId).classList.add('active');
}

// Вспомогательные функции для работы с классами
function hideElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    for (let element of elements) {
        element.style.display = 'none';
    }
}

function showElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    for (let element of elements) {
        element.style.display = 'block';
    }
}

// Функция для обновления интерфейса в зависимости от роли
function updateUIForRole(role) {
    // Скрываем все кнопки навигации сначала
    document.getElementById('btn-courses').style.display = 'none';
    document.getElementById('btn-grades').style.display = 'none';
    document.getElementById('btn-admin').style.display = 'none';
    // btn-login может отсутствовать в разметке, поэтому проверяем
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) btnLogin.style.display = 'none';
    document.getElementById('btn-logout').style.display = 'inline-block';

    // Показываем элементы в зависимости от роли
    if (role === 'student') {
        document.getElementById('btn-courses').style.display = 'inline-block';
        document.getElementById('btn-grades').style.display = 'inline-block';
        // Скрываем элементы для преподавателей и админов
        hideElementsByClass('teacher-only');
        hideElementsByClass('admin-only');
    }
    else if (role === 'teacher') {
        document.getElementById('btn-courses').style.display = 'inline-block';
        document.getElementById('btn-grades').style.display = 'inline-block';
        // Показываем элементы для преподавателей, скрываем для админов
        showElementsByClass('teacher-only');
        hideElementsByClass('admin-only');
    }
    else if (role === 'admin') {
        document.getElementById('btn-courses').style.display = 'inline-block';
        document.getElementById('btn-grades').style.display = 'inline-block';
        document.getElementById('btn-admin').style.display = 'inline-block';
        // Показываем все элементы
        showElementsByClass('teacher-only');
        showElementsByClass('admin-only');
    }

    // Показываем текущую роль
    document.querySelector('header .logo p').innerHTML =
        `Облачная система управления учебными процессами (Вы вошли как: ${role === 'student' ? 'Студент' : role === 'teacher' ? 'Преподаватель' : 'Администратор'})`;
}

// Функция входа
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Пытаемся войти через API
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = {
                username: user.username,
                role: user.role,
                id: user.id
            };

            document.getElementById('login-message').innerHTML =
                `<p style="color:green">Вход выполнен как ${username} (${user.role === 'student' ? 'Студент' : user.role === 'teacher' ? 'Преподаватель' : 'Администратор'})</p>`;

            // Обновляем интерфейс в зависимости от роли
            updateUIForRole(user.role);

            // Загружаем данные и показываем соответствующую секцию
            loadAllData();
            showSection('courses');
        } else {
            // Если API не сработало, используем fallback
            fallbackLogin(username, password);
        }
    } catch (error) {
        console.error('Ошибка входа через API:', error);
        // Fallback на старый метод
        fallbackLogin(username, password);
    }
}

// Fallback метод входа (если API недоступно)
function fallbackLogin(username, password) {
    if ((username === 'teacher' && password === '123') ||
        (username === 'student' && password === '123') ||
        (username === 'admin' && password === '123')) {

        const role = username === 'teacher' ? 'teacher' :
                    username === 'admin' ? 'admin' : 'student';

        currentUser = { username, role, id: role === 'teacher' ? 1 : role === 'student' ? 2 : 3 };
        document.getElementById('login-message').innerHTML =
            `<p style="color:green">Вход выполнен как ${username} (${role === 'student' ? 'Студент' : role === 'teacher' ? 'Преподаватель' : 'Администратор'})</p>`;

        updateUIForRole(role);
        loadAllData();
        showSection('courses');
    } else {
        document.getElementById('login-message').innerHTML =
            `<p style="color:red">Неверный логин или пароль</p>`;
    }
}

// Функция выхода
function logout() {
    currentUser = null;
    // Показываем только кнопку входа
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) btnLogin.style.display = 'inline-block';
    document.getElementById('btn-courses').style.display = 'none';
    document.getElementById('btn-grades').style.display = 'none';
    document.getElementById('btn-admin').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'none';

    // Возвращаем заголовок
    document.querySelector('header .logo p').innerHTML =
        'Облачная система управления учебными процессами';

    // Скрываем все элементы для ролей
    hideElementsByClass('teacher-only');
    hideElementsByClass('admin-only');

    showSection('login');
    // Очищаем поля входа
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Загрузка всех данных
async function loadAllData() {
    await loadCourses();
    await loadGrades();
    await loadUsers();
}

// Загрузка курсов
async function loadCourses() {
    try {
        const response = await fetch(`${API_URL}/courses`);
        const courses = await response.json();

        const coursesList = document.getElementById('courses-list');
        coursesList.innerHTML = '';

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <h4>${course.title}</h4>
                <p>${course.description || 'Без описания'}</p>
                <p><strong>Преподаватель:</strong> ${course.teacher_name || 'Не указан'}</p>
                <p><small>ID курса: ${course.id}</small></p>
            `;
            coursesList.appendChild(card);
        });

        // Заполняем выпадающий список курсов
        const courseSelect = document.getElementById('course-select');
        courseSelect.innerHTML = '';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.title;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки курсов:', error);
    }
}

// Добавление курса
async function addCourse() {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        alert('Только преподаватели и администраторы могут добавлять курсы');
        return;
    }

    const title = document.getElementById('course-title').value;
    const description = document.getElementById('course-description').value;

    if (!title) {
        alert('Введите название курса');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                teacher_id: currentUser.id || 1
            })
        });

        if (response.ok) {
            alert('Курс добавлен');
            document.getElementById('course-title').value = '';
            document.getElementById('course-description').value = '';
            loadCourses();
        }
    } catch (error) {
        console.error('Ошибка добавления курса:', error);
    }
}

// Загрузка оценок
async function loadGrades() {
    try {
        // Загружаем оценки для текущего пользователя (если студент)
        // или все оценки (если преподаватель/админ)
        const studentId = currentUser && currentUser.role === 'student' ? currentUser.id : 1;
        const response = await fetch(`${API_URL}/grades/${studentId}`);
        const grades = await response.json();

        const gradesList = document.getElementById('grades-list');
        gradesList.innerHTML = '';

        if (grades.length === 0) {
            gradesList.innerHTML = '<p>Оценок пока нет</p>';
        } else {
            grades.forEach(grade => {
                const card = document.createElement('div');
                card.className = 'grade-card';
                card.innerHTML = `
                    <h4>${grade.course_title || 'Курс'}</h4>
                    <p><strong>Оценка:</strong> ${grade.grade}</p>
                    <p><strong>Дата:</strong> ${grade.date || 'Не указана'}</p>
                    <p><small>ID оценки: ${grade.id}</small></p>
                `;
                gradesList.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки оценок:', error);
    }
}

// Добавление оценки
async function addGrade() {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        alert('Только преподаватели и администраторы могут добавлять оценки');
        return;
    }

    const studentId = document.getElementById('student-id').value;
    const courseId = document.getElementById('course-select').value;
    const grade = document.getElementById('grade-value').value;

    if (!studentId || !courseId || !grade) {
        alert('Заполните все поля');
        return;
    }

    if (grade < 1 || grade > 5) {
        alert('Оценка должна быть от 1 до 5');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: parseInt(studentId),
                course_id: parseInt(courseId),
                grade: parseInt(grade)
            })
        });

        if (response.ok) {
            alert('Оценка добавлена');
            document.getElementById('student-id').value = '';
            document.getElementById('grade-value').value = '';
            loadGrades();
        }
    } catch (error) {
        console.error('Ошибка добавления оценки:', error);
    }
}

// Загрузка пользователей
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';

        users.forEach(user => {
            const roleText = user.role === 'teacher' ? 'Преподаватель' :
                           user.role === 'admin' ? 'Администратор' : 'Студент';

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <h4>${user.username}</h4>
                <p><strong>Роль:</strong> ${roleText}</p>
                <p><small>ID: ${user.id}</small></p>
            `;
            usersList.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
}

// Добавление пользователя
async function addUser() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Только администраторы могут добавлять пользователей');
        return;
    }

    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (!username || !password) {
        alert('Заполните все поля');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                role
            })
        });

        if (response.ok) {
            alert('Пользователь добавлен');
            document.getElementById('new-username').value = '';
            document.getElementById('new-password').value = '';
            loadUsers();
        }
    } catch (error) {
        console.error('Ошибка добавления пользователя:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    showSection('login');
    // Скрываем все, кроме входа
    document.getElementById('btn-courses').style.display = 'none';
    document.getElementById('btn-grades').style.display = 'none';
    document.getElementById('btn-admin').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'none';

    // Скрываем элементы для учителей и админов
    hideElementsByClass('teacher-only');
    hideElementsByClass('admin-only');

    // Автоматически загружаем данные
    loadAllData();
});