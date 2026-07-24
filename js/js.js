document.addEventListener('DOMContentLoaded', () => {
    // ========== Данные карусели (8 элементов) ==========
    const itemsData = [
        { left: `<img src="images/tl-logo.svg" alt="TL" class="carousel__logo">`, right: `аккредитованная<br>IT-компания` },
        { left: `300+`, right: `сотрудников в техотделе<br>и более 800 в компании` },
        { left: `12 000+`, right: `клиентов работают с нами` },
        { left: `>1,5 млн`, right: `гостей в месяц бронируют через TravelLine` },
        { left: `300+`, right: `интеграций со сторонними сервисами` },
        { left: `<img src="images/tl-logo.svg" alt="TL" class="carousel__logo">`, right: `серебро в рейтинге лучших<br>работодателей Forbes 2025 г.` },
        { left: `с 2008 года`, right: `создаем инструменты для отельеров` },
        { left: `топ-50`, right: `в рейтинге работодателей hh.ru<br>2022-2025 гг.` }
    ];

    const leftList = document.getElementById('left-list');
    const rightList = document.getElementById('right-list');
    const carousel = document.getElementById('carousel');
    const itemHeight = 120;
    const wheelSpeed = 0.6;
    const snapThreshold = itemHeight * 0.55;
    const damping = 0.04;
    const idleDelay = 250;

    // ========== Три копии списка для полной цикличности ==========
    // Повторяем itemsData три раза подряд: [0,1,2,3,4,5,6,7, 0,1,...]
    const totalOriginals = itemsData.length;
    const tripleSequence = [...itemsData, ...itemsData, ...itemsData]; // 24 элемента
    const totalSlides = tripleSequence.length;
    const listHeight = itemHeight * totalSlides;

    // Заполняем DOM
    leftList.innerHTML = '';
    rightList.innerHTML = '';
    tripleSequence.forEach((item, idx) => {
        const liLeft = document.createElement('li');
        liLeft.className = 'carousel__item';
        liLeft.setAttribute('data-index', idx);
        liLeft.innerHTML = item.left;
        leftList.appendChild(liLeft);

        const liRight = document.createElement('li');
        liRight.className = 'carousel__item';
        liRight.setAttribute('data-index', idx);
        liRight.innerHTML = item.right;
        rightList.appendChild(liRight);
    });

    // Начальная позиция: центр второго набора (индекс = totalOriginals)
    let startIndex = totalOriginals; // это первый элемент второго набора (аккредитованная IT-компания)
    let targetPos = startIndex * itemHeight + itemHeight / 2;
    let currentPos = targetPos;
    let isSnapping = false;
    let wheelTimeout = null;

    function updateOpacity() {
        const allRightItems = rightList.querySelectorAll('.carousel__item');
        allRightItems.forEach((item) => {
            const idx = parseInt(item.getAttribute('data-index'), 10);
            const itemCenter = idx * itemHeight + itemHeight / 2;
            const distance = Math.abs(itemCenter - currentPos);
            let opacity;
            if (distance <= itemHeight) {
                // от центра (1) до соседа (0.2)
                opacity = 1 - (distance / itemHeight) * 0.8;
            } else {
                // дальше соседа: от 0.2 до 0.05 на расстоянии 2*itemHeight
                const extra = Math.min(distance - itemHeight, itemHeight);
                opacity = 0.2 - (extra / itemHeight) * 0.15;
            }
            item.style.opacity = Math.max(0.05, opacity);
        });
    }

    function applyTransform() {
        const translateY = `calc(-50% - ${currentPos - listHeight / 2}px)`;
        leftList.style.transform = `translateY(${translateY})`;
        rightList.style.transform = `translateY(${translateY})`;
        updateOpacity();
    }

    function animate() {
        if (!isSnapping) {
            currentPos += (targetPos - currentPos) * damping;
            if (Math.abs(targetPos - currentPos) < 0.1) {
                currentPos = targetPos;
            }
        } else {
            currentPos += (targetPos - currentPos) * damping;
            if (Math.abs(targetPos - currentPos) < 0.1) {
                currentPos = targetPos;
                isSnapping = false;
            }
        }
        applyTransform();
        requestAnimationFrame(animate);
    }

    // Фиксация к ближайшему элементу (без переносов)
    function snapToNearest() {
        // Находим элемент, ближайший к targetPos, среди ВСЕХ элементов (индексы от 0 до totalSlides-1)
        let nearestIndex = 0;
        let minDistance = Infinity;
        for (let idx = 0; idx < totalSlides; idx++) {
            const center = idx * itemHeight + itemHeight / 2;
            const dist = Math.abs(center - targetPos);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = idx;
            }
        }

        const nearestCenter = nearestIndex * itemHeight + itemHeight / 2;
        const currentIndex = Math.round(currentPos / itemHeight);
        const currentCenter = currentIndex * itemHeight + itemHeight / 2;
        const distFromCurrent = Math.abs(targetPos - currentCenter);

        if (nearestIndex === currentIndex && distFromCurrent <= snapThreshold) {
            targetPos = currentCenter;   // возврат к текущему
        } else {
            targetPos = nearestCenter;   // переключение на ближайший
        }

        isSnapping = true;
    }

    function handleWheel(e) {
        e.preventDefault();
        if (isSnapping) {
            targetPos = currentPos;
            isSnapping = false;
        }
        targetPos += e.deltaY * wheelSpeed;

        // Если targetPos выходит за пределы нашего большого списка, перебрасываем на эквивалентную позицию,
        // чтобы сохранить ощущение бесконечности и избежать выхода за границы DOM.
        // Диапазон допустимых значений: от центра первого элемента до центра последнего.
        const minPos = itemHeight / 2;
        const maxPos = (totalSlides - 1) * itemHeight + itemHeight / 2;
        if (targetPos < minPos) {
            // перескакиваем на аналогичную позицию в конце
            targetPos += totalOriginals * itemHeight;
            currentPos += totalOriginals * itemHeight;
        } else if (targetPos > maxPos) {
            targetPos -= totalOriginals * itemHeight;
            currentPos -= totalOriginals * itemHeight;
        }

        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            snapToNearest();
        }, idleDelay);
    }

    carousel.addEventListener('wheel', handleWheel, { passive: false });
    applyTransform();
    requestAnimationFrame(animate);
});

