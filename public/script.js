const sourceForm = document.getElementById("source-form");
const fileInput = document.getElementById("file-input");
const ipAddressField = document.getElementById("ip-addresses");
const fileLabel = document.getElementById("file-label");
const teamNameInput = document.getElementById("team-name-input");
const teamNameButton = document.getElementById("team-name-button");
const backButtonApp = document.getElementById("back-button-app");

backButtonApp.addEventListener("click", function () {
  appContainer.style.display = "none";
  authSelection.style.display = "flex";
});

let teamName;

function submitForm(sourceName, ipAddresses, teamName) {
  const ipsObject = ipAddresses.map((ip) => ip.trim());
  console.log(ipsObject);

  if (!sourceName || !ipsObject.length || !teamName) {
    alert("Не заполнены все обязательные поля - Имя команды или IP-адреса");
    return;
  }

  const data = { source: sourceName, ips: ipsObject, team: teamName };
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
        response.text().then((text) => console.log("Response text:", text));
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
  // nameOfSource Я хаваю его из login.js
  submitForm(nameOfSource, ipAddresses, teamName);
});

// Обновляем количество строк в текстовом поле при изменении его значения
ipAddressField.addEventListener("input", () => {
  const rows = ipAddressField.value.split("\n").length;
  ipAddressField.rows = rows > 1 ? rows : 2;
});

////

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

      // Проверяем, является ли data объектом и содержит ли он свойство sources
      if (typeof data === "object" && data.sources) {
        const sources = data.sources;
        console.log(sources);
        return sources;
      } else {
        // Если свойства sources нет, мы выводим весь объект data, чтобы увидеть, что в нем находится
        console.error("Response does not contain a sources property:", data);
        return [];
      }
    } else {
      throw new Error("HTTP Error: " + response.status);
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

teamNameButton.addEventListener("click", async (event) => {
  event.preventDefault();

  teamName = teamNameInput.value;
  console.log(teamName);

  // Вызываем функцию для проверки имени команды
  const isTeamValid = await validateTeamName(teamName);

  if (!isTeamValid) {
    console.log(isTeamValid);
    alert("Введите существующую команду!");
    teamName = "";
  } else {
    alert("Команда подтверждена!");
  }
});

async function validateTeamName(teamName) {
  try {
    const response = await fetch(`/api/teams/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamName }),
    });

    if (response.status === 200) {
      return true;
    } else {
      console.log(teamName);
      throw new Error("HTTP Error: " + response.status);
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
