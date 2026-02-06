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

// Состояние приложения
const appState = {
    currentFilter: 'all',
    currentSearch: '',
    currentPage: 0,
    searchInName: true,
    searchInDefinition: false,
    searchInCommon: false,
    searchInExample: false,
    termsPerPage: 9,
    isAnimating: false
};

// Основной файл скриптов
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем текущий год в футере
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Инициализация
    initThemeToggle();
    initDictionary();
    initNavigation();
    initScrollToTop();
    initAdvancedSearch();
    initURLState();
    
    // Добавляем анимацию загрузки
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Параллакс эффект для навигации
    initParallax();
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
        themeToggle.style.animation = 'none';
        setTimeout(() => {
            themeToggle.style.animation = 'theme-switch-animation 0.6s ease';
        }, 10);
        
        // Меняем тему
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Плавное изменение прозрачности
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 300);
    });
}

// Инициализация параллакс-эффекта
function initParallax() {
    const navbar = document.querySelector('.navbar');
    const parallaxBg = document.querySelector('.parallax-bg');
    
    if (!parallaxBg) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxBg.style.transform = `translate3d(0, ${rate}px, 0)`;
    });
}

// Инициализация кнопки "Наверх"
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Инициализация расширенного поиска
function initAdvancedSearch() {
    const toggleBtn = document.getElementById('toggleAdvancedSearch');
    const optionsContainer = document.getElementById('advancedSearchOptions');
    
    toggleBtn.addEventListener('click', () => {
        const isVisible = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isVisible ? 'none' : 'block';
        toggleBtn.innerHTML = isVisible 
            ? '<i class="fas fa-sliders-h"></i> Расширенный поиск'
            : '<i class="fas fa-times"></i> Скрыть опции';
    });
    
    // Инициализация чекбоксов
    const checkboxes = ['searchInName', 'searchInDefinition', 'searchInCommon', 'searchInExample'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        checkbox.checked = appState[id];
        checkbox.addEventListener('change', (e) => {
            appState[id] = e.target.checked;
            saveStateToURL();
            displayTerms(0, true);
        });
    });
}

// Управление состоянием URL
function initURLState() {
    // Чтение параметров из URL
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('filter')) {
        appState.currentFilter = params.get('filter');
        const filterBtn = document.querySelector(`[data-filter="${appState.currentFilter}"]`);
        if (filterBtn) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');
        }
    }
    
    if (params.has('search')) {
        const searchTerm = params.get('search');
        document.getElementById('termSearch').value = searchTerm;
        appState.currentSearch = searchTerm;
    }
    
    if (params.has('page')) {
        appState.currentPage = parseInt(params.get('page')) || 0;
    }
    
    // Обновление индикаторов в UI
    updateSearchIndicators();
}

function saveStateToURL() {
    const params = new URLSearchParams();
    
    if (appState.currentFilter !== 'all') {
        params.set('filter', appState.currentFilter);
    }
    
    if (appState.currentSearch) {
        params.set('search', appState.currentSearch);
    }
    
    if (appState.currentPage > 0) {
        params.set('page', appState.currentPage);
    }
    
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
}

