sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function(BaseController, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.GoodsReceipt", {
        onInit: function() {
            // Initialize empty itemsModel for L3 display
            this.getView().setModel(new JSONModel([]), "itemsModel");
            
            // Attach route matched handler to load data when navigating to this view
            this.getRouter().getRoute("goodsReceipt").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            // Clean up previous state before loading new data
            this._cleanupView();
            
            // Load the goods receipt data from OData
            this._loadGoodsReceiptData();
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
         * Collects all selected delivery notes' items and displays them in the L3 table.
         */
        onDeliveryNoteSelect: function(oEvent) {
            var oCheckBox = oEvent.getSource();
            var oL2Context = oCheckBox.getBindingContext("goodsReceiptModel");
            
            if (!oL2Context) {
                return;
            }
            
            // Navigate up the control tree to find the Panel and VBox (L3 Section)
            var oPanel = oCheckBox.getParent(); // HBox
            while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
                oPanel = oPanel.getParent();
            }
            
            if (!oPanel) {
                console.error("Panel not found in control tree");
                return;
            }
            
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
            
            // Get Table (second child of L3 Section)
            var oTable = oL3Section.getItems()[1];
            
            // Get "Mal Kabul" button from Panel's headerToolbar
            var oHeaderToolbar = oPanel.getHeaderToolbar();
            var oMalKabulBtn = null;
            if (oHeaderToolbar) {
                var aToolbarContent = oHeaderToolbar.getContent();
                // Find button with text "Mal Kabul"
                oMalKabulBtn = aToolbarContent.find(function(oControl) {
                    return oControl.getMetadata().getName() === "sap.m.Button" && 
                           oControl.getText() === "Mal Kabul";
                });
            }
            
            var aItemsToShow = [];
            var oSelectedDeliveryNote = null;
            
            if (oCheckBox.getSelected()) {
                // Store the selected delivery note context for category filters
                oSelectedDeliveryNote = oL2Context.getObject();
                
                // Get L3 items from selected delivery note
                var aL3Items = oL2Context.getProperty("ToItems/results");
                if (aL3Items && aL3Items.length > 0) {
                    aItemsToShow = aL3Items;
                }
            }
            
            // Update the itemsModel with collected items
            this.getView().getModel("itemsModel").setData(aItemsToShow);
            
            // Debug: Log collected items
            console.log("Collected L3 Items:", JSON.stringify(aItemsToShow, null, 2));
            console.log("Total items count:", aItemsToShow.length);
            
            // Show/hide L3 section based on whether items are selected
            if (oL3Section) {
                oL3Section.setVisible(aItemsToShow.length > 0);
            }
            
            // Update category filters from DeliveryNote totals
            if (oSelectedDeliveryNote && oIconTabBar) {
                this._updateCategoryFiltersForTabBar(oSelectedDeliveryNote, oIconTabBar);
            }
            
            // Check if all items are approved to enable "Mal Kabul" button
            if (oMalKabulBtn) {
                this._checkMalKabulEnabledForButton(oMalKabulBtn);
            }
        },

        /**
         * Update category filters based on DeliveryNote Total fields
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
                { key: "D", totalField: "TotalDepozito", textField: "TotalDepozitoText" }
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
         * Check if all items are approved and enable/disable specific "Mal Kabul" button
         */
        _checkMalKabulEnabledForButton: function(oMalKabulBtn) {
            if (!oMalKabulBtn) {
                return;
            }
            
            var oItemsModel = this.getView().getModel("itemsModel");
            var aItems = oItemsModel.getData();
            
            var bAllApproved = aItems.length > 0 && aItems.every(function(oItem) {
                return oItem.Approved === "X";
            });
            
            oMalKabulBtn.setEnabled(bAllApproved);
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
            // Get the button from control tree
            var oInput = oEvent.getSource();
            var oPanel = oInput.getParent();
            while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
                oPanel = oPanel.getParent();
            }
            
            if (oPanel) {
                var oHeaderToolbar = oPanel.getHeaderToolbar();
                if (oHeaderToolbar) {
                    var aToolbarContent = oHeaderToolbar.getContent();
                    var oMalKabulBtn = aToolbarContent.find(function(oControl) {
                        return oControl.getMetadata().getName() === "sap.m.Button" && 
                               oControl.getText() === "Mal Kabul";
                    });
                    
                    if (oMalKabulBtn) {
                        this._checkMalKabulEnabledForButton(oMalKabulBtn);
                    }
                }
            }
        },

        onApproveItem: function(oEvent) {
            // Get the item context
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext("itemsModel");
            var sPath = oContext.getPath();
            
            // Set Approved flag to 'X'
            this.getView().getModel("itemsModel").setProperty(sPath + "/Approved", "X");
            
            // Find the "Mal Kabul" button from control tree
            var oPanel = oButton.getParent();
            while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
                oPanel = oPanel.getParent();
            }
            
            if (oPanel) {
                var oHeaderToolbar = oPanel.getHeaderToolbar();
                if (oHeaderToolbar) {
                    var aToolbarContent = oHeaderToolbar.getContent();
                    var oMalKabulBtn = aToolbarContent.find(function(oControl) {
                        return oControl.getMetadata().getName() === "sap.m.Button" && 
                               oControl.getText() === "Mal Kabul";
                    });
                    
                    if (oMalKabulBtn) {
                        this._checkMalKabulEnabledForButton(oMalKabulBtn);
                    }
                }
            }
            
            MessageBox.success("Ürün onaylandı");
        },

        onMalKabulPress: function(oEvent) {
            // TODO: Implement final goods receipt acceptance logic
            MessageBox.information("Tüm ürünler onaylandı. Mal kabul işlemi tamamlanabilir.");
        },

        onAcceptPress: function(oEvent) {
            // Deprecated - replaced by onMalKabulPress
            this.onMalKabulPress(oEvent);
        },

        onPhotoPress: function(oEvent) {
            // TODO: Implement photo capture/upload logic
            MessageBox.information("Fotoğraf ekleme özelliği");
        }
    });
});