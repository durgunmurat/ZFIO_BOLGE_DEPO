sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/ValueColor",
    "sap/m/DeviationIndicator"
], function(BaseController, JSONModel, ValueColor, DeviationIndicator) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.Home", {
        onInit: function() {
            // Initialize view model with counter data
            var oViewModel = new JSONModel({
                pendingReceipts: 10,
                pendingShipments: 3,
                pendingDeliveries: 3,
                pendingCounts: 3,
                // computed fields for UI state (using enum values)
                pendingReceiptsColor: ValueColor.Critical,
                pendingReceiptsIndicator: DeviationIndicator.Up,
                pendingShipmentsColor: ValueColor.Critical,
                pendingShipmentsIndicator: DeviationIndicator.Up,
                pendingDeliveriesColor: ValueColor.Critical,
                pendingDeliveriesIndicator: DeviationIndicator.Up,
                pendingCountsColor: ValueColor.Critical,
                pendingCountsIndicator: DeviationIndicator.Up
            });
            this.setModel(oViewModel, "homeView");

            // compute initial colors/indicators
            this._updateStatusIndicators();
        },

        onGoodsReceiptPress: function() {
            this.getRouter().navTo("goodsReceipt");
        },

        onShipmentAssignmentPress: function() {
            this.getRouter().navTo("shipmentAssignment");
        },

        onGoodsIssuePress: function() {
            this.getRouter().navTo("goodsIssue");
        },

        onInventoryCountPress: function() {
            this.getRouter().navTo("inventoryCount");
        }
        ,

        /**
         * Update the valueColor and indicator properties on the homeView model
         * based on simple thresholds. This keeps UI bindings declarative.
         */
        _updateStatusIndicators: function() {
            var oModel = this.getModel("homeView");
            if (!oModel) {
                return;
            }

            var fnState = function(iValue) {
                // Simple rule: if value === 0 -> Good/None, if > 0 -> Critical/Up
                if (!iValue || Number(iValue) === 0) {
                    return { 
                        color: ValueColor.Good, 
                        indicator: DeviationIndicator.None 
                    };
                }
                return { 
                    color: ValueColor.Critical, 
                    indicator: DeviationIndicator.Up 
                };
            };

            var oReceipts = fnState(oModel.getProperty("/pendingReceipts"));
            var oShipments = fnState(oModel.getProperty("/pendingShipments"));
            var oDeliveries = fnState(oModel.getProperty("/pendingDeliveries"));
            var oCounts = fnState(oModel.getProperty("/pendingCounts"));

            oModel.setProperty("/pendingReceiptsColor", oReceipts.color);
            oModel.setProperty("/pendingReceiptsIndicator", oReceipts.indicator);

            oModel.setProperty("/pendingShipmentsColor", oShipments.color);
            oModel.setProperty("/pendingShipmentsIndicator", oShipments.indicator);

            oModel.setProperty("/pendingDeliveriesColor", oDeliveries.color);
            oModel.setProperty("/pendingDeliveriesIndicator", oDeliveries.indicator);

            oModel.setProperty("/pendingCountsColor", oCounts.color);
            oModel.setProperty("/pendingCountsIndicator", oCounts.indicator);
        }
    });
});