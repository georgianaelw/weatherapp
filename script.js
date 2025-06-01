

const apiKey = "920f4407688f95c37a001112dac724e1";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const uvApiUrl = "https://api.openweathermap.org/data/2.5/uvi?";

// ELEMENTE
const searchInput = document.querySelector(".search-bar input");
const searchBtn = document.querySelector(".search-bar button");
const weatherIcon = document.querySelector(".weather-icon");
const errorMsg = document.querySelector(".error");
const weatherBox = document.querySelector(".weather");
const toggleDark = document.getElementById("toggleDark");
const particlesDiv = document.getElementById("tsparticles");
const uvIndexEl = document.querySelector(".uv-index");
const uvValueEl = document.querySelector(".uv-value");

// ORA CURENTĂ
const now = new Date();
document.querySelector(".getDate").textContent = now.toLocaleString();

// DARK MODE AUTO
if (now.getHours() >= 20 || now.getHours() <= 6) {
  enableDarkMode();
}

// TOGGLE MANUAL
toggleDark.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  toggleDark.classList.toggle("bi-moon");
  toggleDark.classList.toggle("bi-brightness-high-fill");
  if (isDark) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
});

// CĂUTARE
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) checkWeather(city);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) checkWeather(city);
  }
});

// FETCH VREME
async function checkWeather(city) {
  try {
    const res = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    updateUI(data);
    fetchUV(data.coord.lat, data.coord.lon);
  } catch {
    errorMsg.style.display = "block";
    weatherBox.style.display = "none";
    uvIndexEl.style.display = "none";
  }
}

// === UV Index fetch from Tomorrow.io ===
async function fetchUV(lat, lon) {
  const tomorrowApiKey = "qNbhxNzn2QqjV48HUkAawyhyvsbxQbZr";
  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${tomorrowApiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();

    const uv = data.data.values.uvIndex;
    const level = getUVLevel(uv);

    // Badge color logic
    let color = "#ccc";
    if (uv < 3) color = "#4caf50";         // low: green
    else if (uv < 6) color = "#ffeb3b";    // moderate: yellow
    else if (uv < 8) color = "#ff9800";    // high: orange
    else if (uv < 11) color = "#f44336";   // very high: red
    else color = "#9c27b0";                // extreme: purple

    uvValueEl.textContent = `UV Index: ${uv.toFixed(1)} – ${level}`;
    uvValueEl.style.background = color;
    uvValueEl.style.color = "#000";
    uvValueEl.style.borderRadius = "8px";
    uvValueEl.style.padding = "4px 8px";
    uvValueEl.style.fontWeight = "600";

    uvIndexEl.style.display = "flex";
  } catch (err) {
    console.error("Failed to fetch UV Index:", err);
    uvValueEl.textContent = "UV Index: --";
    uvValueEl.removeAttribute("style");
    uvIndexEl.style.display = "flex";
  }
}

function getUVLevel(value) {
  if (value < 3) return "low";
  if (value < 6) return "moderate";
  if (value < 8) return "high";
  if (value < 11) return "very high";
  return "extreme";
}

// ACTUALIZEAZĂ UI
function updateUI(data) {
  document.querySelector(".city").textContent = data.name;
  document.querySelector(".temperature").textContent = Math.round(data.main.temp) + "°C";
  document.querySelector(".humidity").textContent = data.main.humidity + "%";
  document.querySelector(".wind").textContent = data.wind.speed + " km/h";
  errorMsg.style.display = "none";
  weatherBox.style.display = "block";

  const weather = data.weather[0].main.toLowerCase();
  let iconSrc = "img/cloudy.svg";
  if (weather.includes("clear")) iconSrc = "img/day.svg";
  else if (weather.includes("cloud")) iconSrc = "img/cloudy.svg";
  else if (weather.includes("rain")) iconSrc = "img/rainy.svg";
  else if (weather.includes("drizzle")) iconSrc = "img/drizzle.svg";
  else if (weather.includes("snow")) iconSrc = "img/snowy.svg";
  else if (weather.includes("thunder")) iconSrc = "img/thunder.svg";

  weatherIcon.src = iconSrc;
}

// GEOLOCAȚIE
navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const { latitude, longitude } = pos.coords;
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      updateUI(data);
      fetchUV(latitude, longitude);
    }
  },
  () => {
    checkWeather("Bucharest");
  }
);

// DARK MODE FUNCȚII
function enableDarkMode() {
  document.body.classList.add("dark");
  toggleDark.classList.remove("bi-moon");
  toggleDark.classList.add("bi-brightness-high-fill");
  loadParticles();
  generateTwinkleStars();
}

function disableDarkMode() {
  document.body.classList.remove("dark");
  tsParticles.dom().forEach(instance => instance.destroy());
  particlesDiv.style.display = "none";
  clearTwinkleStars();
}

// PARTICULE FUNDAL
function loadParticles() {
  particlesDiv.style.display = "block";
  if (tsParticles.dom().length === 0) {
    tsParticles.load("tsparticles", {
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.6,
          random: true,
          anim: { enable: true, speed: 0.4, opacity_min: 0.2, sync: false }
        },
        size: { value: 1.2, random: true },
        move: { enable: true, speed: 0.05, direction: "none", random: true, out_mode: "out" }
      },
      interactivity: { events: { onhover: { enable: false } } },
      detectRetina: true
    });
  }
}

// STELE CARE CLIPESC
function generateTwinkleStars(count = 20) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "twinkle-star";
    star.style.top = `${Math.random() * 100}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    document.body.appendChild(star);
  }
}
function clearTwinkleStars() {
  document.querySelectorAll(".twinkle-star").forEach(star => star.remove());
}

// METEORIȚI RANDOM
function spawnMeteor() {
  if (!document.body.classList.contains("dark")) return;
  const container = document.querySelector(".meteor-container");
  const meteor = document.createElement("div");
  meteor.className = "meteor";
  meteor.style.left = `${Math.random() * window.innerWidth}px`;
  meteor.style.top = `${Math.random() * window.innerHeight * 0.4}px`;
  container.appendChild(meteor);
  meteor.addEventListener("animationend", () => meteor.remove());
}
setInterval(() => {
  if (Math.random() > 0.5 && document.body.classList.contains("dark")) {
    spawnMeteor();
  }
}, 6000);
