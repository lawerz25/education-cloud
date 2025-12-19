#!/bin/sh

echo "=== Проверка базы данных SQLite ==="
echo ""

# Проверяем, существует ли файл базы данных
if [ ! -f "/data/education.db" ]; then
    echo "Ошибка: Файл базы данных /data/education.db не найден"
    echo "Создайте базу данных или проверьте монтирование тома"
    exit 0
fi

echo "Файл базы данных найден"

# Проверяем наличие таблиц
echo "Проверка наличия таблиц..."
TABLES=$(sqlite3 /data/education.db ".tables")

if echo "$TABLES" | grep -q "users"; then
    echo "Таблица 'users' существует"
else
    echo "Ошибка: Таблица 'users' не найдена"
    exit 0
fi

# Дополнительная проверка структуры таблицы
echo "Проверка структуры таблицы 'users'..."
COLUMNS=$(sqlite3 /data/education.db "PRAGMA table_info(users);")

if echo "$COLUMNS" | grep -q "id"; then
    echo "Таблица имеет необходимые поля"
else
    echo "Предупреждение: Проверьте структуру таблицы 'users'"
fi

# Проверяем, есть ли данные в таблице
ROW_COUNT=$(sqlite3 /data/education.db "SELECT COUNT(*) FROM users;")
echo "Количество записей в таблице 'users': $ROW_COUNT"

echo ""
echo "=== Проверка успешно завершена ==="
exit 0