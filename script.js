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
    
    // Инициализация словаря
    initDictionary();
    initNavigation();
    
    // Добавляем анимацию загрузки
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Модуль словаря терминов с ленивой загрузкой
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
    const termsPerPage = 9; // 3 колонки по 3 термина
    let isAnimating = false;
    
    // Отображение терминов с пагинацией
    function displayTerms(page = 0, reset = false) {
        if (isAnimating) return;
        isAnimating = true;
        
        let filteredTerms = getFilteredTerms();
        
        // Обновляем счетчик
        const showing = Math.min((page + 1) * termsPerPage, filteredTerms.length);
        const total = filteredTerms.length;
        termsCount.textContent = `Показано: ${showing} из ${total}`;
        termsCount.style.animation = 'fadeIn 0.3s ease';
        
        // Показываем кнопку "Показать ещё" если есть еще термины
        if (loadMoreBtn) {
            const hasMore = ((page + 1) * termsPerPage) < filteredTerms.length;
            loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
            if (hasMore) {
                loadMoreBtn.style.animation = 'fadeIn 0.5s ease';
            }
        }
        
        // Если сброс, очищаем контейнер
        if (reset) {
            termsContainer.innerHTML = '';
            currentPage = 0;
        } else if (page === 0) {
            termsContainer.innerHTML = '';
        }
        
        // Получаем термины для текущей страницы
        const start = page * termsPerPage;
        const end = start + termsPerPage;
        const pageTerms = filteredTerms.slice(start, end);
        
        // Создаем DocumentFragment для пакетного добавления
        const fragment = document.createDocumentFragment();
        
        pageTerms.forEach((term, index) => {
            const termCard = createTermCard(term, index);
            fragment.appendChild(termCard);
        });
        
        termsContainer.appendChild(fragment);
        
        currentPage = page;
        
        // Завершаем анимацию
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
    
    // Создание карточки термина
    function createTermCard(term, index) {
        const termCard = document.createElement('div');
        termCard.className = 'term-card';
        termCard.style.animationDelay = `${index * 100}ms`;
        
        const categoryName = getCategoryName(term.category);
        
        termCard.innerHTML = `
            <h3>${term.term} <span class="tag" data-category="${term.category}">${categoryName}</span></h3>
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
        
        // Применяем фильтр
        if (currentFilter !== 'all') {
            filtered = filtered.filter(term => term.category === currentFilter);
        }
        
        // Применяем поиск
        if (currentSearch) {
            const searchLower = currentSearch.toLowerCase();
            filtered = filtered.filter(term => 
                term.term.toLowerCase().includes(searchLower) ||
                term.legalDefinition.toLowerCase().includes(searchLower) ||
                term.commonDefinition.toLowerCase().includes(searchLower)
            );
        }
        
        return filtered;
    }
    
    // Поиск терминов с дебаунсингом
    const searchTerms = debounce(function(query) {
        currentSearch = query;
        displayTerms(0, true);
        
        // Анимация поиска
        if (searchBtn) {
            searchBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                searchBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }, 300);
    
    // Инициализация событий
    displayTerms(0);
    
    // Обработка поиска
    searchBtn.addEventListener('click', () => {
        searchTerms(searchInput.value);
    });
    
    searchInput.addEventListener('input', (e) => {
        searchTerms(e.target.value);
    });
    
    // Обработка фильтров
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isAnimating) return;
            
            // Анимация кнопки
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            displayTerms(0, true);
        });
    });
    
    // Обработка кнопки "Показать ещё"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (isAnimating) return;
            
            // Анимация кнопки
            loadMoreBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                loadMoreBtn.style.transform = 'scale(1)';
            }, 150);
            
            displayTerms(currentPage + 1);
        });
    }
}

// Модуль навигации
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
                
                // Анимация активной ссылки
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // Переключение мобильного меню
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            if (navMenu.classList.contains('show')) {
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
            
            // Анимация
            menuToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                menuToggle.style.transform = 'scale(1)';
            }, 150);
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
    
    // Обновление активной ссылки при прокрутке
    const updateActiveLink = debounce(() => {
        const scrollPosition = window.scrollY + 100;
        let currentSection = '';
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = '#' + section.id;
            }
        });
        
        // Обновляем активную ссылку
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }, 100);
    
    window.addEventListener('scroll', updateActiveLink);
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
