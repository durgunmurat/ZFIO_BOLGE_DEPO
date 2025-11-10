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

            // create the views based on the url/hash
            this.getRouter().initialize();
        }
    });
});