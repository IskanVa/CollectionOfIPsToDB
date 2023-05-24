const sourceForm = document.getElementById("source-form");
const fileInput = document.getElementById("file-input");
const ipAddressField = document.getElementById("ip-addresses");
const fileLabel = document.getElementById("file-label");

function submitForm(sourceName, ipAddresses) {
  const ipsObject = ipAddresses.map((ip) => ip.trim());
  console.log(ipsObject);

  const data = { source: sourceName, ips: ipsObject };
  console.log(data);

  fetch("/api/sources", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Ошибка HTTP: " + response.status);
      }
    })
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error(error);
    });
}

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  const fileName = fileInput.value.split("\\").pop();
  if (fileName) {
    fileLabel.textContent = `Выбран файл: ${fileName}. Выбрать другой файл:`;
  } else {
    fileLabel.textContent = "Загрузить из файла:";
  }

  reader.onload = () => {
    const contents = reader.result;
    const ips = contents.split("\n").map((ip) => ip.trim().replace(/\r$/, ""));
    console.log(ips);
    ipAddressField.value = ips.join("\n");
    // Обновляем количество строк в текстовом поле
    ipAddressField.dispatchEvent(new Event("input"));
  };

  reader.readAsText(file);
});

sourceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const ipAddresses = ipAddressField.value.split("\n");

  if (ipAddresses.length === 1) {
    alert("Введите файл с IP адресами");
    return;
  }

  // Вызываем функцию для отправки формы
  // nameOfSource Я хаваю его из login.js
  submitForm(nameOfSource, ipAddresses);
});

// Обновляем количество строк в текстовом поле при изменении его значения
ipAddressField.addEventListener("input", () => {
  const rows = ipAddressField.value.split("\n").length;
  ipAddressField.rows = rows > 1 ? rows : 2;
});

////////////////////////////////////////////////////////////////////////

const downloadForm = document.getElementById("download-form-all");

downloadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const sources = await getSource();

  // Создаем текстовый файл с IP-адресами
  const text = sources.map((source) => `${source.ip}\n`).join("");

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
});

async function getSource() {
  try {
    const response = await fetch("/api/sources");
    if (response.ok) {
      const data = await response.json();
      const sources = data.sources;
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

//////////////////////////////////////////////

const downloadFormLow = document.getElementById("download-form-low");
const downloadFormBig = document.getElementById("download-form-big");
const downloadFormManual = document.getElementById("download-form-manual");

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

downloadFormManual.addEventListener("submit", async (event) => {
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
