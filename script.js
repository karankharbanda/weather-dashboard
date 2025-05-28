async function getWeather(type){
    const city = document.getElementById('cityInput').value.trim();
    const weatherDiv = document.getElementById('weatherDisplay');
    const errorDiv = document.getElementById('errorDisplay');
    weatherDiv.innerHTML='';
    errorDiv.innerHTML='';

    const apiKey='6c37fa82293c3a931a680ffa0d29a846';
    let url = "";
    
    if(type === "city"){
        if(!city){
        errorDiv.textContent = "Please enter a city name";
        return;
        }
        url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        fetchAndDisplay(url);
    }

    else if(type === "location"){
        if(!navigator.geolocation){
             errorDiv.textContent = "Location not found";
            return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            url=`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            fetchAndDisplay(url);
        },
    () => {
         errorDiv.textContent = "Not able to find your location. ";
    });
    }
    

    async function fetchAndDisplay(url) {
        
    
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Http error status code:${response.status}`)
        }
        const data = await response.json();

        if(data.cod !== 200){
              errorDiv.textContent = data.message;
        }

        if(!data.weather || !data.weather[0]){
            throw new Error("Unexpected error occured")
        }

        const icon = data.weather[0].icon;
        const iconurl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        weatherDiv.innerHTML=`
        <div class="bg-blue-300 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto space-y-6"> 
        <div class="text-center">
        <h2 class="text-xl font-semibold mb-4">${data.name},${data.sys.country}</h2>
        <p class = "mb-4 text-gray-600">Weather: ${data.weather[0].main} (${data.weather[0].description})</p>
        <img class="mx-auto mb-2" src = "${iconurl}" alt = "Weather Icon" />
        </div>
        <hr class="border=gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-2">Temperature</h3>
        <p class = "mb-1">Current: ${data.main.temp}&deg;C</p>
        <p class = "mb-1">Feels like: ${data.main.feels_like}&deg;C</p>
        <p class = "mb-1">Max: ${data.main.temp_min}&deg;C</p>
        <p class = "mb-1">Min: ${data.main.temp_max}&deg;C</p>
        </div>
        <hr class="border-gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-1">Atmosphere</h3>
        <p class = "mb-1">Humidity: ${data.main.humidity}%</p>
        <p class = "mb-1">Pressure: ${data.main.pressure} hPa</p>
        <p class = "mb-1">Visibility: ${data.visibility / 1000} km</p>
        </div>
        <hr class="border-gray-300">
        <h3 class="text-lg font-semibold mb-1">Wind And Location</h3>
        <div>
        <p class = "mb-1">Wind: ${data.wind.speed}m/s</p>
        <p class = "mb-1">Coordinates: ${data.coord.lat},${data.coord.lon}</p>
        </div>
        </div>
        `;

    }catch(err){
         errorDiv.textContent = "failed to fetch weather data";
    }
}
}
