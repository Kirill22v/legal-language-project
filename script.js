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
    
    // Инициализация модулей
    initDictionary();
    initDocumentConstructor();
    initTest();
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
    const termsPerPage = 3;
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
        let filtered = legalTerms;
        
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

// Модуль конструктора документов
function initDocumentConstructor() {
    const templateButtons = document.querySelectorAll('.template-btn');
    const formFields = document.getElementById('formFields');
    const generateBtn = document.getElementById('generateDoc');
    const documentPreview = document.getElementById('documentPreview');
    const errorList = document.getElementById('errorList');
    
    let currentTemplate = 'sale';
    let isGenerating = false;
    
    // Отображение полей формы
    function displayFormFields(template) {
        formFields.innerHTML = '';
        currentTemplate = template;
        
        const templateData = documentTemplates[template];
        
        // Создаем DocumentFragment для пакетного добавления
        const fragment = document.createDocumentFragment();
        
        templateData.fields.forEach((field, index) => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.style.animationDelay = `${index * 50}ms`;
            
            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;
            if (field.required) {
                label.innerHTML += ' <span style="color: var(--danger-color)">*</span>';
            }
            
            let input;
            
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                if (field.options) {
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option;
                        optionElement.textContent = option;
                        input.appendChild(optionElement);
                    });
                }
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }
            
            input.id = field.id;
            input.name = field.id;
            input.required = field.required || false;
            input.placeholder = field.label;
            
            // Валидация в реальном времени
            input.addEventListener('blur', () => {
                validateFieldInRealTime(field, input);
            });
            
            // Сброс валидации при фокусе
            input.addEventListener('focus', () => {
                input.style.borderColor = '';
                clearFieldError(input);
            });
            
            formGroup.appendChild(label);
            formGroup.appendChild(input);
            fragment.appendChild(formGroup);
        });
        
        formFields.appendChild(fragment);
        
        // Очищаем превью
        documentPreview.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>Заполните поля слева, чтобы сгенерировать документ</p>
            </div>
        `;
        errorList.innerHTML = '';
        
        // Удаляем старый контейнер скачивания, если есть
        const oldContainer = document.querySelector('.download-container');
        if (oldContainer) oldContainer.remove();
    }
    
    // Валидация поля в реальном времени
    function validateFieldInRealTime(field, input) {
        const value = input.value.trim();
        
        if (field.required && !value) {
            input.style.borderColor = 'var(--danger-color)';
            showFieldError(input, `Поле "${field.label}" обязательно для заполнения`);
            return false;
        } else if (value) {
            const validationResult = validateField(field, value);
            if (!validationResult.isValid) {
                input.style.borderColor = 'var(--danger-color)';
                showFieldError(input, validationResult.message);
                return false;
            } else {
                input.style.borderColor = 'var(--success-color)';
                clearFieldError(input);
                return true;
            }
        } else {
            input.style.borderColor = '';
            clearFieldError(input);
            return true;
        }
    }
    
    // Показать ошибку поля
    function showFieldError(input, message) {
        // Удаляем старую ошибку
        clearFieldError(input);
        
        // Создаем элемент ошибки
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        // Добавляем после input
        input.parentNode.appendChild(errorDiv);
    }
    
    // Очистить ошибку поля
    function clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }
    }
    
    // Валидация полей
    function validateField(field, value) {
        const result = { isValid: true, message: '' };
        
        // Проверка на ФИО
        if (field.label.toLowerCase().includes('фио') || 
            field.label.toLowerCase().includes('фамилия') ||
            field.label.toLowerCase().includes('имя') ||
            field.label.toLowerCase().includes('отчество') ||
            field.label.toLowerCase().includes('заявитель') ||
            field.label.toLowerCase().includes('продавец') ||
            field.label.toLowerCase().includes('покупатель')) {
            
            // Проверка на наличие только букв, пробелов и дефисов
            const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s-]+$/;
            if (!nameRegex.test(value)) {
                result.isValid = false;
                result.message = `Поле "${field.label}" должно содержать только буквы, пробелы и дефисы`;
            }
            
            // Проверка минимальной длины для ФИО
            if (value.length < 2) {
                result.isValid = false;
                result.message = `Поле "${field.label}" должно содержать минимум 2 символа`;
            }
            
            // Проверка максимальной длины
            if (value.length > 100) {
                result.isValid = false;
                result.message = `Поле "${field.label}" слишком длинное (максимум 100 символов)`;
            }
        }
        
        // Проверка паспортных данных
        if (field.label.toLowerCase().includes('паспорт')) {
            // Убираем все пробелы для проверки
            const cleanValue = value.replace(/\s+/g, '');
            // Проверяем что это 10 цифр (4 серия + 6 номер)
            const passportRegex = /^[0-9]{10}$/;
            if (!passportRegex.test(cleanValue)) {
                result.isValid = false;
                result.message = `Поле "${field.label}" должно содержать 10 цифр (например: "1234567890")`;
            }
        }
        
        // Проверка даты
        if (field.type === 'date') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                result.isValid = false;
                result.message = `Поле "${field.label}" содержит неверную дату`;
            }
            
            // Проверка что дата не в будущем (для некоторых полей)
            if (field.label.toLowerCase().includes('приобретения') || 
                field.label.toLowerCase().includes('покупки')) {
                const today = new Date();
                if (date > today) {
                    result.isValid = false;
                    result.message = `Дата "${field.label}" не может быть в будущем`;
                }
            }
        }
        
        // Проверка чисел
        if (field.type === 'number') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                result.isValid = false;
                result.message = `Поле "${field.label}" должно быть числом`;
            } else if (num < 0) {
                result.isValid = false;
                result.message = `Поле "${field.label}" не может быть отрицательным`;
            } else if (num > 1000000000) { // 1 миллиард
                result.isValid = false;
                result.message = `Поле "${field.label}" слишком большое`;
            }
        }
        
        // Проверка телефона
        if (field.label.toLowerCase().includes('телефон')) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) {
                result.isValid = false;
                result.message = `Поле "${field.label}" содержит недопустимые символы`;
            }
            
            // Убираем все нецифровые символы и проверяем длину
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                result.isValid = false;
                result.message = `Поле "${field.label}" должно содержать минимум 10 цифр`;
            }
        }
        
        // Проверка адреса
        if (field.label.toLowerCase().includes('адрес')) {
            if (value.length < 5) {
                result.isValid = false;
                result.message = `Поле "${field.label}" должно содержать минимум 5 символов`;
            }
            
            if (value.length > 200) {
                result.isValid = false;
                result.message = `Поле "${field.label}" слишком длинное (максимум 200 символов)`;
            }
        }
        
        // Общая проверка длины
        if (value.length > 500) {
            result.isValid = false;
            result.message = `Поле "${field.label}" слишком длинное (максимум 500 символов)`;
        }
        
        return result;
    }
    
    // Генерация документа
    function generateDocument() {
        if (isGenerating) return;
        isGenerating = true;
        
        const templateData = documentTemplates[currentTemplate];
        const data = {};
        let isValid = true;
        const errorFields = [];
        const validationErrors = [];
        
        // Анимация кнопки
        generateBtn.style.transform = 'scale(0.95)';
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Генерация...';
        
        // Сбор данных из формы с валидацией
        templateData.fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();
            
            if (field.required && !value) {
                isValid = false;
                errorFields.push(input);
                validationErrors.push(`Поле "${field.label}" обязательно для заполнения`);
                input.style.borderColor = 'var(--danger-color)';
                input.style.animation = 'shake 0.5s ease';
            } else if (value) {
                // Валидация по типу поля
                const validationResult = validateField(field, value);
                if (!validationResult.isValid) {
                    isValid = false;
                    errorFields.push(input);
                    validationErrors.push(validationResult.message);
                    input.style.borderColor = 'var(--danger-color)';
                    input.style.animation = 'shake 0.5s ease';
                } else {
                    data[field.id] = value;
                    input.style.borderColor = 'var(--success-color)';
                }
            } else {
                data[field.id] = value;
            }
        });
        
        if (!isValid) {
            // Показываем ошибки валидации
            errorList.innerHTML = '';
            validationErrors.forEach((error, index) => {
                setTimeout(() => {
                    const errorItem = document.createElement('div');
                    errorItem.className = 'error-item';
                    errorItem.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i>
                        <span>${error}</span>
                    `;
                    errorList.appendChild(errorItem);
                }, index * 100);
            });
            
            // Фокусируемся на первом ошибочном поле
            if (errorFields.length > 0) {
                errorFields[0].focus();
            }
            
            // Сбрасываем состояние кнопки
            setTimeout(() => {
                generateBtn.style.transform = 'scale(1)';
                generateBtn.innerHTML = '<i class="fas fa-file-download"></i> Сгенерировать документ';
                isGenerating = false;
                
                // Сбрасываем анимацию полей
                errorFields.forEach(field => {
                    setTimeout(() => {
                        field.style.animation = '';
                    }, 500);
                });
            }, 500);
            
            return;
        }
        
        // Генерация документа
        setTimeout(() => {
            try {
                const docText = templateData.template(data);
                
                // Ограничиваем высоту превью и добавляем скролл
                documentPreview.innerHTML = `
                    <div class="document-content">
                        <pre>${escapeHtml(docText)}</pre>
                    </div>
                `;
                
                // Добавляем кнопку скачивания Word
                const downloadContainer = document.createElement('div');
                downloadContainer.className = 'download-container';
                downloadContainer.innerHTML = `
                    <button id="downloadWord" class="btn-secondary">
                        <i class="fas fa-file-word"></i> Скачать документ Word
                    </button>
                    <button id="copyText" class="btn-tertiary">
                        <i class="fas fa-copy"></i> Копировать текст
                    </button>
                    <span class="char-count">Символов: ${docText.length}</span>
                `;
                
                // Удаляем старый контейнер скачивания, если есть
                const oldContainer = document.querySelector('.download-container');
                if (oldContainer) oldContainer.remove();
                
                documentPreview.parentNode.insertBefore(downloadContainer, documentPreview.nextSibling);
                
                // Обработчик скачивания Word
                document.getElementById('downloadWord').addEventListener('click', () => {
                    downloadWordDocument(docText, `${templateData.name}.doc`);
                });
                
                // Обработчик копирования текста
                document.getElementById('copyText').addEventListener('click', () => {
                    copyToClipboard(docText);
                });
                
                // Анимация успешной генерации
                documentPreview.style.borderColor = 'var(--success-color)';
                setTimeout(() => {
                    documentPreview.style.borderColor = '';
                }, 1000);
                
                // Проверка стиля
                checkDocumentStyle(docText);
                
            } catch (error) {
                console.error('Ошибка генерации документа:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-item';
                errorDiv.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Ошибка при генерации документа. Попробуйте ещё раз.</span>
                `;
                errorList.innerHTML = '';
                errorList.appendChild(errorDiv);
            }
            
            // Сбрасываем состояние кнопки
            generateBtn.style.transform = 'scale(1)';
            generateBtn.innerHTML = '<i class="fas fa-file-download"></i> Сгенерировать документ';
            isGenerating = false;
        }, 500);
    }
    
    // Экранирование HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Скачивание Word документа
    function downloadWordDocument(content, filename) {
        try {
            // Форматируем содержимое для Word
            const formattedContent = content
                .replace(/\n/g, '\r\n') // Преобразуем переносы строк для Windows
                .replace(/\t/g, '    '); // Заменяем табы на пробелы
            
            // Создаем blob с содержимым
            const blob = new Blob(['\ufeff' + formattedContent], { 
                type: 'application/msword;charset=utf-8' 
            });
            
            // Создаем URL для blob
            const url = URL.createObjectURL(blob);
            
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'document.doc';
            link.style.display = 'none';
            
            // Добавляем на страницу и кликаем
            document.body.appendChild(link);
            link.click();
            
            // Анимация успешного скачивания
            const downloadBtn = document.getElementById('downloadWord');
            if (downloadBtn) {
                const originalHTML = downloadBtn.innerHTML;
                const originalBg = downloadBtn.style.backgroundColor;
                
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Скачано!';
                downloadBtn.style.backgroundColor = 'var(--success-color)';
                downloadBtn.classList.add('success-animation');
                
                setTimeout(() => {
                    downloadBtn.innerHTML = originalHTML;
                    downloadBtn.style.backgroundColor = originalBg;
                    downloadBtn.classList.remove('success-animation');
                }, 2000);
            }
            
            // Очистка
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
            alert('Ошибка при скачивании файла. Попробуйте ещё раз или скопируйте текст вручную.');
        }
    }
    
    // Копирование в буфер обмена
    function copyToClipboard(text) {
        // Создаем временный textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        // Выделяем и копируем
        textarea.select();
        textarea.setSelectionRange(0, 99999); // Для мобильных устройств
        
        try {
            const successful = document.execCommand('copy');
            
            if (successful) {
                const copyBtn = document.getElementById('copyText');
                if (copyBtn) {
                    const originalHTML = copyBtn.innerHTML;
                    const originalBg = copyBtn.style.backgroundColor;
                    
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                    copyBtn.style.backgroundColor = 'var(--success-color)';
                    copyBtn.classList.add('success-animation');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.style.backgroundColor = originalBg;
                        copyBtn.classList.remove('success-animation');
                    }, 2000);
                }
            } else {
                throw new Error('Не удалось выполнить команду копирования');
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
            alert('Не удалось скопировать текст. Попробуйте выделить и скопировать вручную.');
        } finally {
            // Удаляем textarea
            document.body.removeChild(textarea);
        }
    }
    
    // Проверка стиля документа
    function checkDocumentStyle(text) {
        errorList.innerHTML = '';
        const errors = styleDictionary.checkText(text);
        
        if (errors.length === 0) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Ошибок стиля не найдено. Документ составлен корректно!</span>
            `;
            errorList.appendChild(successDiv);
            return;
        }
        
        // Показываем ошибки с анимацией
        errors.forEach((error, index) => {
            setTimeout(() => {
                const errorItem = document.createElement('div');
                errorItem.className = 'error-item';
                errorItem.style.animationDelay = `${index * 100}ms`;
                errorItem.innerHTML = `
                    <p><strong>${error.type}:</strong> "${error.found}"</p>
                    <p><strong>Рекомендация:</strong> ${error.suggestion}</p>
                    ${error.explanation ? `<p><em>${error.explanation}</em></p>` : ''}
                `;
                errorList.appendChild(errorItem);
            }, index * 100);
        });
    }
    
    // Инициализация событий
    displayFormFields('sale');
    
    // Обработка выбора шаблона
    templateButtons.forEach(button => {
        button.addEventListener('click', () => {
            templateButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.transform = 'scale(1)';
            });
            
            // Анимация кнопки
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            button.classList.add('active');
            displayFormFields(button.dataset.template);
        });
    });
    
    // Обработка генерации документа
    generateBtn.addEventListener('click', generateDocument);
}

