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
async function updateFavoritesList() {
  const favorites = getFavorites();
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = ''; // Очищаем список

  for (const city of favorites) {
    const normalizedCity = normalizeCityName(city); // Нормализуем название города
    const container = document.createElement('div'); // Контейнер для строки города
    container.className = 'favorite-item';

    try {
      // Загружаем погоду для города
      const weatherData = await fetchWeather(city);

      if (weatherData) {
        // Создаем кнопку с названием города
        const cityButton = document.createElement('button');
        cityButton.textContent = normalizedCity;

        // Добавляем обработчик клика для показа погоды
        cityButton.onclick = () => getWeatherForCity(city);

        // Создаем контейнер для данных о погоде
        const weatherDataContainer = document.createElement('div');
        weatherDataContainer.className = 'weather-data';

        // Добавляем температуру
        const temperature = document.createElement('span');
        temperature.textContent = `${Math.round(weatherData.main.temp)}°C `;
        weatherDataContainer.appendChild(temperature);

        // Добавляем описание погоды
        const description = document.createElement('span');
        description.textContent = `${weatherData.weather[0].description} `;
        weatherDataContainer.appendChild(description);

        // Добавляем влажность
        const humidity = document.createElement('span');
        humidity.textContent = `${weatherData.main.humidity}% `;
        weatherDataContainer.appendChild(humidity);

        // Добавляем скорость ветра
        const windSpeed = document.createElement('span');
        windSpeed.textContent = `${weatherData.wind.speed} м/с`;
        weatherDataContainer.appendChild(windSpeed);

        // Добавляем кнопку и данные о погоде в контейнер
        container.appendChild(cityButton);
        container.appendChild(weatherDataContainer);
      } else {
        // Если погода не загружена, просто показываем название города
        const cityName = document.createElement('span');
        cityName.textContent = normalizedCity;
        container.appendChild(cityName);
      }

      // Добавляем обработчики для удаления
      setupDeleteHandlers(container, city);

      favoritesList.appendChild(container);
    } catch (error) {
      console.error(`Ошибка при обработке города ${city}:`, error.message);
      continue; // Пропускаем этот город и переходим к следующему
    }
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

// Функция для удаления города из избранного
function removeFromFavorites(city) {
  const normalizedCity = normalizeCityName(city); // Нормализуем название города
  const favorites = getFavorites();

  // Удаляем город из массива
  const updatedFavorites = favorites.filter(item => item !== normalizedCity);
  saveFavorites(updatedFavorites);
  updateFavoritesList(); // Обновляем список на странице
}

// Функция для настройки обработчиков удаления
function setupDeleteHandlers(container, city) {
  let isMobile = /Mobi|Android/i.test(navigator.userAgent); // Проверка, мобильное ли устройство

  if (isMobile) {
    let pressTimer;

    // При начале касания запускаем таймер
    container.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Предотвращаем стандартное поведение
      pressTimer = setTimeout(() => showConfirmationPopup(city), 1000); // 1 секунда
    });

    // При окончании касания очищаем таймер
    container.addEventListener('touchend', () => clearTimeout(pressTimer));

    // Если пользователь убирает палец с элемента, также очищаем таймер
    container.addEventListener('touchmove', () => clearTimeout(pressTimer));
  } else {
    // На компьютерах используем правую кнопку мыши
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showConfirmationPopup(city);
    });
  }
}

// Функция для показа уведомления об удалении
function showConfirmationPopup(city) {
  const popup = document.createElement('div');
  popup.className = 'confirmation-popup';
  popup.innerHTML = `
    <p>Удалить "${city}" из избранного?</p>
    <button class="yes">Да</button>
    <button class="no">Нет</button>
  `;

  document.body.appendChild(popup);

  // Обработчики кнопок "Да" и "Нет"
  popup.querySelector('.yes').onclick = () => {
    removeFromFavorites(city);
    document.body.removeChild(popup);
  };

  popup.querySelector('.no').onclick = () => {
    document.body.removeChild(popup);
  };
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
