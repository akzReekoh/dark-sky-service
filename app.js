'use strict';

const LANG = {
	'Arabic': 'ar',
	'Bosnian': 'bs',
	'Chinese - Simplified': 'zh',
	'Chinese - Traditional': 'zh-tw',
	'Croatian': 'hr',
	'Dutch': 'nl',
	'English': 'en',
	'French': 'fr',
	'German': 'de',
	'Greek': 'el',
	'Italian': 'it',
	'Polish': 'pl',
	'Portuguese': 'pt',
	'Russian': 'ru',
	'Slovak': 'sk',
	'Spanish': 'es',
	'Swedish': 'sv',
	'Tetum': 'tet',
	'Turkish': 'tr',
	'Ukrainian': 'uk'
};

var domain   = require('domain'),
	config   = require('./config.json'),
	platform = require('./platform'),
	forecast, language;
/**
 * Emitted when device data is received.
 * @param {string} requestId The request id generated by the platform for this service request.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
platform.on('data', function (requestId, data) {
    forecast
        .latitude(data.lat)
        .longitude(data.lng)
        .units('auto')
        .language(language)
        .exclude('minutely,hourly,daily,alerts,flags')
        .get()
        .then(response => {
            platform.sendResult(requestId, JSON.stringify({
                weather_conditions: response.currently
            }));

            platform.log(JSON.stringify({
                title: 'Dark Sky Service Result',
                input: {
                    lat: data.lat,
                    lng: data.lng
                },
                result: response.currently
            }));
        })
        .catch(error => {
            platform.sendResult(requestId, null);
            platform.handleException(error);
        });
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	platform.notifyClose();
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	language = LANG[options.language] || config.language.default;

    let DarkSky = require('dark-sky');
    forecast = new DarkSky(options.apikey);

	platform.log('Dark Sky Service Initialized.');
	platform.notifyReady();
});
