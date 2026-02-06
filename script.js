document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена');
    
    // Устанавливаем текущий год
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Инициализация переключателя темы
    initThemeToggle();
    
    // Инициализация словаря
    initDictionary();
    
    // Инициализация навигации
    initNavigation();
    
    // Убираем прозрачность body
    document.body.style.opacity = '1';
});

// Переключатель темы
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    
    // Обработчик клика
    themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        console.log('Тема изменена на:', newTheme);
    });
}

// Словарь терминов
function initDictionary() {
    const termsContainer = document.getElementById('termsContainer');
    const searchInput = document.getElementById('termSearch');
    const searchBtn = document.getElementById('searchBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const termsCount = document.getElementById('termsCount');
    
    let currentFilter = 'all';
    let currentSearch = '';
    let currentPage = 0;
    const termsPerPage = 6;
    
    // Отображение терминов
    function displayTerms(page = 0, reset = false) {
        console.log('Отображение терминов, страница:', page);
        
        let filteredTerms = getFilteredTerms();
        
        // Обновляем счетчик
        const showing = Math.min((page + 1) * termsPerPage, filteredTerms.length);
        const total = filteredTerms.length;
        termsCount.textContent = `Показано: ${showing} из ${total}`;
        
        // Показываем кнопку "Показать ещё"
        if (loadMoreBtn) {
            const hasMore = ((page + 1) * termsPerPage) < filteredTerms.length;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        }
        
        // Если сброс, очищаем контейнер
        if (reset) {
            termsContainer.innerHTML = '';
            currentPage = 0;
            page = 0;
        } else if (page === 0) {
            termsContainer.innerHTML = '';
        }
        
        // Получаем термины для текущей страницы
        const start = page * termsPerPage;
        const end = start + termsPerPage;
        const pageTerms = filteredTerms.slice(start, end);
        
        // Добавляем термины
        pageTerms.forEach((term, index) => {
            const termCard = createTermCard(term, index);
            termsContainer.appendChild(termCard);
        });
        
        currentPage = page;
        
        // Если ничего не найдено
        if (filteredTerms.length === 0) {
            termsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-color);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
                </div>
            `;
        }
    }
    
    // Создание карточки термина
    function createTermCard(term, index) {
        const termCard = document.createElement('div');
        termCard.className = 'term-card';
        termCard.style.animationDelay = `${index * 100}ms`;
        
        const categoryName = getCategoryName(term.category);
        
        termCard.innerHTML = `
            <h3>${term.term} <span class="tag">${categoryName}</span></h3>
            <div class="legal-def"><strong>Юридическое определение:</strong> ${term.legalDefinition}</div>
            <div class="common-def"><strong>Бытовое употребление:</strong> ${term.commonDefinition}</div>
            <div class="example"><strong>Пример:</strong> ${term.example}</div>
        `;
        
        return termCard;
    }
    
    // Получение названия категории
    function getCategoryName(category) {
        const categories = {
            'all': '📚 Все',
            'contract': '📝 Договоры',
            'court': '⚖️ Суд',
            'property': '🏠 Собственность',
            'finance': '💰 Финансы',
            'criminal': '🔒 Уголовное',
            'civil': '⚖️ Гражданское',
            'international': '🌍 Международное',
            'legislation': '📜 Законодательство',
            'rights': '🛡️ Права',
            'documents': '📄 Документы',
            'politics': '🏛️ Политика',
            'economics': '📊 Экономика',
            'commerce': '🛒 Коммерция',
            'negotiation': '🤝 Переговоры'
        };
        return categories[category] || '📌 Другое';
    }
    
    // Фильтрация терминов
    function getFilteredTerms() {
        let filtered = allTerms;
        
        // Фильтр по категории
        if (currentFilter !== 'all') {
            filtered = filtered.filter(term => term.category === currentFilter);
        }
        
        // Поиск по названию
        if (currentSearch) {
            const searchLower = currentSearch.toLowerCase().trim();
            filtered = filtered.filter(term => 
                term.term.toLowerCase().includes(searchLower) ||
                term.legalDefinition.toLowerCase().includes(searchLower) ||
                term.commonDefinition.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    }
    
    // Инициализация событий
    displayTerms(0);
    
    // Поиск
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value;
        displayTerms(0, true);
    });
    
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        if (!currentSearch) {
            displayTerms(0, true);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value;
            displayTerms(0, true);
        }
    });
    
    // Фильтры
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            displayTerms(0, true);
        });
    });
    
    // Кнопка "Показать ещё"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayTerms(currentPage + 1);
        });
    }
}

// Навигация
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Плавная прокрутка
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Закрываем мобильное меню
                if (navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
                
                // Прокрутка
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Обновляем активную ссылку
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                // Анимация карточек при появлении
function initCardAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${entry.target.dataset.delay || 0}ms`;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.term-card').forEach((card, index) => {
        card.dataset.delay = index * 100;
        observer.observe(card);
    });
}

// Инициализация всех анимаций
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена');
    
    // Устанавливаем текущий год
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Инициализация переключателя темы
    initThemeToggle();
    
    // Инициализация словаря
    initDictionary();
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация анимаций
    setTimeout(initCardAnimations, 500);
    
    // Убираем прозрачность body
    document.body.style.opacity = '1';
});

// В существующую функцию createTermCard добавьте:
function createTermCard(term, index) {
    const termCard = document.createElement('div');
    termCard.className = 'term-card';
    termCard.style.opacity = '0';
    termCard.style.transform = 'translateY(20px)';
    termCard.style.animationDelay = `${index * 100}ms`;
    
    const categoryName = getCategoryName(term.category);
    
    termCard.innerHTML = `
        <h3>${term.term} <span class="tag">${categoryName}</span></h3>
        <div class="legal-def"><strong>Юридическое определение:</strong> ${term.legalDefinition}</div>
        <div class="common-def"><strong>Бытовое употребление:</strong> ${term.commonDefinition}</div>
        <div class="example"><strong>Пример:</strong> ${term.example}</div>
    `;
    
    return termCard;
}
            }
        });
    });
    
    // Мобильное меню
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            if (navMenu.classList.contains('show')) {
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && window.innerWidth <= 768) {
            navMenu.classList.remove('show');
            if (menuToggle) {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
}
