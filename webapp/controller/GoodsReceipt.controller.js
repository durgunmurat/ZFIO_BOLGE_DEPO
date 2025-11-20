sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(BaseController, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.GoodsReceipt", {
        /**
         * Formatter: Determines if "Mal Kabul" button should be enabled
         * Returns true only if itemsModel has data AND all items are approved
         */
        isMalKabulEnabled: function(aItems) {
            if (!aItems || aItems.length === 0) {
                return false;
            }
            
            // Check if ALL items are approved
            var bAllApproved = aItems.every(function(oItem) {
                return oItem.Approved === "X";
            });
            
            return bAllApproved;
        },

        onInit: function() {
            // Initialize empty itemsModel for L3 display
            this.getView().setModel(new JSONModel([]), "itemsModel");
            
            // Initialize editReasonsModel and load from OData
            var oEditReasonsModel = new JSONModel([]);
            this.getView().setModel(oEditReasonsModel, "editReasonsModel");
            this._loadEditReasons();
            
            // Initialize photoModel for photo dialog
            var oPhotoModel = new JSONModel({
                photos: [],
                photoCount: 0,
                lpId: null
            });
            this.getView().setModel(oPhotoModel, "photoModel");
            
            // Attach route matched handler to load data when navigating to this view
            this.getRouter().getRoute("goodsReceipt").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            // Clean up previous state before loading new data
            this._cleanupView();
            
            // Load the goods receipt data from OData, then load drafts
            this._loadGoodsReceiptData();
        },

        /**
         * Load EditReasonSet from OData into JSONModel (one-time load)
         */
        _loadEditReasons: function() {
            var oModel = this.getOwnerComponent().getModel();
            var oEditReasonsModel = this.getView().getModel("editReasonsModel");
            
            // Only load if not already loaded
            if (oEditReasonsModel.getData().length > 0) {
                return;
            }
            
            oModel.read("/EditReasonSet", {
                success: function(oData) {
                    oEditReasonsModel.setData(oData.results || []);
                    console.log("EditReasons loaded:", oData.results.length);
                }.bind(this),
                error: function(oError) {
                    console.error("Failed to load EditReasonSet:", oError);
                    // Set empty array on error
                    oEditReasonsModel.setData([]);
                }.bind(this)
            });
        },

        /**
         * Clean up view state when leaving or re-entering the screen
         */
        _cleanupView: function() {
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
                aL1Items.forEach(function(oL1Item) {
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
                                aL2Items.forEach(function(oL2Item) {
                                    // Find and uncheck all checkboxes
                                    var oCheckBox = oL2Item.getContent()[0].getItems()[0].getItems()[0];
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
                                    oIconTabBar.addItem(new sap.m.IconTabFilter({
                                        key: "all",
                                        text: "Tümü",
                                        count: 0
                                    }));
                                    oIconTabBar.addItem(new sap.m.IconTabSeparator());
                                }
                            }
                        }
                        
                        // Disable "Mal Kabul" button
                        var oHeaderToolbar = oPanel.getHeaderToolbar();
                        if (oHeaderToolbar) {
                            var aToolbarContent = oHeaderToolbar.getContent();
                            var oMalKabulBtn = aToolbarContent.find(function(oControl) {
                                return oControl.getMetadata().getName() === "sap.m.Button" && 
                                       oControl.getText() === "Mal Kabul";
                            });
                            if (oMalKabulBtn) {
                                oMalKabulBtn.setEnabled(false);
                            }
                        }
                    }
                });
            }
        },

        onExit: function() {
            // Clean up when view is destroyed
            this._cleanupView();
        },

        /**
         * Load LicensePlateSet with expanded DeliveryNotes from OData service.
         * Uses WarehouseNum from session and current date for ArrivalDate filter.
         */
        _loadGoodsReceiptData: function() {
            var oModel = this.getOwnerComponent().getModel(); // default OData model
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");

            // 1. Get WarehouseNum from session
            var sWarehouseNum = oSessionModel ? oSessionModel.getProperty("/Login/WarehouseNum") : null;
            if (!sWarehouseNum) {
                MessageBox.error("Depo numarası bulunamadı. Lütfen tekrar giriş yapın.");
                return;
            }

            // 2. Get date from filterModel (set in Home view)
            var sArrivalDate = oFilterModel ? oFilterModel.getProperty("/selectedDate") : null;
            var oDateForFilter;
            
            if (!sArrivalDate) {
                // Fallback to today if filter model not available
                var oToday = new Date();
                var sYear = oToday.getFullYear();
                var sMonth = String(oToday.getMonth() + 1).padStart(2, '0');
                var sDay = String(oToday.getDate()).padStart(2, '0');
                sArrivalDate = sYear + sMonth + sDay; // Format: YYYYMMDD
                oDateForFilter = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), 0, 0, 0));
            } else {
                // Convert from yyyy-MM-dd to YYYYMMDD
                sArrivalDate = sArrivalDate.replace(/-/g, '');
                // Create a UTC Date object to avoid timezone offset issues
                var aParts = oFilterModel.getProperty("/selectedDate").split('-');
                oDateForFilter = new Date(Date.UTC(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]), 0, 0, 0));
            }

            // 3. Create filters
            // Try Date object instead of string - OData v2 typically expects Date for Edm.DateTime
            var aFilters = [
                new Filter("WarehouseNum", FilterOperator.EQ, sWarehouseNum),
                new Filter("ArrivalDate", FilterOperator.EQ, oDateForFilter)
            ];

            // Debug: Log filter values
            console.log("Filters - WarehouseNum:", sWarehouseNum, "ArrivalDate (string):", sArrivalDate, "ArrivalDate (Date):", oDateForFilter);

            // 4. Call OData read with $expand to fetch all 3 levels
            oModel.read("/LicensePlateSet", {
                filters: aFilters,
                urlParameters: {
                    "$expand": "ToDeliveryNotes/ToItems"
                },
                success: function(oData) {
                    // 5. Create a JSON model and set the results
                    var oGoodsReceiptModel = new JSONModel(oData.results || []);
                    this.getView().setModel(oGoodsReceiptModel, "goodsReceiptModel");

                    // Debug: Log the data structure
                    console.log("GoodsReceipt Data Structure:", JSON.stringify(oData.results, null, 2));

                    // Load drafts from localStorage after OData is loaded
                    this._loadDraftsFromLocalStorage();

                    // Optional: show success message or count
                    var iCount = oData.results ? oData.results.length : 0;
                    if (iCount === 0) {
                        MessageBox.information("Bugün için bekleyen mal kabul kaydı bulunamadı.");
                    }
                }.bind(this),
                error: function(oError) {
                    // 6. Handle error
                    var sMessage = "Mal kabul verileri yüklenirken hata oluştu.";
                    if (oError && oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                sMessage = oErrorResponse.error.message.value;
                            }
                        } catch (e) {
                            // ignore parse error
                        }
                    }
                    MessageBox.error(sMessage);
                }.bind(this)
            });
        },

        /**
         * Event handler when a delivery note checkbox is selected/deselected.
         * Supports multi-selection - collects items from ALL selected delivery notes.
         */
        onDeliveryNoteSelect: function(oEvent) {
            var oCheckBox = oEvent.getSource();
            var oL2Context = oCheckBox.getBindingContext("goodsReceiptModel");
            
            if (!oL2Context) {
                return;
            }
            
            // Navigate up the control tree to find the Panel and VBox (L3 Section)
            var oPanel = oCheckBox.getParent();
            while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
                oPanel = oPanel.getParent();
            }
            
            if (!oPanel) {
                console.error("Panel not found in control tree");
                return;
            }
            
            // Get L1 context to retrieve LpId
            var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
            var sLpId = oL1Context ? oL1Context.getObject().LpId : null;
            
            // Get the VBox container (first child of Panel content)
            var oVBoxContainer = oPanel.getContent()[0];
            if (!oVBoxContainer) {
                console.error("VBox container not found");
                return;
            }
            
            // L3 Section is the second child of VBox (after L2 List)
            var oL3Section = oVBoxContainer.getItems()[1];
            if (!oL3Section) {
                console.error("L3 Section not found");
                return;
            }
            
            // Get IconTabBar (first child of L3 Section)
            var oIconTabBar = oL3Section.getItems()[0];
            
            // MULTI-SELECTION: Collect items from ALL selected delivery notes and aggregate by Material
            var oL2List = oVBoxContainer.getItems()[0];
            var aL2Items = oL2List.getItems();
            var oMaterialMap = {}; // Map to aggregate items by Material number
            var aTotalCounts = {
                Total1: 0, Total2: 0, Total3: 0, Total4: 0, Total5: 0,
                Total6: 0, Total7: 0, Total8: 0, Total9: 0, TotalDepozito: 0
            };
            var oFirstSelectedDeliveryNote = null;
            
            aL2Items.forEach(function(oL2Item) {
                var oChkBox = oL2Item.getContent()[0].getItems ? oL2Item.getContent()[0].getItems()[0] : null;
                if (oChkBox && oChkBox.getSelected && oChkBox.getSelected()) {
                    var oCtx = oChkBox.getBindingContext("goodsReceiptModel");
                    if (oCtx) {
                        var oDeliveryNote = oCtx.getObject();
                        
                        // Store first selected for text references
                        if (!oFirstSelectedDeliveryNote) {
                            oFirstSelectedDeliveryNote = oDeliveryNote;
                        }
                        
                        // Collect and aggregate items by Material
                        var aL3Items = oCtx.getProperty("ToItems/results");
                        if (aL3Items && aL3Items.length > 0) {
                            aL3Items.forEach(function(oItem) {
                                var sMaterial = oItem.Material;
                                
                                // Get session model for Username to check localStorage
                                var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
                                var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
                                
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
                                            sReceivedQtyToUse = oDraft.expectedquantity || "0";
                                            sApprovedToUse = oDraft.approved || "";
                                            sEditReasonToUse = oDraft.editreason || "";
                                        }
                                    } catch (e) {
                                        console.error("Failed to parse draft from localStorage:", e);
                                    }
                                }
                                
                                if (oMaterialMap[sMaterial]) {
                                    // Material already exists - aggregate quantities
                                    var fExpectedQty = parseFloat(oMaterialMap[sMaterial].ExpectedQuantity || "0");
                                    var fNewExpectedQty = parseFloat(oItem.ExpectedQuantity || "0");
                                    oMaterialMap[sMaterial].ExpectedQuantity = String(fExpectedQty + fNewExpectedQty);
                                    
                                    var fReceivedQty = parseFloat(oMaterialMap[sMaterial].ReceivedQuantity || "0");
                                    var fNewReceivedQty = parseFloat(sReceivedQtyToUse || "0");
                                    oMaterialMap[sMaterial].ReceivedQuantity = String(fReceivedQty + fNewReceivedQty);
                                    
                                    // Aggregate Approved status - only 'X' if all are approved
                                    if (oMaterialMap[sMaterial].Approved === "X" && sApprovedToUse !== "X") {
                                        oMaterialMap[sMaterial].Approved = "";
                                    }
                                } else {
                                    // First occurrence of this Material - create new entry
                                    oMaterialMap[sMaterial] = {
                                        LpId: sLpId,
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
                                        DeliveryItemId: oItem.DeliveryItemId, // Keep first occurrence
                                        ItemNumber: oItem.ItemNumber,
                                        Approved: sApprovedToUse,
                                        EditReason: sEditReasonToUse
                                    };
                                }
                            }.bind(this));
                        }
                        
                        // Aggregate totals
                        for (var key in aTotalCounts) {
                            aTotalCounts[key] += parseInt(oDeliveryNote[key] || "0");
                        }
                    }
                }
            }.bind(this));
            
            // Convert map to array
            var aItemsToShow = [];
            for (var sMat in oMaterialMap) {
                aItemsToShow.push(oMaterialMap[sMat]);
            }
            
            // Update the itemsModel with collected items
            this.getView().getModel("itemsModel").setData(aItemsToShow);
            
            // Debug: Log collected items
            console.log("Collected L3 Items (Multi-Selection):", aItemsToShow.length);
            
            // Show/hide L3 section based on whether items are selected
            if (oL3Section) {
                oL3Section.setVisible(aItemsToShow.length > 0);
            }
            
            // Update category filters with aggregated totals
            if (oFirstSelectedDeliveryNote && oIconTabBar) {
                this._updateCategoryFiltersForTabBarMulti(oFirstSelectedDeliveryNote, aTotalCounts, oIconTabBar);
            }
        },

        /**
         * Update category filters based on aggregated totals from multiple delivery notes
         */
        _updateCategoryFiltersForTabBarMulti: function(oFirstDeliveryNote, aTotalCounts, oIconTabBar) {
            if (!oIconTabBar) {
                return;
            }
            
            // Remove all existing filters
            oIconTabBar.destroyItems();
            
            // Calculate total count
            var iTotalCount = 0;
            for (var key in aTotalCounts) {
                iTotalCount += aTotalCounts[key];
            }
            
            // Add "Tümü" filter
            oIconTabBar.addItem(new sap.m.IconTabFilter({
                key: "all",
                text: "Tümü (" + iTotalCount + ")",
                count: iTotalCount
            }));
            
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
                { key: "99", totalField: "TotalDepozito", textField: "TotalDepozitoText" }
            ];
            
            aCategoryMapping.forEach(function(oMapping) {
                var iCount = aTotalCounts[oMapping.totalField];
                var sText = oFirstDeliveryNote[oMapping.textField] || "";
                
                if (iCount > 0 && sText) {
                    oIconTabBar.addItem(new sap.m.IconTabFilter({
                        key: oMapping.key,
                        text: sText + " (" + iCount + ")",
                        count: iCount
                    }));
                }
            });
        },

        /**
         * Update category filters based on DeliveryNote Total fields (legacy single-selection)
         */
        _updateCategoryFiltersForTabBar: function(oDeliveryNote, oIconTabBar) {
            if (!oIconTabBar) {
                return;
            }
            
            // Remove all existing filters
            oIconTabBar.destroyItems();
            
            // Calculate total count
            var iTotalCount = 0;
            var aTotalFields = ["Total1", "Total2", "Total3", "Total4", "Total5", "Total6", "Total7", "Total8", "Total9", "TotalDepozito"];
            
            aTotalFields.forEach(function(sField) {
                var iCount = parseInt(oDeliveryNote[sField] || "0");
                iTotalCount += iCount;
            });
            
            // Add "Tümü" filter
            oIconTabBar.addItem(new sap.m.IconTabFilter({
                key: "all",
                text: "Tümü (" + iTotalCount + ")",
                count: iTotalCount
            }));
            
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
                { key: "99", totalField: "TotalDepozito", textField: "TotalDepozitoText" }
            ];
            
            aCategoryMapping.forEach(function(oMapping) {
                var iCount = parseInt(oDeliveryNote[oMapping.totalField] || "0");
                var sText = oDeliveryNote[oMapping.textField] || "";
                
                if (iCount > 0 && sText) {
                    oIconTabBar.addItem(new sap.m.IconTabFilter({
                        key: oMapping.key,
                        text: sText + " (" + iCount + ")",
                        count: iCount
                    }));
                }
            });
        },



        /**
         * Update category filter counts based on items
         */
        _updateCategoryFilterCounts: function(aItems) {
            // This method is now replaced by _updateCategoryFiltersFromDeliveryNote
            // Kept for backward compatibility if needed
        },

        /**
         * Event handler when a category filter is selected in IconTabBar.
         * Filters the L3 items table by selected category key.
         */
        onCategoryFilterSelect: function(oEvent) {
            var sSelectedKey = oEvent.getParameter("key");
            var oIconTabBar = oEvent.getSource();
            
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
                return;
            }
            
            // Apply filter based on selected category
            if (sSelectedKey === "all") {
                oBinding.filter([]);
            } else {
                // Filter by category key (first 2 digits of Kategori field)
                // Kategori format: "02201030001" -> first 2 chars = "02"
                var oFilter = new Filter("Kategori", FilterOperator.StartsWith, sSelectedKey);
                oBinding.filter([oFilter]);
            }
        },

        onCountChange: function(oEvent) {
            // Trigger model refresh to update button enabled state via formatter
            this.getView().getModel("itemsModel").refresh(true);
        },

        onApproveItem: function(oEvent) {
            // Get the item context and button
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext("itemsModel");
            var sPath = oContext.getPath();
            var oItemsModel = this.getView().getModel("itemsModel");
            var oItem = oContext.getObject();
            
            // Store current item path for dialog
            this._sCurrentEditPath = sPath;
            this._oCurrentEditButton = oButton;
            
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
                
                // Save draft to localStorage
                this._saveDraftToLocalStorage(oItem.LpId, oItem, sExpectedQty, "");
                
                // Trigger model refresh to update button state
                oItemsModel.refresh(true);
            }
        },

        _updateMalKabulButton: function(oButton) {
            // Trigger model refresh to update button enabled state via formatter
            this.getView().getModel("itemsModel").refresh(true);
        },

        _openEditDialog: function(oItem) {
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
                                            design: "Bold"
                                        }).addStyleClass("sapUiTinyMarginBottom"),
                                        new sap.m.Text({
                                            id: this.createId("editDialogProductName"),
                                            text: ""
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMarginBottom"),
                                
                                // Current Quantity Info
                                new sap.m.HBox({
                                    justifyContent: "SpaceBetween",
                                    alignItems: "Center",
                                    items: [
                                        new sap.m.Label({
                                            text: "Beklenen Miktar:",
                                            width: "100%"
                                        }),
                                        new sap.m.Text({
                                            id: this.createId("editDialogReceivedQty"),
                                            text: ""
                                        })
                                    ]
                                }).addStyleClass("sapUiSmallMarginBottom"),
                                
                                // Divider
                                new sap.m.VBox({ height: "0.5rem" }),
                                
                                // New Quantity Input
                                new sap.m.Label({
                                    text: "Yeni Miktar",
                                    required: true,
                                    labelFor: this.createId("editDialogNewQty")
                                }).addStyleClass("sapUiTinyMarginTop"),
                                new sap.m.Input({
                                    id: this.createId("editDialogNewQty"),
                                    type: "Number",
                                    placeholder: "Yeni miktarı girin",
                                    width: "100%",
                                    valueState: "None",
                                    valueLiveUpdate: true,
                                    liveChange: function(oEvent) {
                                        var sValue = oEvent.getParameter("value");
                                        var oInput = oEvent.getSource();
                                        if (!sValue || sValue === "0" || parseFloat(sValue) < 0) {
                                            oInput.setValueState("Error");
                                            oInput.setValueStateText("Lütfen geçerli bir miktar girin");
                                        } else {
                                            oInput.setValueState("None");
                                        }
                                    }
                                }).addStyleClass("sapUiTinyMarginTop sapUiSmallMarginBottom"),
                                
                                // Edit Reason ComboBox
                                new sap.m.Label({
                                    text: "Düzenleme Nedeni",
                                    required: true,
                                    labelFor: this.createId("editDialogReason")
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
                                            text: "{editReasonsModel>Text}"
                                        })
                                    },
                                    selectionChange: function(oEvent) {
                                        var oComboBox = oEvent.getSource();
                                        if (oComboBox.getSelectedKey()) {
                                            oComboBox.setValueState("None");
                                        }
                                    }
                                }).addStyleClass("sapUiTinyMarginTop")
                            ]
                        }).addStyleClass("sapUiMediumMargin")
                    ],
                    beginButton: new sap.m.Button({
                        text: "Kaydet",
                        type: "Emphasized",
                        icon: "sap-icon://save",
                        press: function() {
                            this._onEditDialogSave();
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "İptal",
                        icon: "sap-icon://decline",
                        press: function() {
                            this._oEditDialog.close();
                        }.bind(this)
                    }),
                    afterClose: function() {
                        // Reset value states when dialog closes
                        this.byId("editDialogNewQty").setValueState("None");
                        this.byId("editDialogReason").setValueState("None");
                    }.bind(this)
                });
                this.getView().addDependent(this._oEditDialog);
            }
            
            // Set current item data to dialog
            this.byId("editDialogProductName").setText(oItem.MaterialText);
            this.byId("editDialogReceivedQty").setText(oItem.ExpectedQuantity + " " + oItem.UoM);
            this.byId("editDialogNewQty").setValue(oItem.ReceivedQuantity);
            this.byId("editDialogNewQty").setValueState("None");
            this.byId("editDialogReason").setSelectedKey("");
            this.byId("editDialogReason").setValueState("None");
            
            this._oEditDialog.open();
        },

        _onEditDialogSave: function() {
            var oNewQtyInput = this.byId("editDialogNewQty");
            var oReasonComboBox = this.byId("editDialogReason");
            var sNewQty = oNewQtyInput.getValue();
            var sReason = oReasonComboBox.getSelectedKey();
            
            var bValid = true;
            
            // Validation with visual feedback
            if (!sNewQty || sNewQty === "0" || parseFloat(sNewQty) < 0) {
                oNewQtyInput.setValueState("Error");
                oNewQtyInput.setValueStateText("Lütfen geçerli bir miktar girin");
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
            
            // Update the item
            var oItemsModel = this.getView().getModel("itemsModel");
            oItemsModel.setProperty(this._sCurrentEditPath + "/ReceivedQuantity", sNewQty);
            oItemsModel.setProperty(this._sCurrentEditPath + "/EditReason", sReason);
            
            // Get the updated item and save draft
            var oContext = this._oCurrentEditButton.getBindingContext("itemsModel");
            var oUpdatedItem = oContext.getObject();
            this._saveDraftToLocalStorage(oUpdatedItem.LpId, oUpdatedItem, sNewQty, sReason);
            
            // Trigger model refresh to update button state
            oItemsModel.refresh(true);
            
            this._oEditDialog.close();
            MessageBox.success("Miktar başarıyla güncellendi.");
        },

        onMalKabulPress: function(oEvent) {
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

        onAcceptPress: function(oEvent) {
            // Deprecated - replaced by onMalKabulPress
            this.onMalKabulPress(oEvent);
        },

        onPhotoPress: function(oEvent) {
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
        
        _loadPhotos: function(sLpId) {
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
                    "$filter": "LpId eq '" + sLpId + "'",
                    "$select": "PhotoId,LpId,FileName,MimeType"  // Exclude Stream field to avoid serialization error
                },
                success: function(oData) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    var aPhotos = oData.results || [];
                    oPhotoModel.setProperty("/photos", aPhotos);
                    oPhotoModel.setProperty("/photoCount", aPhotos.length);
                    
                    console.log("Photos loaded for LpId", sLpId, ":", aPhotos.length);
                }.bind(this),
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.error("Failed to load photos:", oError);
                    
                    // If still fails, try without filter (get all photos)
                    console.warn("Trying to load all photos without filter...");
                    oModel.read(sPath, {
                        success: function(oData) {
                            // Filter client-side
                            var aAllPhotos = oData.results || [];
                            var aFilteredPhotos = aAllPhotos.filter(function(oPhoto) {
                                return oPhoto.LpId === sLpId;
                            });
                            
                            oPhotoModel.setProperty("/photos", aFilteredPhotos);
                            oPhotoModel.setProperty("/photoCount", aFilteredPhotos.length);
                            
                            console.log("Photos loaded (client-side filter):", aFilteredPhotos.length);
                        }.bind(this),
                        error: function(oErr) {
                            MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoLoadError"));
                        }.bind(this)
                    });
                }.bind(this)
            });
        },
        
        onClosePhotoDialog: function() {
            if (this._oPhotoDialog) {
                this._oPhotoDialog.close();
            }
        },
        
        onFilePress: function(oEvent) {
            // Get the pressed item
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("photoModel");
            
            if (!oContext) {
                return;
            }
            
            var oPhoto = oContext.getObject();
            var sPhotoId = oPhoto.PhotoId;
            
            // Construct image URL (PhotoId is now String, not GUID)
            var sImageUrl = "/sap/opu/odata/sap/ZMM_BOLGE_DEPO_YONETIM_SRV/PlatePhotoSet('" + sPhotoId + "')/$value";
            
            // Create and open LightBox
            if (!this._oLightBox) {
                this._oLightBox = new sap.m.LightBox({
                    imageContent: [
                        new sap.m.LightBoxItem({
                            imageSrc: sImageUrl,
                            title: oPhoto.FileName || "Fotoğraf"
                        })
                    ]
                });
                this.getView().addDependent(this._oLightBox);
            } else {
                // Update existing LightBox
                var oLightBoxItem = this._oLightBox.getImageContent()[0];
                oLightBoxItem.setImageSrc(sImageUrl);
                oLightBoxItem.setTitle(oPhoto.FileName || "Fotoğraf");
            }
            
            this._oLightBox.open();
        },
        
        onBeforeUploadStarts: function(oEvent) {
            var oModel = this.getOwnerComponent().getModel();
            
            // Refresh CSRF token
            oModel.refreshSecurityToken();
            var sToken = oModel.getSecurityToken();
            
            console.log("CSRF Token:", sToken);
            
            // Get file name and create slug
            var sFileName = oEvent.getParameter("fileName");
            var sLpId = this._sCurrentLpId;
            
            if (!sLpId || !sFileName) {
                MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoInvalidData"));
                oEvent.preventDefault();
                return;
            }
            
            // Create slug: LpId|FileName
            var sSlug = sLpId + "|" + sFileName;
            
            // Add headers using the newer approach
            var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: sToken
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
            
            var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: sSlug
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            
            console.log("=== Upload Starting ===");
            console.log("Slug:", sSlug);
            console.log("LpId:", sLpId);
            console.log("FileName:", sFileName);
        },
        
        onUploadComplete: function(oEvent) {
            console.log("=== Upload Complete ===");
            console.log("Full Event:", oEvent);
            console.log("Event Parameters:", oEvent.getParameters());
            
            // Check response status
            var mParams = oEvent.getParameters();
            var iStatus = mParams.status || mParams.getParameter("status");
            var sResponse = mParams.response || mParams.getParameter("response");
            var sResponseRaw = mParams.responseRaw || mParams.getParameter("responseRaw");
            
            console.log("Status:", iStatus);
            console.log("Response:", sResponse);
            console.log("ResponseRaw:", sResponseRaw);
            
            if (iStatus === 201) {
                MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("photoUploadSuccess"));
                
                // Reload photos
                this._loadPhotos(this._sCurrentLpId);
                
                // Update PhotoCount in goodsReceiptModel
                var oContext = this._oCurrentPhotoContext;
                if (oContext) {
                    var sPath = oContext.getPath();
                    var oGoodsReceiptModel = oContext.getModel();
                    var iCurrentCount = parseInt(oContext.getProperty("PhotoCount") || "0");
                    oGoodsReceiptModel.setProperty(sPath + "/PhotoCount", String(iCurrentCount + 1));
                }
            } else {
                var sErrorMsg = this.getView().getModel("i18n").getResourceBundle().getText("photoUploadError");
                
                if (sResponse) {
                    try {
                        var oErrorResponse = JSON.parse(sResponse);
                        if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                            sErrorMsg += "\n\nDetay: " + oErrorResponse.error.message.value;
                        }
                    } catch (e) {
                        sErrorMsg += "\n\nDetay: " + sResponse.substring(0, 200);
                    }
                }
                
                MessageBox.error(sErrorMsg);
            }
        },
        
        onUploadTerminated: function(oEvent) {
            console.log("=== Upload Terminated (Error) ===");
            console.log("Full Event:", oEvent);
            console.log("Event Parameters:", oEvent.getParameters());
            
            var mParams = oEvent.getParameters();
            var sFileName = mParams.fileName || mParams.getParameter("fileName");
            
            MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoUploadError") + ": " + sFileName + "\n\nLütfen SAP backend loglarını kontrol edin.");
        },
        
        onFileChange: function(oEvent) {
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
                MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("photoMaxLimitWarning"));
                oEvent.preventDefault();
                return;
            }
            
            // Validate file size (5 MB)
            var iMaxSize = 5 * 1024 * 1024;
            if (oFile.size > iMaxSize) {
                MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoFileSizeError"));
                oEvent.preventDefault();
                return;
            }
        },
        
        onFileDeleted: function(oEvent) {
            // Get deleted item
            var oItem = oEvent.getParameter("item");
            var sDocumentId = oItem.getDocumentId(); // PhotoId
            
            if (!sDocumentId) {
                MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoInvalidId"));
                return;
            }
            
            // Confirm deletion
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            MessageBox.confirm(oResourceBundle.getText("photoDeleteConfirm"), {
                title: oResourceBundle.getText("photoDeleteTitle"),
                onClose: function(sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._deletePhoto(sDocumentId);
                    }
                }.bind(this)
            });
        },
        
        _deletePhoto: function(sPhotoId) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/PlatePhotoSet('" + sPhotoId + "')";  // PhotoId is String now
            
            sap.ui.core.BusyIndicator.show(0);
            
            oModel.remove(sPath, {
                success: function() {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("photoDeleteSuccess"));
                    
                    // Reload photos
                    this._loadPhotos(this._sCurrentLpId);
                    
                    // Update PhotoCount in goodsReceiptModel
                    var oContext = this._oCurrentPhotoContext;
                    if (oContext) {
                        var sContextPath = oContext.getPath();
                        var oGoodsReceiptModel = oContext.getModel();
                        var iCurrentCount = parseInt(oContext.getProperty("PhotoCount") || "0");
                        oGoodsReceiptModel.setProperty(sContextPath + "/PhotoCount", String(Math.max(0, iCurrentCount - 1)));
                    }
                }.bind(this),
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    var sErrorMsg = this.getView().getModel("i18n").getResourceBundle().getText("photoDeleteError");
                    if (oError && oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                sErrorMsg += "\n\nDetay: " + oErrorResponse.error.message.value;
                            }
                        } catch (e) {
                            // ignore parse error
                        }
                    }
                    
                    MessageBox.error(sErrorMsg);
                }.bind(this)
            });
        },

        /**
         * Get the current logged-in user's ID (Sicil No)
         * @returns {string} Username from sessionModel
         */
        _getUserId: function() {
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            return oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
        },

        /**
         * Handler for "Kaydet" button - syncs drafts to staging table
         * @deprecated - No longer used in simplified workflow
         */
        onSavePress: function(oEvent) {
            var sUserId = this._getUserId();
            
            // Debug logging
            console.log("=== onSavePress Debug ===");
            console.log("UserID:", sUserId);
            
            if (!sUserId) {
                MessageBox.error("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
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
                    UserID: sUserId
                },
                success: function(oData) {
                    // Remove synced drafts from localStorage
                    aKeysToRemove.forEach(function(sKey) {
                        localStorage.removeItem(sKey);
                    });

                    MessageToast.show("Değişiklikler başarıyla kaydedildi (" + aPendingDrafts.length + " adet)");
                    
                    // Trigger model refresh
                    this.getView().getModel("itemsModel").refresh(true);
                }.bind(this),
                error: function(oError) {
                    // Leave drafts in localStorage
                    var sErrorMsg = "Sunucuya kaydedilemedi. Veriler cihazda saklandı.";
                    
                    if (oError && oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                sErrorMsg += "\n\nDetay: " + oErrorResponse.error.message.value;
                            }
                        } catch (e) {
                            // Ignore JSON parse errors
                        }
                    }
                    
                    MessageBox.error(sErrorMsg);
                }.bind(this)
            };

            oModel.callFunction("/PostGoodsReceipt", mParameters);
        },



        /**
         * Save a draft to localStorage with all 17 required fields
         * For aggregated items (multi-selection), distributes the quantity proportionally to original items
         */
        _saveDraftToLocalStorage: function(sLpId, oItem, sExpectedQuantity, sEditReason) {
            // Get session model for Username (Sicil No)
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
            
            if (!sSicilNo) {
                console.error("Username not found in sessionModel");
                return;
            }
            
            if (!sLpId) {
                console.error("LpId not provided");
                return;
            }
            
            // Get goodsReceiptModel to find LicensePlate and DeliveryNotes
            var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
            var aLicensePlates = oGoodsReceiptModel.getData();
            
            // Find the LicensePlate
            var oLicensePlate = null;
            var aAllDeliveryNotes = [];
            
            for (var i = 0; i < aLicensePlates.length; i++) {
                if (aLicensePlates[i].LpId === sLpId) {
                    oLicensePlate = aLicensePlates[i];
                    if (oLicensePlate.ToDeliveryNotes && oLicensePlate.ToDeliveryNotes.results) {
                        aAllDeliveryNotes = oLicensePlate.ToDeliveryNotes.results;
                    }
                    break;
                }
            }
            
            if (!oLicensePlate) {
                console.error("LicensePlate not found for LpId:", sLpId);
                return;
            }
            
            // Collect ALL items for this Material from all delivery notes
            var aOriginalItemsForMaterial = [];
            
            for (var i = 0; i < aAllDeliveryNotes.length; i++) {
                var oDeliveryNote = aAllDeliveryNotes[i];
                
                // Get items from this delivery note that match the current Material
                if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
                    var aL3Items = oDeliveryNote.ToItems.results;
                    aL3Items.forEach(function(oOriginalItem) {
                        if (oOriginalItem.Material === oItem.Material) {
                            aOriginalItemsForMaterial.push({
                                item: oOriginalItem,
                                deliveryNote: oDeliveryNote
                            });
                        }
                    });
                }
            }
            
            if (aOriginalItemsForMaterial.length === 0) {
                console.error("No original items found for material:", oItem.Material);
                return;
            }
            
            // Calculate total original ExpectedQuantity for proportional distribution
            var fTotalOriginalExpected = 0;
            aOriginalItemsForMaterial.forEach(function(oItemData) {
                fTotalOriginalExpected += parseFloat(oItemData.item.ExpectedQuantity || "0");
            });
            
            // Get the user-entered ReceivedQuantity from the aggregated item
            var fAggregatedReceivedQty = parseFloat(oItem.ReceivedQuantity || "0");
            
            console.log("=== Distributing Aggregated Item ===");
            console.log("Material:", oItem.Material);
            console.log("Total Original Expected:", fTotalOriginalExpected);
            console.log("User Entered ReceivedQuantity:", fAggregatedReceivedQty);
            console.log("Original Items Count:", aOriginalItemsForMaterial.length);
            
            // First pass: Calculate proportional values and floor them
            var aDistributedAmounts = [];
            var iTotalDistributed = 0;
            
            aOriginalItemsForMaterial.forEach(function(oItemData, index) {
                var fOriginalExpected = parseFloat(oItemData.item.ExpectedQuantity || "0");
                var fProportionalReceived;
                
                if (fTotalOriginalExpected > 0) {
                    fProportionalReceived = (fOriginalExpected / fTotalOriginalExpected) * fAggregatedReceivedQty;
                } else {
                    // If total is 0, distribute equally
                    fProportionalReceived = fAggregatedReceivedQty / aOriginalItemsForMaterial.length;
                }
                
                // Floor to get whole number
                var iFlooredAmount = Math.floor(fProportionalReceived);
                aDistributedAmounts.push(iFlooredAmount);
                iTotalDistributed += iFlooredAmount;
            });
            
            // Calculate remainder and add to last item
            var iRemainder = Math.floor(fAggregatedReceivedQty) - iTotalDistributed;
            if (aDistributedAmounts.length > 0) {
                aDistributedAmounts[aDistributedAmounts.length - 1] += iRemainder;
            }
            
            console.log("Distribution:", aDistributedAmounts, "Total:", aDistributedAmounts.reduce(function(a, b) { return a + b; }, 0));
            
            // Second pass: Save drafts with whole number amounts
            aOriginalItemsForMaterial.forEach(function(oItemData, index) {
                var oOriginalItem = oItemData.item;
                var oDeliveryNote = oItemData.deliveryNote;
                var fOriginalExpected = parseFloat(oOriginalItem.ExpectedQuantity || "0");
                var iProportionalReceived = aDistributedAmounts[index];
                
                console.log("  Item", index + 1, "- DeliveryItemId:", oOriginalItem.DeliveryItemId);
                console.log("    Original Expected:", fOriginalExpected);
                console.log("    Proportional Received:", iProportionalReceived);
                
                // Create the draft object with all 17 fields
                var oDraft = {
                    lpid: oLicensePlate.LpId || "",
                    warehousenum: oLicensePlate.WarehouseNum || "",
                    platenumber: oLicensePlate.PlateNumber || "",
                    arrivaldate: oLicensePlate.ArrivalDate || "",
                    werks: oLicensePlate.Werks || "",
                    deliveryitemid: oOriginalItem.DeliveryItemId || "",
                    deliverynumber: oDeliveryNote.DeliveryNumber || "",
                    itemnumber: oOriginalItem.ItemNumber || "",
                    material: oOriginalItem.Material || "",
                    expectedquantity: String(iProportionalReceived), // User-entered value (distributed as whole number)
                    receivedquantity: oOriginalItem.ExpectedQuantity || "", // Backend original value (read-only)
                    uom: oOriginalItem.UoM || "",
                    sm: oOriginalItem.SM || "",
                    ebeln: oOriginalItem.Ebeln || "",
                    ebelp: oOriginalItem.Ebelp || "",
                    approved: oItem.Approved || "",
                    editreason: sEditReason || oItem.EditReason || ""
                };
                
                // Create localStorage key: Username_DeliveryItemId
                var sKey = sSicilNo + "_" + oDraft.deliveryitemid;
                
                // Save to localStorage
                try {
                    localStorage.setItem(sKey, JSON.stringify(oDraft));
                    console.log("    Draft saved to localStorage:", sKey);
                } catch (e) {
                    console.error("Failed to save draft to localStorage:", e);
                    MessageBox.error("Draft kaydedilemedi. Lütfen depolama alanınızı kontrol edin.");
                }
            });
        },

        /**
         * Load drafts from localStorage and apply them to the goodsReceiptModel
         */
        _loadDraftsFromLocalStorage: function() {
            // Get session model for Username
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
            
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
                                for (var k = 0; k < oLP.ToDeliveryNotes.results.length && !bFound; k++) {
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
                        console.error("Failed to parse draft from localStorage:", sKey, e);
                    }
                }
            }
            
            // Refresh the model
            oGoodsReceiptModel.refresh(true);
        },

        /**
         * Sync all pending drafts to backend using PostGoodsReceipt function
         */
        _syncDraftsToBackend: function(sLpId) {
            var oModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
            
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
                            console.log("    ✗ NOT MATCHED (expected:", sLpId, ", got:", oDraft.lpid, ")");
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
                    "LpId": sLpId,
                    "PendingItemsJson": sJsonPayload,
                    "UserID": sSicilNo
                },
                success: function(oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    // Remove drafts from localStorage on success
                    aKeysToRemove.forEach(function(sKey) {
                        localStorage.removeItem(sKey);
                        console.log("Draft removed from localStorage:", sKey);
                    });
                    
                    MessageBox.success("Mal kabul işlemi başarıyla tamamlandı!", {
                        onClose: function() {
                            // Navigate back to Dashboard
                            this.getRouter().navTo("home");
                        }.bind(this)
                    });
                }.bind(this),
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    // Do NOT remove drafts on error
                    var sErrorMsg = "Senkronizasyon başarısız. Verileriniz cihazınızda güvende. İnternet bağlantınızı kontrol edip tekrar deneyin.";
                    
                    if (oError && oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                sErrorMsg = oErrorResponse.error.message.value;
                            }
                        } catch (e) {
                            // ignore parse error
                        }
                    }
                    
                    MessageBox.error(sErrorMsg);
                }.bind(this)
            });
        }
    });
});