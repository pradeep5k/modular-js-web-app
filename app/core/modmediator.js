/**
 * @author pradeep_5k@hotmail.com
 *
 * ModMediator provide a decoupled communication channel for the modules to talk to each other without knowing each other.
 * It implements the Mediator pattern to allow a flexible communication.
 */
define([], function() {"use strict";

    var _ModMediator = function() {
        /* PRIVATE VARS */
        var messageTopics = {};

        /**
         * Public method called by a module to register itself with the Mediator and recieveMessage of a specific topic.
         *
         * @param {String} topic - valid module id.
         * @param {BaseModule} module - instance of a BaseModule or its sub class.
         *
         * @return {Boolean} return false not able to register the module.
         */
        this.register = function(topic, module) {
            if (!module.recieveMessage || typeof module.recieveMessage !== 'function') {
                console.error("Error: ModMediator - Invalid Module");
                return false;
            }

            if (! messageTopics[topic]) {
                messageTopics[topic] = [];
            }

            messageTopics[topic].push(module);
            return true;
        };

        /**
         * Public method called by a module to unregister itself from the Mediator and stop receiving messages of a specific topic.
         *
         * @param {String} topic - valid module id.
         * @param {BaseModule} module - instance of a BaseModule or its sub class.
         */
        this.unregister = function(topic, module) {
            if (messageTopics[topic]) {
                var arrTopic = messageTopics[topic];
                var iLen = arrTopic.length;
                for (var i = 0; i < iLen; i++) {
                    var objMod = arrTopic[i];
                    if (objMod === module) {
                        arrTopic.splice(i, 1);
                        break;
                    }
                }
            }
        };

        /**
         * Public method called by a module to distribute/publish a message to other topic listeners.
         *
         * @param {String} topic - valid module id.
         * @param {Object} message - the message object.
         * @param {BaseModule} module - instance of a BaseModule or its sub class.
         */
        this.distributeMessage = function(topic, message, module) {
            if (messageTopics.hasOwnProperty(topic)) {
                var arrTopic = messageTopics[topic];
                var iLen = arrTopic.length;
                for (var i = 0; i < iLen; i++) {
                    var objMod = arrTopic[i];
                    if (!(objMod === module)) {
                        objMod.recieveMessage(topic, message);
                    }
                }
            }
        };
    };

    /*
     * STATIC MEMBERS/METHODS
     */
    /**
     * Static method getInstance to get the scoped singleton ref to the _ModMediator Class.
     *
     */
    _ModMediator.__instance__ = null;
    _ModMediator.getInstance = function() {
        if (_ModMediator.__instance__ === null) {
            _ModMediator.__instance__ = new _ModMediator();
        }
        return _ModMediator.__instance__;
    };

    return _ModMediator;
});