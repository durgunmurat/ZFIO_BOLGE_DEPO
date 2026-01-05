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
        /**
         * Formatter: Format shipment ID - remove leading zeros and add prefix
         * @param {string} sShipmentId - Shipment ID
         * @returns {string} Formatted shipment ID
         */
        formatShipmentId: function(sShipmentId) {
            if (!sShipmentId) {
                return "";
            }
            // Remove leading zeros and add prefix
            var sCleanId = sShipmentId.replace(/^0+/, "");
            return "Nakliye No: " + sCleanId;
        },

        /**
         * Formatter: Format date to DD.MM.YYYY
         * @param {Date|string} vDate - Date value (timestamp or string)
         * @returns {string} Formatted date DD.MM.YYYY
         */
        formatDate: function(vDate) {
            if (!vDate) {
                return "";
            }
            
            var oDate;
            if (vDate instanceof Date) {
                oDate = vDate;
            } else {
                oDate = new Date(vDate);
            }
            
            if (isNaN(oDate.getTime())) {
                return "";
            }
            
            var sDay = String(oDate.getDate()).padStart(2, '0');
            var sMonth = String(oDate.getMonth() + 1).padStart(2, '0');
            var sYear = oDate.getFullYear();
            
            return sDay + "." + sMonth + "." + sYear;
        },

        onInit: function() {
            // Initialize empty models
            var oShipmentModel = new JSONModel([]);
            oShipmentModel.setSizeLimit(9999);
            this.getView().setModel(oShipmentModel, "shipmentModel");
            
            var oEmployeeModel = new JSONModel([]);
            oEmployeeModel.setSizeLimit(9999);
            this.getView().setModel(oEmployeeModel, "employeeModel");
            
            var oOfficerModel = new JSONModel([]);
            oOfficerModel.setSizeLimit(9999);
            this.getView().setModel(oOfficerModel, "officerModel");
            
            // Attach route matched handler
            this.getRouter().getRoute("shipmentAssignment").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            // Load employees and officers first, then load shipment data
            this._loadEmployeesAndOfficers();
        },

        /**
         * Load employees and officers from OData (one-time load per warehouse)
         */
        _loadEmployeesAndOfficers: function() {
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
            
            // Load both EmployeeSet and OfficerSet in parallel
            Promise.all([
                this._readOData("/EmployeeSet", aFilters),
                this._readOData("/OfficerSet", aFilters)
            ]).then(function(aResults) {
                var aEmployees = aResults[0];
                var aOfficers = aResults[1];
                
                this.getView().getModel("employeeModel").setData(aEmployees);
                this.getView().getModel("officerModel").setData(aOfficers);
                
                // After employees and officers loaded, load shipment data
                this._loadShipmentData();
            }.bind(this)).catch(function(oError) {
                MessageBox.error("Personel verileri yüklenirken hata oluştu.");
                console.error("Employee/Officer load error:", oError);
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
            
            // Load ShipmentSet, AssignedPersonnelSet, and AssignedOfficerSet in parallel
            Promise.all([
                this._readOData("/ShipmentSet", aShipmentFilters),
                this._readOData("/AssignedPersonnelSet", aShipmentFilters),
                this._readOData("/AssignedOfficerSet", aShipmentFilters)
            ]).then(function(aResults) {
                var aShipments = aResults[0];
                var aEmployeeAssignments = aResults[1];
                var aOfficerAssignments = aResults[2];
                
                // CLIENT-SIDE MERGING: Inject SelectedEmployeeKeys and SelectedOfficerKeys into each shipment
                aShipments.forEach(function(oShipment) {
                    // Match employee assignments
                    var aMatchedEmployeeAssignments = aEmployeeAssignments.filter(function(oAssignment) {
                        return oAssignment.ShipmentId === oShipment.ShipmentId;
                    });
                    
                    // Create array of employee IDs
                    var aSelectedEmployeeKeys = aMatchedEmployeeAssignments.map(function(oAssignment) {
                        return oAssignment.EmployeeId;
                    });
                    
                    // Match officer assignments
                    var aMatchedOfficerAssignments = aOfficerAssignments.filter(function(oAssignment) {
                        return oAssignment.ShipmentId === oShipment.ShipmentId;
                    });
                    
                    // Create array of officer IDs
                    var aSelectedOfficerKeys = aMatchedOfficerAssignments.map(function(oAssignment) {
                        return oAssignment.EmployeeId;
                        // return oAssignment.OfficerId;
                    });
                    
                    // Inject into shipment object
                    oShipment.SelectedEmployeeKeys = aSelectedEmployeeKeys;
                    oShipment.SelectedOfficerKeys = aSelectedOfficerKeys;
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
         * Open personnel selection dialog
         */
        onOpenPersonnelDialog: function(oEvent) {
            var oButton = oEvent.getSource();
            var oBindingContext = oButton.getBindingContext("shipmentModel");
            
            if (!oBindingContext) {
                return;
            }
            
            var oShipment = oBindingContext.getObject();
            this._currentShipment = oShipment;
            this._currentBindingContext = oBindingContext;
            
            // Create dialog if not exists
            if (!this._oPersonnelDialog) {
                this._oPersonnelDialog = new sap.m.Dialog({
                    title: "Personel Seçimi (Maksimum 5)",
                    contentWidth: "400px",
                    contentHeight: "500px",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.List({
                            mode: "MultiSelect",
                            items: {
                                path: "employeeModel>/",
                                template: new sap.m.StandardListItem({
                                    title: "{employeeModel>EmployeeName}",
                                    type: "Active"
                                })
                            },
                            selectionChange: this._onDialogSelectionChange.bind(this)
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Kaydet",
                        type: "Emphasized",
                        press: this._onSavePersonnelDialog.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "İptal",
                        press: function() {
                            this._oPersonnelDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oPersonnelDialog);
            }
            
            // Set selection AFTER dialog opens and items are rendered
            var oList = this._oPersonnelDialog.getContent()[0];
            oList.getBinding("items").refresh();
            
            // Set selected items based on SelectedEmployeeKeys
            this._oPersonnelDialog.attachAfterOpen(function() {
                this._updateDialogSelection(oList, this._currentShipment.SelectedEmployeeKeys || []);
            }.bind(this));
            
            this._oPersonnelDialog.open();
        },
        
        /**
         * Update dialog selection based on selected keys
         */
        _updateDialogSelection: function(oList, aSelectedKeys) {
            var aItems = oList.getItems();
            
            aItems.forEach(function(oItem) {
                var oContext = oItem.getBindingContext("employeeModel");
                if (oContext) {
                    var sEmployeeId = oContext.getProperty("EmployeeId");
                    var bSelected = aSelectedKeys.indexOf(sEmployeeId) !== -1;
                    oList.setSelectedItem(oItem, bSelected);
                }
            });
        },

        /**
         * Handle selection change in dialog - enforce max 5 limit
         */
        _onDialogSelectionChange: function(oEvent) {
            var oList = oEvent.getSource();
            var aSelectedItems = oList.getSelectedItems();
            
            // Check if trying to select more than 5
            if (aSelectedItems.length > 5) {
                var oListItem = oEvent.getParameter("listItem");
                var bSelected = oEvent.getParameter("selected");
                
                // If user tried to select 6th item, deselect it
                if (bSelected && aSelectedItems.length > 5) {
                    oList.setSelectedItem(oListItem, false);
                    MessageBox.warning("Maksimum 5 personel seçebilirsiniz.");
                }
            }
        },

        /**
         * Save personnel selection from dialog
         */
        _onSavePersonnelDialog: function() {
            var oList = this._oPersonnelDialog.getContent()[0];
            var aSelectedItems = oList.getSelectedItems();
            
            // Get selected employee IDs
            var aSelectedEmployeeKeys = aSelectedItems.map(function(oItem) {
                return oItem.getBindingContext("employeeModel").getObject().EmployeeId;
            });
            
            // Update model
            this.getView().getModel("shipmentModel").setProperty(
                this._currentBindingContext.getPath() + "/SelectedEmployeeKeys", 
                aSelectedEmployeeKeys
            );
            
            // Get current officer keys from model
            var aSelectedOfficerKeys = this._currentShipment.SelectedOfficerKeys || [];
            
            // Save to backend with BOTH employee and officer keys
            // this._saveAssignments(this._currentShipment.ShipmentId, aSelectedEmployeeKeys, aSelectedOfficerKeys);
            this._saveAssignments(this._currentShipment.ShipmentId, aSelectedEmployeeKeys );
            // Close dialog
            this._oPersonnelDialog.close();
        },

        /**
         * Open officer selection dialog
         */
        onOpenOfficerDialog: function(oEvent) {
            var oButton = oEvent.getSource();
            var oBindingContext = oButton.getBindingContext("shipmentModel");
            
            if (!oBindingContext) {
                return;
            }
            
            var oShipment = oBindingContext.getObject();
            this._currentShipment = oShipment;
            this._currentBindingContext = oBindingContext;
            
            // Create dialog if not exists
            if (!this._oOfficerDialog) {
                this._oOfficerDialog = new sap.m.Dialog({
                    title: "Memur Seçimi (Maksimum 1)",
                    contentWidth: "400px",
                    contentHeight: "500px",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.List({
                            mode: "MultiSelect",
                            items: {
                                path: "officerModel>/",
                                template: new sap.m.StandardListItem({
                                    title: "{officerModel>OfficerName}",
                                    type: "Active"
                                })
                            },
                            selectionChange: this._onOfficerDialogSelectionChange.bind(this)
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Kaydet",
                        type: "Emphasized",
                        press: this._onSaveOfficerDialog.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "İptal",
                        press: function() {
                            this._oOfficerDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oOfficerDialog);
            }
            
            // Set selection AFTER dialog opens and items are rendered
            var oList = this._oOfficerDialog.getContent()[0];
            oList.getBinding("items").refresh();
            
            // Set selected items based on SelectedOfficerKeys
            this._oOfficerDialog.attachAfterOpen(function() {
                this._updateOfficerDialogSelection(oList, this._currentShipment.SelectedOfficerKeys || []);
            }.bind(this));
            
            this._oOfficerDialog.open();
        },
        
        /**
         * Update officer dialog selection based on selected keys
         */
        _updateOfficerDialogSelection: function(oList, aSelectedKeys) {
            var aItems = oList.getItems();
            
            aItems.forEach(function(oItem) {
                var oContext = oItem.getBindingContext("officerModel");
                if (oContext) {
                    var sOfficerId = oContext.getProperty("OfficerId");
                    var bSelected = aSelectedKeys.indexOf(sOfficerId) !== -1;
                    oList.setSelectedItem(oItem, bSelected);
                }
            });
        },

        /**
         * Handle selection change in officer dialog - enforce max 1 limit
         */
        _onOfficerDialogSelectionChange: function(oEvent) {
            var oList = oEvent.getSource();
            var aSelectedItems = oList.getSelectedItems();
            
            // Check if trying to select more than 1
            if (aSelectedItems.length > 1) {
                var oListItem = oEvent.getParameter("listItem");
                var bSelected = oEvent.getParameter("selected");
                
                // If user tried to select 2nd item, deselect it
                if (bSelected && aSelectedItems.length > 1) {
                    oList.setSelectedItem(oListItem, false);
                    MessageBox.warning("Maksimum 1 memur seçebilirsiniz.");
                }
            }
        },

        /**
         * Save officer selection from dialog
         */
        _onSaveOfficerDialog: function() {
            var oList = this._oOfficerDialog.getContent()[0];
            var aSelectedItems = oList.getSelectedItems();
            
            // Get selected officer IDs
            var aSelectedOfficerKeys = aSelectedItems.map(function(oItem) {
                return oItem.getBindingContext("officerModel").getObject().OfficerId;
            });
            
            // Update model
            this.getView().getModel("shipmentModel").setProperty(
                this._currentBindingContext.getPath() + "/SelectedOfficerKeys", 
                aSelectedOfficerKeys
            );
            
            // Get current employee keys from model
            var aSelectedEmployeeKeys = this._currentShipment.SelectedEmployeeKeys || [];
            
            // Save to backend with BOTH employee and officer keys
            // this._saveAssignments(this._currentShipment.ShipmentId, aSelectedEmployeeKeys, aSelectedOfficerKeys);
            this._saveAssignments(this._currentShipment.ShipmentId, aSelectedOfficerKeys);            
            // Close dialog
            this._oOfficerDialog.close();
        },

        /**
         * Search handler - client-side filtering (live search)
         * Case-insensitive search with Turkish locale support
         */
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oList = this.byId("idShipmentList");
            var oBinding = oList.getBinding("items");
            
            if (!oBinding) {
                return;
            }
            
            var aFilters = [];
            
            if (sQuery && sQuery.length > 0) {
                // Use Turkish locale for proper İ/i and I/ı handling
                var sQueryLower = sQuery.toLocaleLowerCase('tr-TR');
                // Custom filter function for case-insensitive search
                aFilters.push(new Filter({
                    path: "",
                    test: function(oItem) {
                        var sShipmentId = (oItem.ShipmentId || "").toLocaleLowerCase('tr-TR');
                        var sCustomerName = (oItem.CustomerName || "").toLocaleLowerCase('tr-TR');
                        return sShipmentId.indexOf(sQueryLower) !== -1 || 
                               sCustomerName.indexOf(sQueryLower) !== -1;
                    }
                }));
            }
            
            oBinding.filter(aFilters);
        },

        /**
         * Save assignments via OData function import
         * CRITICAL: Combines BOTH employee and officer IDs into single payload
         * Backend expects comma-separated list of ALL assigned personnel IDs
         */
        _saveAssignments: function(sShipmentId, aSelectedEmployeeKeys, aSelectedOfficerKeys) {
            var oModel = this.getOwnerComponent().getModel();
            
            // Combine employee and officer IDs
            var aCombinedIds = [];
            if (aSelectedEmployeeKeys && aSelectedEmployeeKeys.length > 0) {
                aCombinedIds = aCombinedIds.concat(aSelectedEmployeeKeys);
            }
            if (aSelectedOfficerKeys && aSelectedOfficerKeys.length > 0) {
                aCombinedIds = aCombinedIds.concat(aSelectedOfficerKeys);
            }
            
            var sAssignedEmployeeIds = aCombinedIds.join(",");
            
            oModel.callFunction("/UpdateShipmentAssignments", {
                method: "POST",
                urlParameters: {
                    "ShipmentId": sShipmentId,
                    "AssignedEmployeeIds": sAssignedEmployeeIds
                },
                success: function(oData, oResponse) {
                    MessageBox.success("Kayıt başarılı.");
                    // Refresh dashboard data to update pending counts
                    this.refreshDashboardData();
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