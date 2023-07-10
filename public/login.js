const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const authSelection = document.getElementById("auth-selection");
const loginButton = document.getElementById("login-button");
const loginForm = document.getElementById("login-form");
const backButtonLogin = document.getElementById("back-button-login");

backButtonLogin.addEventListener("click", function () {
  authContainer.style.display = "none";
  authSelection.style.display = "flex";
});

// Функция для отправки запроса на вход (логин)
function login(email, password) {
  const data = { email, password };

  fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        authContainer.style.display = "none";
        appContainer.style.display = "block";
        return response.json();
      } else {
        throw new Error("Ошибка HTTP: " + response.status);
      }
    })
    .then((result) => {
      console.log(result);

      // Сохраняем токен в локальном хранилище (localStorage)
      localStorage.setItem("token", result.token);
    })
    .catch((error) => {
      console.error(error);
      // Отобразить ошибку на странице
      showErrorLogin(
        "Ошибка входа. Проверьте правильность учетных данных или попробуйте еще раз позже."
      );
    });
}

// Функция для отображения ошибки на странице
function showErrorLogin(message) {
  const loginError = document.getElementById("login-error");
  loginError.style.display = "block";
  loginError.textContent = message;
}

loginButton.addEventListener("click", async (e) => {
  console.log("login");
  e.preventDefault();
  authContainer.style.display = "block";
  authSelection.style.display = "none";
});

let nameOfSource;

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  nameOfSource = email;

  if (email.trim() === "" || password.trim() === "") {
    console.log("Заполните все поля");
    return;
  }

  login(email, password);

  // Скрываем окно регистрации
  email.value = "";
  password.value = "";
});