// ========== Динамическая шапка (надёжный способ) ==========
(function () {
    const header = document.querySelector('.header');
    if (!header) return;

    const sections = document.querySelectorAll('[data-header-theme]');
    if (sections.length === 0) return;

    // Находим первую секцию, верхняя граница которой пересекает верхнюю область экрана (0..80px от верха)
    function getTopmostVisibleSection() {
        let bestSection = null;
        let bestTop = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Нас интересуют секции, верх которых находится в пределах от 0 до 80px от верха вьюпорта
            if (rect.top <= 80 && rect.bottom > 0) {
                // Чем ближе к верху, тем лучше
                if (rect.top < bestTop) {
                    bestTop = rect.top;
                    bestSection = section;
                }
            }
        });
        return bestSection;
    }

    function updateHeaderTheme() {
        const topSection = getTopmostVisibleSection();
        if (topSection) {
            const theme = topSection.dataset.headerTheme;
            if (theme === 'dark') {
                header.classList.add('header--dark');
            } else {
                header.classList.remove('header--dark');
            }
        } else {
            // Если ни одна секция не видна (например, между блоками), ставим тёмную тему (белый фон карусели)
            header.classList.add('header--dark');
        }
    }

    // Слушаем скролл и ресайз
    window.addEventListener('scroll', updateHeaderTheme, { passive: true });
    window.addEventListener('resize', updateHeaderTheme);

    // Вызываем сразу
    updateHeaderTheme();
})();

