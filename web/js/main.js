import "../css/animations.css";
import "../css/style.css";
import "../css/modal-menu.css";
import "../css/ui-adaptivity.css";
import "../css/colors.css";

import Swiper, { Navigation } from '../../node_modules/swiper';
Swiper.use([Navigation]);

const lvovich = require("../../node_modules/lvovich/dist/lvovich.min.js");

const search_input = document.querySelector(".header-search__search-input");
const search = document.querySelector(".header-search");
const burger = document.querySelector(".menu-burger");
const header_function_menu = document.querySelector(".header-content__function-menu");
const main_menu_remove = document.querySelector(".main-menu-remove");
const animation = document.querySelector(".loading-animation--conteiner");
const notification_cont = document.querySelector(".error-notification");
const notification_button = document.querySelector(".error-notification__button");
const weather_content = document.querySelectorAll(".weather-content");
const document_blocks = document.querySelectorAll(".js-scroll");
const key = '5ba78f463e9dddeead6f1f0cf154d3ca';
const token = 'pk.5458a1a49de64870a499080d6af514dc';

// weater consts
const weather_main = document.querySelector(".weather-main");
const hourly_forecast = document.querySelector(".hourly-forecast__slider-content");
const full_daily_forecast = document.querySelector(".seven-days-foracast-ditails");
const short_daily_forecast = document.querySelector(".seven-day-forecast-short__slider");

const average = (array) => array.reduce((a, b) => a + b) / array.length;

let get_date = (index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);

    if (index != 0) {
        var options = {
            weekday: 'long',
            month: 'long', 
            day: 'numeric' 
        };

        return date.toLocaleDateString('ru-RU', options);
    } else {
        var options = {
            month: 'long', 
            day: 'numeric' 
        };

        return `завтра, ${date.toLocaleDateString('ru-RU', options)}`;
    }
}

let dt_conventer = (dt, is_utc) => {

    const settings = JSON.parse(localStorage.getItem("document-settings"));

    let options = {
        hour12: false,
        hour: '2-digit',
        minute:'2-digit'
    }

    if (!isNaN(settings)) {
        return;
    }

    if (settings["time-format"] == "12h") {
        options.hour12 = true;
    }

    if (is_utc) {
        let date = new Date((dt - 180*60)*1000);
        return date.toLocaleDateString('ru-RU', options).split(", ")[1];
    } else {
        let date = new Date(dt*1000);
        return date.toLocaleDateString('ru-RU', options).split(", ")[1];
    }

}

let array_min = (arr) => {
    return arr.reduce(function (p, v) {
        return ( p < v ? p : v );
    });
}

let array_max = (arr) => {
    return arr.reduce(function (p, v) {
        return ( p > v ? p : v );
    });
}

let set_temp = (temp_k) => {
    let temp = 0;
    const settings = JSON.parse(localStorage.getItem("document-settings"));
    const temp_mode = settings["units"]["temp"];

    if (temp_mode == "c") {
        temp = Math.round(temp_k - 273.15);
    } else if (temp_mode == "f") {
        temp = Math.round((temp_k - 273.15) * 9/5 + 32);
    } else if (temp_mode == "k") {
        temp = Math.round(temp_k);
    }

    let temp_ret = "";

    if (temp > 0) {
        temp_ret = `+${temp}`;
    } else {
        temp_ret = temp;
    }

    return temp_ret;
}

let set_temp_atr = () => {
    const temp_elements = document.querySelectorAll(".weather-main__temp-block, .day-card__temp, .day-info-block-day-time__temp, .slider-block__temp, .weather-main__self-temp-block");
    const settings = JSON.parse(localStorage.getItem("document-settings"));

    temp_elements.forEach(element => {
        element.classList.add(settings["units"]["temp"]);
    });
}