// Модуль словаря терминов
function initDictionary() {
    const termsContainer = document.getElementById('termsContainer');
    const searchInput = document.getElementById('termSearch');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const termsCount = document.getElementById('termsCount');
    const resultsCount = document.getElementById('resultsCount');
    const autocompleteResults = document.getElementById('autocompleteResults');
    
    // Отображение терминов с пагинацией
    function displayTerms(page = 0, reset = false) {
        if (appState.isAnimating) return;
        appState.isAnimating = true;
        
        let filteredTerms = getFilteredTerms();
        
        // Обновляем счетчики
        updateResultsCounter(filteredTerms.length);
        updatePaginationControls(filteredTerms.length, page);
        
        // Если сброс, очищаем контейнер
        if (reset) {
            termsContainer.innerHTML = '';
            appState.currentPage = 0;
            page = 0;
        } else if (page === 0) {
            termsContainer.innerHTML = '';
        }
        
        // Получаем термины для текущей страницы
        const start = page * appState.termsPerPage;
        const end = start + appState.termsPerPage;
        const pageTerms = filteredTerms.slice(start, end);
        
        if (pageTerms.length === 0 && filteredTerms.length === 0) {
            showNoResultsMessage();
        } else {
            hideNoResultsMessage();
            // Создаем DocumentFragment для пакетного добавления
            const fragment = document.createDocumentFragment();
            
            pageTerms.forEach((term, index) => {
                const termCard = createTermCard(term, index);
                fragment.appendChild(termCard);
            });
            
            termsContainer.appendChild(fragment);
        }
        
        appState.currentPage = page;
        
        // Сохраняем состояние в URL
        saveStateToURL();
        
        // Завершаем анимацию
        setTimeout(() => {
            appState.isAnimating = false;
        }, 300);
    }
    
    // Обновление счетчика результатов
    function updateResultsCounter(total) {
        resultsCount.textContent = `Найдено терминов: ${total}`;
        
        // Обновление индикаторов
        updateSearchIndicators();
    }
    
    function updateSearchIndicators() {
        const activeFilterIndicator = document.getElementById('activeFilter');
        const searchQueryIndicator = document.getElementById('searchQueryIndicator');
        
        // Индикатор фильтра
        if (appState.currentFilter !== 'all') {
            const filterName = getCategoryName(appState.currentFilter);
            activeFilterIndicator.textContent = `Фильтр: ${filterName}`;
            activeFilterIndicator.style.display = 'inline-block';
        } else {
            activeFilterIndicator.style.display = 'none';
        }
        
        // Индикатор поиска
        if (appState.currentSearch) {
            searchQueryIndicator.textContent = `Поиск: "${appState.currentSearch}"`;
            searchQueryIndicator.style.display = 'inline-block';
        } else {
            searchQueryIndicator.style.display = 'none';
        }
    }
    
    // Обновление элементов пагинации
    function updatePaginationControls(total, currentPage) {
        const totalPages = Math.ceil(total / appState.termsPerPage);
        const showing = Math.min((currentPage + 1) * appState.termsPerPage, total);
        
        termsCount.textContent = `Показано: ${showing} из ${total}`;
        document.getElementById('currentPage').textContent = currentPage + 1;
        
        // Кнопка "Назад"
        prevPageBtn.disabled = currentPage === 0;
        
        // Кнопка "Вперед"
        nextPageBtn.disabled = currentPage >= totalPages - 1;
        
        // Кнопка "Показать ещё"
        if (loadMoreBtn) {
            const hasMore = ((currentPage + 1) * appState.termsPerPage) < total;
            loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
        }
    }
    
    // Создание карточки термина с подсветкой найденного текста
    function createTermCard(term, index) {
        const termCard = document.createElement('div');
        termCard.className = 'term-card';
        termCard.style.animationDelay = `${index * 50}ms`;
        
        const categoryName = getCategoryName(term.category);
        
        // Функция для подсветки текста
        const highlightText = (text) => {
            if (!appState.currentSearch) return text;
            
            const searchLower = appState.currentSearch.toLowerCase();
            const regex = new RegExp(`(${searchLower})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        };
        
        termCard.innerHTML = `
            <h3>${highlightText(term.term)} <span class="tag" data-category="${term.category}">${categoryName}</span></h3>
            <div class="legal-def"><strong>Юридическое определение:</strong> ${highlightText(term.legalDefinition)}</div>
            <div class="common-def"><strong>Бытовое употребление:</strong> ${highlightText(term.commonDefinition)}</div>
            <div class="example"><strong>Пример:</strong> ${highlightText(term.example)}</div>
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
    
    // Расширенная фильтрация терминов
    function getFilteredTerms() {
        let filtered = allTerms;
        
        // Применяем фильтр по категории
        if (appState.currentFilter !== 'all') {
            filtered = filtered.filter(term => term.category === appState.currentFilter);
        }
        
        // Применяем расширенный поиск
        if (appState.currentSearch) {
            const searchLower = appState.currentSearch.toLowerCase().trim();
            
            filtered = filtered.filter(term => {
                let found = false;
                
                if (appState.searchInName && term.term.toLowerCase().includes(searchLower)) {
                    found = true;
                }
                
                if (!found && appState.searchInDefinition && term.legalDefinition.toLowerCase().includes(searchLower)) {
                    found = true;
                }
                
                if (!found && appState.searchInCommon && term.commonDefinition.toLowerCase().includes(searchLower)) {
                    found = true;
                }
                
                if (!found && appState.searchInExample && term.example.toLowerCase().includes(searchLower)) {
                    found = true;
                }
                
                return found;
            });
        }
        
        return filtered;
    }
    
    // Автодополнение
    function showAutocomplete(query) {
        if (!query.trim()) {
            autocompleteResults.style.display = 'none';
            return;
        }
        
        const suggestions = allTerms
            .filter(term => term.term.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
        
        if (suggestions.length === 0) {
            autocompleteResults.style.display = 'none';
            return;
        }
        
        autocompleteResults.innerHTML = suggestions.map(term => `
            <div class="autocomplete-item" data-term="${term.term}">
                <span class="autocomplete-term">${highlightMatch(term.term, query)}</span>
                <span class="autocomplete-category">${getCategoryName(term.category)}</span>
            </div>
        `).join('');
        
        autocompleteResults.style.display = 'block';
        
        // Обработчики кликов по предложениям
        autocompleteResults.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const term = item.dataset.term;
                searchInput.value = term;
                performSearch(term);
                autocompleteResults.style.display = 'none';
            });
        });
    }
    
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
    
    function hideAutocomplete() {
        setTimeout(() => {
            if (!autocompleteResults.matches(':hover')) {
                autocompleteResults.style.display = 'none';
            }
        }, 200);
    }
    
    // Поиск терминов
    const performSearch = debounce(function(query) {
        appState.currentSearch = query;
        displayTerms(0, true);
        
        // Анимация поиска
        if (searchBtn) {
            searchBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                searchBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }, 300);
    
    // Функции для сообщений
    function showNoResultsMessage() {
        let message = document.getElementById('noResultsMessage');
        if (!message) {
            message = document.createElement('div');
            message.id = 'noResultsMessage';
            message.className = 'empty-state';
            message.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить поисковый запрос или сбросить фильтры.</p>
            `;
            termsContainer.parentNode.insertBefore(message, termsContainer.nextSibling);
        }
        message.style.display = 'flex';
        termsContainer.innerHTML = '';
    }
    
    function hideNoResultsMessage() {
        const message = document.getElementById('noResultsMessage');
        if (message) {
            message.style.display = 'none';
        }
    }
    
    // Инициализация событий
    displayTerms(appState.currentPage);
    
    // Обработка поиска
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        showAutocomplete(query);
        performSearch(query);
    });
    
    searchInput.addEventListener('focus', () => {
        if (searchInput.value) {
            showAutocomplete(searchInput.value);
        }
    });
    
    searchInput.addEventListener('blur', hideAutocomplete);
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        appState.currentSearch = '';
        displayTerms(0, true);
        autocompleteResults.style.display = 'none';
    });
    
    // Обработка фильтров
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (appState.isAnimating) return;
            
            // Анимация кнопки
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            appState.currentFilter = button.dataset.filter;
            displayTerms(0, true);
        });
    });
    
    // Сброс всех фильтров
    resetFiltersBtn.addEventListener('click', () => {
        // Сброс фильтров
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Сброс поиска
        searchInput.value = '';
        appState.currentSearch = '';
        
        // Сброс состояния
        appState.currentFilter = 'all';
        appState.currentPage = 0;
        
        // Обновление интерфейса
        displayTerms(0, true);
        autocompleteResults.style.display = 'none';
    });
    
    // Обработка кнопки "Показать ещё"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (appState.isAnimating) return;
            
            // Анимация кнопки
            loadMoreBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                loadMoreBtn.style.transform = 'scale(1)';
            }, 150);
            
            displayTerms(appState.currentPage + 1);
        });
    }
    
    // Обработка пагинации
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (appState.currentPage > 0 && !appState.isAnimating) {
                displayTerms(appState.currentPage - 1, true);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalTerms = getFilteredTerms().length;
            const totalPages = Math.ceil(totalTerms / appState.termsPerPage);
            
            if (appState.currentPage < totalPages - 1 && !appState.isAnimating) {
                displayTerms(appState.currentPage + 1, true);
            }
        });
    }
    
    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        // / - фокус в поиск
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Esc - очистить поиск
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            performSearch('');
        }
        
        // ← → - навигация по страницам
        if (e.key === 'ArrowLeft' && prevPageBtn && !prevPageBtn.disabled) {
            prevPageBtn.click();
        }
        
        if (e.key === 'ArrowRight' && nextPageBtn && !nextPageBtn.disabled) {
            nextPageBtn.click();
        }
    });
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

// Добавляем анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes theme-switch-animation {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(0.9) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
    
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    @keyframes cardAppear {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes highlightPulse {
        0% { background-color: rgba(255, 235, 59, 0.1); }
        50% { background-color: rgba(255, 235, 59, 0.5); }
        100% { background-color: rgba(255, 235, 59, 0.3); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes shine {
        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
`;
document.head.appendChild(style);
