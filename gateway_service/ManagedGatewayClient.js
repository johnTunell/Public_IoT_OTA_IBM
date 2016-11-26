'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _format = require('format');

var _format2 = _interopRequireDefault(_format);

var _util = require('../util/util.js');

var _GatewayClient2 = require('./GatewayClient.js');

var _GatewayClient3 = _interopRequireDefault(_GatewayClient2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
 *****************************************************************************
 Copyright (c) 2014, 2015 IBM Corporation and other Contributors.
 All rights reserved. This program and the accompanying materials
 are made available under the terms of the Eclipse Public License v1.0
 which accompanies this distribution, and is available at
 http://www.eclipse.org/legal/epl-v10.html
 Contributors:
 Harrison Kurtz - Initial Contribution
 Jeffrey Dare
 *****************************************************************************
 *
 */

var utilNode = require('util');

var QUICKSTART_ORG_ID = 'quickstart';
var QOS = 1;

var RESPONSE_TOPIC = 'iotdevice-1/type/%s/id/%s/response';
var MANAGE_TOPIC = 'iotdevice-1/type/%s/id/%s/mgmt/manage';
var UNMANAGE_TOPIC = 'iotdevice-1/type/%s/id/%s/mgmt/unmanage';
var UPDATE_LOCATION_TOPIC = 'iotdevice-1/type/%s/id/%s/device/update/location';
var ADD_LOG_TOPIC = 'iotdevice-1/type/%s/id/%s/add/diag/log';
var CLEAR_LOGS_TOPIC = 'iotdevice-1/type/%s/id/%s/clear/diag/log';
var ADD_ERROR_CODE_TOPIC = 'iotdevice-1/type/%s/id/%s/add/diag/errorCodes';
var CLEAR_ERROR_CODES_TOPIC = 'iotdevice-1/type/%s/id/%s/clear/diag/errorCodes';
var NOTIFY_TOPIC = 'iotdevice-1/type/%s/id/%s/notify';

var OBSERVE_TOPIC = 'iotdevice-1/type/%s/id/%s/observe';
var CANCEL_OBSERVE_TOPIC = 'iotdevice-1/type/%s/id/%s/cancel';
var FIRMWARE_DOWNLOAD_TOPIC = 'iotdevice-1/type/%s/id/%s/cancel';

// Subscribe MQTT topics

var DM_DEVICE_RESPONSE_UPWIS_TOPIC = 'iotdm-1/type/%s/id/%s/response';
var DM_DEVICE_REQUEST_UPWIS_TOPIC = 'iotdm-1/type/%s/id/%s/';

var DM_WILDCARD_TOPIC = 'iotdm-1/#';
var DM_RESPONSE_TOPIC = 'iotdm-1/response';
var DM_UPDATE_TOPIC = 'iotdm-1/device/update';
var DM_OBSERVE_TOPIC = 'iotdm-1/observe';
var DM_CANCEL_OBSERVE_TOPIC = 'iotdm-1/cancel';
var DM_REBOOT_TOPIC = 'iotdm-1/mgmt/initiate/device/reboot';
var DM_FACTORY_RESET_TOPIC = 'iotdm-1/mgmt/initiate/device/factory_reset';
var DM_FIRMWARE_DOWNLOAD_TOPIC = 'iotdm-1/mgmt/initiate/firmware/download';
var DM_FIRMWARE_UPDATE_TOPIC = 'iotdm-1/mgmt/initiate/firmware/update';

// Regex topic
var DM_REQUEST_RE = /^iotdm-1\/*/;
var DM_ACTION_RE = /^iotdm-1\/mgmt\/initiate\/(.+)\/(.+)$/;
var DM_RESPONSE_TOPIC_RE = /^iotdm-1\/type\/(.+)\/id\/(.+)\/response$/;
var DM_JOHN_RE_TWO = /^iotdm-1\/type\/(.+)\/id\/(.+)\/(.+)\/(.+)/;
var DM_JOHN_RE_ONE = /^iotdm-1\/type\/(.+)\/id\/(.+)\/(.+)/;
var DM_JOHN_RE_FOUR = /^iotdm-1\/type\/(.+)\/id\/(.+)\/(.+)\/(.+)\/(.+)\/(.+)/;

//Gateway actions
var MANAGE = "manage";
var UNMANAGE = "unmanage";
var UPDATE_LOCATION = "updateLocation";
var ADD_LOG = "addLog";
var CLEAR_LOG = "clearLog";
var ADD_ERROR = "addErrorCode";
var CLEAR_ERROR = "clearErrorCodes";

var ManagedGatewayClient = function (_GatewayClient) {
  _inherits(ManagedGatewayClient, _GatewayClient);

  function ManagedGatewayClient(config) {
    _classCallCheck(this, ManagedGatewayClient);

    var _this = _possibleConstructorReturn(this, (ManagedGatewayClient.__proto__ || Object.getPrototypeOf(ManagedGatewayClient)).call(this, config));

    if (config.org === QUICKSTART_ORG_ID) {
      throw new Error('cannot use quickstart for a managed device');
    }

    _this._deviceRequests = {};
    _this._dmRequests = {};

    //variables for firmware update
    _this.location = {};
    _this.mgmtFirmware = {};

    _this.observe;

    //various states in update of firmware
    _this.FIRMWARESTATE = {
      IDLE: 0,
      DOWNLOADING: 1,
      DOWNLOADED: 2
    };

    _this.FIRMWAREUPDATESTATE = {
      SUCCESS: 0,
      IN_PROGRESS: 1,
      OUT_OF_MEMORY: 2,
      CONNECTION_LOST: 3,
      VERIFICATION_FAILED: 4,
      UNSUPPORTED_IMAGE: 5,
      INVALID_URL: 6
    };

    _this.RESPONSECODE = {
      SUCCESS: 200,
      ACCEPTED: 202,
      UPDATE_SUCCESS: 204,
      BAD_REQUEST: 400,
      NOT_FOUND: 404,
      INTERNAL_ERROR: 500,
      FUNCTION_NOT_SUPPORTED: 501
    };

    return _this;
  }

  _createClass(ManagedGatewayClient, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      _get(ManagedGatewayClient.prototype.__proto__ || Object.getPrototypeOf(ManagedGatewayClient.prototype), 'connect', this).call(this);

      var mqtt = this.mqtt;

      this.mqtt.on('connect', function () {
        // mqtt.subscribe(DM_WILDCARD_TOPIC, { qos: QOS }, function(){});
      });

      this.mqtt.on('message', function (topic, payload) {
        console.log("Message [%s] : %s", topic, payload);

        /*
         let match = DM_RESPONSE_TOPIC_RE.exec(topic);
         if(match) {
         this._onDmResponse(match[1],match[2], payload);
         }
         */

        var match = DM_REQUEST_RE.exec(topic);
        var match2 = DM_JOHN_RE_TWO.exec(topic);
        var match3 = DM_JOHN_RE_ONE.exec(topic);
        var match4 = DM_JOHN_RE_FOUR.exec(topic);

        if (match2 || match3 || match4) {
          match2 = match4 ? match4 : match2 ? match2 : match3;

          var rebuildTopic = 'iotdm-1/' + match2[3];
          console.log("-----------------------------!!!!!!!!!!!   The rebuilt topic is: " + rebuildTopic);
          if (match2.length == 5) {
            rebuildTopic += '/' + match2[4];
          } else if (match2.length > 5) {
            rebuildTopic += '/' + match2[4] + '/' + match2[5] + '/' + match2[6] + '/' + match2[7];
          }

          if (rebuildTopic == DM_RESPONSE_TOPIC) {
            _this2._onDmResponse(match2[1], match2[2], payload);
          } else if (rebuildTopic == DM_UPDATE_TOPIC) {
            _this2._onDmUpdate(match2[1], match2[2], payload);
          } else if (rebuildTopic == DM_OBSERVE_TOPIC) {
            _this2._onDmObserve(match2[1], match2[2], payload);
          } else if (rebuildTopic == DM_CANCEL_OBSERVE_TOPIC) {
            _this2._onDmCancel(match2[1], match2[2], payload);
          } else {
            payload.type = match2[1];
            payload.id = match2[2];
            if (match2.length == 7 && match2[6] == 'update') {
              _this2._onDmRequest(DM_FIRMWARE_UPDATE_TOPIC, payload);
            } else {
              _this2._onDmRequest(DM_FIRMWARE_DOWNLOAD_TOPIC, payload);
            }
          }
        } else {
          _this2._onDmRequest(topic, payload);
        }
      });
    }
  }, {
    key: 'manageGateway',
    value: function manageGateway(lifetime, supportDeviceActions, supportFirmwareActions) {
      //this.type and this.id, are present in the parent Gateway Class.
      return this.manageDevice(this.type, this.id, lifetime, supportDeviceActions, supportFirmwareActions);
    }
  }, {
    key: 'manageDevice',
    value: function manageDevice(type, id, lifetime, supportDeviceActions, supportFirmwareActions) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      var d = new Object();

      if ((0, _util.isDefined)(lifetime)) {
        if (!(0, _util.isNumber)(lifetime)) {
          throw new Error("lifetime must be a number");
        }

        if (lifetime < 3600) {
          throw new Error("lifetime cannot be less than 3600");
        }

        d.lifetime = lifetime;
      }

      if ((0, _util.isDefined)(supportDeviceActions) || (0, _util.isDefined)(supportFirmwareActions)) {
        d.supports = new Object();

        if ((0, _util.isDefined)(supportDeviceActions)) {
          if (!(0, _util.isBoolean)(supportDeviceActions)) {
            throw new Error("supportDeviceActions must be a boolean");
          }

          d.supports.deviceActions = supportDeviceActions;
        }

        if ((0, _util.isDefined)(supportFirmwareActions)) {
          if (!(0, _util.isBoolean)(supportFirmwareActions)) {
            throw new Error("supportFirmwareActions must be a boolean");
          }

          d.supports.firmwareActions = supportFirmwareActions;
        }
      }

      var payload = new Object();
      payload.d = d;

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(MANAGE_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: MANAGE, topic: builtTopic, payload: payload };

      this.log.debug("Publishing manage request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'unmanageGateway',
    value: function unmanageGateway() {
      //this.type and this.id, are present in the parent Gateway Class.
      return this.unmanageDevice(this.type, this.id);
    }
  }, {
    key: 'unmanageDevice',
    value: function unmanageDevice(type, id) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      var payload = new Object();

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(UNMANAGE_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: UNMANAGE, topic: builtTopic, payload: payload };

      this.log.debug("Publishing unmanage request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'updateLocationGateway',
    value: function updateLocationGateway(latitude, longitude, elevation, accuracy) {
      //this.type and this.id, are present in the parent Gateway Class.
      return this.updateLocationDevice(this.type, this.id, latitude, longitude, elevation, accuracy);
    }
  }, {
    key: 'updateLocationDevice',
    value: function updateLocationDevice(type, id, latitude, longitude, elevation, accuracy) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      if (!(0, _util.isDefined)(longitude) || !(0, _util.isDefined)(latitude)) {
        throw new Error("longitude and latitude are required for updating location");
      }

      if (!(0, _util.isNumber)(longitude) || !(0, _util.isNumber)(latitude)) {
        throw new Error("longitude and latitude must be numbers");
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error("longitude cannot be less than -180 or greater than 180");
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error("latitude cannot be less than -90 or greater than 90");
      }

      var d = new Object();
      d.longitude = longitude;
      d.latitude = latitude;

      if ((0, _util.isDefined)(elevation)) {
        if (!(0, _util.isNumber)(elevation)) {
          throw new Error("elevation must be a number");
        }

        d.elevation = elevation;
      }

      if ((0, _util.isDefined)(accuracy)) {
        if (!(0, _util.isNumber)(accuracy)) {
          throw new Error("accuracy must be a number");
        }

        d.accuracy = accuracy;
      }

      d.measuredDateTime = new Date().toISOString();

      var payload = new Object();
      payload.d = d;

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(UPDATE_LOCATION_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: UPDATE_LOCATION, topic: builtTopic, payload: payload };

      this.log.debug("Publishing update location request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'addErrorCodeGateway',
    value: function addErrorCodeGateway(errorCode) {
      //this.type and this.id, are present in the parent Gateway Class.
      return this.addErrorCodeDevice(this.type, this.id, errorCode);
    }
  }, {
    key: 'addErrorCodeDevice',
    value: function addErrorCodeDevice(type, id, errorCode) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      if (!(0, _util.isDefined)(errorCode)) {
        throw new Error("error code is required for adding an error code");
      }

      if (!(0, _util.isNumber)(errorCode)) {
        throw new Error("error code must be a number");
      }

      var d = new Object();
      d.errorCode = errorCode;

      var payload = new Object();
      payload.d = d;

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(ADD_ERROR_CODE_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: ADD_ERROR, topic: builtTopic, payload: payload };

      this.log.debug("Publishing add error code request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'clearErrorCodesGateway',
    value: function clearErrorCodesGateway() {
      //this.type and this.id, are present in the parent Gateway Class.
      return this.clearErrorCodesDevice(this.type, this.id);
    }
  }, {
    key: 'clearErrorCodesDevice',
    value: function clearErrorCodesDevice(type, id) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      var payload = new Object();

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(CLEAR_ERROR_CODES_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: CLEAR_ERROR, topic: builtTopic, payload: payload };

      this.log.debug("Publishing clear error codes request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'addLogGateway',
    value: function addLogGateway(message, severity, data) {
      return this.addLogDevice(this.type, this.id, message, severity, data);
    }
  }, {
    key: 'addLogDevice',
    value: function addLogDevice(type, id, message, severity, data) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      if (!(0, _util.isDefined)(message) || !(0, _util.isDefined)(severity)) {
        throw new Error("message and severity are required for adding a log");
      }

      if (!(0, _util.isString)(message)) {
        throw new Error("message must be a string");
      }

      if (!(0, _util.isNumber)(severity)) {
        throw new Error("severity must be a number");
      }

      if (!(severity === 0 || severity === 1 || severity === 2)) {
        throw new Error("severity can only equal 0, 1, or 2");
      }

      var d = new Object();
      d.message = message;
      d.severity = severity;
      d.timestamp = new Date().toISOString();

      if ((0, _util.isDefined)(data)) {
        if (!(0, _util.isString)(data)) {
          throw new Error("data must be a string");
        }

        d.data = data;
      }

      var payload = new Object();
      payload.d = d;

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(ADD_LOG_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: ADD_LOG, topic: builtTopic, payload: payload };

      this.log.debug("Publishing add log request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'clearLogsGateway',
    value: function clearLogsGateway() {
      return this.clearLogsDevice(this.type, this.id);
    }
  }, {
    key: 'clearLogsDevice',
    value: function clearLogsDevice(type, id) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      var payload = new Object();

      var reqId = (0, _util.generateUUID)();
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      var builtTopic = (0, _format2.default)(CLEAR_LOGS_TOPIC, type, id);

      this._deviceRequests[reqId] = { action: CLEAR_LOG, topic: builtTopic, payload: payload };

      this.log.debug("Publishing clear logs request on topic [%s] with payload : %s", builtTopic, payload);
      this.mqtt.publish(builtTopic, payload, QOS);

      return reqId;
    }
  }, {
    key: 'respondDeviceAction',
    value: function respondDeviceAction(reqId, accept) {
      if (!this.isConnected) {
        this.log.error("Client is not connected");
        //throw new Error("Client is not connected");
        //instead of throwing error, will emit 'error' event.
        this.emit('error', "Client is not connected");
      }

      if (!(0, _util.isDefined)(reqId) || !(0, _util.isDefined)(accept)) {
        throw new Error("reqId and accept are required");
      }

      if (!(0, _util.isString)(reqId)) {
        throw new Error("reqId must be a string");
      }

      if (!(0, _util.isBoolean)(accept)) {
        throw new Error("accept must be a boolean");
      }

      var request = this._dmRequests[reqId];
      if (!(0, _util.isDefined)(request)) {
        throw new Error("unknown request : %s", reqId);
      }

      var rc;
      if (accept) {
        rc = 202;
      } else {
        rc = 500;
      }

      var payload = new Object();
      payload.rc = rc;
      payload.reqId = reqId;
      payload = JSON.stringify(payload);

      this.log.debug("Publishing device action response with payload : %s", payload);
      this.mqtt.publish(RESPONSE_TOPIC, payload, QOS);

      delete this._dmRequests[reqId];

      return this;
    }
  }, {
    key: '_onDmResponse',
    value: function _onDmResponse(type, id, payload) {
      payload = JSON.parse(payload);
      var reqId = payload.reqId;
      var rc = payload.rc;

      var request = this._deviceRequests[reqId];
      if (!(0, _util.isDefined)(request)) {
        throw new Error("unknown request : %s", reqId);
      }

      switch (request.action) {
        case MANAGE:
          if (rc == 200) {
            this.log.debug("[%s] Manage action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Manage action failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        case UNMANAGE:
          if (rc == 200) {
            this.log.debug("[%s] Unmanage action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Unmanage action failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        case UPDATE_LOCATION:
          if (rc == 200) {
            this.log.debug("[%s] Update location action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Update location failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        case ADD_LOG:
          if (rc == 200) {
            this.log.debug("[%s] Add log action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Add log action failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        case CLEAR_LOG:
          if (rc == 200) {
            this.log.debug("[%s] Clear logs action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Clear logs action failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        case ADD_ERROR:
          if (rc == 200) {
            this.log.debug("[%s] Add error code action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Add error code action failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        case CLEAR_ERROR:
          if (rc == 200) {
            this.log.debug("[%s] Clear error codes action completed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          } else {
            this.log.error("[%s] Clear error codes action failed for type : %s and id : %s with payload : %s", rc, type, id, request.payload);
          }
          break;
        default:
          throw new Error("unknown action response");
      }

      this.emit('dmResponse', {
        reqId: reqId,
        type: type,
        id: id,
        action: request.action,
        rc: rc
      });

      delete this._deviceRequests[reqId];

      return this;
    }
  }, {
    key: '_onDmRequest',
    value: function _onDmRequest(topic, payload) {
      payload = JSON.parse(payload);
      var reqId = payload.reqId;

      this._dmRequests[reqId] = { topic: topic, payload: payload };

      var match = DM_ACTION_RE.exec(topic);

      var data = {
        reqId: reqId,
        action: action
      };

      if (match) {
        var type = match[1];
        var action = match[2];

        if (type === "firmware") {
          if (action === "download") {
            this._handleFirmwareDownload(payload, data);
          } else if (action === "update") {
            this._handleFirmwareUpdate(payload, data);
          }
        } else {
          this.emit('dmAction', data);
        }
      }

      return this;
    }

    /**
     JOHN NYTT!!!!!!!!!!!!!!
     */

  }, {
    key: '_onDmUpdate',
    value: function _onDmUpdate(type, id, payload) {
      payload = JSON.parse(payload);
      var reqId = payload.reqId;

      var MANAGED_RESPONSE_TOPIC = utilNode.format(RESPONSE_TOPIC, type, id);

      this._dmRequests[reqId] = { topic: MANAGED_RESPONSE_TOPIC, payload: payload };

      var fields = payload.d.fields;

      for (var count = 0; count < fields.length; count++) {

        var field = fields[count];
        var fieldName = field.field;
        var value = field.value;
        value.type = type;
        value.id = id;

        this.log.debug("Update called for : %s with value : %s", fieldName, value);

        switch (fieldName) {
          case "mgmt.firmware":
            this.mgmtFirmware = value;
            break;
          case "location":
            this.location = value;
            //fire an event to notify user on location change
            this.emit('locationUpdate', value);
            break;
          case "metadata":
            //currently unsupported
            break;
          case "deviceInfo":
            //currently unsupported
            break;
          default:
            this.log.warn("Update called for Unknown field : " + fieldName);
        }
      }

      var payload = new Object();
      payload.rc = this.RESPONSECODE.UPDATE_SUCCESS;
      payload.reqId = reqId;

      payload = JSON.stringify(payload);

      this.log.debug("Publishing Device Update response with payload : %s", payload);
      this.mqtt.publish(MANAGED_RESPONSE_TOPIC, payload, QOS);

      return this;
    }
  }, {
    key: '_onDmObserve',
    value: function _onDmObserve(type, id, payload) {

      payload = JSON.parse(payload);
      var reqId = payload.reqId;

      var MANAGED_RESPONSE_TOPIC = utilNode.format(RESPONSE_TOPIC, type, id);

      var fields = payload.d.fields;

      for (var count = 0; count < fields.length; count++) {

        var field = fields[count];
        var fieldName = field.field;
        this.log.debug("Observe called for : " + fieldName);
        if (fieldName === 'mgmt.firmware') {
          this.observe = true;
          var payload = new Object();
          payload.rc = this.RESPONSECODE.SUCCESS;
          payload.reqId = reqId;

          payload.d = {};
          payload.d.fields = [];

          var fieldData = {
            field: fieldName,
            value: this.mgmtFirmware
          };

          payload.d.fields.push(fieldData);

          payload = JSON.stringify(payload);

          this.log.debug("Publishing Observe response with payload : %s", payload);
          this.mqtt.publish(MANAGED_RESPONSE_TOPIC, payload, QOS);
        }
      }

      return this;
    }
  }, {
    key: '_onDmCancel',
    value: function _onDmCancel(type, id, payload) {

      payload = JSON.parse(payload);
      var reqId = payload.reqId;

      var MANAGED_RESPONSE_TOPIC = utilNode.format(RESPONSE_TOPIC, type, id);

      var fields = payload.d.fields;

      for (var count = 0; count < fields.length; count++) {

        var field = fields[count];
        var fieldName = field.field;
        this.log.debug("Cancel called for : " + fieldName);
        if (fieldName === 'mgmt.firmware') {
          this.observe = false;
          var payload = new Object();
          payload.rc = this.RESPONSECODE.SUCCESS;
          payload.reqId = reqId;

          payload = JSON.stringify(payload);

          this.log.debug("Publishing Cancel response with payload : %s", payload);
          this.mqtt.publish(MANAGED_RESPONSE_TOPIC, payload, QOS);
        }
      }

      return this;
    }
  }, {
    key: '_handleFirmwareDownload',
    value: function _handleFirmwareDownload(payload, request) {

      this.log.debug("Called firmware Download");

      //this.log.debug("Current value of mgmtFirmware : "+JSON.stringify(this.mgmtFirmware));

      var rc = void 0;
      var message = "";
      if (this.mgmtFirmware.state !== this.FIRMWARESTATE.IDLE) {
        rc = this.RESPONSECODE.BAD_REQUEST;
        message = "Cannot download as the device is not in idle state";
      } else {
        rc = this.RESPONSECODE.ACCEPTED;
        this.emit('firmwareDownload', this.mgmtFirmware, payload);
      }

      var acceptFirmwareDownload = true;

      this.respondDeviceAction(request.reqId, acceptFirmwareDownload);

      return this;
    }
  }, {
    key: '_handleFirmwareUpdate',
    value: function _handleFirmwareUpdate(payload, request) {

      this.log.debug("Called firmware Update");

      //this.log.debug("Current value of mgmtFirmware : "+JSON.stringify(this.mgmtFirmware));

      var rc = void 0;
      var message = "";
      this.mgmtFirmware.state = this.FIRMWARESTATE.DOWNLOADED;
      if (this.mgmtFirmware.state !== this.FIRMWARESTATE.DOWNLOADED) {
        rc = this.RESPONSECODE.BAD_REQUEST;
        message = "Firmware is still not successfully downloaded.";
      } else {
        rc = this.RESPONSECODE.ACCEPTED;
        this.emit('firmwareUpdate', this.mgmtFirmware, payload);
      }

      var acceptFirmwareDownload = true;

      this.respondDeviceAction(request.reqId, acceptFirmwareDownload);

      return this;
    }
  }, {
    key: 'changeState',
    value: function changeState(type, id, state) {

      if (this.observe) {
        this.mgmtFirmware.state = state;
        this._notify(type, id, 'mgmt.firmware', 'state', state);
      } else {
        this.log.warn("changeState called, but the mgmt.firmware is not observed now");
      }
    }
  }, {
    key: 'changeUpdateState',
    value: function changeUpdateState(type, id, state) {

      if (this.observe) {
        this.mgmtFirmware.updateStatus = state;
        this._notify(type, id, 'mgmt.firmware', 'updateStatus', state);
      } else {
        this.log.warn("changeUpdateState called, but the mgmt.firmware is not observed now");
      }
    }
  }, {
    key: '_notify',
    value: function _notify(type, id, property, field, newValue) {
      this.log.debug("Notify called : %s field : %s newValue : %s", property, field, newValue);

      var MANAGED_NOTIFY_TOPIC = utilNode.format(NOTIFY_TOPIC, type, id);

      var payload = {};
      payload.d = {};
      payload.d.fields = [];

      var data = {};
      data[field] = newValue;
      var fieldData = {
        field: property,
        value: data
      };
      payload.d.fields.push(fieldData);

      payload = JSON.stringify(payload);
      this.log.debug("Notify with %s", payload);

      this.mqtt.publish(MANAGED_NOTIFY_TOPIC, payload, QOS);
    }
  }, {
    key: 'upwisDeviceConnected',
    value: function upwisDeviceConnected(type, id) {
      console.log('wow! A upwis device connected!');
      var DEVICE_MANAGEMENT_RESPONSE_TOPIC = utilNode.format(DM_DEVICE_RESPONSE_UPWIS_TOPIC, type, id);
      var DEVICE_MANAGEMENT_REQUEST_TOPIC = utilNode.format(DM_DEVICE_REQUEST_UPWIS_TOPIC, type, id);

      this.mqtt.subscribe(DEVICE_MANAGEMENT_RESPONSE_TOPIC, { qos: QOS }, function () {});
      this.mqtt.subscribe(DEVICE_MANAGEMENT_REQUEST_TOPIC, { qos: QOS }, function () {});
    }
  }, {
    key: 'disconnectDevice',
    value: function disconnectDevice(type, id) {
      console.log('disconnecting device type ' + type + ', id ' + id);
      var DEVICE_MANAGEMENT_RESPONSE_TOPIC = utilNode.format(DM_DEVICE_RESPONSE_UPWIS_TOPIC, type, id);
      var DEVICE_MANAGEMENT_REQUEST_TOPIC = utilNode.format(DM_DEVICE_REQUEST_UPWIS_TOPIC, type, id);
      console.log(DEVICE_MANAGEMENT_RESPONSE_TOPIC);
      console.log(DEVICE_MANAGEMENT_REQUEST_TOPIC);
      this.mqtt.unsubscribe(DEVICE_MANAGEMENT_RESPONSE_TOPIC, function () {});
      this.mqtt.unsubscribe(DEVICE_MANAGEMENT_REQUEST_TOPIC, function () {});
    }
  }]);

  return ManagedGatewayClient;
}(_GatewayClient3.default);

exports.default = ManagedGatewayClient;