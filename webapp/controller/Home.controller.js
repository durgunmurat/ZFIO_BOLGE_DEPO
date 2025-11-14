sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/ValueColor",
    "sap/m/DeviationIndicator"
], function(BaseController, JSONModel, ValueColor, DeviationIndicator) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.Home", {
        onInit: function() {
            // Initialize filter model with today's date
            var oToday = new Date();
            var sYear = oToday.getFullYear();
            var sMonth = String(oToday.getMonth() + 1).padStart(2, '0');
            var sDay = String(oToday.getDate()).padStart(2, '0');
            var sTodayFormatted = sYear + "-" + sMonth + "-" + sDay;

            var oFilterModel = new JSONModel({
                selectedDate: sTodayFormatted,
                selectedDateFormatted: sTodayFormatted + "T00:00:00"
            });
            this.getOwnerComponent().setModel(oFilterModel, "filterModel");

            // Remove hardcoded test values. Dashboard counts come from global "dashboardData" model populated at login.
            var oDashboardModel = this.getOwnerComponent().getModel("dashboardData");
            if (!oDashboardModel) {
                // create an empty dashboardData model so bindings won't break
                oDashboardModel = new JSONModel({
                    pendingReceipts: 0,
                    pendingShipments: 0,
                    pendingDeliveries: 0,
                    pendingCounts: 0
                });
                this.getOwnerComponent().setModel(oDashboardModel, "dashboardData");
            }

            // compute indicators initially and whenever dashboardData changes
            this._updateStatusIndicators();
            oDashboardModel.attachEvent("change", function() {
                this._updateStatusIndicators();
            }.bind(this));
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
        },

        onDateChange: function(oEvent) {
            // Update the formatted date for OData queries when user changes the date
            var sSelectedDate = oEvent.getParameter("value");
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");
            
            if (sSelectedDate && oFilterModel) {
                // Convert from display format (dd.MM.yyyy) to OData format (yyyy-MM-ddT00:00:00)
                var oDatePicker = oEvent.getSource();
                var oDate = oDatePicker.getDateValue();
                
                if (oDate) {
                    var sYear = oDate.getFullYear();
                    var sMonth = String(oDate.getMonth() + 1).padStart(2, '0');
                    var sDay = String(oDate.getDate()).padStart(2, '0');
                    var sFormattedDate = sYear + "-" + sMonth + "-" + sDay;
                    var sODataDate = sFormattedDate + "T00:00:00";
                    
                    oFilterModel.setProperty("/selectedDate", sFormattedDate);
                    oFilterModel.setProperty("/selectedDateFormatted", sODataDate);
                }
            }
        }
        ,

        /**
         * Update the valueColor and indicator properties on the homeView model
         * based on simple thresholds. This keeps UI bindings declarative.
         */
        _updateStatusIndicators: function() {
            var oModel = this.getOwnerComponent().getModel("dashboardData");
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
            var oData = oModel.getData() || {};
            var oReceipts = fnState(oData.pendingReceipts);
            var oShipments = fnState(oData.pendingShipments);
            var oDeliveries = fnState(oData.pendingDeliveries);
            var oCounts = fnState(oData.pendingCounts);

            // Set computed indicator/color properties back on dashboardData model so bindings update
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