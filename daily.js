window.addEventListener('DOMContentLoaded',()=>{
try {
    const day = JSON.parse(sessionStorage.getItem("Day"));
    const city = sessionStorage.getItem('city');
    console.log(day)
    const dayDiv = document.getElementById('dayDetails');

    if (!day || !day.weather || !day.weather[0]) {
        dayDiv.innerHTML = "Weather data not found";
        return;
    }

    const icon = day.weather[0].icon;
    const iconurl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    dayDiv.innerHTML = `
    <div class = max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-8 space-y-4">
    
    <h2 class = "text-xl font-bold mb-2"> ${new Date(day.dt * 1000).toDateString()}</h2>
   
    <img src = "${iconurl}" class = "w-16 mx-auto" alt="Weather icon">
    <p class = "text-xl font-semibold text-gray-800">${city}</p>
    <p class = "text-xl font-semibold text-gray-800">${day.weather[0].main}</p>
    <p class = "text-sm text-gray-600 italic">${day.weather[0].description}</p>
    <div class = "text-sm space-y-1">
    
    <p class = "mb-1 text-lg">Temperature: ${day.temp.day}&degC</p>
    </div>
    
    <div class = "text-sm space-y-1">
    <div class = "grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
    
   
    <div>
     <h3 class="text-lg font-semibold border-b pb-1 mb-2">Sun Timing</h3>
    <p class = "mb-1">Sunrise: ${new Date(day.sunrise * 1000).toLocaleTimeString()}</p>
    <p class = "mb-1">Sunset: ${new Date(day.sunset * 1000).toLocaleTimeString()}</p>
    </div>
    
    
    <div>
    <h3 class="text-lg font-semibold border-b pb-1 mb-2">Atmosphere</h3>
    <p> Humidity: ${day.humidity}%</p>
    <p> Wind Speed: ${day.wind_speed}m/s</p>
    </div>
    
   
    <div>
     <h3 class="text-lg font-semibold border-b pb-1 mb-2">Outside Conditions</h3>
    <p> Pressure: ${day.pressure}hPa</p>
    <p> Cloud Cover: ${day.clouds}%</p>
    <p> Moon Phase: ${day.moon_phase}</p>
    </div>
    
    </div>
    </div>
    </div>

`;
} catch (err) {
    const error = document.getElementById('dayDetails')
    error.innerHTML = "Invalid forecast data"
}
});