let set_speed = (speed) => {
    const settings = JSON.parse(localStorage.getItem("document-settings"));
    const speed_mode = settings["units"]["speed"];

    if (speed_mode == "mps") {
        return Math.round(speed);
    } else if (speed_mode == "kmph") {
        return Math.round(speed * 3.6);
    } else if (speed_mode == "milph") {
        return Math.round(speed * 2.23694);
    }
}

let set_speed_atr = () => {
    const temp_elements = document.querySelectorAll(".weather-main__wind-block, .day-card__wind-block, .day-info-block-day-time__wind");
    const settings = JSON.parse(localStorage.getItem("document-settings"));

    temp_elements.forEach(element => {
        element.classList.add(settings["units"]["speed"]);
    });
}

let set_pressure = (pressure) => {
    const settings = JSON.parse(localStorage.getItem("document-settings"));
    const speed_mode = settings["units"]["pressure"];

    if (speed_mode == "mm-rt") {
        return Math.round(pressure * 0.75);
    } else if (speed_mode == "hpa") {
        return pressure;
    } else if (speed_mode == "atm") {
        return Math.round(pressure * 0.75 / 760.002 * 10**5) / 10**5;
    }
}

let set_pressure_atr = () => {
    const temp_elements = document.querySelectorAll(".weather-main__pressure-block, .day-info-block-day-time__pressure");
    const settings = JSON.parse(localStorage.getItem("document-settings"));

    temp_elements.forEach(element => {
        element.classList.add(settings["units"]["pressure"]);
    });
}

const convent_dt_txt = (dt) => {
    let hours = dt.split(" ")[1];
    let time = hours.split(":");
    return `${time[0]}:${time[1]}`;
}

let set_icon = (index) => {
    return `./icons/weather_icons/${index}.svg`;
}

let update_page = () => {
    const slider_blocks = document.querySelectorAll(".slider-block, .day-info-block, .day-card");

    slider_blocks.forEach(element => {
        element.remove();
    });

    document_blocks.forEach(element => {
        element.classList.add("disactive");
    });
    animation.classList.remove("disactive");
    notification_cont.classList.add("disactive");
}

let construct_date = () => {

    const settings = JSON.parse(localStorage.getItem("document-settings"));

    let options = {
        hour12: false,
        hour: '2-digit',
        minute:'2-digit'
    }

    if (!isNaN(settings)) {
        return;
    }

    if (settings["time-format"] == "12h") {
        options.hour12 = true;
    }

    const date = new Date();
    return date.toLocaleDateString('ru-RU', options).split(", ")[1];
}

function transfer_time_from_settings_to_ms() {
    const settings = JSON.parse(localStorage.getItem("document-settings"));

    if (!isNaN(settings)) {
        throw new Error("Settings not found");
    }

    let settings_data = settings["data-update"];
    let time_type = settings_data.match(/s|min|h/)[0];
    if (time_type) {
        let time_count = settings_data.split(time_type)[0];

        switch (time_type) {
            case "s":
                return +time_count * 1000;
                break;
            case "min":
                return +time_count * 1000 * 60;
                break;
            case "h":
                return +time_count * 1000 * 3600;
                break;
            default:
                throw new Error("Another time type or no time type");
        }
    } else {
        throw new Error("Another time type or no time type");
    }
}   

function generate_err_notification(err, place="none") {
    weather_content.forEach(element => {
        element.classList.add("disactive")
    });
    const notification_label = document.querySelector(".error-notification__label");

    const old_notification_button = document.querySelector(".error-notification__button");
    const new_notification_button = notification_button.cloneNode(true);
    old_notification_button.parentNode.replaceChild(new_notification_button, old_notification_button);

    new_notification_button.classList.remove("search", "location");
    notification_cont.classList.remove("not-found", "geolocation")
    animation.classList.add("disactive");

    switch (err) {
        case "geolocation":
            notification_cont.classList.remove("disactive");
            notification_cont.classList.add("geolocation");
            notification_label.textContent = "Не удалось определить ваше местоположение";
            new_notification_button.classList.add("search");
            new_notification_button.textContent = "Перейти к поиску";

            new_notification_button.addEventListener("click", () => {
                search_input.focus();
            });

            break;
        case "not-found":
            notification_cont.classList.remove("disactive");
            notification_cont.classList.add("not-found");
            notification_label.textContent = `Не удалось найти город "${place}"`;
            new_notification_button.classList.add("location");
            new_notification_button.textContent = "Определить местоположение";

            new_notification_button.addEventListener("click", () => {
                update_page();
                get_user_location();
            });
            break;
        default:
            throw new Error("Anonimus error in error notification");
    }
}

