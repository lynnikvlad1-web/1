// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Настройка цвета фона и заголовка
tg.setBackgroundColor('#f0f8ff'); // Цвет фона приложения
tg.setHeaderColor('secondary_bg_color'); // Цвет заголовка
tg.expand(); // Расширяем приложение на весь экран
tg.ready(); // Готовим приложение к работе

// Функция для нормализации названия города (первая буква заглавная)
function normalizeCityName(city) {
  if (!city) return ''; // Если строка пустая, возвращаем пустую строку
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

// Функция для получения избранных городов из LocalStorage
function getFavorites() {
  const favorites = localStorage.getItem('favorites');
  if (!favorites) return []; // Если данных нет, возвращаем пустой массив
  try {
    const parsedFavorites = JSON.parse(favorites);
    return Array.isArray(parsedFavorites) ? parsedFavorites.filter(city => city.trim()) : [];
  } catch (error) {
    console.error('Ошибка при чтении избранных городов:', error);
    return [];
  }
}

// Функция для сохранения избранных городов в LocalStorage
function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Функция для обновления списка избранных городов на странице
function updateFavoritesList() {
  const favorites = getFavorites();
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = ''; // Очищаем список

  if (favorites.length === 0) {
    console.log('Список избранных городов пуст');
    return;
  }

  for (const city of favorites) {
    const normalizedCity = normalizeCityName(city); // Нормализуем название города

    // Создаем контейнер для строки города
    const container = document.createElement('div');
    container.className = 'favorite-item';

    // Добавляем название города
    const cityName = document.createElement('span');
    cityName.className = 'city-name';
    cityName.textContent = normalizedCity;

    // Добавляем крестик для удаления
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'delete-icon';
    deleteIcon.textContent = '❌';
    deleteIcon.onclick = (e) => {
      e.stopPropagation(); // Предотвращаем всплытие события
      showConfirmationPopup(normalizedCity, container); // Показываем уведомление об удалении
    };

    // Добавляем обработчик клика на саму кнопку
    container.onclick = () => getWeatherForCity(city);

    // Добавляем элементы в контейнер
    container.appendChild(cityName);
    container.appendChild(deleteIcon);

    favoritesList.appendChild(container); // Добавляем контейнер в список
  }
}

// Функция для запроса погоды по названию города
async function fetchWeather(city) {
  const apiKey = 'a6e52742e64c1a2f229380e7998ccabb';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (data.cod === 200) {
      return data; // Возвращаем данные о погоде
    } else {
      console.error(`Ошибка при загрузке погоды для города ${city}:`, data.message);
      return null;
    }
  } catch (error) {
    console.error(`Ошибка при запросе погоды для города ${city}:`, error.message);
    return null;
  }
}

// Функция для получения погоды по названию города
function getWeatherForCity(city) {
  fetchWeather(city).then(data => {
    if (data) {
      const weatherInfo = `
        <p><strong>Город:</strong> ${normalizeCityName(data.name)}</p>
        <p><strong>Температура:</strong> ${data.main.temp}°C</p>
        <p><strong>Погода:</strong> ${data.weather[0].description}</p>
        <p><strong>Влажность:</strong> ${data.main.humidity}%</p>
        <p><strong>Скорость ветра:</strong> ${data.wind.speed} м/с</p>
      `;
      document.getElementById('weatherInfo').innerHTML = weatherInfo;
    } else {
      document.getElementById('weatherInfo').innerHTML = `<p>Город не найден. Попробуйте снова.</p>`;
    }
  });
}

// Функция для удаления города из избранного
function removeFromFavorites(city) {
  const normalizedCity = normalizeCityName(city); // Нормализуем название города
  const favorites = getFavorites();

  // Удаляем город из массива
  const updatedFavorites = favorites.filter(item => item !== normalizedCity);
  saveFavorites(updatedFavorites);
  updateFavoritesList(); // Обновляем список на странице
}

// Функция для показа уведомления об удалении
function showConfirmationPopup(city, container) {
  console.log(`Создание уведомления для города: ${city}`);

  // Создаем элемент для уведомления
  const popup = document.createElement('div');
  popup.className = 'confirmation-popup';
  popup.innerHTML = `
    <p>Удалить "${city}" из избранного?</p>
    <button class="yes">Да</button>
    <button class="no">Нет</button>
  `;

  console.log('Добавляем уведомление на страницу');
  document.body.appendChild(popup);

  // Обработчик для кнопки "Да"
  popup.querySelector('.yes').onclick = () => {
    console.log('Кнопка "Да" нажата');
    removeFromFavorites(city); // Удаляем город из избранного
    document.body.removeChild(popup); // Убираем уведомление
  };

  // Обработчик для кнопки "Нет"
  popup.querySelector('.no').onclick = () => {
    console.log('Кнопка "Нет" нажата');
    document.body.removeChild(popup); // Убираем уведомление
  };
}

// Функция для добавления города в избранное
function addToFavorites(city) {
  const normalizedCity = normalizeCityName(city); // Нормализуем название города
  const favorites = getFavorites();

  // Проверяем, что город еще не добавлен
  if (!favorites.includes(normalizedCity)) {
    favorites.push(normalizedCity); // Добавляем нормализованное название
    saveFavorites(favorites);
    updateFavoritesList(); // Обновляем список на странице
  }
}

// Добавляем обработчик события на кнопку "Получить погоду"
document.getElementById('getWeatherBtn').addEventListener('click', function () {
  const city = document.getElementById('cityInput').value.trim();

  if (!city) {
    alert('Введите название города');
    return;
  }

  // Показываем кнопку "Добавить в избранное"
  document.getElementById('addToFavoritesBtn').style.display = 'block';

  // Сохраняем текущий город для добавления в избранное
  document.getElementById('addToFavoritesBtn').onclick = () => addToFavorites(city);

  // Получаем погоду для введенного города
  getWeatherForCity(city);
});

// Инициализация: загружаем избранные города при запуске
updateFavoritesList();
