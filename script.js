// Дебаунсинг для оптимизации поиска
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

// Основной скрипт
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    initAlphabet();
    displayTermsByLetter('А');
    initSearch();
    
    // Устанавливаем общее количество терминов
    document.getElementById('totalTerms').textContent = allTerms.length;
});

// Инициализация алфавитной навигации
function initAlphabet() {
    const alphabetButtons = document.getElementById('alphabetButtons');
    const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    
    // Создаем кнопки для всех букв
    letters.split('').forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-btn';
        button.textContent = letter;
        button.dataset.letter = letter;
        
        // Проверяем, есть ли термины на эту букву
        if (!termsByLetter[letter] || termsByLetter[letter].length === 0) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        }
        
        button.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.letter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');
            
            // Отображаем термины для выбранной буквы
            displayTermsByLetter(letter);
            
            // Прокручиваем к началу словаря
            document.querySelector('.dictionary-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
        
        alphabetButtons.appendChild(button);
    });
    
    // Активируем первую букву
    const firstLetterBtn = alphabetButtons.querySelector('.letter-btn:not([disabled])');
    if (firstLetterBtn) {
        firstLetterBtn.classList.add('active');
    }
}

// Отображение терминов по букве
function displayTermsByLetter(letter) {
    const termsContainer = document.getElementById('termsContainer');
    const currentLetterElement = document.getElementById('currentLetter');
    const termsCountElement = document.getElementById('termsCount');
    
    // Обновляем текущую букву
    currentLetterElement.textContent = letter;
    
    // Получаем термины для выбранной буквы
    const terms = termsByLetter[letter] || [];
    
    // Обновляем счетчик
    termsCountElement.textContent = `${terms.length} термин${getPluralEnding(terms.length)}`;
    
    // Очищаем контейнер
    termsContainer.innerHTML = '';
    
    if (terms.length === 0) {
        termsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-color);">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Термины на букву "${letter}" не найдены</p>
            </div>
        `;
        return;
    }
    
    // Создаем DocumentFragment для пакетного добавления
    const fragment = document.createDocumentFragment();
    
    // Отображаем термины
    terms.forEach((term, index) => {
        const termCard = createTermCard(term, index);
        fragment.appendChild(termCard);
    });
    
    termsContainer.appendChild(fragment);
    
    // Анимация появления
    setTimeout(() => {
        termsContainer.classList.add('fade-in');
    }, 10);
}

// Создание карточки термина
function createTermCard(term, index) {
    const card = document.createElement('div');
    card.className = 'term-card';
    card.style.animationDelay = `${index * 20}ms`;
    
    card.innerHTML = `
        <h3>${term.term}</h3>
        <div class="definition">${term.definition}</div>
        ${term.example ? `<div class="example">Пример: ${term.example}</div>` : ''}
    `;
    
    return card;
}

// Инициализация поиска
function initSearch() {
    const searchInput = document.getElementById('termSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    // Функция поиска
    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            // Возвращаемся к текущей букве
            const activeLetter = document.querySelector('.letter-btn.active');
            if (activeLetter) {
                displayTermsByLetter(activeLetter.dataset.letter);
            }
            return;
        }
        
        // Ищем термины
        const searchResults = allTerms.filter(term => 
            term.term.toLowerCase().includes(query) ||
            term.definition.toLowerCase().includes(query) ||
            (term.example && term.example.toLowerCase().includes(query))
        );
        
        // Отображаем результаты
        displaySearchResults(searchResults, query);
    };
    
    // Дебаунсинг поиска
    const debouncedSearch = debounce(performSearch, 300);
    
    // Обработчики событий
    searchInput.addEventListener('input', debouncedSearch);
    searchBtn.addEventListener('click', performSearch);
    
    // Поиск по Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Отображение результатов поиска
function displaySearchResults(results, query) {
    const termsContainer = document.getElementById('termsContainer');
    const currentLetterElement = document.getElementById('currentLetter');
    const termsCountElement = document.getElementById('termsCount');
    
    // Обновляем заголовок
    currentLetterElement.textContent = 'Результаты поиска';
    termsCountElement.textContent = `${results.length} результат${getPluralEnding(results.length)}`;
    
    // Очищаем контейнер
    termsContainer.innerHTML = '';
    
    if (results.length === 0) {
        termsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-color);">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>По запросу "${query}" ничего не найдено</p>
                <button onclick="clearSearch()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: var(--border-radius); cursor: pointer;">
                    Очистить поиск
                </button>
            </div>
        `;
        return;
    }
    
    // Создаем DocumentFragment для пакетного добавления
    const fragment = document.createDocumentFragment();
    
    // Отображаем результаты
    results.forEach((term, index) => {
        const termCard = createTermCard(term, index);
        
        // Подсветка найденного текста
        const highlightText = (text) => {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };
        
        termCard.querySelector('h3').innerHTML = highlightText(term.term);
        termCard.querySelector('.definition').innerHTML = highlightText(term.definition);
        if (term.example) {
            termCard.querySelector('.example').innerHTML = `Пример: ${highlightText(term.example)}`;
        }
        
        fragment.appendChild(termCard);
    });
    
    termsContainer.appendChild(fragment);
}

// Очистка поиска
window.clearSearch = function() {
    const searchInput = document.getElementById('termSearch');
    searchInput.value = '';
    
    // Возвращаемся к первой букве
    const firstLetterBtn = document.querySelector('.letter-btn:not([disabled])');
    if (firstLetterBtn) {
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        firstLetterBtn.classList.add('active');
        displayTermsByLetter('А');
    }
};

// Функция для правильного склонения
function getPluralEnding(number) {
    if (number % 10 === 1 && number % 100 !== 11) return '';
    if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return 'а';
    return 'ов';
}

// Виртуализация скролла для оптимизации
function initVirtualScroll() {
    const termsContainer = document.getElementById('termsContainer');
    let visibleItems = 20; // Количество видимых элементов
    let startIndex = 0;
    
    const updateVisibleItems = () => {
        const scrollTop = termsContainer.scrollTop;
        const itemHeight = 100; // Примерная высота одного элемента
        startIndex = Math.floor(scrollTop / itemHeight);
        
        // Очищаем контейнер
        termsContainer.innerHTML = '';
        
        // Создаем фрагмент для видимых элементов
        const fragment = document.createDocumentFragment();
        const terms = termsByLetter[document.getElementById('currentLetter').textContent] || [];
        
        // Добавляем только видимые элементы
        for (let i = startIndex; i < Math.min(startIndex + visibleItems, terms.length); i++) {
            const termCard = createTermCard(terms[i], i - startIndex);
            fragment.appendChild(termCard);
        }
        
        termsContainer.appendChild(fragment);
        
        // Устанавливаем высоту для прокрутки
        termsContainer.style.height = `${terms.length * itemHeight}px`;
    };
    
    // Используем Intersection Observer для ленивой загрузки
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const termCard = entry.target;
                    termCard.style.animation = 'fadeIn 0.3s ease';
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Наблюдаем за появлением элементов
        setTimeout(() => {
            document.querySelectorAll('.term-card').forEach(card => {
                observer.observe(card);
            });
        }, 100);
    }
    
    // Инициализируем виртуальный скролл только для больших списков
    termsContainer.addEventListener('scroll', debounce(updateVisibleItems, 50));
}

// Инициализация виртуального скролла при загрузке
setTimeout(initVirtualScroll, 1000);