let generate_short_daily_forecast = (arr) => {

    const mode = (arr) => {
        return arr.sort((a,b) =>
              arr.filter(v => v===a).length
            - arr.filter(v => v===b).length
        ).pop();
    }

    let add_new_day_date = (index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);

        let options = {
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('ru-RU', options);
    }

    let add_week_day = (index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);

        if (index != 0) {
            var options = { 
                weekday: 'long',
            };
            return date.toLocaleDateString('ru-RU', options);
        } else {
            return "завтра";
        }
    }

    let set_min_max_temp = (arr) => {
        return `${set_temp(array_max(arr))} / ${set_temp(array_min(arr))}`;
    }

    let icon_arr = [];
    let temp_arr = [];
    let wind_arr = [];
    let humidity_arr = [];
    let status_arr = [];
    let date_counter = 0;

    let day_data = [];
    for (let i = 0; i < arr.length; i++) {
        day_data.push(arr[i]);
        
        if (day_data.length == 8 && i == 7) {
            day_data = [];
        }
        if (day_data.length > 0) {
            if (convent_dt_txt(day_data[day_data.length - 1].dt_txt) == "21:00" && day_data.length < 8) {
                day_data = [];
            }
        }

        if (day_data.length == 8) {
            day_data.forEach(element => {
                icon_arr.push(element.weather[0].icon);
                temp_arr.push(element.main.temp);
                wind_arr.push(set_speed(element.wind.speed));
                humidity_arr.push(element.main.humidity);
                status_arr.push(element.weather[0].description);
            });
            const forecast_element = document.createElement("a");
            forecast_element.className = "day-card swiper-slide main-focusable";
            forecast_element.tabIndex = "0";
            forecast_element.href = `#day-info-block-${date_counter}`;
            forecast_element.innerHTML = `
            <div class="day-card__label--conteiner">
                <span class="day-card__label">
                    ${add_week_day(date_counter)}
                </span>
                <span class="day-card__date">
                    ${add_new_day_date(date_counter)}
                </span>
            </div>
            <span class="day-card__weather-icon" style="background-image: url('./icons/weather_icons/${mode(icon_arr)}.svg');"></span>
            <span class="day-card__status">${mode(status_arr)}</span>
            <div class="day-card__main-info">
                <span class="day-card__temp-block">
                    <span class="day-card__temp">${set_min_max_temp(temp_arr)}</span>
                </span>
            </div>
            <div class="day-card__second-block">
                <span class="day-card__wind">
                    <span class="day-card__wind-block">${Math.round(average(wind_arr))}</span>
                </span>
                <span class="day-card__humidity">
                    <span class="day-card__humidity-block">${Math.round(average(humidity_arr))}</span>
                </span>
            </div>
            `;

            day_data = [];
            icon_arr = [];
            temp_arr = [];
            wind_arr = [];
            humidity_arr = [];
            date_counter++;

            short_daily_forecast.append(forecast_element);
        }
    }
    link_scroll();

    let four_day_forecast_slider = new Swiper(".seven-day-forecast-short__content", {
        slidesPerView: 7,
        spaceBetween: 10,
        breakpoints: {
            280: {
                slidesPerView: 2
            },
            680: {
                slidesPerView: 3
            },
            850: {
                slidesPerView: 4
            },
            950: {
                slidesPerView: 4
            },
            1175: {
                slidesPerView: 2
            },
            1225: {
                slidesPerView: 3
            },
            1350: {
                slidesPerView: 4
            }
        }
    });
}

