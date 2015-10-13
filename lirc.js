/**
 * Created by aborovsky on 27.08.2015.
 */

var util = require('util'),
    iTach = require('lirc').iTach;

module.exports = function(RED) {

    /**
     * ====== Lirc-controller ================
     * Holds configuration for lircjs host+port,
     * initializes new lircjs connections
     * =======================================
     */
    function LIRCControllerNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.host = config.host;
        this.port = config.port;
        this.lircjsconn = null;
        var node = this;
        //node.log("new LIRCControllerNode, config: %j", config);

        /**
         * Initialize an lircjs socket, calling the handler function
         * when successfully connected, passing it the lircjs connection
         */
        this.initializeLIRCConnection = function(handler) {
            if (node.lircjsconn) {
                node.log('already configured to Lirc device at ' + config.host + ':' + config.port + ' in mode[' + config.mode + ']');
                if (handler && (typeof handler === 'function'))
                    handler(node.lircjsconn);
                return node.lircjsconn;
            }
            node.log('configuring to Lirc device at ' + config.host + ':' + config.port + ' in mode[' + config.mode + ']');
            node.lircjsconn = null;
            //TODO: implement it!
            node.lircjsconn = null;
            node.log('LIRC: successfully connected to ' + config.host + ':' + config.port + ' in mode[' + config.mode + ']');
            if (handler && (typeof handler === 'function'))
                handler(node.lircjsconn);
            return node.lircjsconn;
        };
        this.on("close", function() {
            node.log('disconnecting from lircjs server at ' + config.host + ':' + config.port + ' in mode[' + config.mode + ']');
            node.lircjsconn && node.lircjsconn.disconnect && node.lircjsconn.disconnect();
        });
    }

    RED.nodes.registerType("lirc-controller", LIRCControllerNode);

    /**
     * ====== Lirc-out =======================
     * Sends outgoing Global Cache device from
     * messages received via node-red flows
     * =======================================
     */
    function LIRCOut(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.ctrl = RED.nodes.getNode(config.controller);
        var node = this;
        //node.log('new Lirc-out, config: ' + util.inspect(config));
        //
        this.on("input", function(msg) {
            node.log('lircout.onInput msg[' + util.inspect(msg) + ']');
            if (!(msg && msg.hasOwnProperty('payload'))) return;
            var payload = msg.payload;
            if (typeof(msg.payload) === "object") {
                payload = msg.payload;
            } else if (typeof(msg.payload) === "string") {
                try {
                    payload = JSON.parse(msg.payload);
                } catch (e) {
                    payload = msg.payload.toString();
                }
            }
            if (payload == null) {
                node.log('lircout.onInput: illegal msg.payload!');
                return;
            }

            node.send(payload, function(err) {
                if (err) {
                    node.error('send error: ' + err);
                }
                if (typeof(msg.cb) === 'function')
                    msg.cb(err);
            });

        });
        this.on("close", function() {
            node.log('lircOut.close');
        });

        node.status({
            fill: "yellow",
            shape: "dot",
            text: "inactive"
        });

        function nodeStatusConnected() {
            node.status({
                fill: "green",
                shape: "dot",
                text: "connected"
            });
        }

        function nodeStatusDisconnected() {
            node.status({
                fill: "red",
                shape: "dot",
                text: "disconnected"
            });
        }

        function nodeStatusConnecting() {
            node.status({
                fill: "green",
                shape: "ring",
                text: "connecting"
            });
        }

        this.send = function(data, callback) {
            // init a new one-off connection from the effectively singleton LIRCController
            // there seems to be no way to reuse the outgoing conn in adreek/node-lircjs
            this.ctrl.initializeLIRCConnection(function(connection) {
                if (connection.connected)
                    nodeStatusConnected();
                else
                    nodeStatusDisconnected();
                connection.removeListener('connecting', nodeStatusConnecting);
                connection.on('connecting', nodeStatusConnecting);
                connection.removeListener('connected', nodeStatusConnected);
                connection.on('connected', nodeStatusConnected);
                connection.removeListener('disconnected', nodeStatusDisconnected);
                connection.on('disconnected', nodeStatusDisconnected);

                try {
                    node.log("send:  " + JSON.stringify(data));
                    //TODO: implement it!
                    // connection.send(data, function (err) {
                    //     callback && callback(err);
                    // });
                } catch (err) {
                    node.error('error calling send: ' + err);
                    callback(err);
                }
            });
        }
    }

    RED.nodes.registerType("lirc-out", LIRCOut);
}