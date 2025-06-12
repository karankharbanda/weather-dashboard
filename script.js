async function getWeather(type){
    const city = document.getElementById('cityInput').value.trim();
    const weatherDiv = document.getElementById('weatherDisplay');
    
    weatherDiv.innerHTML='';
    
    

    const apiKey='6c37fa82293c3a931a680ffa0d29a846';
    let url = "";
    
    if(type === "city"){
        if(!city){
        showError("Please enter a city name");
        return;
        }

        const geoUrl = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const geoData = await geoUrl.json();
       

        if(!geoData.length){
            showError(`No data for ${city} city found`);
            // errorDiv.textContent=`No data for ${city} city found`;
            return;
        }
        const cityName = geoData[0].name;
        const lon = geoData[0].lon;
        const lat = geoData[0].lat;

        url=`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;
        fetchAndShow(url,cityName,lat,lon);
    }

    else if(type === "location"){
        if(!navigator.geolocation){
             showError("Location not found");
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const revUrl = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
            const revdata = await revUrl.json();

            const cityName = revdata[0]?.name || 'Current Location';
            
            url=`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;
            fetchAndShow(url,cityName,lat,lon);
        },
    () => {
         showError("Not able to get location");
    });
    }


    async function fetchAndShow(url,cityName,lat,lon) {
        
    
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`Http error status code:${response.status}`)
        }
        const data = await response.json();


        if(!data.current  || !data.current.weather || !data.current.weather[0] || !data.daily){
            throw new showError("Unexpected error occured")
        }

        const icon = data.current.weather[0].icon;
        const iconurl = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        weatherDiv.innerHTML=`
        <div class="bg-gradient-to-b from-blue-100 to-blue-300 p-3 rounded-lg shadow-lg w-full max-w-md  mx-auto space-y-6"> 
        <div class="text-center">
        <h2 class="text-xl font-semibold">${cityName}</h2>
        <p class = "mb-1 text-gray-600">${data.current.temp}&degC  ${data.current.weather[0].main} (${data.current.weather[0].description})</p>
        <img class="mx-auto" src = "${iconurl}" alt = "Weather Icon" />
        </div>
        <hr class="border-gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-2">Hourly Forecast</h3>
        <div class = "flex overflow-x-auto space-x-4 pb-2">
        ${data.hourly.slice(1,13).map(hour => `
            <div class = "flex-shrink-0 text-center ">
            <p class = "text-sm">${new Date(hour.dt * 1000).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}</p>
            <img class = "mx-auto w-10 h-10" src = "http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt = "Icon">
            <p class = "text-sm">${hour.temp}&degC</p>
            <p class = "text-sm">${hour.wind_speed}m/s</p>
            </div>
            `)}
         </div>
        </div>
        <hr class="border-gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-2">Daily Forecast</h3>
        <div class = "flex overflow-x-auto space-x-6 pb-4  bg-white rounded-lg shadow-lg overflow-hidden p-6">
        ${data.daily.slice(1,6).map(day =>`
            <div class = "flex-shrink-0 text-center bg-blue-300 rounded-lg shadow-lg overflow-hidden w-20">
            <p class = "mb-1"> ${new Date(day.dt * 1000).toLocaleDateString([],{day:'2-digit',month:'short'})}</p>
            <img class = "mx-auto w-10 h-10" src = "https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt = "Icon">
            <p class = "text-sm">${day.temp.day}&degC</p>
            <p class = "text-sm">${day.weather[0].description}</p>
            </div>
            `)}
        </div>
        </div>
        <hr class="border-gray-300">
        <h3 class="text-lg font-semibold mb-2">Temperature</h3>
        <div>
        <p class = "mb-1">Current Temp: ${data.current.temp}&deg;C</p>
        <p class = "mb-1">Feels like: ${data.current.feels_like}&deg;C</p>
        </div>
        
        <hr class="border-gray-300">
        <h3 class="text-lg font-semibold mb-1">Atmosphere</h3>
        <div>
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
        <hr class="border-gray-300">
        <h3 class="text-lg font-semibold mb-1">Sun Timing</h3>
        <div>
        <p class = "mb-1">Sunrise: ${new Date(data.current.sunrise * 1000).toLocaleTimeString()}</p>
        <p class = "mb-1">Sunset: ${new Date(data.current.sunset * 1000).toLocaleTimeString(

        )}</p>
        </div>
        </div>
        `;


    }catch(err){
         console.error("Error",err);
         if(type == 'city'){
         showError(`failed to fetch weather data or city ${city} does not exist`);
         }
         else{
            showError("Failed to fetch the location data at this moment");
         }
    }
}




}

document.getElementById('cityInput').addEventListener('keyup',(event) =>{
    if(event.key === 'Enter'){
        getWeather('city');
    }
});
async function showError(err) {
    const errorDiv = document.getElementById('errorDisplay');
    errorDiv.textContent = err;

    setTimeout(() =>{
        errorDiv.textContent='';
    },5000)
}
