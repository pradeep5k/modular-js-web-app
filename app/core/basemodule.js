/**
 * @author pradeep_5k@hotmail.com
 *
 * BaseModule is the super class of all the module implementations. For this application all the mod.js must contain a class which inherits from this module.
 * BaseModule provides the essential infrastructure for rendering the module in the scope of the Module Region. Unloading it. Cleaning up the dom/memory etc.
 * The structure inside the module region is as follow
 * -- [Module Marionette.Region]
 *          +---------[style css loaded from the mod.css]
 *          +---------[other html elements loaded form the mod.html]
 *          +---------[Marionette.LayoutView to create a region for module view content]
 *                           +---------[Marionette.Region to render the module view content]
 *
 *
 *
 */
define(['jquery', 'core/modmediator', 'core/appevent'], function($, ModMediator, evt) {"use strict";

    /**
     * ctor
     */
    var _BaseModule = function() {

        // id of the Marionetter Region <div>
        this.moduleRegionId = "";
        // the html text loaded from the mod.html file
        this.html = "";
        // the css text loaded from the mod.css file
        this.css = "";
        // reference to the Marionette.Region instance which holds this Module
        this.moduleRegion = null;
        // the jQuery object of the module region div
        this.jqDom = null;
        this.modMediator = ModMediator.getInstance();
        // the Marionette.LayoutView in which the content of module is rendered
        this.contentLayoutView = null;
        this.contentDivId = "";
        this.name = "";
        this.config;
    };

    /**
     * Public method called by a ModManager to initialize the Module.
     * This method does be initial heavy lifting of creating a structure in which the content of the module can be rendered
     * It creates a Marionette.LayoutView and in that it creates a Marionette.Region which is used for rendering the content
     * of the Module.
     *
     * @param {String} id - the module id.
     * @param {String} name - name of the module from manifest.json.
     * @param {Object} config - config object for the module from the manifest.json.
     * @param {String} html - the html string from the mod.html.
     * @param {String} css - the css string from the mod.css.
     * @param {Marionette.Region} moduleRegion - instance of a Marionette.Region in which this module will be rendered.
     */
    _BaseModule.prototype.initialize = function(id, name, config, html, css, moduleRegion) {
        this.moduleRegionId = id;
        this.html = html;
        this.css = css;
        this.moduleRegion = moduleRegion;
        this.jqDom = moduleRegion.getEl(moduleRegion.el);
        this.contentDivId = "modcontent_" + id;
        this.name = name;
        this.config = config;
        // load css in a scoped style in the region
        var htmlStr = "";
        if (css !== "") {
            // scope the css for browsers which does not support 'scoped' attribute in the <style>
            // the trick is - the module developer appends #mod_scope before all the relevant style objects
            // in the following code we replace the 'mod_scope' with the div id of the region
            // hence scoping the style to the region itself.
            // this is not a foolproof solution
            // may conflict with another module style if loaded in the same region.
            var divId = this.jqDom.attr("id");
            css = css.replace(new RegExp("mod_scope", 'g'), divId);
            htmlStr = "<style scoped>" + css + "</style>";
        }
        // now load the html in the region
        if (html !== "") {
            htmlStr = htmlStr + html;
        }

        // create LayoutView
        var layoutStr = "<div id='" + this.contentDivId + "_cr'></div>";
        var ContentLayoutView = Backbone.Marionette.Layout.extend({
            template : _.template(layoutStr)
        });

        this.contentLayoutView = new ContentLayoutView();
        this.contentLayoutView.addRegions({
            "contentRegion" : ("#" + this.contentDivId + "_cr")
        });
        this.moduleRegion.show(this.contentLayoutView);

        // trick
        // append the loaded html/css string after calling the show function of the module region
        // other wise it will wipe out everything.

        if (htmlStr != "") {
            this.jqDom.append(htmlStr);
        }

        // trigger initialized event
        evt.Dispatcher.trigger(evt.Events.MODINITIALIZED, this.moduleRegionId);

        // call the module start
        this.start();
    };

    /**
     * Public method called by a ModManager to unload the Module.
     * It calls the stop() which is generally implemented by the subclasses
     * to clear dom/memory which is created by them.
     * From within the stop() it calls onStop which finally unloads the module
     * and clears everything.
     */
    _BaseModule.prototype.unload = function() {
        this.stop();
    };

    /**
     * Protected method to clear/hide the content from the module region.
     * Created as helper for the sub classes
     */
    _BaseModule.prototype.clearView = function() {
        this.contentLayoutView.stop();
    };

    /**
     * Protected method to show the content.
     * Created as helper for the sub classes
     *
     * @param {Marionette.ItemView} view - should be a valid Marionette.ItemView/CompositeView/ContainerView/LayoutView
     */
    _BaseModule.prototype.showView = function(view) {
        this.contentLayoutView.contentRegion.show(view);
    };

    /**
     * Protected method to stop the module and clear dom/memory.
     * Created as helper for the sub classes
     */
    _BaseModule.prototype.onStop = function() {
        var id = this.moduleRegionId;
        this.findElInContext(".modulecontent").remove();
        delete this.moduleRegionId;
        delete this.html;
        delete this.css;
        this.contentLayoutView.contentRegion.close();
        this.moduleRegion.close();
        this.contentLayoutView = this.moduleRegion = null;
        this.jqDom = null;

        evt.Dispatcher.trigger(evt.Events.MODUNLOADED, id);
    };

    /**
     * Protected method to start the module.
     * To be implemented by the sub class
     */
    _BaseModule.prototype.start = function() {
        // to be implemented in the sub class
        evt.Dispatcher.trigger(evt.Events.MODSTARTED, this.moduleRegionId);
    };

    /**
     * Protected method to stop the module.
     * To be implemented by the sub class
     */
    _BaseModule.prototype.stop = function() {
        // to be implemented in the sub class
        this.onStop();
    };

    /**
     * Protected method to query an element in the context of the module.
     * Module Developers are encouraged to use this function instead of querying the dom openly.
     */
    _BaseModule.prototype.findElInContext = function(elRef) {
        return $(elRef, this.jqDom);
    };

    /**
     * Protected placeholder method to receive message from the ModMediator.
     * To be implemented by the sub class
     */
    _BaseModule.prototype.recieveMessage = function(topic, message) {
        // do something with the message
        // to be implemented in the sub class
    };
    return _BaseModule;
});