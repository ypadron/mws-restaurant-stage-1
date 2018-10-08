let restaurants,
	neighborhoods,
	cuisines;
var newMap;
var markers = [];

/**
 * Register Service Worker
 * Service Worker Script by Matt Gaunt](https://developers.google.com/web/fundamentals/primers/service-workers/)
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
if ('serviceWorker' in navigator)  {
	navigator.serviceWorker.register('/sw.js').then(function(registration) {
		// Registration was successful.
		console.log('serviceWorker registration successful with scope: ', registration.scope);
	}, function(err) {
		// Registration failed
		console.log('serviceWorker registration failed: ', err);
	});
}
/*
if ('serviceWorker' in navigator)  {
	navigator.serviceWorker.register('/sw.js').catch(function(error) {
    console.log(error);
	});
}
*/

document.addEventListener('DOMContentLoaded', (event) => {
	initMap(); // added
	fetchNeighborhoods();
	fetchCuisines();
});


/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			console.error(error);
		} else {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
};

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
};

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');

	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
};

/**
 * Initialize leaflet map, called from HTML.
 */
let initMap = () => {
	self.newMap = L.map('map', {
		center: [40.722216, -73.987501],
		zoom: 12,
		scrollWheelZoom: false
	});
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
		mapboxToken: 'pk.eyJ1IjoiZGlnaXRhbHBhZHJvbiIsImEiOiJjam1qeXRjYWEwZmlhM2ttcXFudmRod2RoIn0.dbJNf_qXIjVmd_og3lxsmw',
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(newMap);

	updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	});
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	if (self.markers) {
		self.markers.forEach(marker => marker.remove());
	}
	self.markers = [];
	self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
	const li = document.createElement('li');

	const image = document.createElement('img');
	image.className = 'restaurant-img';
	image.src = DBHelper.imageUrlForRestaurant(restaurant);
	// Add alt attribute to images
	image.setAttribute('alt', restaurant.name + ' Restaurant ' + 'in ' + restaurant.neighborhood);
	li.append(image);

	const name = document.createElement('h3');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);

	// Removed .focus() b/c it created bug & 'view details' focus' properly w/o added method.
	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = DBHelper.urlForRestaurant(restaurant);
	more.setAttribute('aria-labelledby', 'View Details');
	more.setAttribute('role', 'button')
	li.append(more);

	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
		marker.on('click', onClick);
		function onClick() {
			window.location.href = marker.options.url;
		}
		self.markers.push(marker);
	});

};
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
