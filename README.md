# School Club Tracker

Веб-приложение для управления школьными клубами и событиями на базе MERN стека с TypeScript и GraphQL.

## Описание проекта

**School Club Tracker** — это платформа для управления школьными клубами и мероприятиями, где:

- **Ученики** могут искать клубы, присоединяться к ним, просматривать мероприятия и управлять своими членствами
- **Администраторы** могут создавать и удалять клубы и события, а также видеть участников клубов
- Все изменения отображаются в реальном времени через GraphQL Subscriptions

## Технологический стек

- **Backend**: Node.js, Express.js, TypeScript, GraphQL (Apollo Server)
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, Apollo Client
- **Database**: MongoDB (Mongoose)
- **Testing**: Jest
- **DevOps**: Docker, Docker Compose
- **Real-time**: GraphQL Subscriptions (graphql-ws)

## Схема данных

### Модели

1. **User** (Student/Admin)
   - email, password, name, role, clubs (refs), createdAt, updatedAt

2. **Club**
   - name, description, category, capacity, members (refs), createdBy, createdAt, updatedAt

3. **Event**
   - title, description, date, location, time, dressCode, club (ref), createdAt, updatedAt

4. **Membership**
   - user (ref), club (ref), joinedAt, status, createdAt, updatedAt

### Связи

- User ↔ Membership ↔ Club (многие-ко-многим через Membership)
- Club → Event (1-ко-многим)

## Запуск проекта

### Локальный запуск (Docker Compose)

```bash
docker-compose up
```

Это поднимет все сервисы:
- **API**: http://localhost:4000/graphql
- **Client**: http://localhost:3000
- **MongoDB**: localhost:27017

### Локальный запуск (без Docker)

#### Backend

```bash
cd server
npm install
cp .env.example .env
npm run seed  # заполнить БД тестовыми данными
npm run dev
```

#### Frontend

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

## Проверка реалтайм-функциональности

### Сценарий 1: Запись ученика в клуб

1. Откройте два браузера/вкладки
2. В первой вкладке войдите как **Student** (test@student.com / password123)
3. Во второй вкладке войдите как **Admin** (admin@admin.com / admin123)
4. В первой вкладке откройте список клубов и нажмите "Записаться" на любом клубе
5. Во второй вкладке (Admin) список участников клуба должен обновиться **мгновенно** без перезагрузки

### Сценарий 2: Создание нового события

1. Войдите как **Admin**
2. Создайте новое событие для клуба
3. В другой вкладке (как Student) список событий должен обновиться **мгновенно**

### Сценарий 3: Выход из клуба

1. Как Student, откройте "Мои клубы"
2. Нажмите "Выйти из клуба"
3. Список должен обновиться **мгновенно** через Subscription

## Тестовые пользователи

### Student
- Email: `test@student.com`
- Password: `password123`

### Admin
- Email: `admin@admin.com`
- Password: `admin123`

## Скрипты

### Backend (server/)
- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для production
- `npm run test` - запуск тестов
- `npm run seed` - заполнение БД тестовыми данными
- `npm run lint` - проверка кода

### Frontend (client/)
- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для production
- `npm run lint` - проверка кода

## Структура проекта

```
school-club-tracker/
├── server/          # Backend (Express + GraphQL)
│   ├── src/
│   │   ├── models/      # Mongoose модели
│   │   ├── resolvers/   # GraphQL резолверы
│   │   ├── schema/      # GraphQL схема
│   │   ├── services/    # Бизнес-логика
│   │   ├── utils/       # Утилиты (JWT, валидация)
│   │   └── index.ts     # Точка входа
│   ├── tests/      # Jest тесты
│   └── Dockerfile
├── client/          # Frontend (Next.js)
│   ├── app/         # App Router страницы
│   ├── components/  # React компоненты
│   ├── store/       # Zustand stores
│   ├── lib/         # Apollo Client, утилиты
│   └── Dockerfile
└── docker-compose.yml
```

## Команда

- Разработка: Nursultan, Kausar






