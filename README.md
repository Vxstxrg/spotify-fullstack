# Музыкальная платформа (Spotify-клон)

Fullstack-приложение: клиент на **Next.js**, API на **NestJS**, база **MongoDB**, всё упаковано в **Docker Compose**.

![CI](https://github.com/Vxstxrg/spotify-fullstack/actions/workflows/ci.yml/badge.svg)

## Возможности

- **Треки**: загрузка с обложкой и аудиофайлом, текст песни, счётчик прослушиваний, поиск по названию и исполнителю
- **Альбомы**: создание, страница альбома со своими треками, добавление и удаление треков в альбоме, привязка трека к альбому при загрузке, при удалении альбома треки отвязываются, а не удаляются
- **Аутентификация**: JWT (регистрация/вход), имя автора комментария берётся из аккаунта; **первый зарегистрированный пользователь получает роль администратора**
- **Права доступа**: удалять треки и альбомы может только их автор или администратор (проверка на сервере, кнопки в UI видны только тем, кому разрешено)
- **Валидация**: DTO через class-validator (глобальный ValidationPipe), проверка расширений и размера загружаемых файлов
- **Плеер**: play/pause, перемотка, громкость, время воспроизведения
- **Тесты**: 32 автотеста — unit (валидация файлов) и e2e на in-memory MongoDB (auth, треки, альбомы, права доступа)

## Стек

| Слой | Технологии |
|---|---|
| Клиент | Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, MUI, Tailwind |
| Сервер | NestJS, Mongoose, Passport JWT, class-validator, Multer |
| БД | MongoDB |
| Инфраструктура | Docker, Docker Compose, GitHub Actions |

## Запуск

### Вариант 1: Docker (рекомендуется)

```bash
docker compose up --build
```

- Клиент: http://localhost:3000
- API: http://localhost:5000
- MongoDB поднимается внутри compose, загруженные файлы хранятся в томе `server_static`

### Вариант 2: локальная разработка

```bash
# сервер (порт 5000)
cd server
cp .env.example .env      # заполните MONGODB_URI и JWT_SECRET
npm install
npm run start:dev

# клиент (порт 3000), в отдельном терминале
cd client
npm install
npm run dev
```

Адрес API можно переопределить переменной `NEXT_PUBLIC_API_URL`.

## Переменные окружения (server)

| Переменная | Назначение |
|---|---|
| `PORT` | порт API (по умолчанию 5000) |
| `MONGODB_URI` | строка подключения к MongoDB |
| `JWT_SECRET` | секрет для подписи JWT |

## API

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/auth/register` | — | регистрация, возвращает JWT |
| POST | `/auth/login` | — | вход, возвращает JWT |
| GET | `/auth/me` | 🔒 | данные текущего пользователя |
| GET | `/tracks?count=&offset=` | — | список треков |
| GET | `/tracks/search?query=` | — | поиск по названию/исполнителю |
| GET | `/tracks/:id` | — | трек с комментариями |
| POST | `/tracks` | 🔒 | создание трека (multipart: name, artist, text, albumId, picture, audio) |
| POST | `/tracks/listen/:id` | — | +1 прослушивание |
| POST | `/tracks/comment` | 🔒 | комментарий (имя берётся из JWT) |
| DELETE | `/tracks/:id` | 🔒 автор/админ | удаление трека и его файлов |
| GET/POST/DELETE | `/albums...` | — / 🔒 / 🔒 автор/админ | то же для альбомов; `GET /albums/:id` включает треки |
| POST | `/albums/:id/tracks/:trackId` | 🔒 автор/админ | добавить трек в альбом |
| DELETE | `/albums/:id/tracks/:trackId` | 🔒 автор/админ | убрать трек из альбома (трек не удаляется) |

## Тесты

```bash
cd server
npm test          # unit-тесты
npm run test:e2e  # e2e на mongodb-memory-server (реальная БД не нужна)
```

Для запуска тестов нужен Node.js ≥ 24 (Jest использует нативный `require(esm)`).

## Структура

```
client/                  # Next.js (App Router)
  app/                   # страницы: треки, альбомы, вход/регистрация
  components/            # плеер, списки, навигация
  store/                 # Redux: player, track, auth
server/                  # NestJS
  src/auth/              # JWT: стратегия, guards, роли
  src/track/             # треки и комментарии
  src/album/             # альбомы и связь с треками
  src/file/              # загрузка и валидация файлов
  test/                  # e2e-тесты
docker-compose.yml       # mongo + server + client
```

## Идеи для развития

- refresh-токены вместо долгоживущего access-токена
- RTK Query вместо ручных thunk'ов
- пагинация списка с общим количеством, автопереход между треками в плеере
