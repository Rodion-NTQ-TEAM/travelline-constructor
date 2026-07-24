document.addEventListener('DOMContentLoaded', () => {
    // Исходные данные для карусели
    const itemsData = [
        // Исходные три элемента
        {
            left: `<img src="images/tl-logo.svg" alt="TL" class="carousel__logo">`,
            right: `аккредитованная<br>IT-компания`
        },
        {
            left: `300+`,
            right: `сотрудников в техотделе<br>и более 800 в компании`
        },
        {
            left: `12 000+`,
            right: `клиентов работают с нами`
        },
        // Добавленные элементы
        {
            left: `>1,5 млн`,
            right: `гостей в месяц бронируют через TravelLine`
        },
        {
            left: `300+`,
            right: `интеграций со сторонними сервисами`
        },
        {
            left: `<img src="images/tl-logo.svg" alt="TL" class="carousel__logo">`,
            right: `серебро в рейтинге лучших<br>работодателей Forbes 2025 г.`
        },
        {
            left: `с 2008 года`,
            right: `создаем инструменты для отельеров`
        },
        {
            left: `топ-50`,
            right: `в рейтинге работодателей hh.ru<br>2022-2025 гг.`
        }
    ];

    const leftList = document.getElementById('left-list');
    const rightList = document.getElementById('right-list');
    const carousel = document.getElementById('carousel');

    // Строим расширенные списки для бесконечной прокрутки
    function buildInfiniteLists() {
        // Очищаем
        leftList.innerHTML = '';
        rightList.innerHTML = '';

        // Собираем массив из 5 элементов: [последний, 0, 1, 2, первый]
        const total = itemsData.length;
        const sequence = [
            itemsData[total - 1], // копия последнего
            ...itemsData,
            itemsData[0]          // копия первого
        ];

        sequence.forEach((item, idx) => {
            // левый элемент
            const liLeft = document.createElement('li');
            liLeft.className = 'carousel__item';
            liLeft.setAttribute('data-index', idx); // индекс в sequence
            liLeft.innerHTML = item.left;
            leftList.appendChild(liLeft);

            // правый элемент
            const liRight = document.createElement('li');
            liRight.className = 'carousel__item';
            liRight.setAttribute('data-index', idx);
            liRight.innerHTML = item.right;
            rightList.appendChild(liRight);
        });

        return sequence.length; // 5
    }

    const totalSlides = buildInfiniteLists(); // 5
    // Активный индекс среди sequence (от 1 до 3 включительно — исходные элементы)
    let activeIndex = 1; // соответствует itemsData[0]
    const itemHeight = 180; // должно совпадать с CSS (высота .carousel__item)
    let isTransitioning = false;

    function setActiveClasses() {
        document.querySelectorAll('.carousel__item').forEach(item => {
            const idx = parseInt(item.getAttribute('data-index'), 10);
            item.classList.toggle('active', idx === activeIndex);
        });
    }

    function updateCarousel(animate = true) {
        // Вычисляем сдвиг так, чтобы элемент с activeIndex оказался в центре (50% высоты контейнера)
        const listHeight = itemHeight * totalSlides;
        // Центрирование: позиция центра элемента activeIndex относительно начала списка
        const offset = (activeIndex * itemHeight) + (itemHeight / 2);
        // translateY, чтобы этот центр совпадал с 50% контейнера
        const translateY = `calc(-50% - ${offset - (listHeight / 2)}px)`;

        if (!animate) {
            leftList.style.transition = 'none';
            rightList.style.transition = 'none';
        } else {
            leftList.style.transition = 'transform 0.4s ease';
            rightList.style.transition = 'transform 0.4s ease';
        }

        leftList.style.transform = `translateY(${translateY})`;
        rightList.style.transform = `translateY(${translateY})`;
        setActiveClasses();
    }

    function handleWheel(e) {
        e.preventDefault();
        if (isTransitioning) return;

        if (e.deltaY > 0) {
            // вниз
            if (activeIndex >= totalSlides - 2) { // 3 (последний оригинал) -> переходим на 4 (копия первого)
                activeIndex++;
                updateCarousel(true);
                isTransitioning = true;
                setTimeout(() => {
                    // мгновенно переставляем на индекс 1 (тот же визуальный элемент)
                    activeIndex = 1;
                    updateCarousel(false);
                    isTransitioning = false;
                }, 400); // длительность анимации
            } else {
                activeIndex++;
                updateCarousel(true);
                isTransitioning = true;
                setTimeout(() => {
                    isTransitioning = false;
                }, 400);
            }
        } else {
            // вверх
            if (activeIndex <= 1) { // 1 -> пытаемся уйти на 0 (копия последнего)
                activeIndex--;
                updateCarousel(true);
                isTransitioning = true;
                setTimeout(() => {
                    activeIndex = totalSlides - 2; // 3 (исходный последний)
                    updateCarousel(false);
                    isTransitioning = false;
                }, 400);
            } else {
                activeIndex--;
                updateCarousel(true);
                isTransitioning = true;
                setTimeout(() => {
                    isTransitioning = false;
                }, 400);
            }
        }
    }

    carousel.addEventListener('wheel', handleWheel, { passive: false });

    // Инициализация
    updateCarousel(false);
});