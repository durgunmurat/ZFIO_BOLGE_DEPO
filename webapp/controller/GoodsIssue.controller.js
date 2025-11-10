sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.GoodsIssue", {
        onInit: function() {
            var oViewModel = new JSONModel({
                deliveries: [
                    {
                        id: "6092740",
                        driver: "YETİŞ YILDIRIM",
                        date: "14/07/2025",
                        progress: "0",
                        total: "35",
                        loaded: "0"
                    },
                    {
                        id: "6092743",
                        driver: "CELİL ÖKTEN_TSL.MT_SQE #DS",
                        date: "14/07/2025",
                        progress: "0",
                        total: "21",
                        loaded: "0"
                    }
                ]
            });
            this.setModel(oViewModel);
        },

        calculateProgress: function(loaded, total) {
            return Math.round((loaded / total) * 100);
        }
    });
});