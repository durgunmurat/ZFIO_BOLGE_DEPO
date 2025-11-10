sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.ShipmentAssignment", {
        onInit: function() {
            var oViewModel = new JSONModel({
                shipments: [
                    {
                        id: "6092740",
                        date: "14/07/2025",
                        driver: "YETİŞ YILDIRIM",
                        products: "0/35",
                        status: "Bekliyor"
                    },
                    {
                        id: "6092743",
                        date: "14/07/2025",
                        driver: "CELİL ÖKTEN_TSL.MT_SQE #DS",
                        products: "0/21",
                        status: "Bekliyor"
                    }
                ]
            });
            this.setModel(oViewModel);
        },

        onSearch: function(oEvent) {
            // TODO: Implement search logic
            var sQuery = oEvent.getParameter("query");
            this.showMessage("Arama yapılıyor: " + sQuery);
        }
    });
});