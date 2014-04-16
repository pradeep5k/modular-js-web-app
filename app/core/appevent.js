/**
 * @author pradeep_5k@hotmail.com
 * define all the constants for the app event
 * events can be packaged in groups/types
 */
define(['underscore', 'backbone'], function(_, Backbone) {"use strict";

    /*
     * Application's own event dispatcher
     * Not used much in this application
     * But can be very useful for decoupled communication
     * between Application and Module
     * But not between Modules.
     * ModMediator is more decoupled and flexible way for
     * communication between modules.
     */
    var _Dispatcher = _.extend({}, Backbone.Events);

    /*
     * ModularJSApp own events
     */
    var _AppEvent = {
        INITIALIZE : "application:initialize",
        COMPLETE : "application:complete",
        ERROR : "application:error",
        MODINITIALIZED : "module:initialized",
        MODSTARTED : "module:started",
        MODSTOPPED : "module:stopped",
        MODUNLOADED : "module:unloaded"
    };

    return {
        "Events" : _AppEvent,
        "Dispatcher" : _Dispatcher
    };
});