const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2'
const API_KEY = '244d94bd014b08bd252576f4690e3c17'
const SERVER = 'https://api.themoviedb.org/3/'


const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    preloader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    modalContent = document.querySelector('.modal__content'),
    pagination = document.querySelector('.pagination');

const loader = document.createElement('div');
loader.className = 'loading';

const DBService = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Could not get data from ${url}`)
        }
    }
    getTestData = () => {
        return this.getData('test.json')
    }

    getTestCard = () => {
        return this.getData('card.json')
    }
    getSearchResult = query => {
        this.curData = `${SERVER}search/tv?api_key=${API_KEY}&query=${query}&language=en-US`
        return this.getData(this.curData)
    }

    getShowsByPage = page => this.getData(`${this.curData}&page=${page}`)

    getTvShow = id => {
        return this.getData(`${SERVER}tv/${id}?api_key=${API_KEY}&language=en-US`);
    }

    getTopRated = () => this.getData(`${SERVER}tv/top_rated?api_key=${API_KEY}&language=en-US`)

    getPopular = () => this.getData(`${SERVER}tv/popular?api_key=${API_KEY}&language=en-US`)

    getToday = () => this.getData(`${SERVER}tv/airing_today?api_key=${API_KEY}&language=en-US`)

    getWeek = () => this.getData(`${SERVER}tv/on_the_air?api_key=${API_KEY}&language=en-US`)
}

const dBService = new DBService();

const renderCard = (response, target) => {

    tvShowsList.textContent = '';


    if (response.results.length === 0) {
        loader.remove();
        tvShowsHead.textContent = 'No results found';
    } else {
        response.results.forEach(item => {
            tvShowsHead.textContent = target ? target.textContent : 'Search results';
            const {
                backdrop_path: backdrop,
                name: title,
                poster_path: poster,
                vote_average: vote,
                id
            } = item;
            const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
            const backdropImg = backdrop ? IMG_URL + backdrop : '';
            const voteElem = vote ? `<span class="tv-card__vote">${vote}</span> ` : '';

            const card = document.createElement('li');
            card.classList.add('tv-shows__item');
            card.innerHTML = `
                <a href="#" id="${id}" class="tv-card">
                    ${voteElem}
                    <img class="tv-card__img"
                         src="${posterIMG}"
                         data-backdrop="${backdropImg}"
                         alt=${title}>
                    <h4 class="tv-card__head">${title}</h4>
                </a>
            `;
            loader.remove();
            tvShowsList.append(card);
        });

        pagination.textContent = '';

        if (response.total_pages > 1) {
            for (let i = 1; i <= response.total_pages; i++) {
                pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
            }
        }
    }
}

pagination.addEventListener('click', e => {
    e.preventDefault();
    if (e.target && e.target.classList.contains('pages')) {
        tvShows.append(loader);
        dBService.getShowsByPage(e.target.textContent).then(renderCard)
    }
})

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = searchFormInput.value.trim();
    if (value) {
        tvShows.append(loader);
        dBService.getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
});

const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.body.addEventListener('click', e => {
    if (!e.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', e => {
    e.preventDefault()
    const dropdown = e.target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

    if (e.target.closest('#top-rated')) {
        tvShows.append(loader);
        dBService.getTopRated().then((response) => renderCard(response, e.target))
    }
    if (e.target.closest('#popular')) {
        tvShows.append(loader);
        dBService.getPopular().then((response) => renderCard(response, e.target))
    }
    if (e.target.closest('#week')) {
        tvShows.append(loader);
        dBService.getWeek().then((response) => renderCard(response, e.target))
    }
    if (e.target.closest('#today')) {
        tvShows.append(loader);
        dBService.getToday().then((response) => renderCard(response, e.target))
    }
    if (e.target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }

});


tvShowsList.addEventListener('click', e => {
    e.preventDefault()
    const card = e.target.closest('.tv-card');

    if (card) {

        preloader.style.display = 'block';

        console.log(card.id)
        dBService.getTvShow(card.id)
            .then(response => {

                if (response.poster_path) {
                    tvCardImg.src = IMG_URL + response.poster_path;
                    tvCardImg.alt = response.name;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = '';
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '50px';
                }

                modalTitle.textContent = response.name;
                genresList.textContent = '';
                for (const item of response.genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`
                }
                rating.textContent = response.vote_average;
                description.textContent = response.overview;
                modalLink.href = response.homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = '';
            })
    }
});

modal.addEventListener('click', e => {
    if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

const changeImage = e => {
    const card = e.target.closest('.tv-shows__item');
    if (card) {
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
}

tvShowsList.addEventListener('mouseover', changeImage)
tvShowsList.addEventListener('mouseout', changeImage)