function generate_hourly_forecast(arr) {

    const add_new_day_date = (element, index) => {
        let date = new Date();
        date.setDate(date.getDate() + index);

        let options = {
            month: 'numeric', 
            day: 'numeric' 
        };

        let date_element = document.createElement("span");
        date_element.className = "slider-date";
        date_element.textContent = date.toLocaleDateString('ru-RU', options);
        element.append(date_element);
    }

    const settings = JSON.parse(localStorage.getItem("document-settings"));

    let counter = 1;
    arr.forEach(element => {
        let content = document.createElement("div");
        let time_data = "";
        arr[0] != element ? time_data = dt_conventer(element.dt, true) : time_data = construct_date();

        content.innerHTML = `
        <span class="slider-block__time">${time_data}</span>
        <span class="slider-block__status-icon" style="background-image: url(${set_icon(element.weather[0].icon)});"></span>
        <span class="slider-block__temp-block">
            <span class="slider-block__temp">${set_temp(element.main.temp)}</span>
        </span>
        `;
        hourly_forecast.append(content);
        if ((dt_conventer(element.dt, true) == "00:00" || dt_conventer(element.dt, true) == "00:00 AM") && arr[0] != element) {
            
            content.className = "new-day slider-block swiper-slide";
            add_new_day_date(content, counter);
            counter++;
        } else {
            content.className = "slider-block swiper-slide";
        }        
    });

    let time_block_elements = document.querySelectorAll(".slider-block__time");

    time_block_elements.forEach(element => {
        settings["time-format"] == "12h" ? element.classList.add("h12") : void(0);
    });

    const swiper_hourly_foresast = new Swiper(".hourly-forecast__slider-block", {
        slidesPerView: "auto",
        spaceBetween: 10,
        slidesPerGroup: 3,
        keyboard: {
            enabled: true,
          },
        navigation: {
            nextEl: '.hourly-forecast__right-button',
            prevEl: '.hourly-forecast__left-button',
        }
    });
}

function generate_full_daily_forecast(arr) {
    let day_data = [];
    let counter_data = 0;
    for (let i = 0; i < arr.length; i++) {
        day_data.push(arr[i]);
        
        if (day_data.length == 8 && i == 7) {
            day_data = [];
        }
        if (day_data.length > 0) {
            if (convent_dt_txt(day_data[day_data.length - 1].dt_txt) == "21:00" && day_data.length < 8) {
                day_data = [];
            }
        }

        if (day_data.length == 8) {

            const forecast_day = document.createElement("section");
            forecast_day.className = "day-info-block js-scroll";
            forecast_day.id = `day-info-block-${counter_data}`;

            forecast_day.innerHTML = `
            <h2 class="info-name-block">
            <div class="info-name-block__day-info">
                <span class="info-name-block__week-day">${get_date(counter_data)}</span>
            </div>
            </h2>
            <div class="day-info-block-content">
                <div class="day-info-block-content__block"></div>
                <div class="day-info-block-content__other"></div>
            </div>
            `;
            full_daily_forecast.append(forecast_day);

            const day_info_content = document.querySelectorAll(".day-info-block-content__block");

            let counter_data_1 = 0;
            let counter_data_2 = 1;
            const day_time_arr = ["Ночью", "Утром", "Днём", "Вечером"];

            for (let i = 0; i < 4; i++) {
                const day_info_block_time = document.createElement("div");
                day_info_block_time.className = "day-info-block-day-time";
                day_info_block_time.innerHTML = `
                <span class="day-info-block-day-time__label">${day_time_arr[i]}</span>
                <div class="day-info-block-day-time__content">
                    <div class="day-info-block-day-time__info-block-1">
                        <span class="day-info-block-day-time__temp">${set_temp(Math.round(average([day_data[counter_data_1].main.temp, day_data[counter_data_2].main.temp])))}</span>
                        <span class="day-info-block-day-time__status">
                            <span class="day-info-block-day-time__icon" style="background-image: url('${set_icon(day_data[counter_data_2].weather[0].icon)}')"></span>
                            ${day_data[counter_data_2].weather[0].description}
                        </span>
                    </div>
                    <div class="day-info-block-day-time__info-block-2">
                        <span class="day-info-block-day-time__wind">${Math.round(average([set_speed(day_data[counter_data_1].wind.speed), set_speed(day_data[counter_data_1].wind.speed)]))}</span>
                        <span class="day-info-block-day-time__humidity">${Math.round(average([day_data[counter_data_1].main.humidity, day_data[counter_data_2].main.humidity]))}</span>
                        <span class="day-info-block-day-time__pressure">${Math.round(average([set_pressure(day_data[counter_data_1].main.pressure), set_pressure(day_data[counter_data_2].main.pressure)]))}</span>
                    </div>
                </div>
                `;

                day_info_content[counter_data].append(day_info_block_time);
                counter_data_1 += 2;
                counter_data_2 += 2;
            }

            counter_data++;
            day_data = [];
        }
    }
}

