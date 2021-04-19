// Imports
import {env} from '/js/env.js';

// Sett varriables
let form = document.querySelector("nav form");
let field = form.elements['where'];
let div = document.getElementById('newDiv');
let footer = document.querySelector("footer");
let suppButtonList = [];
let plusButtonList = [];
let allCities = [];

// Sett Local Storage
if (localStorage.getItem('cities')) {
    let storageCities = localStorage.getItem('cities').split(',');
    storageCities.forEach(citie => allCities.push(citie));
    allCities.forEach(citie => {
        fetch('https://api.openweathermap.org/data/2.5/weather?q=' + citie + '&units=metric&appid=' + env.openWeatherKey + '&lang=fr')
        .then(res => res.json())
        .then(result =>{

            createCitieBlock(result, false);
        })
    })
}

// Create citie event
form.addEventListener('submit', research);

// Function for citie research
function research(event) {
    event.preventDefault();
    field.classList.remove('wrong');

    // API request
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + field.value + '&units=metric&appid=' + env.openWeatherKey + '&lang=fr')
    .then(res => res.json())
    .then(result =>{

        if (result.cod == 404) {
            field.classList.add('wrong');
        } else {
            // Create new div
            createCitieBlock(result, true);
        }
    })

}

// Create new div
function createCitieBlock(citieResult, storage) {
    div.innerHTML += 
    '<div class="col-lg-3 ' + citieResult.coord.lat + ' ' + citieResult.coord.lon + '">'
    + '    <div class="card ' + citieResult.name + '">'
    + '        <div class="card-body">'
    + '            <h5 class="card-title">' + citieResult.name + '<img id="wicon" src="http://openweathermap.org/img/w/' + citieResult.weather[0].icon + '.png" alt="Weather icon"></h5>'
    + '            <h6 class="card-subtitle mb-2 text-muted">' + citieResult.sys.country + '</h6>'
    + '            <h4>' + citieResult.main.temp + '°C</h4>'
    + '            <p class="card-text">' + citieResult.weather[0].description + '</p>'
    + '            <button type="button" class="btn btn-primary plus">Plus</button>'
    + '            <button type="button" class="btn btn-outline-danger supp">Supprimer</button>'
    + '        </div>'
    + '    </div>'
    + '</div>'

    // Searching bg-photo with unsplash
    fetch('https://api.unsplash.com/search/photos?query=' + citieResult.name + '&per_page=1&client_id=' + env.unsplashKey)
    .then(res => res.json())
    .then(result => {
        if (result.cod == 404) {
            console.log('error');
        } else {
            // Set block bg-img
            document.querySelectorAll('.' + citieResult.name).forEach(city => 
                city.style.background = ' linear-gradient(rgba(255,255,255,0.8) 0 0), url("' + result.results[0].urls.thumb + '") center/cover');
        }
    })

    if (storage) {
        // Updating local storage
        allCities.push(citieResult.name);
        localStorage.setItem('cities', allCities);
    }

    // Adding listener for btns
    plusButtonList = document.querySelectorAll('.plus');
    suppButtonList = document.querySelectorAll('.supp');
    plusButtonList.forEach(btn => btn.addEventListener('click', seeMore));
    suppButtonList.forEach(btn => btn.addEventListener('click', takeOff));
}

// Delete citie
function takeOff(event) {
    event.target.parentElement.parentElement.parentElement.remove();

    let name = event.target.parentElement.querySelector('h5').innerText;
    allCities.forEach((citie, key) =>{
        if (citie == name) {
            allCities.splice(key, 1);
        }
    })
    localStorage.setItem('cities', allCities);
}

// See more details
function seeMore(event){
    let classes = event.target.parentElement.parentElement.parentElement.className;
    let classesArray = classes.split(' ');
    let weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + classesArray[1] + '&lon=' + classesArray[2] + '&exclude=minutly,alerts&units=metric&appid=' + env.openWeatherKey + '&lang=fr')
    .then(res => res.json())
    .then(result =>{
        let dayInfos = [];
        result.daily.forEach(daily => {
            dayInfos.push({
                dt: daily.dt,
                temp: daily.temp.day,
                min: daily.temp.min,
                max: daily.temp.max,
                icon: daily.weather[0].icon
            })
        })

        let dates = [];
        dayInfos.forEach(info => dates.push(new Date(info.dt * 1000)))

        footer.innerHTML = ''
        dayInfos.forEach((day, key) => {
            let date = dates[key];
            footer.innerHTML +=
            
                '<div class="weekDays">'
                + '    <h5>' + weekDays[date.getDay()] + '<img id="wicon" src="http://openweathermap.org/img/w/' + day.icon + '.png" alt="Weather icon"></h5>'
                + '    <p class="mb-2 text-muted">Le ' + date.getDate() + '/' + date.getMonth() + '</p>'
                + '    <h5>' + day.temp + 'C°</h5>'
                + '    <p>Max : ' + day.max + 'C°</br>'
                + '    Min : ' + day.min + 'C°</p>'
                + '</div>'
        })
        footer.innerHTML += '<i id="closeWeekTemp" class="fas fa-times"></i>'
        footer.classList.add("setFooter");

        // Add event listener to close the week temp
        document.getElementById('closeWeekTemp').addEventListener('click', closeWeekTemp);
        
    })
}

// Close week temp function
function closeWeekTemp(event) {
    event.target.parentElement.innerHTML = '';
    footer.classList.remove("setFooter");
}
