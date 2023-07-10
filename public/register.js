const registerContainer = document.getElementById("register-container");
const registerForm = document.getElementById("register-form");
const registerButton = document.getElementById("register-button");
const backButtonRegister = document.getElementById("back-button-register");

backButtonRegister.addEventListener("click", function () {
  registerContainer.style.display = "none";
  authSelection.style.display = "flex";
});

function register(username, email, password) {
  const data = { username, email, password };

  fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 400) {
        throw new Error(
          "Введите валидные данные, длина пароля от 8 знаков, имя пользователя от 5 знаков"
        );
      } else {
        throw new Error("Ошибка HTTP: " + response.status);
      }
    })
    .then((result) => {
      console.log(result);

      // Продолжаем с другой логикой после успешной регистрации
      // ...

      // Скрыть окно регистрации и отобразить основное приложение
      registerContainer.style.display = "none";
      appContainer.style.display = "block";
    })
    .catch((error) => {
      showErrorRegister(error.message);
    });
}

// Функция для отображения ошибки на странице
function showErrorRegister(message) {
  const registerError = document.getElementById("register-error");
  registerError.style.display = "block";
  registerError.textContent = message;
}

//////////////////////////////////////////

registerButton.addEventListener("click", async (e) => {
  console.log("regis");
  e.preventDefault();
  registerContainer.style.display = "block";
  authSelection.style.display = "none";
  // короче обработчик готов
  // Скрываем окно регистрации потом это на authSelection.style.display = "flex"; и дисплей мод окна тушить
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  if (username.trim() === "" || email.trim() === "" || password.trim() === "") {
    console.log("Заполните все поля");
    alert("Заполните все поля");
    return;
  }

  // Вызываем функцию для отправки запроса на регистрацию
  register(username, email, password);

  // Скрываем окно регистрации
  username.value = "";
  email.value = "";
  password.value = "";
});
