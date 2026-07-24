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