// Модуль теста
function initTest() {
    const questionText = document.getElementById('questionText');
    const documentText = document.getElementById('documentText');
    const errorAreas = document.getElementById('errorAreas');
    const checkAnswerBtn = document.getElementById('checkAnswer');
    const nextQuestionBtn = document.getElementById('nextQuestion');
    const showExplanationBtn = document.getElementById('showExplanation');
    const explanationDiv = document.getElementById('explanation');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const scoreText = document.getElementById('scoreText');
    
    let currentQuestion = 0;
    let score = 0;
    let selectedOptions = new Set();
    let isChecking = false;
    
    // Отображение вопроса
    function displayQuestion(index) {
        if (index >= testQuestions.length) {
            showResults();
            return;
        }
        
        const question = testQuestions[index];
        questionText.textContent = question.question;
        documentText.textContent = question.text;
        
        // Очищаем предыдущие варианты
        errorAreas.innerHTML = '';
        selectedOptions.clear();
        explanationDiv.classList.remove('show');
        explanationDiv.innerHTML = '';
        
        // Создаем все варианты
        const allOptions = [...question.correctErrors, ...question.incorrectOptions];
        
        // Перемешиваем варианты
        const shuffledOptions = shuffleArray([...allOptions]);
        
        // Создаем DocumentFragment для пакетного добавления
        const fragment = document.createDocumentFragment();
        
        // Отображаем варианты
        shuffledOptions.forEach((option, i) => {
            const errorOption = document.createElement('label');
            errorOption.className = 'error-option';
            errorOption.htmlFor = `option-${index}-${option.id}`;
            errorOption.style.animationDelay = `${i * 100}ms`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `option-${index}-${option.id}`;
            checkbox.dataset.optionId = option.id;
            
            const optionText = document.createElement('div');
            optionText.className = 'option-text';
            optionText.textContent = option.text;
            
            errorOption.appendChild(checkbox);
            errorOption.appendChild(optionText);
            
            errorOption.addEventListener('click', (e) => {
                if (isChecking) return;
                
                if (e.target.type !== 'checkbox') {
                    checkbox.checked = !checkbox.checked;
                }
                
                if (checkbox.checked) {
                    selectedOptions.add(option.id);
                    errorOption.classList.add('selected');
                    errorOption.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        errorOption.style.transform = 'scale(1)';
                    }, 150);
                } else {
                    selectedOptions.delete(option.id);
                    errorOption.classList.remove('selected');
                }
            });
            
            fragment.appendChild(errorOption);
        });
        
        errorAreas.appendChild(fragment);
        
        // Обновляем прогресс
        const progress = ((index + 1) / testQuestions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Вопрос ${index + 1} из ${testQuestions.length}`;
        
        // Сбрасываем состояние кнопок
        checkAnswerBtn.disabled = false;
        nextQuestionBtn.disabled = true;
        showExplanationBtn.disabled = true;
        
        // Анимация появления
        documentText.style.animation = 'fadeIn 0.5s ease';
        setTimeout(() => {
            checkAnswerBtn.style.animation = 'pulse 2s infinite';
        }, 500);
    }
    
    // Перемешивание массива
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Проверка ответа
    function checkAnswer() {
        if (isChecking) return;
        isChecking = true;
        
        const question = testQuestions[currentQuestion];
        const correctIds = question.correctErrors.map(err => err.id);
        
        // Отключаем чекбоксы и кнопку
        document.querySelectorAll('.error-option input').forEach(checkbox => {
            checkbox.disabled = true;
        });
        checkAnswerBtn.disabled = true;
        checkAnswerBtn.style.animation = '';
        
        // Подсветка правильных/неправильных ответов
        let questionScore = 0;
        const maxScore = question.correctErrors.length;
        
        document.querySelectorAll('.error-option').forEach((option, i) => {
            setTimeout(() => {
                const checkbox = option.querySelector('input');
                const optionId = parseInt(checkbox.dataset.optionId);
                
                if (correctIds.includes(optionId)) {
                    option.classList.add('correct-answer');
                    if (checkbox.checked) {
                        questionScore++;
                        option.style.transform = 'scale(1.05)';
                        setTimeout(() => {
                            option.style.transform = 'scale(1)';
                        }, 300);
                    }
                } else if (checkbox.checked) {
                    option.classList.add('wrong-answer');
                    questionScore = Math.max(0, questionScore - 0.5);
                }
            }, i * 200);
        });
        
        // Добавляем баллы к общему счёту
        setTimeout(() => {
            score += Math.max(0, questionScore);
            scoreText.textContent = score.toFixed(1);
            
            // Анимация обновления счёта
            scoreText.style.transform = 'scale(1.5)';
            scoreText.style.color = 'var(--success-color)';
            setTimeout(() => {
                scoreText.style.transform = 'scale(1)';
                scoreText.style.color = '';
            }, 500);
            
            // Обновление состояния кнопок
            nextQuestionBtn.disabled = false;
            showExplanationBtn.disabled = false;
            isChecking = false;
            
            // Анимация кнопки следующего вопроса
            nextQuestionBtn.style.animation = 'pulse 1s infinite';
        }, question.correctErrors.length * 200 + 500);
    }
    
    // Показ объяснения
    function showExplanation() {
        const question = testQuestions[currentQuestion];
        explanationDiv.innerHTML = `
            <div class="explanation-content">
                <h4><i class="fas fa-info-circle"></i> Объяснение:</h4>
                <p>${question.explanation}</p>
                <h4><i class="fas fa-check-circle"></i> Правильные исправления:</h4>
                <ul>
                    ${question.correctErrors.map(error => `
                        <li><strong>"${error.text}"</strong> → ${error.correct}<br>
                        <em>${error.explanation}</em></li>
                    `).join('')}
                </ul>
            </div>
        `;
        explanationDiv.classList.add('show');
        
        // Анимация появления
        explanationDiv.style.animation = 'fadeIn 0.5s ease';
    }
    
    // Показ результатов
    function showResults() {
        const maxScore = testQuestions.reduce((sum, q) => sum + q.correctErrors.length, 0);
        const percentage = (score / maxScore) * 100;
        
        questionText.textContent = "Тест завершён!";
        questionText.style.animation = 'fadeIn 0.5s ease';
        
        documentText.innerHTML = `
            <div class="results">
                <h3><i class="fas fa-trophy"></i> Ваши результаты:</h3>
                <div class="score-display">
                    <div class="score-circle">
                        <div class="score-percent" style="
                            background: conic-gradient(
                                var(--primary-color) 0% ${percentage}%, 
                                var(--light-gray) ${percentage}% 100%
                            );
                            width: 120px;
                            height: 120px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 1rem;
                        ">
                            <div style="
                                background: white;
                                width: 100px;
                                height: 100px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 1.5rem;
                                font-weight: bold;
                                color: var(--primary-color);
                            ">
                                ${percentage.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                    <div class="score-details">
                        <p><strong>Набрано баллов:</strong> ${score.toFixed(1)} из ${maxScore}</p>
                        <p><strong>Правильных ответов:</strong> ${Math.round((score / maxScore) * 100)}%</p>
                        <p><strong>Уровень знаний:</strong> ${getKnowledgeLevel(percentage)}</p>
                    </div>
                </div>
                <button onclick="initTest()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Пройти тест ещё раз
                </button>
            </div>
        `;
        
        errorAreas.innerHTML = '';
        explanationDiv.classList.remove('show');
        checkAnswerBtn.disabled = true;
        nextQuestionBtn.disabled = true;
        showExplanationBtn.disabled = true;
    }
    
    // Определение уровня знаний
    function getKnowledgeLevel(percentage) {
        if (percentage >= 90) return 'Эксперт';
        if (percentage >= 70) return 'Продвинутый';
        if (percentage >= 50) return 'Средний';
        return 'Начинающий';
    }
    
    // Инициализация событий
    displayQuestion(0);
    
    checkAnswerBtn.addEventListener('click', checkAnswer);
    
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestion++;
        nextQuestionBtn.style.animation = '';
        displayQuestion(currentQuestion);
    });
    
    showExplanationBtn.addEventListener('click', showExplanation);
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

// Добавляем глобальные функции для теста
window.initTest = initTest;

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
