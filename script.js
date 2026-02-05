// Основной файл скриптов
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем текущий год в футере
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Инициализация словаря
    initDictionary();
    initNavigation();
    
    // Анимация загрузки
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Модуль словаря терминов с оптимизацией
function initDictionary() {
    const termsContainer = document.getElementById('termsContainer');
    const searchInput = document.getElementById('termSearch');
    const searchBtn = document.getElementById('searchBtn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const termsCount = document.getElementById('termsCount');
    const currentLetterElement = document.getElementById('currentLetter');
    const totalCount = document.getElementById('totalCount');
    const alphabetButtons = document.getElementById('alphabetButtons');
    
    let currentFilter = 'all';
    let currentSearch = '';
    let currentLetter = 'А';
    let currentPage = 0;
    const termsPerPage = 20; // Увеличил для производительности
    let isAnimating = false;
    let currentDisplayedTerms = [];
    
    // Устанавливаем общее количество
    totalCount.textContent = `Всего терминов: ${allTerms.length}`;
    
    // Инициализация алфавитной навигации
    function initAlphabetNavigation() {
        const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
        
        letters.split('').forEach(letter => {
            const button = document.createElement('button');
            button.className = 'letter-btn';
            button.textContent = letter;
            button.dataset.letter = letter;
            
            // Проверяем, есть ли термины на эту букву
            if (!termsByLetter[letter] || termsByLetter[letter].length === 0) {
                button.disabled = true;
            }
            
            button.addEventListener('click', () => {
                if (isAnimating || button.disabled) return;
                
                // Убираем активный класс у всех кнопок
                document.querySelectorAll('.letter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Добавляем активный класс к нажатой кнопке
                button.classList.add('active');
                
                // Устанавливаем текущую букву
                currentLetter = letter;
                currentPage = 0;
                currentSearch = '';
                searchInput.value = '';
                
                // Отображаем термины
                displayTermsByLetter(letter);
                
                // Сбрасываем фильтры
                filterButtons.forEach(btn => {
                    if (btn.dataset.filter === 'all') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                currentFilter = 'all';
            });
            
            alphabetButtons.appendChild(button);
        });
        
        // Активируем первую букву
        const firstLetterBtn = alphabetButtons.querySelector('.letter-btn:not([disabled])');
        if (firstLetterBtn) {
            firstLetterBtn.classList.add('active');
        }
    }
    
    // Отображение терминов по букве с пагинацией
    function displayTermsByLetter(letter, page = 0, reset = false) {
        if (isAnimating) return;
        isAnimating = true;
        
        let filteredTerms = termsByLetter[letter] || [];
        
        // Применяем текущий фильтр
        if (currentFilter !== 'all') {
            filteredTerms = filteredTerms.filter(term => term.category === currentFilter);
        }
        
        // Применяем поиск, если есть
        if (currentSearch) {
            filteredTerms = filteredTerms.filter(term => 
                term.term.toLowerCase().includes(currentSearch) ||
                term.legalDefinition.toLowerCase().includes(currentSearch) ||
                term.commonDefinition.toLowerCase().includes(currentSearch)
            );
        }
        
        // Обновляем счетчик
        currentLetterElement.textContent = letter;
        termsCount.textContent = `${filteredTerms.length} термин${getPluralEnding(filteredTerms.length)}`;
        
        // Показываем кнопку "Показать ещё" если есть еще термины
        if (loadMoreBtn) {
            const hasMore = ((page + 1) * termsPerPage) < filteredTerms.length;
            loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
        }
        
        // Если сброс, очищаем контейнер
        if (reset || page === 0) {
            termsContainer.innerHTML = '';
            currentDisplayedTerms = [];
        }
        
        // Получаем термины для текущей страницы
        const start = page * termsPerPage;
        const end = start + termsPerPage;
        const pageTerms = filteredTerms.slice(start, end);
        
        // Добавляем к отображаемым терминам
        currentDisplayedTerms = [...currentDisplayedTerms, ...pageTerms];
        
        // Создаем DocumentFragment для пакетного добавления
        const fragment = document.createDocumentFragment();
        
        pageTerms.forEach((term, index) => {
            const termCard = createTermCard(term, index + (page * termsPerPage));
            fragment.appendChild(termCard);
        });
        
        termsContainer.appendChild(fragment);
        
        currentPage = page;
        
        // Завершаем анимацию
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }
    
    // Создание карточки термина с оптимизацией
    function createTermCard(term, index) {
        const termCard = document.createElement('div');
        termCard.className = 'term-card';
        termCard.style.animationDelay = `${Math.min(index, 20) * 20}ms`; // Ограничиваем анимацию
        
        const categoryName = getCategoryName(term.category);
        
        termCard.innerHTML = `
            <h3>${highlightSearch(term.term)} <span class="tag" data-category="${term.category}">${categoryName}</span></h3>
            <div class="legal-def"><strong>Юридическое определение:</strong> ${highlightSearch(term.legalDefinition)}</div>
            <div class="common-def"><strong>Бытовое употребление:</strong> ${highlightSearch(term.commonDefinition)}</div>
            <div class="example"><strong>Пример:</strong> ${highlightSearch(term.example)}</div>
        `;
        
        return termCard;
    }
    
    // Подсветка результатов поиска
    function highlightSearch(text) {
        if (!currentSearch) return text;
        
        const regex = new RegExp(`(${currentSearch})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
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
            'documents': '📄 Документы'
        };
        return categories[category] || '📌 Другое';
    }
    
    // Поиск терминов с дебаунсингом
    const searchTerms = debounce(function(query) {
        currentSearch = query.toLowerCase();
        currentPage = 0;
        
        // Если есть поисковый запрос, отображаем результаты поиска
        if (currentSearch) {
            performSearch();
        } else {
            // Возвращаемся к текущей букве
            displayTermsByLetter(currentLetter, 0, true);
        }
        
        // Анимация поиска
        if (searchBtn) {
            searchBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                searchBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }, 300);
    
    // Выполнение поиска
    function performSearch() {
        const filteredTerms = allTerms.filter(term => 
            term.term.toLowerCase().includes(currentSearch) ||
            term.legalDefinition.toLowerCase().includes(currentSearch) ||
            term.commonDefinition.toLowerCase().includes(currentSearch)
        );
        
        // Обновляем счетчик
        currentLetterElement.textContent = 'Результаты поиска';
        termsCount.textContent = `${filteredTerms.length} результат${getPluralEnding(filteredTerms.length)}`;
        
        // Очищаем контейнер
        termsContainer.innerHTML = '';
        
        if (filteredTerms.length === 0) {
            termsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            loadMoreBtn.style.display = 'none';
            return;
        }
        
        // Отображаем первые результаты
        displaySearchResults(filteredTerms.slice(0, termsPerPage));
        
        // Настраиваем кнопку "Показать ещё" для поиска
        if (loadMoreBtn) {
            const hasMore = filteredTerms.length > termsPerPage;
            loadMoreBtn.style.display = hasMore ? 'flex' : 'none';
            
            // Обновляем обработчик для поиска
            loadMoreBtn.onclick = () => {
                const nextPage = Math.floor(currentDisplayedTerms.length / termsPerPage);
                const start = nextPage * termsPerPage;
                const end = start + termsPerPage;
                const nextTerms = filteredTerms.slice(start, end);
                
                if (nextTerms.length > 0) {
                    displaySearchResults(nextTerms, true);
                }
                
                if (end >= filteredTerms.length) {
                    loadMoreBtn.style.display = 'none';
                }
            };
        }
    }
    
    // Отображение результатов поиска
    function displaySearchResults(terms, append = false) {
        if (!append) {
            termsContainer.innerHTML = '';
            currentDisplayedTerms = [];
        }
        
        const fragment = document.createDocumentFragment();
        
        terms.forEach((term, index) => {
            const termCard = createTermCard(term, index);
            fragment.appendChild(termCard);
            currentDisplayedTerms.push(term);
        });
        
        termsContainer.appendChild(fragment);
    }
    
    // Функция для правильного склонения
    function getPluralEnding(number) {
        if (number % 10 === 1 && number % 100 !== 11) return '';
        if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return 'а';
        return 'ов';
    }
    
    // Инициализация событий
    initAlphabetNavigation();
    displayTermsByLetter('А', 0, true);
    
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
            
            // Если есть активный поиск, применяем фильтр к результатам
            if (currentSearch) {
                performSearch();
            } else {
                // Иначе отображаем термины по текущей букве с фильтром
                displayTermsByLetter(currentLetter, 0, true);
            }
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
            
            if (currentSearch) {
                // Для поиска используем специальную логику
                loadMoreBtn.onclick();
            } else {
                // Для обычного просмотра
                displayTermsByLetter(currentLetter, currentPage + 1);
            }
        });
    }
}

// Модуль навигации (упрощенный)
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

// Оптимизация: ленивая загрузка изображений
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const termCard = entry.target;
                termCard.style.animation = 'slideUp 0.4s ease';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Начинаем наблюдать после загрузки
    setTimeout(() => {
        document.querySelectorAll('.term-card').forEach(card => {
            observer.observe(card);
        });
    }, 1000);
}
