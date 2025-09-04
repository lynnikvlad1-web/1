document.getElementById('getWeatherBtn').addEventListener('click', function () {
  const city = document.getElementById('cityInput').value;
  if (!city) {
    alert('Введите название города');
    return;
  }

  // Проверка, запущено ли приложение в Telegram
  if (typeof Telegram !== "undefined" && Telegram.WebApp) {
    const tg = Telegram.WebApp;
    console.log("Приложение запущено в Telegram");
  } else {
    console.log("Приложение запущено вне Telegram");
  }

  // Запрос к OpenWeatherMap API
  const apiKey = 'a6e52742e64c1a2f229380e7998ccabb'; // Замените на ваш API Key
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        const weatherInfo = `
          <p><strong>Город:</strong> ${data.name}</p>
          <p><strong>Температура:</strong> ${data.main.temp}°C</p>
          <p><strong>Погода:</strong> ${data.weather[0].description}</p>
          <p><strong>Влажность:</strong> ${data.main.humidity}%</p>
          <p><strong>Скорость ветра:</strong> ${data.wind.speed} м/с</p>
        `;
        document.getElementById('weatherInfo').innerHTML = weatherInfo;
      } else {
        document.getElementById('weatherInfo').innerHTML = `<p>Город не найден. Попробуйте снова.</p>`;
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
      document.getElementById('weatherInfo').innerHTML = `<p>Произошла ошибка. Попробуйте позже.</p>`;
    });
});