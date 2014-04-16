/**
 * @author pradeep_5k@hotmail.com
 *
 * ModManager - A singleton which manages the life cycle of modules.
 */
define(['core/appevent'], function(evt) {"use strict";

    var _ModManager = function() {

        /* PRIVATE VARS */
        // dictionary to refer module models by id as key
        var _modules = {};
        // the prefix of id to make it reasonable key
        var _idPrefix = "mod_";

        // possible state of the module
        var MOD_STATE = {
            'NOTLOADED' : 0,
            'LOADING' : 1,
            'LOADED' : 2,
            'STARTED' : 3,
            'STOPPED' : 4
        };

        /* PUBLIC METHODS */
        /**
         * Public method called to register modules with ModManager.
         * ModManager does not recognize a module unless its registered with ModManager.
         * Logs error if invalid parameter.
         *
         * @param {Array} arrModules - Array of module objects loaded from the manifest.
         */
        this.registerModulesFromManifest = function(arrModules) {
            if (!arrModules || !( arrModules instanceof Array)) {
                console.error("Error: ModManager - Invalid Module list.");
                return;
            }
            var iLen = arrModules.length;
            for (var i = 0; i < iLen; i++) {
                var mod = arrModules[i];
                mod.id = _idPrefix + i;
                mod.css = "";
                mod.html = "";
                mod.modClass = null;
                mod.state = MOD_STATE.NOTLOADED;
                _modules[mod.id] = mod;
            }
        };

        /**
         * Public method called to load a modules.
         * Logs error if unable to load module files.
         * Tries to load three files from the module root - 1. mod.js, 2. mod.css & 3. mod.html
         * Out of the three files 'mod.js' is mandatory. It does not care if other two files are missing.
         *
         * @param {String} id - valid module id.
         * @param {function} successCallback - callback function if module files gets loaded successfully.
         * @param {function} errorCallback - callback function if module files are not loaded successfully.
         *
         * @return {Boolean} return false if does not find the module in the module dictionary.
         */
        this.loadModule = function(id, successCallback, errorCallback) {
            if (!_modules[id]) {
                return false;
            }

            var mod = _modules[id];
            // module is loading or loaded then return
            if (mod.state != MOD_STATE.NOTLOADED) {
                return false;
            }

            // start load sequence
            mod.state = MOD_STATE.LOADING;
            mod.loadSuccessCallback = successCallback;
            mod.loadErrorCallback = errorCallback;

            // first - try to load the module js
            require([mod.url + "mod.js"], function(module) {
                mod.modClass = module;
                // if module class loaded successfully then

                // final css load callbacks
                var cssSuccess = function(css) {
                    mod.css = css;
                    mod.state = MOD_STATE.LOADED;
                    // send the success callback
                    mod.loadSuccessCallback.call(this, mod);
                };
                //
                var cssError = function(err) {
                    // never mind if css file does not exist
                    // assume that css is not required by this module
                    // or it will generate css dynamically
                    mod.state = MOD_STATE.LOADED;
                    mod.loadSuccessCallback.call(this, err);
                };

                // second - try to load the module html file as text file using requirejs text plugin
                require(["text!" + mod.url + "mod.html"], function(html) {
                    mod.html = html;
                    // third - try to load css file as a text file
                    require(["text!" + mod.url + "mod.css"], cssSuccess, cssError);
                }, function(err) {
                    // if module html does not exist then assuming that
                    // module code will generate html dynamically or will simply work
                    // with the container view go ahead and load css.
                    require(["text!" + mod.url + "mod.css"], cssSuccess, cssError);
                });
            }, function(err) {
                // if module js is not loaded then send an error callback
                mod.state = MOD_STATE.NOTLOADED;
                mod.loadErrorCallback.call(this, err);
            });

            return true;
        };

        /**
         * Public method called to start a modules is a given Marionette Region.
         * Instanciate and initialize the module
         *
         * @param {String} id - valid module id.
         * @param {Marionette.Region} moduleRegion - in which the module will get instanciated
         * @param {function} successCallback - callback function if module gets started successfully.
         * @param {function} errorCallback - callback function if module is not started successfully.
         *
         * @return {Boolean} return false if does not find the module in the module dictionary or if module files are not loaded.
         */
        this.startModule = function(id, moduleRegion, successCallback, errorCallback) {
            if (!_modules[id]) {
                return false;
            }

            var mod = _modules[id];

            if (mod.state != MOD_STATE.LOADED) {
                return false;
            }
            // create an instance of the module class
            mod.instance = new mod.modClass();
            // listen to ensure that module is initialized
            var callback = function(e) {
                evt.Dispatcher.off(evt.Events.MODINITIALIZED, callback);
                successCallback.call(this, mod);
            };
            evt.Dispatcher.on(evt.Events.MODINITIALIZED, callback);
            mod.instance.initialize(mod.id, mod.name, mod.config, mod.html, mod.css, moduleRegion);

            return true;
        };

        /**
         * Public method called to unload a module.
         * Unload module and clean up memory.
         *
         * @param {String} id - valid module id.
         *
         * @return {Boolean} return false if does not find the module in the module dictionary or if module files are not loaded.
         */
        this.unloadModule = function(id) {
            if (!_modules[id]) {
                return false;
            }

            var mod = _modules[id];

            if (mod.state != MOD_STATE.LOADED) {
                return false;
            }
            // listen when module gets unloads itself
            // then clean up
            var callback = function(id) {
                evt.Dispatcher.off(evt.Events.MODUNLOADED, callback);
                if (!_modules[id]) {
                    return;
                }

                var mod = _modules[id];
                mod.css = "";
                mod.html = "";
                mod.modClass = null;
                mod.state = MOD_STATE.NOTLOADED;
                delete mod.instance;
                mod.instance = null;

            };
            evt.Dispatcher.on(evt.Events.MODUNLOADED, callback);

            mod.instance.unload();

            return true;
        };

    };

    /*
    * STATIC MEMBERS/METHODS
    */
    /**
     * Static method getInstance to get the scoped singleton ref to the ModManager Class.
     *
     */
    _ModManager.__instance__ = null;
    _ModManager.getInstance = function() {
        if (_ModManager.__instance__ === null) {
            _ModManager.__instance__ = new _ModManager();
        }
        return _ModManager.__instance__;
    };

    return _ModManager;
});