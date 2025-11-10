sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.InventoryCount", {
        onInit: function() {
            var oViewModel = new JSONModel({
                counts: [],
                filterKey: "pending"
            });
            this.setModel(oViewModel);
        },

        onNewCount: function() {
            // TODO: Implement new inventory count creation logic
            this.showMessage("Yeni sayım başlatılıyor");
        },

        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            // TODO: Implement search logic
            this.showMessage("Arama yapılıyor: " + sQuery);
        }
    });
});