let set_round_data = (element_sp, data) => {
    const element_data = document.querySelector(`.weather-ditails__data.${element_sp}`);
    const round = document.querySelector(`#${element_sp}`);

    element_data.textContent = data;

    if (data) {
        round.style = `stroke-dasharray: ${250*(data/100)} 400;`;
    } else {
        round.style = "stroke: transparent;";
    }
}

let set_dt = (data) => {
    const sunrise = document.querySelector(".sinrise-sunset__sunrise-time");
    const sunset = document.querySelector(".sinrise-sunset__sunset-time");

    sunrise.textContent = dt_conventer(data.city.sunrise, false);
    sunset.textContent = dt_conventer(data.city.sunset), false;
}

async function getWeather(place, key) {
    update_page();
    return await fetch(`https://api.openweathermap.org/data/2.5/forecast/?q=${place}&appid=${key}&lang=ru&cnt=40`)
}

function display_weather(place) {;
    if (!place) {
        return;
    }

    getWeather(place, key)  
    .then(function(resp) { return resp.json() })
    .then(function(data) {

        let latest_towns = JSON.parse(sessionStorage.getItem("latest-towns"));
        if (isNaN(latest_towns)) {
            if (latest_towns[length-1] != place) {
                latest_towns.push(place);
                sessionStorage.setItem("latest-towns", JSON.stringify(latest_towns));
            }
        } else {
            try {
                latest_towns.push(place);
                sessionStorage.setItem("latest-towns", JSON.stringify(latest_towns));
            } catch {}
        }
        const slider_blocks = document.querySelectorAll(".slider-block, .day-info-block, .day-card");
        slider_blocks.forEach(element => {
            element.remove();
        });

        weather_content.forEach(element => {
            element.classList.remove("disactive")
        });
        document_blocks.forEach(element => {
            element.classList.remove("disactive");
        });

        var weather_now = data.list[0];
        let predict = "";
        place.toLowerCase().match(/^в[с\з\ч\щ\к\м\л\ж\т\м\г\д\н\п\р\х]/) ? predict = "во" : predict = "в";
        place.toLowerCase().match(/[a-z]|^[0-9]/) ? predict = "в городе" : void(0);

        construct_date();
        weather_main.innerHTML = `
        <div class="weather-main__text">
            <h2 class="weather-main__label">
                Погода ${predict}
                <span class="weather-main__town">${lvovich.cityIn(place)}</span>
            </h2>
            Данные на
            <span class="weather-main__time">${construct_date()}</span>
        </div>
        <div class="weather-main__content">
            <span class="weather-main__temp">
                <span class="weather-main__temp-block" id="temp">${set_temp(weather_now.main.temp)}</span>
            </span>
            <div class="weather-main__status">
                <img src="${set_icon(weather_now.weather[0].icon)}" class="weather-main__staus-icon" alt>
                <span class="weather-main__status-block">${weather_now.weather[0].description}</span>
                <div class="weather-main__self-temp">
                    <span class="weather-main__self-temp--label">Ощущается как </span>
                    <span class="weather-main__self-temp-block">${set_temp(weather_now.main.feels_like)}</span>
                </div>
            </div>
        </div>
        <div class="weather-main__second-block">
            <span class="weather-main__wind">
                <span class="weather-main__wind-block">${set_speed(weather_now.wind.speed)}</span>
            </span>
            <span class="weather-main__humidity">
                <span class="weather-main__humidity-block">${weather_now.main.humidity}</span>
            </span>
            <span class="weather-main__pressure">
                <span class="weather-main__pressure-block">${set_pressure(weather_now.main.pressure)}</span>
            </span>
        </div>
        `;

        set_dt(data);
        set_round_data("clouds", weather_now.clouds.all);
        set_round_data("pop", weather_now.pop*100);
        generate_hourly_forecast(data.list);
        generate_short_daily_forecast(data.list);
        generate_full_daily_forecast(data.list);
        document_scroll();
        set_temp_atr();
        set_speed_atr();
        set_pressure_atr();
    })
    .catch(() => {
        generate_err_notification("not-found", place);
    })
    .finally(() => {
        animation.classList.add("disactive");
    })
}

