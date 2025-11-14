sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("com.sut.bolgeyonetim.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // set device model
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // Restore sessionModel from localStorage if it exists
            this._restoreSessionModel();

            // create the views based on the url/hash
            this.getRouter().initialize();
        },

        _restoreSessionModel: function() {
            try {
                var sStoredSession = localStorage.getItem("sessionData");
                if (sStoredSession) {
                    var oSessionData = JSON.parse(sStoredSession);
                    var oSessionModel = new JSONModel(oSessionData);
                    this.setModel(oSessionModel, "sessionModel");
                }
            } catch (e) {
                // If there's an error reading from localStorage, just continue
                console.warn("Could not restore session from localStorage:", e);
            }
        }
    });
});