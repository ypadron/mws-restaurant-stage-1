//[Service Worker Script by Matt Gaunt](https://developers.google.com/web/fundamentals/primers/service-workers/)

let restaurant_reviews_cache = 'restaurant-reviews-cache-v1';
let urlsToCache = [
	'/',
	'/index.html',
	'/restaurant.html',
	'/css/styles.css',
	'/css/responsive.css',
	'/data/restaurants.json',
	'/img/1.jpg',
	'/img/2.jpg',
	'/img/3.jpg',
	'/img/4.jpg',
	'/img/5.jpg',
	'/img/6.jpg',
	'/img/7.jpg',
	'/img/8.jpg',
	'/img/9.jpg',
	'/img/10.jpg',
	'/js/dbhelper.js',
	'/js/main.js',
	'/js/restaurant_info.js'
];

// install callback
self.addEventListener('install', function(event)  {
	// Install steps
	event.waitUntil(
		caches.open(restaurant_reviews_cache)
			.then(function(cache) {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			})
	);
});

//define fetch event
self.addEventListener('fetch', function(event)  {
	event.respndWith(
		// Promise - looks at request and finds any cached results from service worker caches
		caches.match(event.request)
			.then(function(response)  {
				//cache hit - return response
				if (response) {
					// return cached value if match response exists
					return response;
				} else {
					// otherwise return fetch call results (data retrieved from network if possible)
					let fetchRequest = event.request.clone();

					// Add callback to then on fetch request
					return fetch(fetchRequest).then(function(response)  {
						// check if valid response recieved, status on response is 200
						// make sure response is basic - from origin and not a third party request
						if(!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}
						// if all checks are passed then response (stream) is cloned - one for browser/one for cache
						var responseToCache = respond.clone();

						caches.open(restaurant_reviews_cache)
							.then(function(cache) {
								cache.put(event.request, responseToCache);
							});
						return response;
					});
				}
			})
	);
});
