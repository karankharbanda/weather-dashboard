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

        const geoUrl = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const geoData = await geoUrl.json();
        const cityName = geoData[0].name;

        if(!geoData.length){
            errorDiv.textContent=`No data for ${city} city found`;
            return;
        }
        const lon = geoData[0].lon;
        const lat = geoData[0].lat;

        url=`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;
        fetchAndShow(url,cityName,lat,lon);
    }

    else if(type === "location"){
        if(!navigator.geolocation){
             errorDiv.textContent = "Location not found";
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const revUrl = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
            const revdata = await revUrl.json();

            const cityName = revdata[0]?.name || 'Current Location';
            
            url=`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;
            fetchAndShow(url,cityName,lat,lon);
        },
    () => {
         errorDiv.textContent = "Not able to find your location. ";
    });
    }


    async function fetchAndShow(url,cityName,lat,lon) {
        
    
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Http error status code:${response.status}`)
        }
        const data = await response.json();


        if(!data.current  || !data.current.weather || !data.current.weather[0]){
            throw new Error("Unexpected error occured")
        }

        const icon = data.current.weather[0].icon;
        const iconurl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        weatherDiv.innerHTML=`
        <div class="bg-blue-300 p-3 rounded-lg shadow-lg w-full max-w-md mx-auto space-y-6"> 
        <div class="text-center">
        <h2 class="text-xl font-semibold">${cityName}</h2>
        <p class = "mb-4 text-gray-600">Weather: ${data.current.weather[0].main} (${data.current.weather[0].description})</p>
        <img class="mx-auto" src = "${iconurl}" alt = "Weather Icon" />
        </div>
        <hr class="border-gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-2">Temperature</h3>
        <p class = "">Current Temp: ${data.current.temp}&deg;C</p>
        <p class = "mb-1">Feels like: ${data.current.feels_like}&deg;C</p>
        
        </div>
        <hr class="border-gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-1">Atmosphere</h3>
        <p class = "mb-1">Humidity: ${data.current.humidity}%</p>
        <p class = "mb-1">Pressure: ${data.current.pressure} hPa</p>
        <p class = "mb-1">Visibility: ${data.current.visibility / 1000} km</p>
        </div>
        <hr class="border-gray-300">
        <h3 class="text-lg font-semibold mb-1">Wind And Location</h3>
        <div>
        <p class = "mb-1">Wind Speed: ${data.current.wind_speed}m/s</p>
        <p class = "mb-1">Coordinates: ${lat},${lon}</p>
        </div>
        </div>
        `;

    }catch(err){
         errorDiv.textContent = `failed to fetch weather data or city ${city} does not exist`;
    }
}
}

document.getElementById('cityInput').addEventListener('keyup',(event) =>{
    if(event.key === 'Enter'){
        getWeather('city');
    }
});