function recommend_towns_event(event) {
    let target = event.target;

    if (target.classList.contains("modal-block__recommend-button")) {
        display_weather(target.value);
        console.dir(target)

        search_input.value = target.value;
    }
}

function remove_towns_search() {
    let favorite_towns_ = document.querySelectorAll(".modal-block__recommend-button");
    favorite_towns_.forEach(element => {
        element.remove();
    });
}

function favorite_towns_search(value) {
    const search_modal = document.querySelector(".modal-header-search");
    let favorite_towns = JSON.parse(localStorage.getItem("favorite-towns"));

    if (!isNaN(favorite_towns)) {
        return;
    }

    let favorite_towns_arr = [];
    let modal_block_content = document.querySelector(".modal-block__content");

    favorite_towns.forEach(element => {
        let favorite_town = element.name.toLowerCase();

        if (favorite_town.includes(value.toLowerCase())) {
            favorite_towns_arr.push(element.name);
        }
    });

    favorite_towns_arr.forEach(element => {
        let town = document.createElement("button");
        town.className = "modal-block__recommend-button";
        town.innerText = element;
        town.value = element;

        modal_block_content.appendChild(town);
    });

    if (favorite_towns_arr.length > 0) {
        search_modal.classList.add("active");
    } else {
        search_modal.classList.remove("active");
    }
}

function searchF(value) {
    const is_search = JSON.parse(sessionStorage.getItem("search"));
    const weater_interval = JSON.parse(sessionStorage.getItem("weather-interval"));
    const settings = JSON.parse(localStorage.getItem("document-settings"));

    clearInterval(weater_interval);

    if (!isNaN(is_search) && !isNaN(weater_interval) && is_search) {
        value === "" ? get_user_location() : void(0);
        display_weather(value);
        
        if (settings["data-update"] != "disable") {
            const weather_interval_2 = setInterval(() => {
                display_weather(value);
            }, transfer_time_from_settings_to_ms());

            sessionStorage.setItem("weather-interval", JSON.stringify(weather_interval_2));
        }

        sessionStorage.setItem("search", JSON.stringify(false));

        setTimeout(() => {
            sessionStorage.setItem("search", JSON.stringify(true));
        }, 700);
    }
}

