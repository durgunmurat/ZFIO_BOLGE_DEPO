sap.ui.define(
  [
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
  ) {
    "use strict";

    return BaseController.extend(
      "com.sut.bolgeyonetim.controller.ShipmentAssignment",
      {
        /**
         * Formatter: Format shipment ID - remove leading zeros and add prefix
         * @param {string} sShipmentId - Shipment ID
         * @returns {string} Formatted shipment ID
         */
        formatShipmentId: function (sShipmentId) {
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
        formatDate: function (vDate) {
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

          var sDay = String(oDate.getDate()).padStart(2, "0");
          var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
          var sYear = oDate.getFullYear();

          return sDay + "." + sMonth + "." + sYear;
        },

        onInit: function () {
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

          // Initialize stats model for tab counts
          var oStatsModel = new JSONModel({
            monoCount: 0,
            organizeCount: 0,
            currentTypeAllCount: 0,
            currentTypePendingCount: 0,
            currentTypeAssignedCount: 0,
          });
          this.getView().setModel(oStatsModel, "shipmentStatsModel");

          // Store all shipments for filtering
          this._aAllShipments = [];
          this._sCurrentTypeFilter = "MONO";
          this._sCurrentAssignmentFilter = "all";
          this._sCurrentSearchQuery = "";

          // Attach route matched handler
          this.getRouter()
            .getRoute("shipmentAssignment")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
          // Reset filters on route match
          this._sCurrentTypeFilter = "MONO";
          this._sCurrentAssignmentFilter = "all";
          this._sCurrentSearchQuery = "";

          // Reset IconTabBars to default
          var oTypeBar = this.byId("idTypeFilterBar");
          var oAssignmentBar = this.byId("idAssignmentFilterBar");
          if (oTypeBar) oTypeBar.setSelectedKey("MONO");
          if (oAssignmentBar) oAssignmentBar.setSelectedKey("all");

          // Load employees and officers first, then load shipment data
          this._loadEmployeesAndOfficers();
        },

        /**
         * Load employees and officers from OData (one-time load per warehouse)
         */
        _loadEmployeesAndOfficers: function () {
          var oModel = this.getOwnerComponent().getModel();
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sWarehouseNum = oSessionModel
            ? oSessionModel.getProperty("/Login/WarehouseNum")
            : null;

          if (!sWarehouseNum) {
            MessageBox.error(
              "Depo numarası bulunamadı. Lütfen tekrar giriş yapın.",
            );
            return;
          }

          // CRITICAL: Use exact property name from OData metadata (case-sensitive)
          var aFilters = [
            new Filter({
              path: "WarehouseNum",
              operator: FilterOperator.EQ,
              value1: sWarehouseNum,
            }),
          ];

          // Load both EmployeeSet and OfficerSet in parallel
          Promise.all([
            this._readOData("/EmployeeSet", aFilters),
            this._readOData("/OfficerSet", aFilters),
          ])
            .then(
              function (aResults) {
                var aEmployees = aResults[0];
                var aOfficers = aResults[1];

                this.getView().getModel("employeeModel").setData(aEmployees);
                this.getView().getModel("officerModel").setData(aOfficers);

                // After employees and officers loaded, load shipment data
                this._loadShipmentData();
              }.bind(this),
            )
            .catch(
              function (oError) {
                var sErrorMessage = this._extractErrorMessage(oError);
                MessageBox.error(
                  sErrorMessage || "Personel verileri yüklenirken hata oluştu.",
                );
                console.error("Employee/Officer load error:", oError);
              }.bind(this),
            );
        },

        /**
         * Load shipments and assignments, then merge them client-side
         */
        _loadShipmentData: function () {
          var oModel = this.getOwnerComponent().getModel();
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");

          var sWarehouseNum = oSessionModel
            ? oSessionModel.getProperty("/Login/WarehouseNum")
            : null;
          var sSelectedDate = oFilterModel
            ? oFilterModel.getProperty("/selectedDate")
            : null;

          if (!sWarehouseNum) {
            MessageBox.error("Depo numarası bulunamadı.");
            return;
          }

          // Convert date to OData format
          var oDateForFilter;
          if (sSelectedDate) {
            var aParts = sSelectedDate.split("-");
            oDateForFilter = new Date(
              Date.UTC(
                parseInt(aParts[0]),
                parseInt(aParts[1]) - 1,
                parseInt(aParts[2]),
                0,
                0,
                0,
              ),
            );
          } else {
            var oToday = new Date();
            oDateForFilter = new Date(
              Date.UTC(
                oToday.getFullYear(),
                oToday.getMonth(),
                oToday.getDate(),
                0,
                0,
                0,
              ),
            );
          }

          // CRITICAL: Use exact property names from OData metadata (case-sensitive)
          // Use explicit object notation to preserve case
          var aShipmentFilters = [
            new Filter({
              path: "WarehouseNum",
              operator: FilterOperator.EQ,
              value1: sWarehouseNum,
            }),
            new Filter({
              path: "ShipmentDate",
              operator: FilterOperator.EQ,
              value1: oDateForFilter,
            }),
          ];

          // Load ShipmentSet, AssignedPersonnelSet, and AssignedOfficerSet in parallel
          Promise.all([
            this._readOData("/ShipmentSet", aShipmentFilters),
            this._readOData("/AssignedPersonnelSet", aShipmentFilters),
            this._readOData("/AssignedOfficerSet", aShipmentFilters),
          ])
            .then(
              function (aResults) {
                var aShipments = aResults[0];
                var aEmployeeAssignments = aResults[1];
                var aOfficerAssignments = aResults[2];

                // CLIENT-SIDE MERGING: Inject SelectedEmployeeKeys and SelectedOfficerKeys into each shipment
                aShipments.forEach(function (oShipment) {
                  // Match employee assignments
                  var aMatchedEmployeeAssignments = aEmployeeAssignments.filter(
                    function (oAssignment) {
                      return oAssignment.ShipmentId === oShipment.ShipmentId;
                    },
                  );

                  // Create array of employee IDs
                  var aSelectedEmployeeKeys = aMatchedEmployeeAssignments.map(
                    function (oAssignment) {
                      return oAssignment.EmployeeId;
                    },
                  );

                  // Match officer assignments
                  var aMatchedOfficerAssignments = aOfficerAssignments.filter(
                    function (oAssignment) {
                      return oAssignment.ShipmentId === oShipment.ShipmentId;
                    },
                  );

                  // Create array of officer IDs
                  var aSelectedOfficerKeys = aMatchedOfficerAssignments.map(
                    function (oAssignment) {
                      return oAssignment.EmployeeId;
                      // return oAssignment.OfficerId;
                    },
                  );

                  // Inject into shipment object
                  oShipment.SelectedEmployeeKeys = aSelectedEmployeeKeys;
                  oShipment.SelectedOfficerKeys = aSelectedOfficerKeys;

                  // Calculate if assigned (has at least one officer or employee)
                  oShipment._isAssigned =
                    aSelectedEmployeeKeys.length > 0 ||
                    aSelectedOfficerKeys.length > 0;
                });

                // Sort: unassigned first, then by ShipmentId
                aShipments.sort(function (a, b) {
                  // First sort by assignment status (unassigned first)
                  if (a._isAssigned !== b._isAssigned) {
                    return a._isAssigned ? 1 : -1;
                  }
                  // Then sort by ShipmentId
                  return (a.ShipmentId || "").localeCompare(b.ShipmentId || "");
                });

                // Store all shipments for filtering
                this._aAllShipments = aShipments;

                // Calculate stats and apply initial filter
                this._updateStatsAndFilter();
              }.bind(this),
            )
            .catch(
              function (oError) {
                var sErrorMessage = this._extractErrorMessage(oError);
                MessageBox.error(
                  sErrorMessage || "Yükleme verileri yüklenirken hata oluştu.",
                );
                console.error("Data load error:", oError);
              }.bind(this),
            );
        },

        /**
         * Helper function to read OData with Promise
         */
        _readOData: function (sPath, aFilters) {
          var oModel = this.getOwnerComponent().getModel();

          return new Promise(function (resolve, reject) {
            oModel.read(sPath, {
              filters: aFilters,
              success: function (oData) {
                resolve(oData.results || []);
              },
              error: function (oError) {
                reject(oError);
              },
            });
          });
        },

        /**
         * Helper function to extract error message from OData error response
         * @param {object} oError - OData error object
         * @returns {string} Extracted error message or empty string
         */
        _extractErrorMessage: function (oError) {
          var sMessage = "";
          try {
            if (oError && oError.responseText) {
              var o = JSON.parse(oError.responseText);

              // Standard OData v2 error shape: o.error.message.value
              if (o && o.error && o.error.message && o.error.message.value) {
                sMessage = o.error.message.value;
              }

              // SAP Gateway specific: look for innererror.errordetails (message container)
              var aDetails = null;
              if (
                o &&
                o.error &&
                o.error.innererror &&
                o.error.innererror.errordetails
              ) {
                aDetails = o.error.innererror.errordetails;
              } else if (o && o.error && o.error.errordetails) {
                aDetails = o.error.errordetails;
              }

              if (aDetails && Array.isArray(aDetails) && aDetails.length) {
                // Build a combined message from errordetails
                var aMsgs = aDetails
                  .map(function (d) {
                    return d.message || d.Message || "";
                  })
                  .filter(Boolean);
                if (aMsgs.length) {
                  sMessage = aMsgs.join("\n");
                }
              }
            } else if (oError && oError.message) {
              sMessage = oError.message;
            } else if (oError && oError.statusText) {
              sMessage = oError.statusText;
            }
          } catch (e) {
            console.error("Error parsing error response:", e);
            if (oError && oError.statusText) {
              sMessage = oError.statusText;
            }
          }
          return sMessage;
        },

        /**
         * Open personnel selection dialog
         */
        onOpenPersonnelDialog: function (oEvent) {
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
                      type: "Active",
                    }),
                  },
                  selectionChange: this._onDialogSelectionChange.bind(this),
                }),
              ],
              beginButton: new sap.m.Button({
                text: "Kaydet",
                type: "Emphasized",
                press: this._onSavePersonnelDialog.bind(this),
              }),
              endButton: new sap.m.Button({
                text: "İptal",
                press: function () {
                  this._oPersonnelDialog.close();
                }.bind(this),
              }),
            });
            this.getView().addDependent(this._oPersonnelDialog);
          }

          // Set selection AFTER dialog opens and items are rendered
          var oList = this._oPersonnelDialog.getContent()[0];
          oList.getBinding("items").refresh();

          // Set selected items based on SelectedEmployeeKeys
          this._oPersonnelDialog.attachAfterOpen(
            function () {
              this._updateDialogSelection(
                oList,
                this._currentShipment.SelectedEmployeeKeys || [],
              );
            }.bind(this),
          );

          this._oPersonnelDialog.open();
        },

        /**
         * Update dialog selection based on selected keys
         */
        _updateDialogSelection: function (oList, aSelectedKeys) {
          var aItems = oList.getItems();

          aItems.forEach(function (oItem) {
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
        _onDialogSelectionChange: function (oEvent) {
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
        _onSavePersonnelDialog: function () {
          var oList = this._oPersonnelDialog.getContent()[0];
          var aSelectedItems = oList.getSelectedItems();

          // Get selected employee IDs
          var aSelectedEmployeeKeys = aSelectedItems.map(function (oItem) {
            return oItem.getBindingContext("employeeModel").getObject()
              .EmployeeId;
          });

          // Update model
          this.getView()
            .getModel("shipmentModel")
            .setProperty(
              this._currentBindingContext.getPath() + "/SelectedEmployeeKeys",
              aSelectedEmployeeKeys,
            );

          // Get current officer keys from model
          var aSelectedOfficerKeys =
            this._currentShipment.SelectedOfficerKeys || [];

          // Update _isAssigned status
          var bIsAssigned =
            aSelectedEmployeeKeys.length > 0 || aSelectedOfficerKeys.length > 0;
          this.getView()
            .getModel("shipmentModel")
            .setProperty(
              this._currentBindingContext.getPath() + "/_isAssigned",
              bIsAssigned,
            );

          // Update _aAllShipments for consistent filtering
          this._updateAllShipmentsAssignment(
            this._currentShipment.ShipmentId,
            aSelectedEmployeeKeys,
            aSelectedOfficerKeys,
          );

          // Save to backend with BOTH employee and officer keys
          this._saveAssignments(
            this._currentShipment.ShipmentId,
            aSelectedEmployeeKeys,
            aSelectedOfficerKeys,
            "EMPLOYEE",
          );
          // this._saveAssignments(this._currentShipment.ShipmentId, aSelectedEmployeeKeys );
          // Close dialog
          this._oPersonnelDialog.close();
        },

        /**
         * Open officer selection dialog
         */
        onOpenOfficerDialog: function (oEvent) {
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
                      type: "Active",
                    }),
                  },
                  selectionChange:
                    this._onOfficerDialogSelectionChange.bind(this),
                }),
              ],
              beginButton: new sap.m.Button({
                text: "Kaydet",
                type: "Emphasized",
                press: this._onSaveOfficerDialog.bind(this),
              }),
              endButton: new sap.m.Button({
                text: "İptal",
                press: function () {
                  this._oOfficerDialog.close();
                }.bind(this),
              }),
            });
            this.getView().addDependent(this._oOfficerDialog);
          }

          // Set selection AFTER dialog opens and items are rendered
          var oList = this._oOfficerDialog.getContent()[0];
          oList.getBinding("items").refresh();

          // Set selected items based on SelectedOfficerKeys
          this._oOfficerDialog.attachAfterOpen(
            function () {
              this._updateOfficerDialogSelection(
                oList,
                this._currentShipment.SelectedOfficerKeys || [],
              );
            }.bind(this),
          );

          this._oOfficerDialog.open();
        },

        /**
         * Update officer dialog selection based on selected keys
         */
        _updateOfficerDialogSelection: function (oList, aSelectedKeys) {
          var aItems = oList.getItems();

          aItems.forEach(function (oItem) {
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
        _onOfficerDialogSelectionChange: function (oEvent) {
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
        _onSaveOfficerDialog: function () {
          var oList = this._oOfficerDialog.getContent()[0];
          var aSelectedItems = oList.getSelectedItems();

          // Get selected officer IDs
          var aSelectedOfficerKeys = aSelectedItems.map(function (oItem) {
            return oItem.getBindingContext("officerModel").getObject()
              .OfficerId;
          });

          // Update model
          this.getView()
            .getModel("shipmentModel")
            .setProperty(
              this._currentBindingContext.getPath() + "/SelectedOfficerKeys",
              aSelectedOfficerKeys,
            );

          // Get current employee keys from model
          var aSelectedEmployeeKeys =
            this._currentShipment.SelectedEmployeeKeys || [];

          // Update _isAssigned status
          var bIsAssigned =
            aSelectedEmployeeKeys.length > 0 || aSelectedOfficerKeys.length > 0;
          this.getView()
            .getModel("shipmentModel")
            .setProperty(
              this._currentBindingContext.getPath() + "/_isAssigned",
              bIsAssigned,
            );

          // Update _aAllShipments for consistent filtering
          this._updateAllShipmentsAssignment(
            this._currentShipment.ShipmentId,
            aSelectedEmployeeKeys,
            aSelectedOfficerKeys,
          );

          // Save to backend with BOTH employee and officer keys
          this._saveAssignments(
            this._currentShipment.ShipmentId,
            aSelectedEmployeeKeys,
            aSelectedOfficerKeys,
            "OFFICER",
          );
          // this._saveAssignments(this._currentShipment.ShipmentId, aSelectedOfficerKeys);
          // Close dialog
          this._oOfficerDialog.close();
        },

        /**
         * Update _aAllShipments array when assignment changes
         */
        _updateAllShipmentsAssignment: function (
          sShipmentId,
          aEmployeeKeys,
          aOfficerKeys,
        ) {
          if (!this._aAllShipments) return;

          var oShipment = this._aAllShipments.find(function (s) {
            return s.ShipmentId === sShipmentId;
          });

          if (oShipment) {
            oShipment.SelectedEmployeeKeys = aEmployeeKeys || [];
            oShipment.SelectedOfficerKeys = aOfficerKeys || [];
            oShipment._isAssigned =
              aEmployeeKeys.length > 0 || aOfficerKeys.length > 0;

            // Recalculate stats for current type
            this._updateStatsOnly();
          }
        },

        /**
         * Update only the stats model without re-filtering
         */
        _updateStatsOnly: function () {
          var aAllShipments = this._aAllShipments || [];
          var oStatsModel = this.getView().getModel("shipmentStatsModel");
          var sTypeFilter = this._sCurrentTypeFilter || "MONO";

          // Calculate type counts
          var iMonoCount = 0;
          var iOrganizeCount = 0;
          aAllShipments.forEach(function (oShipment) {
            var sType = (oShipment.Type || "").toUpperCase();
            if (sType.indexOf("MONO") !== -1) {
              iMonoCount++;
            } else if (sType.indexOf("ORGAN") !== -1) {
              iOrganizeCount++;
            }
          });

          // Filter by type
          var aTypeFiltered = aAllShipments.filter(function (oShipment) {
            var sType = (oShipment.Type || "").toUpperCase();
            if (sTypeFilter === "MONO") {
              return sType.indexOf("MONO") !== -1;
            } else {
              return sType.indexOf("ORGAN") !== -1;
            }
          });

          // Calculate assignment counts
          var iCurrentTypeAllCount = aTypeFiltered.length;
          var iCurrentTypePendingCount = 0;
          var iCurrentTypeAssignedCount = 0;
          aTypeFiltered.forEach(function (oShipment) {
            if (oShipment._isAssigned) {
              iCurrentTypeAssignedCount++;
            } else {
              iCurrentTypePendingCount++;
            }
          });

          oStatsModel.setData({
            monoCount: iMonoCount,
            organizeCount: iOrganizeCount,
            currentTypeAllCount: iCurrentTypeAllCount,
            currentTypePendingCount: iCurrentTypePendingCount,
            currentTypeAssignedCount: iCurrentTypeAssignedCount,
          });
        },

        /**
         * Search handler - client-side filtering (live search)
         * Case-insensitive search with Turkish locale support
         */
        onSearch: function (oEvent) {
          var sQuery = oEvent.getParameter("newValue") || "";
          this._sCurrentSearchQuery = sQuery;
          this._updateStatsAndFilter();
        },

        /**
         * Type filter handler (MONO / ORGANIZE)
         */
        onTypeFilterSelect: function (oEvent) {
          var sKey = oEvent.getParameter("key");
          this._sCurrentTypeFilter = sKey;
          // Reset assignment filter to "all" when type changes
          this._sCurrentAssignmentFilter = "all";
          var oAssignmentBar = this.byId("idAssignmentFilterBar");
          if (oAssignmentBar) oAssignmentBar.setSelectedKey("all");
          this._updateStatsAndFilter();
        },

        /**
         * Assignment status filter handler (all / pending / assigned)
         */
        onAssignmentFilterSelect: function (oEvent) {
          var sKey = oEvent.getParameter("key");
          this._sCurrentAssignmentFilter = sKey;
          this._updateStatsAndFilter();
        },

        /**
         * Update statistics and apply all filters
         */
        _updateStatsAndFilter: function () {
          var aAllShipments = this._aAllShipments || [];
          var oStatsModel = this.getView().getModel("shipmentStatsModel");

          // Calculate type counts
          var iMonoCount = 0;
          var iOrganizeCount = 0;
          aAllShipments.forEach(function (oShipment) {
            var sType = (oShipment.Type || "").toUpperCase();
            if (sType.indexOf("MONO") !== -1) {
              iMonoCount++;
            } else if (sType.indexOf("ORGAN") !== -1) {
              iOrganizeCount++;
            }
          });

          // Filter by type first
          var sTypeFilter = this._sCurrentTypeFilter || "MONO";
          var aTypeFiltered = aAllShipments.filter(function (oShipment) {
            var sType = (oShipment.Type || "").toUpperCase();
            if (sTypeFilter === "MONO") {
              return sType.indexOf("MONO") !== -1;
            } else {
              return sType.indexOf("ORGAN") !== -1;
            }
          });

          // Calculate assignment counts for current type
          var iCurrentTypeAllCount = aTypeFiltered.length;
          var iCurrentTypePendingCount = 0;
          var iCurrentTypeAssignedCount = 0;
          aTypeFiltered.forEach(function (oShipment) {
            if (oShipment._isAssigned) {
              iCurrentTypeAssignedCount++;
            } else {
              iCurrentTypePendingCount++;
            }
          });

          // Update stats model
          oStatsModel.setData({
            monoCount: iMonoCount,
            organizeCount: iOrganizeCount,
            currentTypeAllCount: iCurrentTypeAllCount,
            currentTypePendingCount: iCurrentTypePendingCount,
            currentTypeAssignedCount: iCurrentTypeAssignedCount,
          });

          // Apply assignment filter
          var sAssignmentFilter = this._sCurrentAssignmentFilter || "all";
          var aAssignmentFiltered = aTypeFiltered;
          if (sAssignmentFilter === "pending") {
            aAssignmentFiltered = aTypeFiltered.filter(function (oShipment) {
              return !oShipment._isAssigned;
            });
          } else if (sAssignmentFilter === "assigned") {
            aAssignmentFiltered = aTypeFiltered.filter(function (oShipment) {
              return oShipment._isAssigned;
            });
          }

          // Apply search filter
          var sQuery = this._sCurrentSearchQuery || "";
          var aFinalFiltered = aAssignmentFiltered;
          if (sQuery.length > 0) {
            var sQueryLower = sQuery.toLocaleLowerCase("tr-TR");
            aFinalFiltered = aAssignmentFiltered.filter(function (oShipment) {
              var sShipmentId = (oShipment.ShipmentId || "").toLocaleLowerCase(
                "tr-TR",
              );
              var sCustomerName = (
                oShipment.CustomerName || ""
              ).toLocaleLowerCase("tr-TR");
              return (
                sShipmentId.indexOf(sQueryLower) !== -1 ||
                sCustomerName.indexOf(sQueryLower) !== -1
              );
            });
          }

          // Sort: unassigned first, then by ShipmentId
          aFinalFiltered.sort(function (a, b) {
            if (a._isAssigned !== b._isAssigned) {
              return a._isAssigned ? 1 : -1;
            }
            return (a.ShipmentId || "").localeCompare(b.ShipmentId || "");
          });

          // Set filtered data to model
          this.getView().getModel("shipmentModel").setData(aFinalFiltered);
        },

        /**
         * Save assignments via OData function import
         * CRITICAL: Combines BOTH employee and officer IDs into single payload
         * Backend expects comma-separated list of ALL assigned personnel IDs
         */
        _saveAssignments: function (
          sShipmentId,
          aSelectedEmployeeKeys,
          aSelectedOfficerKeys,
          aType,
        ) {
          var oModel = this.getOwnerComponent().getModel();

          // Combine employee and officer IDs
          var aCombinedIds = [];
          if (aType == "EMPLOYEE") {
            if (aSelectedEmployeeKeys && aSelectedEmployeeKeys.length > 0) {
              aCombinedIds = aCombinedIds.concat(aSelectedEmployeeKeys);
              var sAssignedEmployeeIds = aCombinedIds.join(",");
            } else if (
              aSelectedEmployeeKeys &&
              aSelectedEmployeeKeys.length == 0
            ) {
              var sAssignedEmployeeIds = "2";
            }
          } else if (aType == "OFFICER") {
            if (aSelectedOfficerKeys && aSelectedOfficerKeys.length > 0) {
              aCombinedIds = aCombinedIds.concat(aSelectedOfficerKeys);
              var sAssignedEmployeeIds = aCombinedIds.join(",");
            } else if (
              aSelectedOfficerKeys &&
              aSelectedOfficerKeys.length == 0
            ) {
              var sAssignedEmployeeIds = "1";
            }
          }

          oModel.callFunction("/UpdateShipmentAssignments", {
            method: "POST",
            urlParameters: {
              ShipmentId: sShipmentId,
              AssignedEmployeeIds: sAssignedEmployeeIds,
            },
            success: function (oData, oResponse) {
              MessageBox.success("Kayıt başarılı.");
              // Refresh dashboard data to update pending counts
              this.refreshDashboardData();
            }.bind(this),
            error: function (oError) {
              MessageBox.error("Kayıt başarısız. Lütfen tekrar deneyin.");

              // Reload data to sync state
              this._loadShipmentData();
            }.bind(this),
          });
        },
      },
    );
  },
);
