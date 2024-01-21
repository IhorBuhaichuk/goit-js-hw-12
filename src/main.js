'use strict';

import axios from 'axios';
// Описаний у документації
import iziToast from 'izitoast';
// Додатковий імпорт стилів
import 'izitoast/dist/css/iziToast.min.css';
// Описаний у документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '41511602-ac1f0d864a13fd01c911f294b';
const searchFormEl = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more');
let currentPage = 1;
let totalHits = 0;
let searchQuery = '';
let imagesLoaded = 0;

loader.style.display = 'none';
loadMoreButton.classList.remove('visible');
searchFormEl.addEventListener('submit', handleFormSubmit);
loadMoreButton.addEventListener('click', loadMoreImages);

async function handleFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.target.querySelector('.search-input').value.trim();
if (!searchQuery) {
  showWarningToast('Please enter image name!');
  return;
}

clearGallery();
showLoader();
hideLoadMoreButton();

try {
  const response = await axios.get('https://pixabay.com/api/', {
    params: {
      key: API_KEY,
      per_page: 40,
      safesearch: true,
      page: currentPage,
      orientation: 'horizontal',
      image_type: 'photo',
      q: searchQuery,
    },
  });
hideLoader();

const data = response.data;
if (data.hits.length === 0) {
  showErrorToast('Sorry, there are no images matching your search query. Please try again!');
  return;
}

totalHits = data.totalHits;
imagesLoaded = data.hits.length;
renderImages(data.hits);
lightbox.refresh();

showInfoToast(`We found ${totalHits} images.`);

if (totalHits > 40) {
  showLoadMoreButton();
}
} catch (error) {
  console.error('Error fetching images:', error);
  hideLoader();
  showErrorToast('Failed to fetch images. Please try again later.');
}
}

function renderImages(images) {
  const fragment = document.createDocumentFragment();

images.forEach(image => {
  const imageCardElement = createImageCard(image);
  fragment.appendChild(imageCardElement);
});

gallery.appendChild(fragment);
}

function createImageCard(image) {
  const imageCardElement = document.createElement('div');
  imageCardElement.classList.add('card');

  imageCardElement.innerHTML = `
    <a class="gallery-link" href="${image.largeImageURL}">
    <img class="card-image" src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
    </a>
    <div class="card-info">
      <p class="card-text"><b>Likes:</b> ${image.likes}</p>
      <p class="card-text"><b>Views:</b> ${image.views}</p>
      <p class="card-text"><b>Comments:</b> ${image.comments}</p>
      <p class="card-text"><b>Downloads:</b> ${image.downloads}</p>
    </div>
  `;

  return imageCardElement;
}

function clearGallery() {
  gallery.innerHTML = '';
  currentPage = 1;
  hideLoadMoreButton();
}

async function loadMoreImages() {
  showLoader();
  hideLoadMoreButton();

  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        safesearch: true,
        per_page: 40,
        page: currentPage + 1,
        orientation: 'horizontal',
        image_type: 'photo',
        q: searchQuery,
      },
    });
    
    hideLoader();

    const data = response.data;

    if (data.hits.length === 0) {
      return;
    }

    currentPage++;

    if (imagesLoaded + data.hits.length > totalHits) {
      data.hits = data.hits.slice(0, totalHits - imagesLoaded);
    }

    imagesLoaded += data.hits.length;
    renderImages(data.hits);
    lightbox.refresh();

    if (imagesLoaded >= totalHits) {
      hideLoadMoreButton();
      showInfoToast(`We're sorry, but you've reached the end of search results.`);
    } else {
      showLoadMoreButton();
    }

    const cards = document.querySelectorAll('.card');
    const newImages = Array.from(cards).slice(-40);
    if (newImages.length > 0) {
      const firstNewImage = newImages[0];

      firstNewImage.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  } catch (error) {
    console.error('Error fetching more images:', error);
    hideLoader();
    showErrorToast('Failed to fetch more images. Please try again later.');
  }
}

const showLoader = () => {
  loader.style.display = 'block';
};

const hideLoader = () => {
  loader.style.display = 'none';
};

const showLoadMoreButton = () => {
  loadMoreButton.style.display = 'block';
};

const hideLoadMoreButton = () => {
  loadMoreButton.style.display = 'none';
};

const showWarningToast = (message) => {
  iziToast.warning({
    title: 'Warning!',
    message: message,
    position: 'topRight',
  });
};

const showErrorToast = (message) => {
  iziToast.error({
    message: message,
    position: 'topRight',
  });
};

const showInfoToast = (message) => {
  iziToast.info({
    message: message,
    position: 'topRight',
  });
};
