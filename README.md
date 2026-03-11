# ASANOV NEWS — Новостной портал

Полноценное веб-приложение "Новостной портал" с системой управления контентом.

## Стек технологий

### Backend
- **FastAPI** — асинхронный веб-фреймворк
- **SQLAlchemy 2.0** — ORM (async)
- **PostgreSQL 16** — база данных
- **Alembic** — миграции БД
- **JWT** — аутентификация
- **MinIO** — S3-совместимое хранилище изображений

### Frontend
- **React 18** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **TailwindCSS** — стилизация
- **Zustand** — управление состоянием
- **TanStack Query** — серверное состояние
- **Editor.js** — блочный редактор
- **react-i18next** — мультиязычность (KZ/RU)

## Возможности

- Главная страница с баннером популярной новости
- Лента новостей с пагинацией
- Детальная страница новости с контент-блоками (текст, изображения, YouTube)
- Комментарии с лайками
- Закладки
- Категории с фильтрацией
- Полнотекстовый поиск
- Система рекомендаций (похожие новости)
- Админ панель с блочным редактором (как в Medium)
- Тёмная и светлая тема
- Двуязычный интерфейс (KZ/RU)
- JWT аутентификация
- Загрузка изображений в MinIO

## Запуск

### Требования
- Docker
- Docker Compose

### Шаги

```bash
# 1. Клонировать репозиторий
git clone git@github.com:asanov2/domplom.git
cd domplom

# 2. Скопировать .env (при необходимости изменить)
# .env уже включен в проект

# 3. Запустить все сервисы
docker compose up --build

# 4. Применить миграции (в отдельном терминале)
docker compose exec backend alembic upgrade head
```

### Доступ
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **MinIO Console:** http://localhost:9001 (minioadmin / minioadmin)

## Создание администратора

После запуска зарегистрируйте пользователя через UI, затем обновите роль в БД:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Структура проекта

```
├── backend/
│   ├── app/
│   │   ├── api/          # API роутеры
│   │   ├── core/         # Конфигурация, безопасность
│   │   ├── crud/         # Операции с БД
│   │   ├── db/           # Сессия, базовая модель
│   │   ├── models/       # SQLAlchemy модели
│   │   ├── schemas/      # Pydantic схемы
│   │   ├── services/     # Бизнес-логика (MinIO)
│   │   └── main.py       # Точка входа
│   ├── alembic/          # Миграции
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы
│   │   ├── layouts/      # Лейауты
│   │   ├── store/        # Zustand stores
│   │   ├── services/     # API клиент
│   │   ├── types/        # TypeScript типы
│   │   ├── i18n/         # Переводы
│   │   ├── App.tsx       # Маршрутизация
│   │   └── main.tsx      # Точка входа
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env
```

## API Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /auth/register | Регистрация |
| POST | /auth/login | Авторизация |
| GET | /auth/me | Текущий пользователь |
| GET | /news/ | Список новостей (пагинация) |
| GET | /news/{id} | Детали новости |
| GET | /news/popular-today | Популярные сегодня |
| GET | /news/search?q= | Поиск |
| GET | /news/{id}/similar | Похожие новости |
| POST | /news/ | Создать новость (admin) |
| PUT | /news/{id} | Обновить новость (admin) |
| DELETE | /news/{id} | Удалить новость (admin) |
| GET | /categories/ | Список категорий |
| POST | /categories/ | Создать категорию (admin) |
| DELETE | /categories/{id} | Удалить категорию (admin) |
| GET | /comments/news/{id} | Комментарии к новости |
| POST | /comments/ | Добавить комментарий |
| POST | /comments/{id}/like | Лайк/анлайк комментария |
| GET | /bookmarks/ | Закладки пользователя |
| POST | /bookmarks/{news_id} | Добавить/убрать закладку |
| POST | /upload/image | Загрузить изображение (admin) |

## Автор

**Asanov** — дипломный проект, 2026
