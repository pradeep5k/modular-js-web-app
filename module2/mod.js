/**
 * @author pradeep_5k@hotmail.com
 *
 * This is a module implementation. Which will typically be done by different developers sitting in different locations.
 * This module inherits form the 'BaseModule'.
 *
 * This module is created to demonstrate the most basic use of the Moduler development.
 * A module can be very complex and may run into thousands of lines of code and may consist of many requirejs modules.
 *
 * The functionality of this module is:
 * It listens to the "todo" topic and displays the most recent todo message. Very simple. Right!!!
 *
 */
define(['jquery', 'core/basemodule'], function($, BaseModule) {"use strict";

    var _MyModule = function() {

        /*PRIVATE MEMBERS*/
        var _todoTask = null;
        var _iRef = this;

        /**
         * Override the start method of the BaseModule to do your own stuff.
         * Render the your own view using the templates defined in the mod.html.
         *
         */
        this.start = function() {
            var ItemModel = Backbone.Model.extend({});

            var ItemView = Backbone.Marionette.ItemView.extend({
                template : _.template(this.findElInContext("#tpllatesttodoitem").html()),
                initialize : function() {
                    var viewRef = this;
                    this.model.bind('change', function() {
                        viewRef.render(this.model);
                    });
                }
            });

            _todoTask = new ItemModel({
                datetime : "[]",
                text : "Todo list is empty"
            });
            var todoView = new ItemView({
                model : _todoTask
            });
            this.showView(todoView);

            // register to listen to the todo topic
            this.modMediator.register("todo", this);
            this.modMediator.distributeMessage("get_todo", "", this);
            // call super start();
            _MyModule.prototype.start.apply(this);
        };

        /**
         * Override the stop method of the BaseModule to do your own stuff.
         *
         */
        this.stop = function() {
            this.modMediator.unregister("todo", this);
            _MyModule.prototype.stop.apply(this);
        };

        /**
         * Override the stop method of the BaseModule to do your own stuff.
         *
         */
        this.recieveMessage = function(topic, message) {

            if (topic !== 'todo' || !message || !message.datetime || !message.text) {
                return;
            }
            _todoTask.set({
                datetime : message.datetime,
                text : message.text
            });

        };

    };

    _MyModule.prototype = new BaseModule();

    return _MyModule;
});