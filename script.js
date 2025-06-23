const indiaData ={
    "Uttar Pradesh":["Lucknow","Kanpur","Varanasi","Agra,Noida"],
    "Maharashtra":["Mumbai","Pune","Nagpur","Nashik","Thane"],
    "Punjab":["Ludhiana","Amritsar","Jalandhar","Bathinda","Tarantaran"],
    "West Bengal":["Kolkata","Howrah","Durgapur","Asansol","siliguri"]
};
 const stateSelect = document.getElementById("stateSelect");
 const citySelect = document.getElementById("citySelect");
 const cityInput = document.getElementById("cityInput");

 function states(){
    stateSelect.innerHTML=`<option value = "">Select State</option>`;
    Object.keys(indiaData).forEach(state =>{
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
 }
 function cities(state){
    citySelect.innerHTML=`<option value = "">Select City</option>`;
    indiaData[state].forEach(city =>{
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
 }

 stateSelect.addEventListener("change",()=>{
    const selectedState = stateSelect.value;
    if(selectedState && indiaData[selectedState]){
        cities(selectedState);

    }else{
        citySelect.innerHTML = `<option value = "">Select City</option>`;
    }

 });

 citySelect.addEventListener("change",()=>{
    cityInput.value = citySelect.value;
    console.log("slected city",cityInput.value);
    getWeather('city');
 })

 states();


 
async function getWeather(type){
    const cityInputValue = document.getElementById('cityInput').value.trim();
    const mulCities = cityInputValue.split(',').map(city => city.trim()).filter(i => i !== "");
    const weatherDiv = document.getElementById('weatherDisplay');
    
    // weatherDiv.innerHTML='';
    
    

    const apiKey='6c37fa82293c3a931a680ffa0d29a846';
    let url = "";
    
    if(type === "city"){
        if(!mulCities.length){

        showError("Please enter a city name");
        return;
        }
        for (const city of mulCities) {
            console.log(city)
            try{
             const geoUrl = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
             const geoData = await geoUrl.json();
            //  let indianCity = geoData.find(c => c.country === 'IN')

             if(!geoData.length){
                showError(`No data for ${city} city found`);
            // errorDiv.textContent=`No data for ${city} city found`;
                continue;
             }
                const cityName = geoData[0].name;
                const lon = geoData[0].lon;
                const lat = geoData[0].lat;

                url=`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;
                await fetchAndShow(url,cityName,lat,lon);
    }catch(err){
        showError("Failed to fetch data")
    }
}}

    else if(type == "location"){
        weatherDiv.innerHTML='';
        if(!navigator.geolocation){
             showError("Location not found");
            return;
        }
        console.log("getting location")
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log("latitude " , lat + "longotude " , lon)

        try{
            const revUrl = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
            const revdata = await revUrl.json();
            console.log("reverse geocoding name",revdata)
            if(revdata.length === 0 || !revdata[0].name){
               cityName = "current location";
            }else{
                cityName = revdata[0].name;
            }
            url=`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;
            fetchAndShow(url,cityName,lat,lon);
        }catch(err){
            console.error("reverse geocoding failed",err)
            showError("not able to fetch location")
        }},
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
        else{
        const icon = data.current.weather[0].icon;
       
        const hourly_forecast = data.hourly.slice(1,13).map(hour => `
            <div class = "flex-shrink-0 text-center ">
            <p class = "text-sm">${new Date(hour.dt * 1000).toLocaleTimeString([],{hour: '2-digit',minute:'2-digit'})}</p>
            <img class = "mx-auto w-10 h-10" src = "https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt = "Icon">
            <p class = "text-sm">${hour.temp}&degC</p>
            <p class = "text-sm">${hour.wind_speed}m/s</p>
            </div>
            `).join('');
        const daily_forecast = data.daily.slice(1,6).map(day =>`
           
            <div class = "flex-shrink-0 text-center bg-blue-300 rounded-lg shadow-lg overflow-hidden w-20 cursor-pointer" city-data = '${cityName}' day-data='${(JSON.stringify(day))}' onclick="openDailyPage(this)">
            <p class = "mb-1"> ${new Date(day.dt * 1000).toLocaleDateString([],{day:'2-digit',month:'short'})}</p>
            <img class = "mx-auto w-10 h-10" src = "https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt = "Icon">
            <p class = "text-sm">${day.temp.day}&degC</p>
            <p class = "text-sm">${day.weather[0].description}</p>
            </div>
            `).join('');
            
        const iconurl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        weatherDiv.innerHTML += `
        <div class=" bg-gradient-to-b from-blue-100 to-blue-300 p-4 rounded-lg shadow-lg w-full h-[400px] overflow-y-auto"> 
        <div class="text-center">
        <h2 class="text-xl font-semibold">${cityName}</h2>
        <p class = "mb-1 text-gray-600">${data.current.temp}&degC  ${data.current.weather[0].main} (${data.current.weather[0].description})</p>
        <img class="mx-auto" src = "${iconurl}" alt = "Weather Icon" />
        </div>
        <hr class="border-gray-300">
        <div>
        <h3 class="text-lg font-semibold mb-2">Hourly Forecast</h3>
        <div class = "flex overflow-x-auto space-x-4 pb-2">
        ${hourly_forecast}
         </div>
        </div>
        <hr class="border-gray-300">
        <div class="bg-gradient-to-b from-blue-100 to-blue-300 p-3 rounded-lg shadow-lg w-full max-w-md  mx-auto space-y-6">
        <div>
        <h3 class="text-lg font-semibold mb-2">Daily Forecast</h3>
        <div class = "flex overflow-x-auto space-x-6 pb-4  bg-white rounded-lg shadow-lg overflow-hidden p-6">
        ${daily_forecast}
        </div>
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
        <p class = "mb-1">Sunset: ${new Date(data.current.sunset * 1000).toLocaleTimeString()}</p>
        </div>
        </div>
        
       
       
        `;
        
       

    }

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

function openDailyPage(dayData){
            const data = dayData.getAttribute("day-data");
            const city = dayData.getAttribute("city-data");
            sessionStorage.setItem('Day',data);
            sessionStorage.setItem('city',city);
            
            window.location.href = 'daily.html';
        }
