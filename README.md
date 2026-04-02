# GREEN-API DevOps Test Task

Тестовое задание для позиции DevOps-инженера — интеграция с GREEN-API.

##  Демо

[Ссылка на GitHub Pages](https://github.com/VladimirMok/greenapi-devops-test)

##  Функциональность

- ✅ Получение настроек инстанса (`getSettings`)
- ✅ Проверка состояния инстанса (`getStateInstance`)
- ✅ Отправка текстового сообщения (`sendMessage`)
- ✅ Отправка файла по URL (`sendFileByUrl`)
- ✅ Автоматическая проверка статуса при вводе данных
- ✅ Сохранение параметров в localStorage
- ✅ Адаптивный дизайн
- ✅ Индикация загрузки запросов

##  Технологии

- HTML5
- CSS3 (Flexbox, Grid, анимации)
- JavaScript (ES6+)
- Fetch API
- Docker
- GitHub Actions (CI/CD)

##  Архитектура
├── index.html # Основная страница
├── style.css # Стили
├── script.js # Логика API-вызовов
├── Dockerfile # Контейнеризация
├── .github/workflows/ # CI/CD пайплайн
└── README.md # Документация

```bash
# Клонирование репозитория
git clone https://github.com/VladimirMok/greenapi-devops-test.git
cd greenapi-devops-test

# Открыть index.html в браузере
open index.html

 Использование

    Зарегистрируйтесь на GREEN-API

    Создайте инстанс и подключите WhatsApp

    Введите idInstance и ApiTokenInstance на странице

    Нажмите getStateInstance для проверки подключения

    Введите номер телефона и отправьте сообщение

 Контакты
    GitHub: VladimirMok
 Лицензия

MIT
