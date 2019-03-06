var ipResponse;
var weatherResponse;
var infoBox = document.getElementById('descriptionText');

var cityInput = document.getElementById('cityInput');
var countryInput = document.getElementById('countryInput');

var loading;

var loadingText = document.getElementById('loading');

var cityError = document.getElementById('errorCity');
var countryError = document.getElementById('errorCountry');
var emptyError = document.getElementById('errorEmpty');

// Generic http request promise function
function Request(options) {
    return new Promise(function (resolve, reject) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.open(options.method, options.url);
        httpRequest.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(httpRequest.response);
            } else {
                reject({
                    status: this.status,
                    statusText: httpRequest.statusText
                });
            }
        };
        httpRequest.onerror = function () {
            reject({
                status: this.status,
                statusText: httpRequest.statusText
            });
        };

        // Set headers
        if (options['header']) {
            Object.keys(options.headers).forEach(function (key) {
                httpRequest.setRequestHeader(key, options.headers[key]);
            });
        }

        let params = options['params'];
        if (params && typeof params === 'object') {
            params = Object.keys(params).map(function(key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
            }).join('&');
        }
        httpRequest.send(params);
    });
}

// On click functionality for 'MyLocation'
function checkIp() {
    resetError();
    if(!loading) {
        clearData();
        toggleLoading();
        getIp();
    }
}

// On click functionality for 'Search'
function searchCity() {
    resetError();
    if(!loading) {
        clearData();
        // Empty input validation
        if (!countryInput.value && !cityInput.value) {
            toggleEmptyError();
            return false;
        }
        // Country input validation
        let searchInput = getSearchInput();
        // On successful validation, call API
        if(searchInput) {
            toggleLoading();
            getWeather(searchInput, false);
        } else {
            console.error('Invalid country');
            // Toggle red text error message
            toggleCountryError();
        }
    }
}

// API call that checks current IP address and calls the weather API below
function getIp() {
    Request({
        'method': 'GET',
        'url': `https://cors-anywhere.herokuapp.com/https://ipinfo.io/json${config.appIdIp}`
    }).then(function(data) {
        data = JSON.parse(data);
        ipResponse = data;
        getWeather(`${data['city']},${data['country']}`, true);
    }, function (error) {
        console.log(error);
        // Toggle red text error
        toggleLoading();
    });
}

// API call that checks weather then displays information
function getWeather(params, withIp) {
    Request({
        'method': 'GET',
        'url': `https://api.openweathermap.org/data/2.5/weather?q=${params}${config.appIdWeather}`
    }).then(function(data) {
        data = JSON.parse(data);
        weatherResponse = data;

        toggleLoading();
        displayInformation(withIp);
        clearInput();
    }, function (error) {
        console.log(error);
        // Toggle red text error
        toggleLoading();
        toggleCityError();
    });
}

// Add information to the DOM
function displayInformation(withIp) {
    // Subtract 273.15 to convert Kelvins into Celsius
    let celsius = parseInt(weatherResponse['main']['temp']) - 273.15;

    addToDOM('div', infoBox, 'locationInfo', 'flex-wrap row');
    let locationInfo = document.getElementById('locationInfo');

    if(withIp) {
        addToDOM('span', locationInfo, null, 'row capitalize',
            `Detected IP Address: ${ipResponse['ip']}`);
        addToDOM('span', locationInfo, null, 'row capitalize',
            `IP Address City: ${ipResponse['city']}`);
        addToDOM('span', locationInfo, null, 'row capitalize',
            `IP Address Country: ${ipResponse['region']}`);
    } else {
        addToDOM('span', locationInfo, null, 'row capitalize',
            `Input City: ${cityInput.value}`);
        // We can just find a way to print the country because it was already validated
        addToDOM('span', locationInfo, null, 'row capitalize',
            `Input Country: ${getCountryName(countryInput.value)}`);
    }
    addToDOM('div', infoBox, 'weatherInfo', 'flex-wrap row');
    let weatherInfo = document.getElementById('weatherInfo');
    addToDOM('span', weatherInfo, null, 'row',
        `Temperature: ${celsius.toFixed(2)}°C`);
}

function addToDOM(tagName, parentNode, id, className, text) {
    let tag = document.createElement(tagName);
    if(text) {
        tag.appendChild(document.createTextNode(text));
    }
    if(id) {
        tag.id = id;
    }
    if(className) {
        tag.className = className;
    }
    parentNode.appendChild(tag);
}

function getSearchInput() {
    let countryCode;
    if(this.countryInput.value.length > 2) {
        countryCode = getCountryCode(this.countryInput.value);
        if(!countryCode) {
            return false
        }
    } else if (this.countryInput.value.length < 2) {
        return false;
    } else {
        countryCode = this.countryInput.value;
    }
    return `${this.cityInput.value},${countryCode}`
}

function resetError() {
    if(!emptyError.classList.contains('hidden')) {
        emptyError.classList.toggle('hidden');
    }
    if(!cityError.classList.contains('hidden')) {
        cityError.classList.toggle('hidden');
    }
    if(!countryError.classList.contains('hidden')) {
        countryError.classList.toggle('hidden');
    }
}

function clearData() {
    let locationInfo = document.getElementById('locationInfo');
    let weatherInfo = document.getElementById('weatherInfo');
    if(locationInfo) {
        locationInfo.parentNode.removeChild(locationInfo);
    }
    if(weatherInfo) {
        weatherInfo.parentNode.removeChild(weatherInfo);
    }
}

function clearInput() {
    cityInput.value = '';
    countryInput.value = '';
}

function toggleLoading() {
    loadingText.classList.toggle('hidden');
    loading = !loading;
}

function toggleCityError() {
    cityError.classList.toggle('hidden');
}

function toggleCountryError() {
    countryError.classList.toggle('hidden');
}

function toggleEmptyError() {
    emptyError.classList.toggle('hidden');
}
