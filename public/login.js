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
      localStorage.setItem("ip", result.ip); // Сохраняем IP-адрес
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
  const response = await fetch(
    `/api/users/${encodeURIComponent(email)}/ratings`
  );
  login(email, password);

  if (response.ok) {
    const { selectedRatings, refreshRate } = await response.json();
    // Берём выбранные рейтиги из БД
    setSelectedRatings(selectedRatings);
    // Берём таймер из БД
    document.getElementById("timer-input").value = refreshRate;
  } else {
    console.error(
      "Ошибка при получении выбранных рейтингов или таймера отправления листов:",
      response.status
    );
  }

  // Скрываем окно регистрации
  email.value = "";
  password.value = "";
});

function setSelectedRatings(ratings) {
  const checkboxes = document.querySelectorAll('input[name="rating"]');
  checkboxes.forEach((checkbox) => {
    if (ratings.includes(parseInt(checkbox.value))) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }
  });
}

// function checkToken() {
//   const token = localStorage.getItem("token");
//   console.log(token);
//   if (token) {
//     authContainer.style.display = "none";
//     appContainer.style.display = "block";
//   } else {
//     authContainer.style.display = "block";
//     appContainer.style.display = "none";
//   }
// }
// checkToken();
