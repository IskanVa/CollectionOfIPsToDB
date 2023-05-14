const sourceForm = document.getElementById("source-form");
const fileInput = document.getElementById("file-input");
const ipAddressField = document.getElementById("ip-addresses");
const fileLabel = document.getElementById("file-label");

function submitForm(sourceName, ipAddresses) {
  const ipsObject = ipAddresses.map((ip) => ip.trim());
  console.log(ipsObject);

  const data = { source: sourceName, ips: ipsObject };

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

  const sourceName = document.getElementById("source-name").value;
  const ipAddresses = ipAddressField.value.split("\n");

  if (!sourceName || ipAddresses.length === 1) {
    alert("Введите имя источника и файл с IP адресами");
    return;
  }

  // Вызываем функцию для отправки формы
  submitForm(sourceName, ipAddresses);
});

// Обновляем количество строк в текстовом поле при изменении его значения
ipAddressField.addEventListener("input", () => {
  const rows = ipAddressField.value.split("\n").length;
  ipAddressField.rows = rows > 1 ? rows : 2;
});
