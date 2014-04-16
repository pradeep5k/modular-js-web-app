/**
 * @author pradeep_5k@hotmail.com
 *
 * Application is a singleton. Responsible for initializing, rendering and managing modules of the application.
 * It uses Marionette to render itself.
 * Uses ModManager (app/core/modmanager.js) to manage modules.
 *
 */
define(['jquery', 'marionette', 'core/modmanager'], function($, Marionette, ModManager) {"use strict";

    /*
     *
     */
    var _Application = function() {

        /* PRIVATE VARS */
        var _iref = this;
        // set a reference to the instance of the class to access within the class
        var _marionetteapp = null;
        // check if already initialized
        var ifInitialized = false;

        // Backbone models
        // _modModel is populated with the module objects read from the manifest.json
        // _modModel populates the Module load/unload views.
        var _modModel = Backbone.Model.extend({});
        // _modCollection is a collection of the modules read from the manifest.json
        var _modCollection = Backbone.Collection.extend({
            model : _modModel
        });

        // view
        // Renders the Module load/unload view
        // Handle the button events and call respective methods
        var _modLaunchView = Marionette.ItemView.extend({
            template : '#tplmodlauncher',
            events : {
                'click .loadbutton' : 'onModuleLoad',
                'click .unloadbutton' : 'onModuleUnload'
            },
            onModuleLoad : function(e) {
                processLoadModuleRequest(this.model.attributes.id);
            },
            onModuleUnload : function(e) {
                processUnloadModuleRequest(this.model.attributes.id);
            }
        });
        // collection of the Module load/unload views
        var _modLanuchCollectionView = Marionette.CollectionView.extend({
            itemView : _modLaunchView
        });

        /* PRIVATE METHODS */

        /**
         * Private method called when a request for loading a specific module is raised.
         * Expects a valid module id. Uses ModManager to load the module.
         * Logs error if fails to load the module.
         *
         * @param {String} modId - valid module id.
         */
        var processLoadModuleRequest = function(modId) {

            // module loading sequence
            // 1. Load the required files by firing ModManager.getInstance().loadModule()
            // 2. If files successfully loaded then try to start the module by firing ModManager.getInstance().startModule()
            // 3. If failed at loading or starting module then log error.
            var success = ModManager.getInstance().loadModule(modId, function(module) {
                // called if module files loaded success fully
                var startSuccess = ModManager.getInstance().startModule(module.id, _marionetteapp.getRegion(modId), function(mod) {
                    console.log("Log: Module started successfully", mod.id);
                }, function(err) {
                    console.error("Error: Application - Failed to start the module", err);
                });

                if (!startSuccess) {
                    console.error("Error: Application - Error starting module.", "Invalid module id.");
                }
            }, function(err) {
                console.error("Error: Application - Error loading module.", err);
            });

            if (!success) {
                console.error("Error: Application - Error loading module.", "Invalid module id: " + modId);
            }
        };

        /**
         * Private method called when a request for unloading a specific module is raised from within the application.
         * Expects a valid module id. Uses ModManager (app/core/modmanager.js) to unload the module.
         * Logs error if fails to unload the module.
         *
         * @param {String} modId - valid module id.
         */
        var processUnloadModuleRequest = function(modId) {
            var success = ModManager.getInstance().unloadModule(modId, function(module) {
                console.log("Log: Module started successfully", module.id);
            }, function(err) {
                console.error("Error: Application - Error unloading module.", err);
            });

            if (!success) {
                console.error("Error: Application - Error unloading module.", "Invalid module id: " + modId);
            }
        };

        /**
         * Private method called to load the manifest.json.
         * Uses simple jQuery ajax request to load the json file.
         *
         * Logs error if fails to load the file.
         *
         * @param {String} manifest - url to the manifest file.
         */
        var loadModuleMenifest = function(manifest) {
            $.ajax({
                type : "GET",
                url : manifest,
                success : function(data, textStatus, jqXHR) {
                    populateModule(data, textStatus, jqXHR);
                },
                error : function(jqXHR, textStatus, errorThrown) {
                    console.error("Error: Application - Failed to load manifest.json.", errorThrown);
                }
            });

        };

        /**
         * Private method called to populate the Module load/unload views and
         * create module regions in the <section>.
         * This method is called after manifest.json gets loaded.
         *
         * Logs error if manifest is invalid.
         *
         * @param {json} data - valid JSON object as per the manifest structure guidelines.
         * @param {String} textStatus - 'success' if file gets loaded successfully.
         */
        var populateModule = function(data, textStatus) {
            if (textStatus != "success" || !data || !data.modules || !data.modules.length) {
                console.error("Error: Application - Invalid manifest.json.", data);
                return;
            }

            // register modules with ModManager
            ModManager.getInstance().registerModulesFromManifest(data.modules);

            //
            _marionetteapp = new Backbone.Marionette.Application();

            // add a initializer to process the Marionette Application creation
            _marionetteapp.addInitializer(function(param) {
                // create required regions
                // push the default region for the Module load/unload view
                var regions = {
                    'launcher' : '#launcher'
                };

                var modelCollection = new _modCollection();
                for (var i = 0; i < param.modules.length; i++) {

                    modelCollection.add(param.modules[i]);

                    // create a <div> for each module and append it to the <section> to create a region
                    $('#appmodules').append("<div id='" + param.modules[i].id + "' class='modregion'></div>");
                    // populate the region
                    regions[param.modules[i].id] = "#" + param.modules[i].id;
                }
                // add all regions into the _marionette Application
                _marionetteapp.addRegions(regions);

                // show Module load/unload views
                _marionetteapp.launcher.show(new _modLanuchCollectionView({
                    collection : modelCollection
                }));
            });

            // start marionette
            _marionetteapp.start(data);
        };

        /*
        * PUBLIC METHODS
        */
        /**
         * Only public method of the Application class.
         * Exposes the starting point of the application.
         *
         * @param {String} manifest - url to the manifest file.
         */
        this.init = function(manifest) {
            if (ifInitialized) {
                return;
            }

            ifInitialized = true;
            loadModuleMenifest(manifest);
        };
    };

    /*
     * STATIC MEMBERS/METHODS
     */

    _Application.__instance__ = null;

    /**
     * Static method getInstance to get the scoped singleton ref to the Application Class.
     * Exposes the starting point of the application.
     *
     */
    _Application.getInstance = function() {
        if (_Application.__instance__ === null) {
            _Application.__instance__ = new _Application();
        }
        return _Application.__instance__;
    };

    //
    return _Application;
});
