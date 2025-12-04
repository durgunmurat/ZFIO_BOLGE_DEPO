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
    MessageToast
  ) {
    "use strict";

    return BaseController.extend(
      "com.sut.bolgeyonetim.controller.GoodsReceipt",
      {
        /**
         * Formatter: Row highlighting based on ReceivedQuantity vs ExpectedQuantity
         * @param {string} sReceivedQty - Received quantity
         * @param {string} sExpectedQty - Expected quantity
         * @param {string} sApproved - Approved status ('X' or '')
         * @returns {string} MessageType for row highlighting
         */
        formatRowHighlight: function (sReceivedQty, sExpectedQty, sApproved) {
          var fReceived = parseFloat(sReceivedQty || "0");
          var fExpected = parseFloat(sExpectedQty || "0");

          // If ReceivedQuantity is 0 AND not approved, it's not counted yet (Yellow)
          // If ReceivedQuantity is 0 AND approved, user explicitly set it to 0 (Red - error/mismatch)
          if (fReceived === 0) {
            if (sApproved === "X") {
              return sap.ui.core.MessageType.Error; // Red - approved with 0 quantity (mismatch)
            } else {
              return sap.ui.core.MessageType.Warning; // Yellow - not counted yet
            }
          } else if (fReceived !== fExpected) {
            return sap.ui.core.MessageType.Error; // Red for mismatch
          } else {
            return sap.ui.core.MessageType.Success; // Green for match
          }
        },

        /**
         * Formatter: Format number with thousands separator (Turkish locale)
         * @param {string|number} vValue - The number to format
         * @returns {string} Formatted number with dot as thousands separator (e.g., 1.200)
         */
        formatNumberWithSeparator: function (vValue) {
          if (!vValue && vValue !== 0) {
            return "";
          }

          var fNumber = parseFloat(vValue);
          if (isNaN(fNumber)) {
            return vValue;
          }

          // Format with Turkish locale (dot as thousands separator)
          return fNumber.toLocaleString("tr-TR");
        },

        /**
         * Formatter: Determines if "Mal Kabul" button should be enabled
         * Returns true only if ALL unique materials from ALL delivery notes of this LpId are approved
         * @param {string} sLpId - The License Plate ID from current context
         */
        isMalKabulEnabled: function (sLpId) {
          if (!sLpId) {
            return false;
          }

          // Get the license plate data from goodsReceiptModel
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          if (!oGoodsReceiptModel) {
            return false;
          }

          // Find the license plate with this LpId
          var aLicensePlates = oGoodsReceiptModel.getData();
          var oLicensePlate = aLicensePlates.find(function (oLp) {
            return oLp.LpId === sLpId;
          });

          if (
            !oLicensePlate ||
            !oLicensePlate.ToDeliveryNotes ||
            !oLicensePlate.ToDeliveryNotes.results
          ) {
            return false;
          }

          var aDeliveryNotes = oLicensePlate.ToDeliveryNotes.results;
          if (aDeliveryNotes.length === 0) {
            return false;
          }

          // Collect ALL unique materials from ALL delivery notes of this LpId
          var oUniqueMaterialsMap = {};
          aDeliveryNotes.forEach(function (oDeliveryNote) {
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              oDeliveryNote.ToItems.results.forEach(function (oItem) {
                var sMaterial = oItem.Material;
                if (sMaterial) {
                  oUniqueMaterialsMap[sMaterial] = true;
                }
              });
            }
          });

          var aUniqueMaterials = Object.keys(oUniqueMaterialsMap);
          var iTotalUniqueMaterials = aUniqueMaterials.length;

          if (iTotalUniqueMaterials === 0) {
            return false;
          }

          // CRITICAL FIX: Check localStorage drafts instead of itemsModel
          // itemsModel is only populated when user selects checkboxes, but drafts persist
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;

          if (!sSicilNo) {
            return false;
          }

          // Count approved unique materials from localStorage drafts
          var oApprovedMaterialsMap = {};

          // Iterate through all delivery notes and their items to check drafts
          aDeliveryNotes.forEach(function (oDeliveryNote) {
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              oDeliveryNote.ToItems.results.forEach(function (oItem) {
                var sMaterial = oItem.Material;
                var sKey = sSicilNo + "_" + oItem.DeliveryItemId;

                try {
                  var sDraftStr = localStorage.getItem(sKey);
                  if (sDraftStr) {
                    var oDraft = JSON.parse(sDraftStr);
                    // Check if this item is approved in draft
                    if (oDraft.approved === "X" && sMaterial) {
                      oApprovedMaterialsMap[sMaterial] = true;
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse draft from localStorage:", e);
                }
              });
            }
          });

          var iApprovedUniqueMaterials = Object.keys(
            oApprovedMaterialsMap
          ).length;

          // Enable button only if all unique materials are approved
          return (
            iApprovedUniqueMaterials === iTotalUniqueMaterials &&
            iTotalUniqueMaterials > 0
          );
        },

        onInit: function () {
          // Initialize empty itemsModel for L3 display with one-way binding for mobile performance
          var oItemsModel = new JSONModel([]);
          oItemsModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
          oItemsModel.setSizeLimit(9999); // Prevent truncation on large datasets (default is 100)
          this.getView().setModel(oItemsModel, "itemsModel");

          // Initialize editReasonsModel and load from OData
          var oEditReasonsModel = new JSONModel([]);
          this.getView().setModel(oEditReasonsModel, "editReasonsModel");
          this._loadEditReasons();

          // Initialize photoModel for photo dialog
          var oPhotoModel = new JSONModel({
            photos: [],
            photoCount: 0,
            lpId: null,
          });
          this.getView().setModel(oPhotoModel, "photoModel");

          // Attach route matched handler to load data when navigating to this view
          this.getRouter()
            .getRoute("goodsReceipt")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
          // Clean up previous state before loading new data
          this._cleanupView();

          // Load the goods receipt data from OData, then load drafts
          this._loadGoodsReceiptData();
        },

        /**
         * Load EditReasonSet from OData into JSONModel (one-time load)
         */
        _loadEditReasons: function () {
          var oModel = this.getOwnerComponent().getModel();
          var oEditReasonsModel = this.getView().getModel("editReasonsModel");

          // Only load if not already loaded
          if (oEditReasonsModel.getData().length > 0) {
            return;
          }

          oModel.read("/EditReasonSet", {
            success: function (oData) {
              oEditReasonsModel.setData(oData.results || []);
            }.bind(this),
            error: function (oError) {
              console.error("Failed to load EditReasonSet:", oError);
              // Set empty array on error
              oEditReasonsModel.setData([]);
            }.bind(this),
          });
        },

        /**
         * Clean up view state when leaving or re-entering the screen
         */
        _cleanupView: function () {
          // Reset itemsModel
          var oItemsModel = this.getView().getModel("itemsModel");
          if (oItemsModel) {
            oItemsModel.setData([]);
          }

          // Reset goodsReceiptModel
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          if (oGoodsReceiptModel) {
            oGoodsReceiptModel.setData([]);
          }

          // Find and reset all checkboxes, panels, and L3 sections
          var oL1List = this.byId("idL1List");
          if (oL1List) {
            var aL1Items = oL1List.getItems();
            aL1Items.forEach(function (oL1Item) {
              var oPanel = oL1Item.getContent()[0];
              if (oPanel) {
                // Collapse panel
                oPanel.setExpanded(false);

                var oVBoxContainer = oPanel.getContent()[0];
                if (oVBoxContainer) {
                  // Get L2 List
                  var oL2List = oVBoxContainer.getItems()[0];
                  if (oL2List) {
                    var aL2Items = oL2List.getItems();
                    aL2Items.forEach(function (oL2Item) {
                      // Find and uncheck all checkboxes
                      var oCheckBox = oL2Item
                        .getContent()[0]
                        .getItems()[0]
                        .getItems()[0];
                      if (oCheckBox && oCheckBox.setSelected) {
                        oCheckBox.setSelected(false);
                      }
                    });
                  }

                  // Hide L3 Section
                  var oL3Section = oVBoxContainer.getItems()[1];
                  if (oL3Section) {
                    oL3Section.setVisible(false);

                    // Clear IconTabBar
                    var oIconTabBar = oL3Section.getItems()[0];
                    if (oIconTabBar) {
                      oIconTabBar.destroyItems();
                      oIconTabBar.addItem(
                        new sap.m.IconTabFilter({
                          key: "all",
                          text: "Tümü",
                          count: 0,
                        })
                      );
                      oIconTabBar.addItem(new sap.m.IconTabSeparator());
                    }
                  }
                }

                // Disable "Mal Kabul" button
                var oHeaderToolbar = oPanel.getHeaderToolbar();
                if (oHeaderToolbar) {
                  var aToolbarContent = oHeaderToolbar.getContent();
                  var oMalKabulBtn = aToolbarContent.find(function (oControl) {
                    return (
                      oControl.getMetadata().getName() === "sap.m.Button" &&
                      oControl.getText() === "Mal Kabul"
                    );
                  });
                  if (oMalKabulBtn) {
                    oMalKabulBtn.setEnabled(false);
                  }
                }
              }
            });
          }
        },

        onExit: function () {
          // Clean up when view is destroyed
          this._cleanupView();
        },

        /**
         * Load LicensePlateSet with expanded DeliveryNotes from OData service.
         * Uses WarehouseNum from session and current date for ArrivalDate filter.
         */
        _loadGoodsReceiptData: function () {
          var oModel = this.getOwnerComponent().getModel(); // default OData model
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");

          // 1. Get WarehouseNum from session
          var sWarehouseNum = oSessionModel
            ? oSessionModel.getProperty("/Login/WarehouseNum")
            : null;

          if (!sWarehouseNum) {
            MessageBox.error(
              "Depo numarası bulunamadı. Lütfen tekrar giriş yapın."
            );
            return;
          }

          // 2. Get date from filterModel (set in Home view)
          var sArrivalDate = oFilterModel
            ? oFilterModel.getProperty("/selectedDate")
            : null;
          var oDateForFilter;

          if (!sArrivalDate) {
            // Fallback to today if filter model not available
            var oToday = new Date();
            var sYear = oToday.getFullYear();
            var sMonth = String(oToday.getMonth() + 1).padStart(2, "0");
            var sDay = String(oToday.getDate()).padStart(2, "0");
            sArrivalDate = sYear + sMonth + sDay; // Format: YYYYMMDD
            oDateForFilter = new Date(
              Date.UTC(
                oToday.getFullYear(),
                oToday.getMonth(),
                oToday.getDate(),
                0,
                0,
                0
              )
            );
          } else {
            // Convert from yyyy-MM-dd to YYYYMMDD
            sArrivalDate = sArrivalDate.replace(/-/g, "");
            // Create a UTC Date object to avoid timezone offset issues
            var aParts = oFilterModel.getProperty("/selectedDate").split("-");
            oDateForFilter = new Date(
              Date.UTC(
                parseInt(aParts[0]),
                parseInt(aParts[1]) - 1,
                parseInt(aParts[2]),
                0,
                0,
                0
              )
            );
          }

          // 3. Create filters
          // Try Date object instead of string - OData v2 typically expects Date for Edm.DateTime
          var aFilters = [
            new Filter("WarehouseNum", FilterOperator.EQ, sWarehouseNum),
            new Filter("ArrivalDate", FilterOperator.EQ, oDateForFilter),
          ];

          // 4. Call OData read with $expand to fetch all 3 levels
          oModel.read("/LicensePlateSet", {
            filters: aFilters,
            urlParameters: {
              $expand: "ToDeliveryNotes/ToItems",
            },
            success: function (oData) {
              // 5. Create a JSON model and set the results
              var aResults = oData.results || [];

              // Add expanded property to each item (default false for independent panel state)
              // Also add selected=false to each delivery note to prevent checkbox state mixing
              aResults.forEach(function (oItem) {
                oItem.expanded = false;
                if (oItem.ToDeliveryNotes && oItem.ToDeliveryNotes.results) {
                  oItem.ToDeliveryNotes.results.forEach(function (
                    oDeliveryNote
                  ) {
                    oDeliveryNote.selected = false;
                  });
                }
              });

              var oGoodsReceiptModel = new JSONModel(aResults);
              this.getView().setModel(oGoodsReceiptModel, "goodsReceiptModel");

              // Load drafts from localStorage after OData is loaded
              this._loadDraftsFromLocalStorage();

              // Update status filter counts
              this._updateStatusFilterCounts();

              // Set default filter to "Pending"
              var oStatusFilterBar = this.byId("idStatusFilterBar");
              if (oStatusFilterBar) {
                oStatusFilterBar.setSelectedKey("pending");
                this._applyStatusFilter("pending");
              }

              // Optional: show success message or count
              var iCount = oData.results ? oData.results.length : 0;
              if (iCount === 0) {
                MessageBox.information(
                  "Bugün için bekleyen mal kabul kaydı bulunamadı."
                );
              }
            }.bind(this),
            error: function (oError) {
              console.error("[DEBUG] OData read ERROR:", oError);
              // 6. Handle error
              var sMessage = "Mal kabul verileri yüklenirken hata oluştu.";
              if (oError && oError.responseText) {
                try {
                  var oErrorResponse = JSON.parse(oError.responseText);
                  if (
                    oErrorResponse.error &&
                    oErrorResponse.error.message &&
                    oErrorResponse.error.message.value
                  ) {
                    sMessage = oErrorResponse.error.message.value;
                  }
                } catch (e) {
                  // ignore parse error
                }
              }
              MessageBox.error(sMessage);
            }.bind(this),
          });
        },

        /**
         * Event handler when a delivery note checkbox is selected/deselected.
         * Implements DEBOUNCE PATTERN to prevent UI flicker and unnecessary recalculations.
         * Waits 300ms after last checkbox click before running the expensive calculation.
         */
        onDeliveryNoteSelect: function (oEvent) {
          // DEBOUNCE PATTERN: Clear existing timer if user is clicking fast
          if (this._iDelayTimer) {
            clearTimeout(this._iDelayTimer);
          }

          // Set new timer - wait 200ms after last click before calculating
          this._iDelayTimer = setTimeout(
            function () {
              this._calculateAndRenderItems();
            }.bind(this),
            200
          );
        },

        /**
         * Event handler for "Select All" checkbox in panel header.
         * Selects or deselects all delivery notes for the specific license plate.
         */
        onSelectAllDeliveryNotes: function (oEvent) {
          var bSelected = oEvent.getParameter("selected");
          var oCheckBox = oEvent.getSource();

          // Navigate up to find the Panel
          var oPanel = oCheckBox.getParent().getParent(); // OverflowToolbar > Panel
          while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
            oPanel = oPanel.getParent();
          }

          if (!oPanel) {
            console.error("Could not find Panel");
            return;
          }

          // Get VBox content and then the delivery notes List
          var oVBoxContainer = oPanel.getContent()[0];
          if (!oVBoxContainer) {
            console.error("Could not find VBox container");
            return;
          }

          var oList = oVBoxContainer.getItems()[0]; // First item is delivery notes list
          if (!oList || oList.getMetadata().getName() !== "sap.m.List") {
            console.error("Could not find delivery notes list");
            return;
          }

          // Get all list items and update their selected state
          var aItems = oList.getItems();
          aItems.forEach(function (oItem) {
            var oBindingContext = oItem.getBindingContext("goodsReceiptModel");
            if (oBindingContext) {
              var oDeliveryNote = oBindingContext.getObject();
              // Only update if status is not completed
              if (oDeliveryNote.Status !== "X") {
                oBindingContext
                  .getModel()
                  .setProperty(
                    oBindingContext.getPath() + "/selected",
                    bSelected
                  );
              }
            }
          });

          // Trigger debounced calculation
          if (this._iDelayTimer) {
            clearTimeout(this._iDelayTimer);
          }

          this._iDelayTimer = setTimeout(
            function () {
              this._calculateAndRenderItems();
            }.bind(this),
            200
          );
        },

        /**
         * Calculate and render items from ALL selected delivery notes across ALL license plates.
         * This is the debounced calculation logic separated from the event handler.
         * OPTIMIZED FOR MOBILE: No BusyIndicator, no redundant refresh, smooth updates.
         */
/**
         * Calculate and render items from ALL selected delivery notes across ALL license plates.
         * This is the debounced calculation logic separated from the event handler.
         * OPTIMIZED FOR MOBILE: No BusyIndicator, no redundant refresh, smooth updates.
         */
        _calculateAndRenderItems: function () {
          // CRITICAL FIX: Process each panel INDEPENDENTLY instead of aggregating globally
          var oL1List = this.byId("idL1List");
          if (!oL1List) {
            return;
          }

          var aL1Items = oL1List.getItems();

          // Get session model once (performance optimization)
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;

          // ITERATE THROUGH ALL LICENSE PLATES - PROCESS EACH INDEPENDENTLY
          aL1Items.forEach(
            function (oL1Item) {
              var oPanel = oL1Item.getContent()[0]; // Panel is first child of CustomListItem
              if (!oPanel) {
                return;
              }

              // Get L1 context to retrieve LpId and Status
              var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
              var oLicensePlate = oL1Context ? oL1Context.getObject() : null;
              var sLpId = oLicensePlate ? oLicensePlate.LpId : null;
              var sStatus = oLicensePlate ? oLicensePlate.Status : null;

              if (!sLpId) {
                return;
              }

              // Per-panel data structures
              var oMaterialMap = {}; // Map to aggregate items by Material number
              var oMaterialDeliveryCount = {}; // Track how many delivery items per material
              var oMaterialApprovedCount = {}; // Track how many approved delivery items per material
              
              // Initialize counts with 0
              var aTotalCounts = {
                Total1: 0,
                Total2: 0,
                Total3: 0,
                Total4: 0,
                Total5: 0,
                Total6: 0,
                Total7: 0,
                Total8: 0,
                Total9: 0,
                TotalDepozito: 0,
              };

              // NEW: Map to store category texts from any selected delivery note
              var oCategoryTextMap = {};

              // Get the VBox container (first child of Panel content)
              var oVBoxContainer = oPanel.getContent()[0];
              if (!oVBoxContainer) {
                return;
              }

              // L3 Section is the second child of VBox (after L2 List)
              var oL3Section = oVBoxContainer.getItems()[1];
              var oIconTabBar = oL3Section ? oL3Section.getItems()[0] : null;
              var oTable = oL3Section ? oL3Section.getItems()[1] : null;

              // Get L2 List (delivery notes)
              var oL2List = oVBoxContainer.getItems()[0];
              if (!oL2List) {
                return;
              }

              var aL2Items = oL2List.getItems();
              var bHasSelectedInThisPanel = false;

              // ITERATE THROUGH DELIVERY NOTES IN THIS PANEL ONLY
              aL2Items.forEach(
                function (oL2Item) {
                  var oChkBox = oL2Item.getContent()[0].getItems
                    ? oL2Item.getContent()[0].getItems()[0]
                    : null;
                  if (oChkBox && oChkBox.getSelected && oChkBox.getSelected()) {
                    bHasSelectedInThisPanel = true;
                    var oCtx = oChkBox.getBindingContext("goodsReceiptModel");
                    if (oCtx) {
                      var oDeliveryNote = oCtx.getObject();

                      // NEW: Collect category texts from this delivery note
                      // If text exists, add it to the map (this ensures we get text if ANY selected note has it)
                      var aTextFields = [
                        "Total1Text",
                        "Total2Text",
                        "Total3Text",
                        "Total4Text",
                        "Total5Text",
                        "Total6Text",
                        "Total7Text",
                        "Total8Text",
                        "Total9Text",
                        "TotalDepozitoText",
                      ];

                      aTextFields.forEach(function (sTextField) {
                        if (oDeliveryNote[sTextField]) {
                          oCategoryTextMap[sTextField] =
                            oDeliveryNote[sTextField];
                        }
                      });

                      // Collect and aggregate items by Material
                      var aL3Items = oCtx.getProperty("ToItems/results");
                      if (aL3Items && aL3Items.length > 0) {
                        aL3Items.forEach(
                          function (oItem) {
                            var sMaterial = oItem.Material;

                            // Check if there's a draft in localStorage for this item
                            var sKey = sSicilNo + "_" + oItem.DeliveryItemId;
                            var oDraft = null;
                            var sReceivedQtyToUse = oItem.ReceivedQuantity;
                            var sApprovedToUse = oItem.Approved || "";
                            var sEditReasonToUse = oItem.EditReason || "";

                            if (sSicilNo) {
                              try {
                                var sDraftStr = localStorage.getItem(sKey);
                                if (sDraftStr) {
                                  oDraft = JSON.parse(sDraftStr);
                                  // Use draft values instead of OData values
                                  sReceivedQtyToUse =
                                    oDraft.expectedquantity || "0";
                                  sApprovedToUse = oDraft.approved || "";
                                  sEditReasonToUse = oDraft.editreason || "";
                                }
                              } catch (e) {
                                console.error(
                                  "Failed to parse draft from localStorage:",
                                  e
                                );
                              }
                            }

                            if (oMaterialMap[sMaterial]) {
                              // Material already exists - aggregate quantities
                              var fExpectedQty = parseFloat(
                                oMaterialMap[sMaterial].ExpectedQuantity || "0"
                              );
                              var fNewExpectedQty = parseFloat(
                                oItem.ExpectedQuantity || "0"
                              );
                              oMaterialMap[sMaterial].ExpectedQuantity = String(
                                fExpectedQty + fNewExpectedQty
                              );

                              var fReceivedQty = parseFloat(
                                oMaterialMap[sMaterial].ReceivedQuantity || "0"
                              );
                              var fNewReceivedQty = parseFloat(
                                sReceivedQtyToUse || "0"
                              );
                              oMaterialMap[sMaterial].ReceivedQuantity = String(
                                fReceivedQty + fNewReceivedQty
                              );

                              // Track delivery item count and approved count
                              oMaterialDeliveryCount[sMaterial] =
                                (oMaterialDeliveryCount[sMaterial] || 0) + 1;
                              if (sApprovedToUse === "X") {
                                oMaterialApprovedCount[sMaterial] =
                                  (oMaterialApprovedCount[sMaterial] || 0) + 1;
                              }
                            } else {
                              // First occurrence of this Material - create new entry
                              oMaterialMap[sMaterial] = {
                                LpId: sLpId,
                                Status: sStatus,
                                Material: oItem.Material,
                                MaterialText: oItem.MaterialText,
                                Kategori: oItem.Kategori,
                                KategoriText: oItem.KategoriText,
                                ExpectedQuantity: oItem.ExpectedQuantity,
                                ReceivedQuantity: sReceivedQtyToUse,
                                UoM: oItem.UoM,
                                SM: oItem.SM,
                                Ebeln: oItem.Ebeln,
                                Ebelp: oItem.Ebelp,
                                DeliveryItemId: oItem.DeliveryItemId,
                                ItemNumber: oItem.ItemNumber,
                                Approved: sApprovedToUse,
                                EditReason: sEditReasonToUse,
                              };

                              // Initialize counters
                              oMaterialDeliveryCount[sMaterial] = 1;
                              oMaterialApprovedCount[sMaterial] =
                                sApprovedToUse === "X" ? 1 : 0;
                            }
                          }.bind(this)
                        );
                      }

                      // --- [ESKİ KOD KALDIRILDI] ---
                      // Burada oDeliveryNote[key] üzerinden yapılan toplama işlemi silindi.
                      // Çünkü bu işlem duplicate malzemeleri mükerrer sayıyordu.
                    }
                  }
                }.bind(this)
              );

              // Convert map to array and set final Approved status
              var aItemsToShow = [];
              for (var sMat in oMaterialMap) {
                var oAggItem = oMaterialMap[sMat];

                // Set Approved only if ALL delivery items for this material are approved
                var iTotalDeliveryItems = oMaterialDeliveryCount[sMat] || 0;
                var iApprovedDeliveryItems = oMaterialApprovedCount[sMat] || 0;

                if (
                  iTotalDeliveryItems > 0 &&
                  iTotalDeliveryItems === iApprovedDeliveryItems
                ) {
                  oAggItem.Approved = "X";
                } else {
                  oAggItem.Approved = "";
                }

                var fExpected = parseFloat(oAggItem.ExpectedQuantity || "0");
                var fReceived = parseFloat(oAggItem.ReceivedQuantity || "0");
                if (fReceived > fExpected) {
                  oAggItem.ReceivedQuantity = oAggItem.ExpectedQuantity;
                  oAggItem.Approved = "";
                }

                aItemsToShow.push(oAggItem);
              }

              // --- [YENİ KOD: AGGREGATED COUNT] ---
              // Sayımları nihai liste (birleştirilmiş malzemeler) üzerinden yapıyoruz.
              // Böylece ekranda 1 satır varsa, sayı da 1 artıyor.
              aItemsToShow.forEach(function(oItem) {
                  var sPrefix = oItem.Kategori ? oItem.Kategori.substring(0, 2) : "";
                  
                  if (sPrefix === "01") aTotalCounts.Total1++;
                  else if (sPrefix === "02") aTotalCounts.Total2++;
                  else if (sPrefix === "03") aTotalCounts.Total3++;
                  else if (sPrefix === "04") aTotalCounts.Total4++;
                  else if (sPrefix === "05") aTotalCounts.Total5++;
                  else if (sPrefix === "06") aTotalCounts.Total6++;
                  else if (sPrefix === "07") aTotalCounts.Total7++;
                  else if (sPrefix === "08") aTotalCounts.Total8++;
                  else if (sPrefix === "09") aTotalCounts.Total9++;
                  else if (sPrefix === "99") aTotalCounts.TotalDepozito++;
              });

              // Create or update model for THIS panel
              var sModelName = "itemsModel_" + sLpId;
              var oItemsModel = this.getView().getModel(sModelName);
              if (!oItemsModel) {
                oItemsModel = new JSONModel();
                oItemsModel.setSizeLimit(9999);
                oItemsModel.setDefaultBindingMode("OneWay");
                this.getView().setModel(oItemsModel, sModelName);
              }

              // Update model data
              oItemsModel.setData(aItemsToShow);

              // Bind table to this panel's model
              if (oTable) {
                var oBinding = oTable.getBinding("items");

                // If table is not yet bound or bound to different model, rebind
                if (
                  !oBinding ||
                  oBinding.getModel().getId() !== oItemsModel.getId()
                ) {
                  oTable.bindItems({
                    path: sModelName + ">/",
                    template: this._createTableItemTemplate(sModelName),
                    templateShareable: false,
                  });
                } else {
                  // Just refresh existing binding
                  oBinding.refresh();
                }
              }

              // Update L3 section visibility and category filters
              if (oL3Section) {
                var bShouldShow =
                  bHasSelectedInThisPanel && aItemsToShow.length > 0;

                if (bShouldShow && oIconTabBar) {
                  // NEW: Pass oCategoryTextMap instead of oFirstSelectedDeliveryNote
                  this._updateCategoryFiltersForTabBarMulti(
                    oCategoryTextMap,
                    aTotalCounts,
                    oIconTabBar,
                    sLpId
                  );
                }

                setTimeout(function () {
                  oL3Section.setVisible(bShouldShow);
                  if (bShouldShow) {
                    oL3Section.invalidate();
                  }
                }, 50);
              }
            }.bind(this)
          );
        },

        /**
         * Update category filters based on aggregated totals from multiple delivery notes
         * @param {object} oCategoryTextMap - Map containing valid texts for categories
         * @param {object} aTotalCounts - Aggregated totals
         * @param {sap.m.IconTabBar} oIconTabBar - The IconTabBar to update
         * @param {string} sLpId - License Plate ID for storing state
         */
        _updateCategoryFiltersForTabBarMulti: function (
          oCategoryTextMap,
          aTotalCounts,
          oIconTabBar,
          sLpId
        ) {
          if (!oIconTabBar) {
            return;
          }

          // Store LpId on IconTabBar for category filter handler
          oIconTabBar.data("lpId", sLpId);

          // Remove all existing filters
          oIconTabBar.destroyItems();

          // Calculate total count
          var iTotalCount = 0;
          for (var key in aTotalCounts) {
            iTotalCount += aTotalCounts[key];
          }

          // Add "Tümü" filter
          oIconTabBar.addItem(
            new sap.m.IconTabFilter({
              key: "all",
              text: "Tümü",
              count: iTotalCount,
            })
          );

          oIconTabBar.addItem(new sap.m.IconTabSeparator());

          // Add category filters dynamically
          var aCategoryMapping = [
            { key: "01", totalField: "Total1", textField: "Total1Text" },
            { key: "02", totalField: "Total2", textField: "Total2Text" },
            { key: "03", totalField: "Total3", textField: "Total3Text" },
            { key: "04", totalField: "Total4", textField: "Total4Text" },
            { key: "05", totalField: "Total5", textField: "Total5Text" },
            { key: "06", totalField: "Total6", textField: "Total6Text" },
            { key: "07", totalField: "Total7", textField: "Total7Text" },
            { key: "08", totalField: "Total8", textField: "Total8Text" },
            { key: "09", totalField: "Total9", textField: "Total9Text" },
            {
              key: "99",
              totalField: "TotalDepozito",
              textField: "TotalDepozitoText",
            },
          ];

          aCategoryMapping.forEach(function (oMapping) {
            var iCount = aTotalCounts[oMapping.totalField];
            // NEW: Get text from the map
            var sText = oCategoryTextMap[oMapping.textField] || "";

            if (iCount > 0 && sText) {
              oIconTabBar.addItem(
                new sap.m.IconTabFilter({
                  key: oMapping.key,
                  text: sText,
                  count: iCount,
                })
              );

              oIconTabBar.addItem(new sap.m.IconTabSeparator());
            }
          });
        },

        /**
         * Update category filter counts based on items
         */
        _updateCategoryFilterCounts: function (aItems) {
          // This method is now replaced by _updateCategoryFiltersFromDeliveryNote
          // Kept for backward compatibility if needed
        },

        /**
         * Event handler when a category filter is selected in IconTabBar.
         * Filters the L3 items table by selected category key.
         */
        onCategoryFilterSelect: function (oEvent) {
          var sSelectedKey = oEvent.getParameter("key");
          var oIconTabBar = oEvent.getSource();

          // Get LpId stored on IconTabBar
          var sLpId = oIconTabBar.data("lpId");
          if (!sLpId) {
            console.error("LpId not found on IconTabBar");
            return;
          }

          // Navigate to find the Table (sibling of IconTabBar in L3 Section VBox)
          var oL3Section = oIconTabBar.getParent();
          if (!oL3Section) {
            console.error("L3 Section not found");
            return;
          }

          var oTable = oL3Section.getItems()[1]; // Table is second child
          if (!oTable) {
            console.error("Table not found");
            return;
          }

          var oBinding = oTable.getBinding("items");
          if (!oBinding) {
            console.error("Table binding not found");
            return;
          }

          // Apply filter based on selected category
          if (sSelectedKey === "all") {
            oBinding.filter([]);
          } else {
            // Filter by category key (first 2 digits of Kategori field)
            var oFilter = new Filter(
              "Kategori",
              FilterOperator.StartsWith,
              sSelectedKey
            );
            oBinding.filter([oFilter]);
          }
        },

        _createTableItemTemplate: function (sModelName) {
          // Create template with model-specific bindings
          var oTemplate = new sap.m.ColumnListItem({
            cells: [
              new sap.m.Text({
                text: "{= parseInt(${" + sModelName + ">Material}) }",
              }),
              new sap.m.Text({ text: "{" + sModelName + ">MaterialText}" }),
              new sap.m.ObjectNumber({
                number: {
                  path: sModelName + ">ExpectedQuantity",
                  formatter: this.formatNumberWithSeparator.bind(this),
                },
                unit: "{" + sModelName + ">UoM}",
                state: "None",
              }),
              new sap.m.Text({
                text: {
                  path: sModelName + ">ReceivedQuantity",
                  formatter: this.formatNumberWithSeparator.bind(this),
                },
                textAlign: "Center",
              }),
              new sap.m.Text({ text: "{" + sModelName + ">SM}" }),
              new sap.m.Button({
                text:
                  "{= ${" +
                  sModelName +
                  ">Approved} === 'X' ? 'Düzenle' : 'Onayla' }",
                type: "Emphasized",
                press: this.onApproveItem.bind(this),
                visible: "{= ${" + sModelName + ">Status} !== 'X' }",
                icon:
                  "{= ${" +
                  sModelName +
                  ">Approved} === 'X' ? 'sap-icon://edit' : 'sap-icon://accept' }",
              }),
            ],
          });

          // Bind highlight property programmatically with formatter
          oTemplate.bindProperty("highlight", {
            parts: [
              { path: sModelName + ">ReceivedQuantity" },
              { path: sModelName + ">ExpectedQuantity" },
              { path: sModelName + ">Approved" },
            ],
            formatter: this.formatRowHighlight.bind(this),
          });

          return oTemplate;
        },

        /**
         * Event handler when status filter tab is selected
         */
        onStatusFilterSelect: function (oEvent) {
          var sKey = oEvent.getParameter("key");

          // Collapse all panels when switching filters
          this._collapseAllPanels();

          this._applyStatusFilter(sKey);
        },

        /**
         * Collapse all panels in the goods receipt model
         */
        _collapseAllPanels: function () {
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          if (!oGoodsReceiptModel) {
            return;
          }

          var aData = oGoodsReceiptModel.getData();
          if (aData && Array.isArray(aData)) {
            aData.forEach(function (oItem) {
              oItem.expanded = false;
              // Clear all delivery note checkbox selections
              if (oItem.ToDeliveryNotes && oItem.ToDeliveryNotes.results) {
                oItem.ToDeliveryNotes.results.forEach(function (oDeliveryNote) {
                  oDeliveryNote.selected = false;
                });
              }
            });
            oGoodsReceiptModel.refresh();
          }

          // Clear all panel-specific itemsModels to prevent data mixing between filters
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          if (oGoodsReceiptModel) {
            var aLicensePlates = oGoodsReceiptModel.getData();
            if (aLicensePlates && aLicensePlates.length > 0) {
              aLicensePlates.forEach(
                function (oLp) {
                  var sModelName = "itemsModel_" + oLp.LpId;
                  var oModel = this.getView().getModel(sModelName);
                  if (oModel) {
                    oModel.setData([]);
                  }
                }.bind(this)
              );
            }
          }

          // Hide all Level 3 sections
          var oList = this.byId("idL1List");
          if (oList) {
            var aItems = oList.getItems();
            aItems.forEach(function (oItem) {
              var oPanel = oItem.getContent()[0];
              if (oPanel && oPanel.getContent) {
                var oVBoxContainer = oPanel.getContent()[0];
                if (oVBoxContainer && oVBoxContainer.getItems) {
                  var oL3Section = oVBoxContainer.getItems()[1];
                  if (oL3Section && oL3Section.setVisible) {
                    oL3Section.setVisible(false);
                  }
                }
              }
            });
          }
        },

        /**
         * Apply filter to the License Plates list based on status
         * @param {string} sStatus - "pending" or "completed"
         */
        _applyStatusFilter: function (sStatus) {
          var oList = this.byId("idL1List");
          var oBinding = oList.getBinding("items");

          if (!oBinding) {
            return;
          }

          var aFilters = [];

          if (sStatus === "pending") {
            // Filter where Status is NOT 'X' (empty or null)
            aFilters.push(new Filter("Status", FilterOperator.NE, "X"));
          } else if (sStatus === "completed") {
            // Filter where Status equals 'X'
            aFilters.push(new Filter("Status", FilterOperator.EQ, "X"));
          }

          oBinding.filter(aFilters);
        },

        /**
         * Update the counts on the status filter tabs
         */
        _updateStatusFilterCounts: function () {
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");

          if (!oGoodsReceiptModel) {
            return;
          }

          var aData = oGoodsReceiptModel.getData() || [];
          var iPendingCount = 0;
          var iCompletedCount = 0;

          aData.forEach(function (oItem) {
            if (oItem.Status === "X") {
              iCompletedCount++;
            } else {
              iPendingCount++;
            }
          });

          // Update tab counts
          var oPendingTab = this.byId("idPendingTab");
          var oCompletedTab = this.byId("idCompletedTab");

          if (oPendingTab) {
            oPendingTab.setCount(iPendingCount.toString());
          }

          if (oCompletedTab) {
            oCompletedTab.setCount(iCompletedCount.toString());
          }
        },

        onApproveItem: function (oEvent) {
          // Get the item context and button
          var oButton = oEvent.getSource();

          // Find the correct model - button's binding context will have the model name
          var oBindingContext = null;
          var sModelName = null;
          var oItemsModel = null;

          // Try to find which itemsModel this button is bound to
          var aModelNames = Object.keys(this.getView().oModels || {});
          for (var i = 0; i < aModelNames.length; i++) {
            if (aModelNames[i].startsWith("itemsModel_")) {
              var oContext = oButton.getBindingContext(aModelNames[i]);
              if (oContext) {
                oBindingContext = oContext;
                sModelName = aModelNames[i];
                oItemsModel = this.getView().getModel(sModelName);
                break;
              }
            }
          }

          if (!oBindingContext || !oItemsModel) {
            MessageBox.error("Ürün bilgisi alınamadı.");
            return;
          }

          var sPath = oBindingContext.getPath();
          var oItem = oBindingContext.getObject();

          // Store current item path for dialog
          this._sCurrentEditPath = sPath;
          this._oCurrentEditButton = oButton;
          this._sCurrentItemsModelName = sModelName; // Store model name for later use

          // Check if already approved (button text is "Düzenle")
          if (oItem.Approved === "X") {
            // Open edit dialog
            this._openEditDialog(oItem);
          } else {
            // Set Approved flag to 'X'
            oItemsModel.setProperty(sPath + "/Approved", "X");

            // Copy ExpectedQuantity to ReceivedQuantity
            var sExpectedQty = oItem.ExpectedQuantity;
            oItemsModel.setProperty(sPath + "/ReceivedQuantity", sExpectedQty);

            // Get selected delivery notes for this LpId
            var aSelectedDeliveryNotes = this._getSelectedDeliveryNotesForLpId(
              oItem.LpId
            );

            // Save draft to localStorage with selected delivery notes
            this._saveDraftToLocalStorage(
              oItem.LpId,
              oItem,
              sExpectedQty,
              "",
              aSelectedDeliveryNotes
            );

            // Trigger model refresh to update button state
            oItemsModel.refresh(true);

            // Also refresh goodsReceiptModel to trigger Mal Kabul button update
            this.getView().getModel("goodsReceiptModel").refresh(true);
          }
        },

        /**
         * Helper function to get selected delivery notes for a specific LpId
         * @param {string} sLpId - License Plate ID
         * @returns {Array} Array of selected delivery note objects
         */
        _getSelectedDeliveryNotesForLpId: function (sLpId) {
          var aSelectedDeliveryNotes = [];

          // Find the Panel for this LpId
          var oL1List = this.byId("idL1List");
          if (!oL1List) {
            return aSelectedDeliveryNotes;
          }

          var aL1Items = oL1List.getItems();
          for (var i = 0; i < aL1Items.length; i++) {
            var oL1Item = aL1Items[i];
            var oPanel = oL1Item.getContent()[0]; // Panel is first child of CustomListItem

            if (!oPanel) {
              continue;
            }

            var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
            if (!oL1Context) {
              continue;
            }

            var oLp = oL1Context.getObject();
            if (oLp.LpId !== sLpId) {
              continue;
            }

            // Found the correct panel, now get selected delivery notes
            var oVBoxContainer = oPanel.getContent()[0];
            if (!oVBoxContainer) {
              continue;
            }

            var oL2List = oVBoxContainer.getItems()[0];
            if (!oL2List) {
              continue;
            }

            var aL2Items = oL2List.getItems();
            aL2Items.forEach(function (oL2Item) {
              var oChkBox = oL2Item.getContent()[0].getItems
                ? oL2Item.getContent()[0].getItems()[0]
                : null;
              if (oChkBox && oChkBox.getSelected && oChkBox.getSelected()) {
                var oCtx = oChkBox.getBindingContext("goodsReceiptModel");
                if (oCtx) {
                  aSelectedDeliveryNotes.push(oCtx.getObject());
                }
              }
            });

            break;
          }

          return aSelectedDeliveryNotes;
        },

        _openEditDialog: function (oItem) {
          if (!this._oEditDialog) {
            this._oEditDialog = new sap.m.Dialog({
              title: "Miktar Düzenleme",
              contentWidth: "450px",
              draggable: true,
              resizable: true,
              content: [
                new sap.m.VBox({
                  items: [
                    // Product Info Section
                    new sap.m.VBox({
                      items: [
                        new sap.m.Label({
                          text: "Ürün Bilgisi",
                          design: "Bold",
                        }).addStyleClass("sapUiTinyMarginBottom"),
                        new sap.m.Text({
                          id: this.createId("editDialogProductName"),
                          text: "",
                        }),
                      ],
                    }).addStyleClass("sapUiSmallMarginBottom"),

                    // Current Quantity Info
                    new sap.m.HBox({
                      justifyContent: "SpaceBetween",
                      alignItems: "Center",
                      items: [
                        new sap.m.Label({
                          text: "Beklenen Miktar:",
                          width: "100%",
                        }),
                        new sap.m.Text({
                          id: this.createId("editDialogReceivedQty"),
                          text: "",
                        }),
                      ],
                    }).addStyleClass("sapUiSmallMarginBottom"),

                    // Divider
                    new sap.m.VBox({ height: "0.5rem" }),

                    // New Quantity Input
                    new sap.m.Label({
                      text: "Yeni Miktar",
                      required: true,
                      labelFor: this.createId("editDialogNewQty"),
                    }).addStyleClass("sapUiTinyMarginTop"),
                    new sap.m.Input({
                      id: this.createId("editDialogNewQty"),
                      type: "Number",
                      placeholder: "Yeni miktarı girin",
                      width: "100%",
                      valueState: "None",
                      valueLiveUpdate: true,
                      liveChange: function (oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oInput = oEvent.getSource();
                        if (!sValue || parseFloat(sValue) < 0) {
                          oInput.setValueState("Error");
                          oInput.setValueStateText(
                            "Lütfen geçerli bir miktar girin (0 veya pozitif)"
                          );
                        } else {
                          oInput.setValueState("None");
                        }
                      },
                    }).addStyleClass(
                      "sapUiTinyMarginTop sapUiSmallMarginBottom"
                    ),

                    // Edit Reason ComboBox
                    new sap.m.Label({
                      text: "Düzenleme Nedeni",
                      required: true,
                      labelFor: this.createId("editDialogReason"),
                    }),
                    new sap.m.ComboBox({
                      id: this.createId("editDialogReason"),
                      placeholder: "Neden seçin",
                      width: "100%",
                      valueState: "None",
                      items: {
                        path: "editReasonsModel>/",
                        template: new sap.ui.core.Item({
                          key: "{editReasonsModel>Key}",
                          text: "{editReasonsModel>Text}",
                        }),
                      },
                      selectionChange: function (oEvent) {
                        var oComboBox = oEvent.getSource();
                        if (oComboBox.getSelectedKey()) {
                          oComboBox.setValueState("None");
                        }
                      },
                    }).addStyleClass("sapUiTinyMarginTop"),
                  ],
                }).addStyleClass("sapUiMediumMargin"),
              ],
              beginButton: new sap.m.Button({
                text: "Kaydet",
                type: "Emphasized",
                icon: "sap-icon://save",
                press: function () {
                  this._onEditDialogSave();
                }.bind(this),
              }),
              endButton: new sap.m.Button({
                text: "İptal",
                icon: "sap-icon://decline",
                press: function () {
                  this._oEditDialog.close();
                }.bind(this),
              }),
              afterClose: function () {
                // Reset value states when dialog closes
                this.byId("editDialogNewQty").setValueState("None");
                this.byId("editDialogReason").setValueState("None");
              }.bind(this),
            });
            this.getView().addDependent(this._oEditDialog);
          }

          // Set current item data to dialog
          this.byId("editDialogProductName").setText(oItem.MaterialText);
          this.byId("editDialogReceivedQty").setText(
            oItem.ExpectedQuantity + " " + oItem.UoM
          );
          this.byId("editDialogNewQty").setValue(oItem.ReceivedQuantity);
          this.byId("editDialogNewQty").setValueState("None");
          this.byId("editDialogReason").setSelectedKey("");
          this.byId("editDialogReason").setValueState("None");

          this._oEditDialog.open();
        },

        _onEditDialogSave: function () {
          var oNewQtyInput = this.byId("editDialogNewQty");
          var oReasonComboBox = this.byId("editDialogReason");
          var sNewQty = oNewQtyInput.getValue();
          var sReason = oReasonComboBox.getSelectedKey();

          var bValid = true;

          // Validation with visual feedback
          if (!sNewQty || parseFloat(sNewQty) < 0) {
            oNewQtyInput.setValueState("Error");
            oNewQtyInput.setValueStateText(
              "Lütfen geçerli bir miktar girin (0 veya pozitif)"
            );
            bValid = false;
          } else {
            oNewQtyInput.setValueState("None");
          }

          if (!sReason) {
            oReasonComboBox.setValueState("Error");
            oReasonComboBox.setValueStateText("Lütfen düzenleme nedeni seçin");
            bValid = false;
          } else {
            oReasonComboBox.setValueState("None");
          }

          if (!bValid) {
            return;
          }

          // Use the stored model name from onApproveItem
          var sModelName = this._sCurrentItemsModelName;
          if (!sModelName) {
            MessageBox.error("Model bilgisi bulunamadı.");
            return;
          }

          // Update the item model first
          var oItemsModel = this.getView().getModel(sModelName);
          oItemsModel.setProperty(
            this._sCurrentEditPath + "/ReceivedQuantity",
            sNewQty
          );
          oItemsModel.setProperty(
            this._sCurrentEditPath + "/EditReason",
            sReason
          );

          // Get the updated item AFTER model update to ensure we have latest data
          var oContext = this._oCurrentEditButton.getBindingContext(sModelName);
          var oUpdatedItem = oContext.getObject();

          // Get selected delivery notes for this LpId
          var aSelectedDeliveryNotes = this._getSelectedDeliveryNotesForLpId(
            oUpdatedItem.LpId
          );

          // Save draft to localStorage with the NEW quantity (sNewQty parameter is critical here)
          this._saveDraftToLocalStorage(
            oUpdatedItem.LpId,
            oUpdatedItem,
            sNewQty,
            sReason,
            aSelectedDeliveryNotes
          );

          // Force model refresh to ensure UI updates immediately (critical for tablet)
          oItemsModel.refresh(true);

          // Also refresh goodsReceiptModel to trigger Mal Kabul button update
          this.getView().getModel("goodsReceiptModel").refresh(true);

          this._oEditDialog.close();
          MessageBox.success("Miktar başarıyla güncellendi.");
        },

        onMalKabulPress: function (oEvent) {
          // Get the button and find the Panel to identify which LicensePlate
          var oButton = oEvent.getSource();
          var oPanel = oButton.getParent();
          while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
            oPanel = oPanel.getParent();
          }

          if (!oPanel) {
            MessageBox.error("Panel bulunamadı.");
            return;
          }

          // Get the L1 context (LicensePlate)
          var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
          if (!oL1Context) {
            MessageBox.error("License Plate context bulunamadı.");
            return;
          }

          var oLicensePlate = oL1Context.getObject();
          var sLpId = oLicensePlate.LpId;

          // Call the sync function
          this._syncDraftsToBackend(sLpId);
        },

        onPanelExpand: function (oEvent) {
          var oPanel = oEvent.getSource();
          var bExpanded = oEvent.getParameter("expand");
          var oContext = oPanel.getBindingContext("goodsReceiptModel");

          if (!oContext) {
            return;
          }

          // Force the delivery notes list to update when panel expands
          if (bExpanded) {
            // Find the delivery notes list inside this panel
            var aContent = oPanel.getContent();

            if (aContent.length > 0) {
              var oVBox = aContent[0]; // The VBox containing the List

              // CRITICAL FIX: Set binding context on VBox to ensure inheritance
              oVBox.setBindingContext(oContext, "goodsReceiptModel");

              var aVBoxItems = oVBox.getItems();

              // Level 2: Delivery Notes List
              if (aVBoxItems.length > 0) {
                var oDeliveryNotesList = aVBoxItems[0]; // The delivery notes List

                // CRITICAL FIX: Explicitly set binding context on the List
                oDeliveryNotesList.setBindingContext(
                  oContext,
                  "goodsReceiptModel"
                );

                // Force binding context update
                var oListBinding = oDeliveryNotesList.getBinding("items");

                if (oListBinding) {
                  oListBinding.refresh();

                  // Use setTimeout for tablet compatibility
                  setTimeout(function () {
                    oDeliveryNotesList.invalidate();
                  }, 50);
                }
              }

              // Level 3: Items Table VBox and Table
              if (aVBoxItems.length > 1) {
                var oL3VBox = aVBoxItems[1]; // The Level 3 VBox

                // Set binding context on Level 3 VBox
                oL3VBox.setBindingContext(oContext, "goodsReceiptModel");

                var aL3Items = oL3VBox.getItems();

                // Find the Table (should be second item after IconTabBar)
                if (aL3Items.length > 1) {
                  var oItemsTable = aL3Items[1]; // The items Table

                  // Set binding context on Table (for itemsModel, but context still needed)
                  oItemsTable.setBindingContext(oContext, "goodsReceiptModel");

                  // Force table update
                  setTimeout(function () {
                    oItemsTable.invalidate();
                  }, 50);
                }
              }
            }
          }
        },

        onPhotoPress: function (oEvent) {
          // Check if online
          if (!navigator.onLine) {
            MessageBox.error("İnternet bağlantısı yok. Fotoğraf yüklenemez.");
            return;
          }

          // Get button and its binding context (Level 1 - LicensePlate)
          var oButton = oEvent.getSource();
          var oContext = oButton.getBindingContext("goodsReceiptModel");

          if (!oContext) {
            MessageBox.error("License Plate bilgisi bulunamadı.");
            return;
          }

          var oLicensePlate = oContext.getObject();
          var sLpId = oLicensePlate.LpId;
          var iPhotoCount = parseInt(oLicensePlate.PhotoCount || "0");

          // Store context and LpId for later use
          this._oCurrentPhotoContext = oContext;
          this._sCurrentLpId = sLpId;

          // Update photoModel
          var oPhotoModel = this.getView().getModel("photoModel");
          oPhotoModel.setProperty("/lpId", sLpId);
          oPhotoModel.setProperty("/photoCount", iPhotoCount);

          // Load and open dialog
          if (!this._oPhotoDialog) {
            this._oPhotoDialog = sap.ui.xmlfragment(
              "photoDialog",
              "com.sut.bolgeyonetim.view.PhotoUploadDialog",
              this
            );
            this.getView().addDependent(this._oPhotoDialog);
          }

          // Lazy load photos from OData
          this._loadPhotos(sLpId);

          this._oPhotoDialog.open();
        },

        _loadPhotos: function (sLpId) {
          var oModel = this.getOwnerComponent().getModel();
          var oPhotoModel = this.getView().getModel("photoModel");

          if (!sLpId) {
            console.error("LpId is missing");
            return;
          }

          sap.ui.core.BusyIndicator.show(0);

          // Try reading with URL parameters instead of filters
          var sPath = "/PlatePhotoSet";

          oModel.read(sPath, {
            urlParameters: {
              $filter: "LpId eq '" + sLpId + "'",
              $select: "PhotoId,LpId,FileName,MimeType", // Exclude Stream field to avoid serialization error
            },
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();

              var aPhotos = oData.results || [];
              oPhotoModel.setProperty("/photos", aPhotos);
              oPhotoModel.setProperty("/photoCount", aPhotos.length);

              console.log("Photos loaded for LpId", sLpId, ":", aPhotos.length);
            }.bind(this),
            error: function (oError) {
              sap.ui.core.BusyIndicator.hide();
              console.error("Failed to load photos:", oError);

              // If still fails, try without filter (get all photos)
              console.warn("Trying to load all photos without filter...");
              oModel.read(sPath, {
                success: function (oData) {
                  // Filter client-side
                  var aAllPhotos = oData.results || [];
                  var aFilteredPhotos = aAllPhotos.filter(function (oPhoto) {
                    return oPhoto.LpId === sLpId;
                  });

                  oPhotoModel.setProperty("/photos", aFilteredPhotos);
                  oPhotoModel.setProperty(
                    "/photoCount",
                    aFilteredPhotos.length
                  );

                  console.log(
                    "Photos loaded (client-side filter):",
                    aFilteredPhotos.length
                  );
                }.bind(this),
                error: function (oErr) {
                  MessageBox.error(
                    this.getView()
                      .getModel("i18n")
                      .getResourceBundle()
                      .getText("photoLoadError")
                  );
                }.bind(this),
              });
            }.bind(this),
          });
        },

        onClosePhotoDialog: function () {
          if (this._oPhotoDialog) {
            this._oPhotoDialog.close();
          }
        },

        onFilePress: function (oEvent) {
          // Get selected item from selectionChange event
          var oUploadCollection = oEvent.getSource();
          var aSelectedItems = oUploadCollection.getSelectedItems();

          if (!aSelectedItems || aSelectedItems.length === 0) {
            return;
          }

          var oItem = aSelectedItems[0];
          var oContext = oItem.getBindingContext("photoModel");

          if (!oContext) {
            return;
          }

          var oPhoto = oContext.getObject();
          var sPhotoId = oPhoto.PhotoId;

          // Construct image URL (PhotoId is now String, not GUID)
          var sImageUrl =
            "/sap/opu/odata/sap/ZMM_BOLGE_DEPO_YONETIM_SRV/PlatePhotoSet('" +
            sPhotoId +
            "')/$value";

          // Create and open LightBox
          if (!this._oLightBox) {
            this._oLightBox = new sap.m.LightBox({
              imageContent: [
                new sap.m.LightBoxItem({
                  imageSrc: sImageUrl,
                  title: oPhoto.FileName || "Fotoğraf",
                }),
              ],
            });
            this.getView().addDependent(this._oLightBox);
          } else {
            // Update existing LightBox
            var oLightBoxItem = this._oLightBox.getImageContent()[0];
            oLightBoxItem.setImageSrc(sImageUrl);
            oLightBoxItem.setTitle(oPhoto.FileName || "Fotoğraf");
          }

          this._oLightBox.open();

          // Deselect the item after opening lightbox (use setTimeout to avoid timing issues)
          setTimeout(function () {
            if (oItem && oItem.setSelected) {
              oItem.setSelected(false);
            }
          }, 100);
        },

        onBeforeUploadStarts: function (oEvent) {
          var oModel = this.getOwnerComponent().getModel();

          // Refresh CSRF token
          oModel.refreshSecurityToken();
          var sToken = oModel.getSecurityToken();

          console.log("CSRF Token:", sToken);

          // Get file name and create slug
          var sFileName = oEvent.getParameter("fileName");
          var sLpId = this._sCurrentLpId;

          if (!sLpId || !sFileName) {
            MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("photoInvalidData")
            );
            oEvent.preventDefault();
            return;
          }

          // Create slug: LpId|FileName
          var sSlug = sLpId + "|" + sFileName;

          // Add headers using the newer approach
          var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
            name: "x-csrf-token",
            value: sToken,
          });
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);

          var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
            name: "slug",
            value: sSlug,
          });
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

          console.log("=== Upload Starting ===");
          console.log("Slug:", sSlug);
          console.log("LpId:", sLpId);
          console.log("FileName:", sFileName);
        },

        onUploadComplete: function (oEvent) {
          console.log("=== Upload Complete ===");
          console.log("Full Event:", oEvent);
          console.log("Event Parameters:", oEvent.getParameters());

          // Check response status
          var mParams = oEvent.getParameters();
          var iStatus = mParams.status || mParams.getParameter("status");
          var sResponse = mParams.response || mParams.getParameter("response");
          var sResponseRaw =
            mParams.responseRaw || mParams.getParameter("responseRaw");

          console.log("Status:", iStatus);
          console.log("Response:", sResponse);
          console.log("ResponseRaw:", sResponseRaw);

          if (iStatus === 201) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("photoUploadSuccess")
            );

            // Reload photos
            this._loadPhotos(this._sCurrentLpId);

            // Update PhotoCount in goodsReceiptModel
            var oContext = this._oCurrentPhotoContext;
            if (oContext) {
              var sPath = oContext.getPath();
              var oGoodsReceiptModel = oContext.getModel();
              var iCurrentCount = parseInt(
                oContext.getProperty("PhotoCount") || "0"
              );
              oGoodsReceiptModel.setProperty(
                sPath + "/PhotoCount",
                String(iCurrentCount + 1)
              );
            }
          } else {
            var sErrorMsg = this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("photoUploadError");

            if (sResponse) {
              try {
                var oErrorResponse = JSON.parse(sResponse);
                if (
                  oErrorResponse.error &&
                  oErrorResponse.error.message &&
                  oErrorResponse.error.message.value
                ) {
                  sErrorMsg +=
                    "\n\nDetay: " + oErrorResponse.error.message.value;
                }
              } catch (e) {
                sErrorMsg += "\n\nDetay: " + sResponse.substring(0, 200);
              }
            }

            MessageBox.error(sErrorMsg);
          }
        },

        onUploadTerminated: function (oEvent) {
          console.log("=== Upload Terminated (Error) ===");
          console.log("Full Event:", oEvent);
          console.log("Event Parameters:", oEvent.getParameters());

          var mParams = oEvent.getParameters();
          var sFileName = mParams.fileName || mParams.getParameter("fileName");

          MessageBox.error(
            this.getView()
              .getModel("i18n")
              .getResourceBundle()
              .getText("photoUploadError") +
              ": " +
              sFileName +
              "\n\nLütfen SAP backend loglarını kontrol edin."
          );
        },

        onFileChange: function (oEvent) {
          // Validate file before upload
          var aFiles = oEvent.getParameter("files");

          if (!aFiles || aFiles.length === 0) {
            return;
          }

          var oFile = aFiles[0];

          // Check photo count limit
          var oPhotoModel = this.getView().getModel("photoModel");
          var iPhotoCount = oPhotoModel.getProperty("/photoCount");

          if (iPhotoCount >= 5) {
            MessageBox.warning(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("photoMaxLimitWarning")
            );
            oEvent.preventDefault();
            return;
          }

          // Validate file size (5 MB)
          var iMaxSize = 5 * 1024 * 1024;
          if (oFile.size > iMaxSize) {
            MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("photoFileSizeError")
            );
            oEvent.preventDefault();
            return;
          }
        },

        onFileDeleted: function (oEvent) {
          // UploadCollection will show built-in Turkish confirmation dialog
          // Get deleted item after user confirms
          var oItem = oEvent.getParameter("item");
          var sDocumentId = oItem.getDocumentId(); // PhotoId

          if (!sDocumentId) {
            MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("photoInvalidId")
            );
            return;
          }

          // Delete the photo from backend
          this._deletePhoto(sDocumentId);
        },

        _deletePhoto: function (sPhotoId) {
          var oModel = this.getOwnerComponent().getModel();
          var sPath = "/PlatePhotoSet('" + sPhotoId + "')"; // PhotoId is String now

          sap.ui.core.BusyIndicator.show(0);

          oModel.remove(sPath, {
            success: function () {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getResourceBundle()
                  .getText("photoDeleteSuccess")
              );

              // Reload photos
              this._loadPhotos(this._sCurrentLpId);

              // Update PhotoCount in goodsReceiptModel
              var oContext = this._oCurrentPhotoContext;
              if (oContext) {
                var sContextPath = oContext.getPath();
                var oGoodsReceiptModel = oContext.getModel();
                var iCurrentCount = parseInt(
                  oContext.getProperty("PhotoCount") || "0"
                );
                oGoodsReceiptModel.setProperty(
                  sContextPath + "/PhotoCount",
                  String(Math.max(0, iCurrentCount - 1))
                );
              }
            }.bind(this),
            error: function (oError) {
              sap.ui.core.BusyIndicator.hide();

              var sErrorMsg = this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("photoDeleteError");
              if (oError && oError.responseText) {
                try {
                  var oErrorResponse = JSON.parse(oError.responseText);
                  if (
                    oErrorResponse.error &&
                    oErrorResponse.error.message &&
                    oErrorResponse.error.message.value
                  ) {
                    sErrorMsg +=
                      "\n\nDetay: " + oErrorResponse.error.message.value;
                  }
                } catch (e) {
                  // ignore parse error
                }
              }

              MessageBox.error(sErrorMsg);
            }.bind(this),
          });
        },

        /**
         * Get the current logged-in user's ID (Sicil No)
         * @returns {string} Username from sessionModel
         */
        _getUserId: function () {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          return oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;
        },

        /**
         * Handler for "Kaydet" button - syncs drafts to staging table
         * @deprecated - No longer used in simplified workflow
         */
        onSavePress: function (oEvent) {
          var sUserId = this._getUserId();

          // Debug logging
          console.log("=== onSavePress Debug ===");
          console.log("UserID:", sUserId);

          if (!sUserId) {
            MessageBox.error(
              "Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın."
            );
            return;
          }

          // Get the button to navigate to Panel for LpId
          var oButton = oEvent.getSource();
          var oPanel = oButton.getParent();
          while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
            oPanel = oPanel.getParent();
          }

          if (!oPanel) {
            MessageBox.error("Panel bulunamadı.");
            return;
          }

          var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
          if (!oL1Context) {
            MessageBox.error("License Plate context bulunamadı.");
            return;
          }

          var sLpId = oL1Context.getObject().LpId;
          console.log("LpId:", sLpId);

          // Collect all drafts from localStorage for this user and LpId
          var aPendingDrafts = [];
          var aKeysToRemove = [];

          for (var i = 0; i < localStorage.length; i++) {
            var sKey = localStorage.key(i);
            if (sKey && sKey.startsWith(sUserId + "_")) {
              try {
                var oDraft = JSON.parse(localStorage.getItem(sKey));
                if (oDraft && oDraft.lpid === sLpId) {
                  aPendingDrafts.push(oDraft);
                  aKeysToRemove.push(sKey);
                }
              } catch (e) {
                console.error("Failed to parse draft from localStorage:", e);
              }
            }
          }

          if (aPendingDrafts.length === 0) {
            MessageBox.information("Kaydedilecek değişiklik bulunmamaktadır.");
            return;
          }

          // Convert to JSON string for backend
          var sPendingItemsJson = JSON.stringify(aPendingDrafts);

          // Debug: Log parameters before call
          console.log("PostGoodsReceipt Parameters:");
          console.log("  LpId:", sLpId);
          console.log("  UserID:", sUserId);
          console.log("  PendingItemsJson:", sPendingItemsJson);
          console.log("  Total items:", aPendingDrafts.length);

          // Call PostGoodsReceipt function import
          var oModel = this.getOwnerComponent().getModel();
          var mParameters = {
            method: "POST",
            urlParameters: {
              LpId: sLpId,
              PendingItemsJson: sPendingItemsJson,
              UserID: sUserId,
            },
            success: function (oData) {
              // Remove synced drafts from localStorage
              aKeysToRemove.forEach(function (sKey) {
                localStorage.removeItem(sKey);
              });

              MessageToast.show(
                "Değişiklikler başarıyla kaydedildi (" +
                  aPendingDrafts.length +
                  " adet)"
              );

              // Trigger model refresh
              this.getView().getModel("itemsModel").refresh(true);
            }.bind(this),
            error: function (oError) {
              // Leave drafts in localStorage
              var sErrorMsg =
                "Sunucuya kaydedilemedi. Veriler cihazda saklandı.";

              if (oError && oError.responseText) {
                try {
                  var oErrorResponse = JSON.parse(oError.responseText);
                  if (
                    oErrorResponse.error &&
                    oErrorResponse.error.message &&
                    oErrorResponse.error.message.value
                  ) {
                    sErrorMsg +=
                      "\n\nDetay: " + oErrorResponse.error.message.value;
                  }
                } catch (e) {
                  // Ignore JSON parse errors
                }
              }

              MessageBox.error(sErrorMsg);
            }.bind(this),
          };

          oModel.callFunction("/PostGoodsReceipt", mParameters);
        },

        /**
         * Save a draft to localStorage with all 17 required fields
         * For aggregated items (multi-selection), distributes the quantity proportionally to original items
         */
        _saveDraftToLocalStorage: function (
          sLpId,
          oItem,
          sExpectedQuantity,
          sEditReason,
          aSelectedDeliveryNotes
        ) {
          // Get session model for Username (Sicil No)
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;

          if (!sSicilNo) {
            console.error("Username not found in sessionModel");
            return;
          }

          if (!sLpId) {
            console.error("LpId not provided");
            return;
          }

          // Get goodsReceiptModel to find LicensePlate
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();

          // Find the LicensePlate
          var oLicensePlate = null;

          for (var i = 0; i < aLicensePlates.length; i++) {
            if (aLicensePlates[i].LpId === sLpId) {
              oLicensePlate = aLicensePlates[i];
              break;
            }
          }

          if (!oLicensePlate) {
            console.error("LicensePlate not found for LpId:", sLpId);
            return;
          }

          // Use selected delivery notes if provided, otherwise use all delivery notes
          var aDeliveryNotesToUse = aSelectedDeliveryNotes;
          if (!aDeliveryNotesToUse || aDeliveryNotesToUse.length === 0) {
            // Fallback to all delivery notes
            if (
              oLicensePlate.ToDeliveryNotes &&
              oLicensePlate.ToDeliveryNotes.results
            ) {
              aDeliveryNotesToUse = oLicensePlate.ToDeliveryNotes.results;
            } else {
              aDeliveryNotesToUse = [];
            }
          }

          // Collect items for this Material from SELECTED delivery notes only
          var aOriginalItemsForMaterial = [];

          for (var i = 0; i < aDeliveryNotesToUse.length; i++) {
            var oDeliveryNote = aDeliveryNotesToUse[i];

            // Get items from this delivery note that match the current Material
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              var aL3Items = oDeliveryNote.ToItems.results;
              aL3Items.forEach(function (oOriginalItem) {
                if (oOriginalItem.Material === oItem.Material) {
                  aOriginalItemsForMaterial.push({
                    item: oOriginalItem,
                    deliveryNote: oDeliveryNote,
                  });
                }
              });
            }
          }

          if (aOriginalItemsForMaterial.length === 0) {
            console.error(
              "No original items found for material:",
              oItem.Material
            );
            return;
          }

          // Calculate total original ExpectedQuantity for proportional distribution
          var fTotalOriginalExpected = 0;
          aOriginalItemsForMaterial.forEach(function (oItemData) {
            fTotalOriginalExpected += parseFloat(
              oItemData.item.ExpectedQuantity || "0"
            );
          });

          // Get the user-entered ReceivedQuantity from the aggregated item
          var fAggregatedReceivedQty = parseFloat(
            oItem.ReceivedQuantity || "0"
          );

          // First pass: Calculate proportional values and floor them
          var aDistributedAmounts = [];
          var iTotalDistributed = 0;

          aOriginalItemsForMaterial.forEach(function (oItemData, index) {
            var fOriginalExpected = parseFloat(
              oItemData.item.ExpectedQuantity || "0"
            );
            var fProportionalReceived;

            if (fTotalOriginalExpected > 0) {
              fProportionalReceived =
                (fOriginalExpected / fTotalOriginalExpected) *
                fAggregatedReceivedQty;
            } else {
              // If total is 0, distribute equally
              fProportionalReceived =
                fAggregatedReceivedQty / aOriginalItemsForMaterial.length;
            }

            // Floor to get whole number
            var iFlooredAmount = Math.floor(fProportionalReceived);
            aDistributedAmounts.push(iFlooredAmount);
            iTotalDistributed += iFlooredAmount;
          });

          // Calculate remainder and add to last item
          var iRemainder =
            Math.floor(fAggregatedReceivedQty) - iTotalDistributed;
          if (aDistributedAmounts.length > 0) {
            aDistributedAmounts[aDistributedAmounts.length - 1] += iRemainder;
          }

          // Second pass: Save drafts with whole number amounts
          aOriginalItemsForMaterial.forEach(function (oItemData, index) {
            var oOriginalItem = oItemData.item;
            var oDeliveryNote = oItemData.deliveryNote;
            var fOriginalExpected = parseFloat(
              oOriginalItem.ExpectedQuantity || "0"
            );
            var iProportionalReceived = aDistributedAmounts[index];

            // Create the draft object with all 17 fields + timestamp
            // CRITICAL: Swap expectedquantity and receivedquantity for SAP backend
            // Fiori UI ReceivedQuantity (user-entered) → SAP ExpectedQuantity
            // Fiori UI ExpectedQuantity (original) → SAP ReceivedQuantity
            var oDraft = {
              timestamp: new Date().toISOString(), // For cleanup strategy
              lpid: oLicensePlate.LpId || "",
              warehousenum: oLicensePlate.WarehouseNum || "",
              platenumber: oLicensePlate.PlateNumber || "",
              arrivaldate: oLicensePlate.ArrivalDate || "",
              werks: oLicensePlate.Werks || "",
              deliveryitemid: oOriginalItem.DeliveryItemId || "",
              deliverynumber: oDeliveryNote.DeliveryNumber || "",
              itemnumber: oOriginalItem.ItemNumber || "",
              material: oOriginalItem.Material || "",
              expectedquantity: oOriginalItem.ExpectedQuantity || "", // SAP expects original quantity here
              receivedquantity: String(iProportionalReceived), // SAP expects user-entered value here
              uom: oOriginalItem.UoM || "",
              sm: oOriginalItem.SM || "",
              ebeln: oOriginalItem.Ebeln || "",
              ebelp: oOriginalItem.Ebelp || "",
              approved: oItem.Approved || "",
              editreason: sEditReason || oItem.EditReason || "",
            };

            // Create localStorage key: Username_DeliveryItemId
            var sKey = sSicilNo + "_" + oDraft.deliveryitemid;

            // Save to localStorage with quota exceeded handling
            try {
              localStorage.setItem(sKey, JSON.stringify(oDraft));
            } catch (e) {
              console.error("Failed to save draft to localStorage:", e);
              // Call Component cleanup if quota exceeded
              if (e.name === 'QuotaExceededError') {
                this.getOwnerComponent().cleanOldLocalStorageData();
                // Retry once after cleanup
                try {
                  localStorage.setItem(sKey, JSON.stringify(oDraft));
                } catch (e2) {
                  MessageBox.error(
                    "Draft kaydedilemedi. Lütfen depolama alanınızı kontrol edin."
                  );
                }
              } else {
                MessageBox.error(
                  "Draft kaydedilemedi. Lütfen depolama alanınızı kontrol edin."
                );
              }
            }
          });
        },

        /**
         * Load drafts from localStorage and apply them to the goodsReceiptModel
         */
        _loadDraftsFromLocalStorage: function () {
          // Get session model for Username
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;

          if (!sSicilNo) {
            console.error("Username not found in sessionModel");
            return;
          }

          var sPrefix = sSicilNo + "_";
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();

          // Loop through localStorage
          for (var i = 0; i < localStorage.length; i++) {
            var sKey = localStorage.key(i);

            // Check if key belongs to this user
            if (sKey.indexOf(sPrefix) === 0) {
              try {
                var oDraft = JSON.parse(localStorage.getItem(sKey));

                // Find the corresponding item in goodsReceiptModel
                var bFound = false;
                for (var j = 0; j < aLicensePlates.length && !bFound; j++) {
                  var oLP = aLicensePlates[j];
                  if (oLP.ToDeliveryNotes && oLP.ToDeliveryNotes.results) {
                    for (
                      var k = 0;
                      k < oLP.ToDeliveryNotes.results.length && !bFound;
                      k++
                    ) {
                      var oDN = oLP.ToDeliveryNotes.results[k];
                      if (oDN.ToItems && oDN.ToItems.results) {
                        for (var l = 0; l < oDN.ToItems.results.length; l++) {
                          var oItem = oDN.ToItems.results[l];
                          if (oItem.DeliveryItemId === oDraft.deliveryitemid) {
                            // Overwrite with draft data (DO NOT change ExpectedQuantity - keep backend value)
                            oItem.ReceivedQuantity = oDraft.expectedquantity;
                            oItem.Approved = oDraft.approved;
                            oItem.EditReason = oDraft.editreason;
                            bFound = true;
                            console.log("Draft loaded:", oDraft.deliveryitemid);
                            break;
                          }
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                console.error(
                  "Failed to parse draft from localStorage:",
                  sKey,
                  e
                );
              }
            }
          }

          // Refresh the model
          oGoodsReceiptModel.refresh(true);
        },

        /**
         * Refresh Home dashboard data after successful goods receipt
         */
        _refreshHomeDashboard: function () {
          console.log("=== _refreshHomeDashboard called ===");

          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");

          if (!oSessionModel || !oFilterModel) {
            console.warn("Missing sessionModel or filterModel");
            return;
          }

          var oLoginData = oSessionModel.getProperty("/Login");
          if (!oLoginData || !oLoginData.Username || !oLoginData.AuthToken) {
            console.warn("Missing login credentials");
            return;
          }

          // Get current selected date from filterModel
          var sSelectedDate = oFilterModel.getProperty("/selectedDate");
          var oArrivalDate;

          if (sSelectedDate) {
            var aParts = sSelectedDate.split("-");
            oArrivalDate = new Date(
              Date.UTC(
                parseInt(aParts[0]),
                parseInt(aParts[1]) - 1,
                parseInt(aParts[2]),
                0,
                0,
                0
              )
            );
          } else {
            var oToday = new Date();
            oArrivalDate = new Date(
              Date.UTC(
                oToday.getFullYear(),
                oToday.getMonth(),
                oToday.getDate(),
                0,
                0,
                0
              )
            );
          }

          console.log("Calling Login function import with date:", oArrivalDate);

          // Call Login function import to get updated counts
          this.callFunctionImport("Login", {
            urlParameters: {
              Username: oLoginData.Username,
              Password: oLoginData.AuthToken,
              ArrivalDate: oArrivalDate,
            },
          })
            .then(
              function (oData) {
                console.log("Login response received:", oData);

                if (!oData || !oData.Login) {
                  console.warn("No login data in response");
                  return;
                }

                // Update dashboard counts
                var oDashboardModel =
                  this.getOwnerComponent().getModel("dashboardData");
                var oLoginPayload = oData.Login;
                var oDashboardPayload = {
                  pendingReceipts: oLoginPayload.PendingGRCount || 0,
                  pendingShipments: oLoginPayload.PendingShipAssignCount || 0,
                  pendingDeliveries: oLoginPayload.PendingGICount || 0,
                  pendingCounts: oLoginPayload.PendingInvCount || 0,
                };

                console.log("Updating dashboard with:", oDashboardPayload);

                if (oDashboardModel) {
                  oDashboardModel.setData(
                    Object.assign(
                      {},
                      oDashboardModel.getData() || {},
                      oDashboardPayload
                    )
                  );
                  console.log("Dashboard updated successfully");
                } else {
                  console.warn("Dashboard model not found");
                }
              }.bind(this)
            )
            .catch(function (sError) {
              // Silent error - dashboard will update when user goes back to Home
              console.error("Failed to refresh dashboard:", sError);
            });
        },

        /**
         * Sync all pending drafts to backend using PostGoodsReceipt function
         */
        _syncDraftsToBackend: function (sLpId) {
          var oModel = this.getOwnerComponent().getModel();
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;

          if (!sSicilNo) {
            MessageBox.error("Kullanıcı bilgisi bulunamadı.");
            return;
          }

          if (!sLpId) {
            MessageBox.error("License Plate ID bulunamadı.");
            return;
          }

          // Debug: Log current LpId and localStorage state
          console.log("=== _syncDraftsToBackend Debug ===");
          console.log("Looking for LpId:", sLpId);
          console.log("UserId:", sSicilNo);
          console.log("Total localStorage items:", localStorage.length);

          // Collect all drafts for this user and this LpId
          var sPrefix = sSicilNo + "_";
          var aPendingDrafts = [];
          var aKeysToRemove = [];

          for (var i = 0; i < localStorage.length; i++) {
            var sKey = localStorage.key(i);

            if (sKey.indexOf(sPrefix) === 0) {
              try {
                var oDraft = JSON.parse(localStorage.getItem(sKey));
                console.log("  Checking draft:", sKey, "→ lpid:", oDraft.lpid);

                // Only include drafts for this LpId
                if (oDraft.lpid === sLpId) {
                  aPendingDrafts.push(oDraft);
                  aKeysToRemove.push(sKey);
                  console.log("    ✓ MATCHED - Adding to pending drafts");
                } else {
                  console.log(
                    "    ✗ NOT MATCHED (expected:",
                    sLpId,
                    ", got:",
                    oDraft.lpid,
                    ")"
                  );
                }
              } catch (e) {
                console.error("Failed to parse draft:", sKey, e);
              }
            }
          }

          console.log("Total pending drafts found:", aPendingDrafts.length);

          if (aPendingDrafts.length === 0) {
            MessageBox.information("Kaydedilecek değişiklik bulunmamaktadır.");
            return;
          }

          // Convert array to JSON string
          var sJsonPayload = JSON.stringify(aPendingDrafts);

          // Log the payload for debugging
          console.log("=== PostGoodsReceipt Payload ===");
          console.log("LpId:", sLpId);
          console.log("PendingItemsJson:", sJsonPayload);
          console.log("Total items:", aPendingDrafts.length);

          // Show busy indicator
          sap.ui.core.BusyIndicator.show(0);

          // Call OData function
          oModel.callFunction("/PostGoodsReceipt", {
            method: "POST",
            urlParameters: {
              LpId: sLpId,
              PendingItemsJson: sJsonPayload,
              UserID: sSicilNo,
            },
            success: function (oData, oResponse) {
              sap.ui.core.BusyIndicator.hide();

              // Remove drafts from localStorage on success
              aKeysToRemove.forEach(function (sKey) {
                localStorage.removeItem(sKey);
                console.log("Draft removed from localStorage:", sKey);
              });

              // Refresh the goods receipt data to get updated status
              this._loadGoodsReceiptData();

              // Refresh Home dashboard counts
              this._refreshHomeDashboard();

              MessageBox.success("Mal kabul işlemi başarıyla tamamlandı!");
            }.bind(this),
            error: function (oError) {
              sap.ui.core.BusyIndicator.hide();

              // Do NOT remove drafts on error
              var sErrorMsg =
                "Senkronizasyon başarısız. Verileriniz cihazınızda güvende. İnternet bağlantınızı kontrol edip tekrar deneyin.";

              if (oError && oError.responseText) {
                try {
                  var oErrorResponse = JSON.parse(oError.responseText);
                  if (
                    oErrorResponse.error &&
                    oErrorResponse.error.message &&
                    oErrorResponse.error.message.value
                  ) {
                    sErrorMsg = oErrorResponse.error.message.value;
                  }
                } catch (e) {
                  // ignore parse error
                }
              }

              MessageBox.error(sErrorMsg);
            }.bind(this),
          });
        },
      }
    );
  }
);
