/**
 * @author pradeep_5k@hotmail.com
 *
 * This is a module implementation. Which will typically be done by different developers sitting in different locations.
 * This module inherits form the 'BaseModule'.
 *
 * This module is created to demonstrate the a simple todo list module.
 *
 * The functionality of this module is:
 * It allows the user to add todo items in the list. It also uses the ModMediator to broadcast todo item on the 'todo' topic.
 *
 */
define(['jquery', 'core/basemodule'], function($, BaseModule) {"use strict";

    var _MyModule = function() {

        var _todoList = null;
        var _iRef = this;

        /**
         * Override the start method of the BaseModule to do your own stuff.
         * Render the your own view using the templates defined in the mod.html.
         *
         */
        this.start = function() {
            var ItemModel = Backbone.Model.extend({});

            var TodoCollection = Backbone.Collection.extend({
                model : ItemModel
            });

            var ItemView = Backbone.Marionette.ItemView.extend({
                template : _.template(this.findElInContext("#tpltodoitem").html())
            });

            var TodoView = Backbone.Marionette.CompositeView.extend({
                template : _.template(this.findElInContext("#tpltodo").html()),
                itemView : ItemView,
                events : {
                    'click #btnadd' : 'onAdd'
                },
                serializeData : function() {
                    var viewData = {};
                    viewData.name = this.options.name === undefined ? "" : this.options.name;
                    console.log(viewData);
                    return viewData;
                },
                onAdd : function(e) {
                    var txt = _iRef.findElInContext("#todoinput").prop("value");
                    _todoList.add(new ItemModel({
                        datetime : (new Date()).toString(),
                        text : txt
                    }));

                    _iRef.findElInContext("#todoinput").prop("value", "");
                    _iRef.modMediator.distributeMessage("todo", {
                        datetime : (new Date()).toString(),
                        text : txt
                    }, _iRef);
                },
                appendHtml : function(collectionView, itemView) {
                    collectionView.$("#todolist").append(itemView.el);
                }
            });

            _todoList = new TodoCollection();

            var todoView = new TodoView({
                collection : _todoList,
                name : this.name
            });

            this.showView(todoView);
            this.modMediator.register("get_todo", this);
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

            if (topic !== 'get_todo') {
                return;
            }
            var iLen = _todoList.length;
            if (iLen > 0) {
                var obj = _todoList.at(_todoList.length - 1);
                this.modMediator.distributeMessage("todo", {
                    datetime : obj.get('datetime'),
                    text : obj.get('text')
                }, this);
            }

        };
    };

    _MyModule.prototype = new BaseModule();

    return _MyModule;
});