// ========== Карусель команды (цикличная, плавная) ==========
(function () {
    const track = document.getElementById('teamTrack');
    const carousel = document.getElementById('teamCarousel');
    if (!track || !carousel) return;

    // Должности
    const roles = [
        'Frontend-разработчик',
        'Backend-разработчик',
        'QA-инженер',
        'DevOps',
        'Дизайнер',
        'Менеджер проектов',
        'HR-менеджер',
        'Аналитик',
        'Техлид',
        'Team Lead',
        'Системный администратор',
        'Продукт-менеджер',
        'Тестировщик'
    ];

    const teamList = [
        { name: 'Ваня Потехин', photo: 'images/0g73x2njkshf9qmujyub0hjp9zl87v1w.png' },
        { name: 'Костя Дмитриев', photo: 'images/3ht0rqk20ni0ox2vb7uqafl4b4d43h2w.png' },
        { name: 'Лена Мочалова', photo: 'images/9m2v37w8bboj9zsr34ohimbzboi2rbej.png' },
        { name: 'Гасан Агаев', photo: 'images/72mm50028lx702598mu3o564qcbtlxn4.png' },
        { name: 'Таня Глазырина', photo: 'images/aqkl6fr9dl37nsbgbck489ltq9gaxjwj.png' },
        { name: 'Саша Очеев', photo: 'images/dh9piduru4t57xz8i7aqpjt6nxysrwc9.png' },
        { name: 'Настя Волкова', photo: 'images/dmjg21l9b1oqioh6y3bsdmsuo73wwasu.png' },
        { name: 'Оля Рядова', photo: 'images/elpr32rtbthyfs96gyv3e4kl16tasho9.png' },
        { name: 'Женя Гермогенов', photo: 'images/lp0xwm3awi8twhvqovjfzlca8eboax6u.png' },
        { name: 'Игорь Егошин', photo: 'images/lp4sz53lkyjv8p483o9kt4ikpe2xs8pk.png' },
        { name: 'Настя Ягодарова', photo: 'images/m0euwozke0u8vke8q63fmtif73qm3vhm.png' },
        { name: 'Алексей Герасимов', photo: 'images/zjpczcqzikerwej1coy74ti6y7sb0y9d.png' },
        { name: 'Юра Костин', photo: 'images/rsx07xrge1cz7ql0gw8j4ao3fca0z7x0.png' }
    ];

    teamList.forEach(member => {
        member.role = roles[Math.floor(Math.random() * roles.length)];
    });

    // Перемешиваем
    for (let i = teamList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teamList[i], teamList[j]] = [teamList[j], teamList[i]];
    }

    const itemWidth = 336;
    const gap = 30;
    const setWidth = teamList.length * (itemWidth + gap);

    const tripleTeam = [...teamList, ...teamList, ...teamList];

    tripleTeam.forEach(member => {
        const div = document.createElement('div');
        div.className = 'team-member';
        div.style.width = itemWidth + 'px';
        div.innerHTML = `
            <img class="team-member__photo" src="${member.photo}" alt="${member.name}" draggable="false" />
            <div class="team-member__photo-gradient"></div>
            <div class="team-member__info">
                <div class="team-member__name">${member.name}</div>
                <div class="team-member__role">${member.role}</div>
            </div>
        `;
        track.appendChild(div);
    });

    carousel.scrollLeft = setWidth;

    // Состояния
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let autoScrollActive = true; // автоскролл активен
    // Единственный requestAnimationFrame, работающий всегда
    let rafId = null;

    // Бесшовный зацикливающий сдвиг
    function clampScroll() {
        if (carousel.scrollLeft >= 2 * setWidth) {
            carousel.scrollLeft -= setWidth;
        } else if (carousel.scrollLeft < setWidth) {
            carousel.scrollLeft += setWidth;
        }
    }

    // Основной цикл анимации
    function loop() {
        if (!isDown && autoScrollActive) {
            carousel.scrollLeft += 0.6; // скорость автоскролла
            clampScroll();
        }
        rafId = requestAnimationFrame(loop);
    }

    // Запускаем постоянный loop
    rafId = requestAnimationFrame(loop);

    // Ручное перетаскивание
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX;
        scrollStart = carousel.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
        if (isDown) {
            isDown = false;
            carousel.style.cursor = 'grab';
            clampScroll(); // подкорректируем после перетаскивания
        }
    });

    carousel.addEventListener('mouseleave', () => {
        if (isDown) {
            isDown = false;
            carousel.style.cursor = 'grab';
            clampScroll();
        }
        autoScrollActive = true; // возобновляем автоскролл при уходе
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const dx = e.pageX - startX;
        carousel.scrollLeft = scrollStart - dx;
    });

})();