// Утилитарные функции
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Основной файл скриптов
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем текущий год в футере
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Инициализация
    initDictionary();
    initNavigation();
    initThemeToggle(); // Инициализация переключателя темы
    
    // Добавляем анимацию загрузки
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Инициализация переключателя темы
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    
    // Устанавливаем тему из localStorage или по умолчанию светлую
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    
    // Обработчик клика по переключателю
    themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Анимация переключения
        themeToggle.classList.add('animating');
        
        // Меняем тему
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Убираем класс анимации после завершения
        setTimeout(() => {
            themeToggle.classList.remove('animating');
        }, 600);
        
        // Плавное изменение прозрачности
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 300);
        
        console.log('Тема изменена на:', newTheme);
    });
    
    console.log('Переключатель темы инициализирован');
}

// Модуль словаря терминов с ленивой загрузкой
function initDictionary() {
    // ... существующий код без изменений ...
    // (оставляем как было)
}

// Модуль навигации
function initNavigation() {
    // ... существующий код без изменений ...
    // (оставляем как было)
}

// Добавляем анимацию пульсации
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);