function search_event() {
    sessionStorage.setItem("search", JSON.stringify(true));
    const search_input = document.querySelector(".header-search__search-input");
    const search_button = document.querySelector(".header-search__search-button");
    const search_modal = document.querySelector(".modal-header-search");
    const modal_bar = document.querySelector(".modal-block");

    modal_bar.addEventListener("mousedown", (event) => {
        recommend_towns_event(event)
    });

    search_input.addEventListener("keydown", (event) => {
        if (event.keyCode == 13) {
            searchF(search_input.value);
        }
    });

    search_input.addEventListener("input", () => {
        if (search_input.value) {
            remove_towns_search();
            favorite_towns_search(search_input.value);
        } else {
            search_modal.classList.remove("active");
        }
    });

    search_input.addEventListener("focus", () => {
        if (search_input.value) {
            remove_towns_search();
            favorite_towns_search(search_input.value);
        }
    });

    search_input.addEventListener("blur", () => {
        search_modal.classList.remove("active");
    });

    search_button.addEventListener("click", () => {
        searchF(search_input.value);
    });
}

function night_mode_select_event() {
    const night_mode_inputs = document.querySelectorAll(".dark-mode-form__button-input");

    night_mode_inputs.forEach(element => {
        element.addEventListener("change", () => {
            console.log(1);
            const settings = JSON.parse(localStorage.getItem("document-settings"));

            if (!isNaN(settings)) {
                return;
            }


            settings["night-mode"] = element.value;
            localStorage.setItem("document-settings", JSON.stringify(settings));

            get_user_theme();
        });
    });
}

function document_events() {

    sessionStorage.setItem("latest-towns", JSON.stringify([]));

    
    addEventListener('DOMContentLoaded', () => {
        search_event();
        get_user_theme();
        night_mode_select_event();
    });

    search_input.addEventListener("focus", function() {
        search.classList.add("header-search--active");
    });

    search_input.addEventListener("blur", function() {
        search.classList.remove("header-search--active");
    });

    search_input.addEventListener("keydown", function(event) {
        if (event.keyCode == 27) {
            search_input.blur();
        }
    });

    addEventListener("keydown", function(event) {
        if (event.keyCode == 111) {
            setTimeout(() => {
                search_input.focus();
            }, 10);
        }
    });
}

function link_scroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(element) {
            element.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

let element_in_view = (element, margin) => {
    const element_top = element.getBoundingClientRect().top;
    
    return (
        element_top <= (window.innerHeight - margin || document.documentElement.clientHeight)
    );
    };

let display_scroll_element = (element) => {
    element.classList.add("scrolled");
    element.classList.remove("not-scrolled");
};

let hide_scroll_element = (element) => {
    element.classList.add("not-scrolled");
}

let handle_scroll_animation = (scrollEl) => {
    scrollEl.forEach((element) => {
        if (element_in_view(element, 0)) {
            display_scroll_element(element);
        } else {
            hide_scroll_element(element);
        }
    })
}

function document_scroll() {	
    const scrollElements = document.querySelectorAll(".js-scroll");

    scrollElements.forEach((element) => {
        element.classList.add("not-scrolled");
    });

    window.addEventListener("scroll", () => {
        handle_scroll_animation(scrollElements);
    });

    handle_scroll_animation(scrollElements);
}

function success(pos) {
    const crd = pos.coords;

    get_city(crd.latitude, crd.longitude);
    search_input.value = "";
}

function error() {
    generate_err_notification("geolocation");
}

function get_user_location() {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
}

function get_city(lat, lng) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', `https://us1.locationiq.com/v1/reverse.php?key=${token}&lat=${lat}&lon=${lng}&format=json`, true);
    xhr.send();
    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            let place = "";
    
            if (response.address.town) {
                place = response.address.town;
            } else {
                place = response.address.city;
            }
     
            const settings = JSON.parse(localStorage.getItem("document-settings"));
    
            display_weather(place);
    
            if (settings["data-update"] != "disable") {
                const weather_interval = setInterval(() => {
                    display_weather(place);
                }, transfer_time_from_settings_to_ms());
    
                sessionStorage.setItem("weather-interval", JSON.stringify(weather_interval));
            }
        }
    }, false);
}


// Don't use "load" event
document_events();
get_user_location();


export { burger, header_function_menu, key, update_page, display_weather, transfer_time_from_settings_to_ms }