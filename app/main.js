/**
 * @author Pradeep Kumar
 *
 * Application start point.
 * Configure requirejs to define the base path in the 'baseUrl'. Pointing to the application code directory 'app'.
 * Define an alias in the 'path' for each library. Makes life bit easy while refering these libs in the code.
 * Set dependencies in the 'shim' of the libs to ensure required code is loaded before a lib gets loaded.
 */
require.config({
    baseUrl : "app/",
    paths : {
        "module" : "../module",
        "jquery" : "../lib/jquery.min 2.1.0",
        "underscore" : "../lib/underscore.min 1.6.0",
        "backbone" : "../lib/backbone.min 1.1.2",
        "marionette" : "../lib/backbone.marionette.min 1.7.4",
        "text" : "../lib/text",
        "createjs": 'http://code.createjs.com/createjs-2013.12.12.min'
    },
    shim : {
        'marionette' : {
            deps : ['backbone'],
            exports : 'Marionette'
        },
        'backbone' : {
            deps : ['underscore', 'jquery'],
            exports : 'Backbone'
        },
        'underscore' : {
            exports : '_'
        },
        'createjs' : {
            exports : 'createjs'
        }
    }
});

/**
 * Kick start the application
 */
require(["core/application"], function(Application) {
    /*
     * Application is a scoped SingleTon which lives till
     * browser pages lives.
     *
     * init the Application with the path to the 'manifest.json'.
     * For now the path to the manifest.json is hardcode here.
     * It can be provided dynamically by passing it in query string
     * or using other methods.
     *
     * Now look into the 'app/core/application.js'
     */
    Application.getInstance().init("manifest.json");

});