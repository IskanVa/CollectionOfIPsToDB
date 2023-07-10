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
