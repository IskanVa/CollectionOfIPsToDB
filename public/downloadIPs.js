const downloadFormLow = document.getElementById("download-form-low");
const downloadFormBig = document.getElementById("download-form-big");
const downloadFormManual = document.getElementById("download-form-manual");
const manualConfigurationButton = document.getElementById(
  "manual-configuration-button"
);
const downloadFormManualDownload = document.getElementById(
  "manual-configuration-button-download"
);

downloadFormLow.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ratings = [2];
  const sources = await getSourcesByRatings(ratings);
  downloadIPAddresses(sources);
});

downloadFormBig.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ratings = [3];
  const sources = await getSourcesByRatings(ratings);
  downloadIPAddresses(sources);
});

let isManualConfigurationVisible = false;

manualConfigurationButton.addEventListener("click", (event) => {
  event.preventDefault();
  isManualConfigurationVisible = !isManualConfigurationVisible;
  downloadFormManual.style.display = isManualConfigurationVisible
    ? "block"
    : "none";
  downloadFormManualDownload.style.display = isManualConfigurationVisible
    ? "block"
    : "none";
});

downloadFormManualDownload.addEventListener("click", async (event) => {
  event.preventDefault();

  const checkboxes = document.querySelectorAll('input[name="rating"]:checked');
  const ratings = Array.from(checkboxes).map((checkbox) =>
    parseInt(checkbox.value)
  );

  if (ratings.length === 0) {
    alert("Пожалуйста, выберите хотя бы один рейтинг.");
    return;
  }

  const sources = await getSourcesByRatings(ratings);
  downloadIPAddresses(sources);
});

async function getSourcesByRatings(ratings) {
  try {
    const response = await fetch("/api/sources");
    if (response.ok) {
      const data = await response.json();
      const sources = data.sources.filter((source) =>
        ratings.includes(source.rating)
      );
      if (sources.length === 0) {
        alert("Этот список пуст");
        return;
      }
      console.log(sources);
      return sources;
    } else {
      throw new Error("HTTP Error: " + response.status);
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

function downloadIPAddresses(sources) {
  // Создаем текстовый файл с IP-адресами
  const text = sources.map((source) => `${source.ip}\n`).join("");

  // Создаем элемент <a> для скачивания файла
  const link = document.createElement("a");
  link.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  link.setAttribute("download", "ip_addresses.txt");

  // Добавляем элемент <a> на страницу и симулируем клик для скачивания файла
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const saveRatingsButton = document.getElementById("save-ratings-button");
const failMessage = document.getElementById("fail-message");
const successMessage = document.getElementById("success-message");
const successMessageRate = document.getElementById("success-message-rate");

saveRatingsButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const checkboxes = document.querySelectorAll('input[name="rating"]:checked');
  const ratings = Array.from(checkboxes).map((checkbox) =>
    parseInt(checkbox.value)
  );

  if (ratings.length === 0) {
    alert("Пожалуйста, выберите хотя бы один рейтинг.");
    return;
  }

  try {
    const response = await fetch(
      `/api/users/${encodeURIComponent(nameOfSource)}/ratings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ratings }),
      }
    );

    if (response.ok) {
      successMessageRate.innerHTML = "Рейтинги успешно сохранены.";
      setTimeout(() => {
        successMessageRate.innerText = "";
      }, 5000);
      // alert("Рейтинги успешно сохранены.");
      if (failMessage) {
        failMessage.innerText = ""; // Очистите сообщение об ошибке
      }
    } else {
      throw new Error("HTTP Error: " + response.status);
    }
  } catch (error) {
    console.error(error);
  }
});

// Инициализация интервала
let interval;

// Ваш код для загрузки IP-адресов
async function downloadIPs() {
  // Получаем сохраненный IP-адрес
  const ip = localStorage.getItem("ip");

  // Отправляем запрос на получение данных, включающих IP в URL
  const response = await fetch(
    `/api/autodownload/${encodeURIComponent(nameOfSource)}/${encodeURIComponent(
      ip
    )}`
  );
  if (response.ok) {
    const data = await response.json();
    const sources = data.sources;
    if (sources.length === 0) {
      failMessage.innerText = "Этот список пуст";
      setTimeout(() => {
        failMessage.innerText = "";
      }, 5000);
      return;
    }
    console.log(sources);
    downloadIPAddresses(sources);
  } else {
    console.error("HTTP Error: " + response.status);
  }
}

// Функция для начала автоматической загрузки IP-адресов
function startAutoDownload() {
  // Получаем значение интервала обновления из localStorage
  const refreshRate = localStorage.getItem("refreshRate");

  // Преобразуем интервал обновления в миллисекунды
  const intervalInMilliseconds = refreshRate * 60 * 1000;

  // Если интервал уже был установлен, его нужно сначала очистить
  if (interval) {
    clearInterval(interval);
  }

  // Настройка интервала
  interval = setInterval(downloadIPs, intervalInMilliseconds);
}

// Запуск автоматической загрузки при загрузке страницы
document.addEventListener("DOMContentLoaded", startAutoDownload);

// Обработка события отправки формы для обновления интервала обновления
document
  .getElementById("timer-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const refreshRate = document.getElementById("timer-input").value;

    const response = await fetch("/api/users/refreshRate", {
      method: "PUT",
      body: JSON.stringify({ refreshRate }),
      headers: {
        "Content-Type": "application/json",
        "User-Email": nameOfSource,
      },
    });

    if (response.ok) {
      successMessage.innerText = "Интервал обновления успешно обновлен";
      setTimeout(() => {
        successMessage.innerText = "";
      }, 5000);

      localStorage.setItem("refreshRate", refreshRate);

      // Сразу же запускаем загрузку IP-адресов
      await downloadIPs();

      // Затем перезапускаем автоматическую загрузку с новым интервалом обновления
      startAutoDownload();
    } else {
      console.error(
        "Ошибка при обновлении интервала обновления: " + response.status
      );
    }
  });
