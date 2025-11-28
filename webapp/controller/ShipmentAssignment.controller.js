sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(BaseController, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.ShipmentAssignment", {
        onInit: function() {
            // Initialize empty models
            var oShipmentModel = new JSONModel([]);
            oShipmentModel.setSizeLimit(9999);
            this.getView().setModel(oShipmentModel, "shipmentModel");
            
            var oEmployeeModel = new JSONModel([]);
            oEmployeeModel.setSizeLimit(9999);
            this.getView().setModel(oEmployeeModel, "employeeModel");
            
            // Attach route matched handler
            this.getRouter().getRoute("shipmentAssignment").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            // Load employees first, then load shipment data
            this._loadEmployees();
        },

        /**
         * Load employees from OData (one-time load per warehouse)
         */
        _loadEmployees: function() {
            var oModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var sWarehouseNum = oSessionModel ? oSessionModel.getProperty("/Login/WarehouseNum") : null;
            
            if (!sWarehouseNum) {
                MessageBox.error("Depo numarası bulunamadı. Lütfen tekrar giriş yapın.");
                return;
            }
            
            // CRITICAL: Use exact property name from OData metadata (case-sensitive)
            var aFilters = [
                new Filter({
                    path: "WarehouseNum",
                    operator: FilterOperator.EQ,
                    value1: sWarehouseNum
                })
            ];
            
            oModel.read("/EmployeeSet", {
                filters: aFilters,
                success: function(oData) {
                    var aEmployees = oData.results || [];
                    this.getView().getModel("employeeModel").setData(aEmployees);
                    
                    // After employees loaded, load shipment data
                    this._loadShipmentData();
                }.bind(this),
                error: function(oError) {
                    MessageBox.error("Personel verileri yüklenirken hata oluştu.");
                    console.error("Employee load error:", oError);
                }.bind(this)
            });
        },

        /**
         * Load shipments and assignments, then merge them client-side
         */
        _loadShipmentData: function() {
            var oModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");
            
            var sWarehouseNum = oSessionModel ? oSessionModel.getProperty("/Login/WarehouseNum") : null;
            var sSelectedDate = oFilterModel ? oFilterModel.getProperty("/selectedDate") : null;
            
            if (!sWarehouseNum) {
                MessageBox.error("Depo numarası bulunamadı.");
                return;
            }
            
            // Convert date to OData format
            var oDateForFilter;
            if (sSelectedDate) {
                var aParts = sSelectedDate.split('-');
                oDateForFilter = new Date(Date.UTC(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]), 0, 0, 0));
            } else {
                var oToday = new Date();
                oDateForFilter = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), 0, 0, 0));
            }
            
            // CRITICAL: Use exact property names from OData metadata (case-sensitive)
            // Use explicit object notation to preserve case
            var aShipmentFilters = [
                new Filter({
                    path: "WarehouseNum",
                    operator: FilterOperator.EQ,
                    value1: sWarehouseNum
                }),
                new Filter({
                    path: "ShipmentDate",
                    operator: FilterOperator.EQ,
                    value1: oDateForFilter
                })
            ];
            
            // Load both ShipmentSet and AssignedPersonnelSet in parallel
            Promise.all([
                this._readOData("/ShipmentSet", aShipmentFilters),
                this._readOData("/AssignedPersonnelSet", [])
            ]).then(function(aResults) {
                var aShipments = aResults[0];
                var aAssignments = aResults[1];
                
                // CLIENT-SIDE MERGING: Inject SelectedEmployeeKeys into each shipment
                aShipments.forEach(function(oShipment) {
                    var aMatchedAssignments = aAssignments.filter(function(oAssignment) {
                        return oAssignment.ShipmentId === oShipment.ShipmentId;
                    });
                    
                    // Create array of employee IDs
                    var aSelectedKeys = aMatchedAssignments.map(function(oAssignment) {
                        return oAssignment.EmployeeId;
                    });
                    
                    // Inject into shipment object
                    oShipment.SelectedEmployeeKeys = aSelectedKeys;
                });
                
                // Set merged data to model
                this.getView().getModel("shipmentModel").setData(aShipments);
                
            }.bind(this)).catch(function(oError) {
                MessageBox.error("Yükleme verileri yüklenirken hata oluştu.");
                console.error("Data load error:", oError);
            });
        },

        /**
         * Helper function to read OData with Promise
         */
        _readOData: function(sPath, aFilters) {
            var oModel = this.getOwnerComponent().getModel();
            
            return new Promise(function(resolve, reject) {
                oModel.read(sPath, {
                    filters: aFilters,
                    success: function(oData) {
                        resolve(oData.results || []);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Search handler - client-side filtering
         */
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oList = this.byId("idShipmentList");
            var oBinding = oList.getBinding("items");
            
            if (!oBinding) {
                return;
            }
            
            var aFilters = [];
            
            if (sQuery && sQuery.length > 0) {
                // Search in ShipmentId OR CustomerName
                aFilters.push(new Filter({
                    filters: [
                        new Filter("ShipmentId", FilterOperator.Contains, sQuery),
                        new Filter("CustomerName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            
            oBinding.filter(aFilters);
        },

        /**
         * Personnel selection change handler with validation and auto-save
         */
        onPersonnelSelectionChange: function(oEvent) {
            var oMultiComboBox = oEvent.getSource();
            var aSelectedItems = oEvent.getParameter("selectedItems");
            var oBindingContext = oMultiComboBox.getBindingContext("shipmentModel");
            
            if (!oBindingContext) {
                return;
            }
            
            var oShipment = oBindingContext.getObject();
            var sShipmentId = oShipment.ShipmentId;
            
            // VALIDATION: Max 5 personnel
            if (aSelectedItems.length > 5) {
                MessageBox.error("Maksimum 5 personel atayabilirsiniz.");
                
                // REVERT: Reset to previous selection
                setTimeout(function() {
                    oMultiComboBox.setSelectedKeys(oShipment.SelectedEmployeeKeys || []);
                }, 100);
                
                return;
            }
            
            // Get new selected keys
            var aSelectedKeys = aSelectedItems.map(function(oItem) {
                return oItem.getKey();
            });
            
            // Update model immediately for UI responsiveness
            this.getView().getModel("shipmentModel").setProperty(oBindingContext.getPath() + "/SelectedEmployeeKeys", aSelectedKeys);
            
            // AUTO-SAVE: Call function import
            this._saveAssignments(sShipmentId, aSelectedKeys);
        },

        /**
         * Save assignments via OData function import
         */
        _saveAssignments: function(sShipmentId, aSelectedKeys) {
            var oModel = this.getOwnerComponent().getModel();
            var sAssignedEmployeeIds = aSelectedKeys.join(",");
            
            oModel.callFunction("/UpdateShipmentAssignments", {
                method: "POST",
                urlParameters: {
                    "ShipmentId": sShipmentId,
                    "AssignedEmployeeIds": sAssignedEmployeeIds
                },
                success: function(oData, oResponse) {
                    // Show success toast (non-blocking)
                    MessageToast.show("Kayıt başarılı");
                }.bind(this),
                error: function(oError) {
                    MessageBox.error("Kayıt başarısız. Lütfen tekrar deneyin.");
                    
                    // Reload data to sync state
                    this._loadShipmentData();
                }.bind(this)
            });
        }
    });
});