sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(BaseController, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.GoodsIssue", {
        
        // --- STATE PROPERTIES ---
        _oCurrentSmartContext: null,
        _sCurrentItemsModelName: null,
        _oCurrentBitirContext: null,
        _sCurrentBitirModelName: null,

        // --- FORMATTERS ---

        formatSmartButtonText: function(sStatus, fQty) {
            if (sStatus === "COMPLETED" || sStatus === "IP") {
                return String(parseFloat(fQty || "0"));
            }
            return "";
        },

        formatSmartButtonType: function(sStatus) {
            if (sStatus === "COMPLETED") return "Accept";
            if (sStatus === "IP") return "Emphasized";
            return "Default";
        },

        formatSmartButtonIcon: function(sStatus) {
            if (sStatus === "COMPLETED") return "sap-icon://accept";
            if (sStatus === "IP") return "sap-icon://edit";
            return "sap-icon://add";
        },

        formatSmartButtonTooltip: function(sStatus, fQty) {
            if (sStatus === "COMPLETED") return "Tamamlandı (" + parseFloat(fQty || "0") + ")";
            if (sStatus === "IP") return "Devam Et (" + parseFloat(fQty || "0") + ")";
            return "Giriş Yap";
        },

        formatRowHighlight: function(sCountedQty, sTargetQty, sApproved) {
            var fCounted = parseFloat(sCountedQty || "0");
            var fTarget = parseFloat(sTargetQty || "0");

            if (fCounted === 0) {
                if (sApproved === "X") {
                    return sap.ui.core.MessageType.Error;
                } else {
                    return sap.ui.core.MessageType.Warning;
                }
            } else if (fCounted !== fTarget) {
                return sap.ui.core.MessageType.Error;
            } else {
                return sap.ui.core.MessageType.Success;
            }
        },

        formatNumberWithSeparator: function(vValue) {
            if (!vValue && vValue !== 0) {
                return "";
            }
            var fNumber = parseFloat(vValue);
            if (isNaN(fNumber)) {
                return vValue;
            }
            return fNumber.toLocaleString("tr-TR");
        },

        isMalCikisEnabled: function(sPackingNumber, refreshTrigger) {
            if (!sPackingNumber) {
                return false;
            }

            var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
            if (!oIssuePackagesModel) {
                return false;
            }

            var aPackages = oIssuePackagesModel.getData();
            var oPackage = aPackages.find(function(oPkg) {
                return oPkg.PackingNumber === sPackingNumber;
            });

            if (!oPackage || !oPackage.ToItems || !oPackage.ToItems.results) {
                return false;
            }

            var aItems = oPackage.ToItems.results;
            if (aItems.length === 0) {
                return false;
            }

            var bAllApproved = aItems.every(function(oItem) {
                return oItem.Approved === "X";
            });

            return bAllApproved;
        },

        // --- LIFECYCLE METHODS ---

        onInit: function() {
            var oItemsModel = new JSONModel([]);
            oItemsModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
            oItemsModel.setSizeLimit(9999);
            this.getView().setModel(oItemsModel, "itemsModel");

            var oEditReasonsModel = new JSONModel([]);
            this.getView().setModel(oEditReasonsModel, "editReasonsModel");
            this._loadEditReasons();

            this.getRouter().getRoute("goodsIssue").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            this._cleanupView();
            this._loadGoodsIssueData();
        },

        _createTableItemTemplate: function(sModelName) {
            var oTemplate = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({
                        text: "{= parseInt(${" + sModelName + ">Material}) }"
                    }),
                    new sap.m.Text({ text: "{" + sModelName + ">MaterialText}" }),
                    new sap.m.ObjectNumber({
                        number: {
                            path: sModelName + ">TargetQuantity",
                            formatter: this.formatNumberWithSeparator.bind(this)
                        },
                        unit: "{" + sModelName + ">UoM}",
                        state: "None"
                    }),
                    new sap.m.Text({
                        text: {
                            path: sModelName + ">CountedQuantity",
                            formatter: this.formatNumberWithSeparator.bind(this)
                        },
                        textAlign: "Center"
                    }),
                    new sap.m.Text({ text: "{" + sModelName + ">SM}" }),

                    // ACTION BUTTONS
                    new sap.m.HBox({
                        justifyContent: "SpaceAround",
                        width: "100%",
                        items: [
                            new sap.m.Button({
                                type: {
                                    path: sModelName + ">LocalStatus",
                                    formatter: this.formatSmartButtonType
                                },
                                icon: {
                                    path: sModelName + ">LocalStatus",
                                    formatter: this.formatSmartButtonIcon
                                },
                                tooltip: {
                                    parts: [
                                        { path: sModelName + ">LocalStatus" },
                                        { path: sModelName + ">CountedQuantity" }
                                    ],
                                    formatter: this.formatSmartButtonTooltip
                                },
                                press: this.onSmartCountPress.bind(this),
                                visible: "{= ${" + sModelName + ">Status} !== 'X' }"
                            }),
                            new sap.m.Button({
                                text: "",
                                icon: "sap-icon://accept",
                                type: "Emphasized",
                                press: this.onTableBitirPress.bind(this),
                                visible: {
                                    parts: [
                                        { path: sModelName + ">CountedQuantity" },
                                        { path: sModelName + ">Approved" },
                                        { path: sModelName + ">Status" }
                                    ],
                                    formatter: function(sCountedQty, sApproved, sStatus) {
                                        return sStatus !== "X" && parseFloat(sCountedQty || "0") > 0 && sApproved !== "X";
                                    }
                                }
                            })
                        ]
                    })
                ]
            });

            oTemplate.bindProperty("highlight", {
                parts: [
                    { path: sModelName + ">CountedQuantity" },
                    { path: sModelName + ">TargetQuantity" },
                    { path: sModelName + ">Approved" }
                ],
                formatter: this.formatRowHighlight.bind(this)
            });

            return oTemplate;
        },

        _loadEditReasons: function() {
            var oModel = this.getOwnerComponent().getModel();
            var oEditReasonsModel = this.getView().getModel("editReasonsModel");
            if (oEditReasonsModel.getData().length > 0) return;
            oModel.read("/EditReasonSet", {
                success: function(oData) {
                    oEditReasonsModel.setData(oData.results || []);
                },
                error: function(oError) {
                    oEditReasonsModel.setData([]);
                }
            });
        },

        _cleanupView: function() {
            var oItemsModel = this.getView().getModel("itemsModel");
            if (oItemsModel) oItemsModel.setData([]);
            var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
            if (oIssuePackagesModel) oIssuePackagesModel.setData([]);
        },

        _loadGoodsIssueData: function() {
            var oModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");
            var sWarehouseNum = oSessionModel ? oSessionModel.getProperty("/Login/WarehouseNum") : null;
            var sSelectedDate = oFilterModel ? oFilterModel.getProperty("/selectedDate") : null;
            var oDateForFilter;

            if (!sSelectedDate) {
                var oToday = new Date();
                oDateForFilter = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), 0, 0, 0));
            } else {
                var aParts = sSelectedDate.split("-");
                oDateForFilter = new Date(Date.UTC(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]), 0, 0, 0));
            }

            var aFilters = [
                new Filter("Warehouse", FilterOperator.EQ, sWarehouseNum),
                new Filter("PlanDate", FilterOperator.EQ, oDateForFilter)
            ];

            oModel.read("/IssuePackageSet", {
                filters: aFilters,
                urlParameters: { $expand: "ToItems" },
                success: function(oData) {
                    var aResults = oData.results || [];
                    aResults.forEach(function(oItem) {
                        oItem.expanded = false;
                        oItem._refreshTrigger = 0;
                    });

                    var oIssuePackagesModel = new JSONModel(aResults);
                    this.getView().setModel(oIssuePackagesModel, "issuePackagesModel");
                    this._updateStatusFilterCounts();
                    var oStatusFilterBar = this.byId("idGIStatusFilterBar");
                    if (oStatusFilterBar) {
                        oStatusFilterBar.setSelectedKey("pending");
                        this._applyStatusFilter("pending");
                    }
                }.bind(this),
                error: function(oError) {
                    MessageBox.error("Mal çıkış verileri yüklenemedi.");
                }.bind(this)
            });
        },

        // --- SMART COUNT LOGIC ---

        onSmartCountPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oBindingContext = null;
            var sModelName = null;

            var aModelNames = Object.keys(this.getView().oModels || {});
            for (var i = 0; i < aModelNames.length; i++) {
                if (aModelNames[i].startsWith("itemsModel_")) {
                    var oContext = oButton.getBindingContext(aModelNames[i]);
                    if (oContext) {
                        oBindingContext = oContext;
                        sModelName = aModelNames[i];
                        break;
                    }
                }
            }

            if (!oBindingContext) {
                MessageBox.error("Ürün bilgisi alınamadı.");
                return;
            }

            var oItem = oBindingContext.getObject();
            this._oCurrentSmartContext = oBindingContext;
            this._sCurrentItemsModelName = sModelName;

            var fPalletFactor = parseFloat(oItem.Palet);
            if (isNaN(fPalletFactor) || fPalletFactor <= 0) fPalletFactor = 1;

            var fCrateFactor = parseFloat(oItem.Sepet);
            if (isNaN(fCrateFactor) || fCrateFactor <= 0) fCrateFactor = 1;

            var fBaseQuantity = parseFloat(oItem.CountedQuantity || "0");
            var fInitialPallet = parseFloat(oItem.PalletCount || "0");
            var fInitialCrate = parseFloat(oItem.CrateCount || "0");
            var sInitialReason = oItem.EditReason || "";

            if (this.getView().getModel("editReasonsModel").getData().length === 0) {
                this._loadEditReasons();
            }

            var oSmartData = {
                materialText: oItem.MaterialText,
                expectedQuantity: parseFloat(oItem.TargetQuantity),
                uom: oItem.UoM,
                palletFactor: fPalletFactor,
                crateFactor: fCrateFactor,
                baseQuantity: fBaseQuantity,
                palletCount: fInitialPallet,
                crateCount: fInitialCrate,
                totalCalculated: fBaseQuantity + fInitialPallet * fPalletFactor + fInitialCrate * fCrateFactor,
                editReason: sInitialReason,
                showReasonError: false,
                reasonErrorState: false,
                quantityExceeded: false,
                quantityErrorState: false
            };

            var oSmartModel = new JSONModel(oSmartData);
            this.getView().setModel(oSmartModel, "smartCountModel");

            if (!this._oSmartDialog) {
                this._oSmartDialog = sap.ui.xmlfragment("com.sut.bolgeyonetim.view.SmartCountDialog", this);
                this.getView().addDependent(this._oSmartDialog);
            }
            this._oSmartDialog.open();
        },

        onSmartInputChanged: function() {
            var oModel = this.getView().getModel("smartCountModel");
            var oData = oModel.getData();
            var fTotal = oData.baseQuantity + oData.palletCount * oData.palletFactor + oData.crateCount * oData.crateFactor;
            fTotal = parseFloat(fTotal.toFixed(3));
            oModel.setProperty("/totalCalculated", fTotal);
            oModel.setProperty("/quantityExceeded", false);
            oModel.setProperty("/quantityErrorState", false);
            if (fTotal === oData.expectedQuantity) {
                oModel.setProperty("/showReasonError", false);
                oModel.setProperty("/reasonErrorState", false);
            }
        },

        onTotalManualChange: function(oEvent) {
            var fVal = parseFloat(oEvent.getParameter("value"));
            if (isNaN(fVal)) fVal = 0;
            var oModel = this.getView().getModel("smartCountModel");
            var oData = oModel.getData();
            oModel.setProperty("/baseQuantity", fVal);
            oModel.setProperty("/palletCount", 0);
            oModel.setProperty("/crateCount", 0);
            oModel.setProperty("/totalCalculated", fVal);
            oModel.setProperty("/quantityExceeded", false);
            oModel.setProperty("/quantityErrorState", false);
            if (fVal === oData.expectedQuantity) {
                oModel.setProperty("/showReasonError", false);
                oModel.setProperty("/reasonErrorState", false);
            }
        },

        onCopyExpectedToReceived: function() {
            var oModel = this.getView().getModel("smartCountModel");
            var fExpected = oModel.getProperty("/expectedQuantity");
            oModel.setProperty("/totalCalculated", fExpected);
            oModel.setProperty("/showReasonError", false);
            oModel.setProperty("/reasonErrorState", false);
        },

        onSmartSaveIntermediate: function() {
            this._performSmartSave("IP", "");
        },

        onSmartSaveFinal: function() {
            var oModel = this.getView().getModel("smartCountModel");
            var oData = oModel.getData();
            var fTotal = parseFloat(oData.totalCalculated);
            var fExpected = parseFloat(oData.expectedQuantity);

            if (fTotal !== fExpected) {
                oModel.setProperty("/showReasonError", true);
                if (!oData.editReason) {
                    oModel.setProperty("/reasonErrorState", true);
                    MessageToast.show("Miktar farkı var. Lütfen bir neden seçiniz.");
                    return;
                }
            }
            this._performSmartSave("COMPLETED", "X");
        },

        onTableBitirPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oBindingContext = null;
            var sModelName = null;

            var aModelNames = Object.keys(this.getView().oModels || {});
            for (var i = 0; i < aModelNames.length; i++) {
                if (aModelNames[i].startsWith("itemsModel_")) {
                    var oContext = oButton.getBindingContext(aModelNames[i]);
                    if (oContext) {
                        oBindingContext = oContext;
                        sModelName = aModelNames[i];
                        break;
                    }
                }
            }

            if (!oBindingContext) {
                MessageBox.error("Ürün bilgisi alınamadı.");
                return;
            }

            var oItem = oBindingContext.getObject();
            this._oCurrentBitirContext = oBindingContext;
            this._sCurrentBitirModelName = sModelName;

            var fExpected = parseFloat(oItem.TargetQuantity || "0");
            var fCounted = parseFloat(oItem.CountedQuantity || "0");

            if (fCounted !== fExpected) {
                this._showReasonDialog(oItem.EditReason || "");
            } else {
                this._finalizeBitir("");
            }
        },

        _showReasonDialog: function(sCurrentReason) {
            if (!this._oReasonDialog) {
                this._oReasonDialog = sap.ui.xmlfragment("com.sut.bolgeyonetim.view.ReasonDialog", this);
                this.getView().addDependent(this._oReasonDialog);
            }
            var oReasonDialogModel = new sap.ui.model.json.JSONModel({
                editReason: sCurrentReason,
                reasonErrorState: false
            });
            this.getView().setModel(oReasonDialogModel, "reasonDialogModel");
            this._oReasonDialog.open();
        },

        onReasonDialogConfirm: function() {
            var oReasonDialogModel = this.getView().getModel("reasonDialogModel");
            var sEditReason = oReasonDialogModel.getProperty("/editReason");
            if (!sEditReason) {
                oReasonDialogModel.setProperty("/reasonErrorState", true);
                MessageToast.show("Lütfen bir neden seçiniz.");
                return;
            }
            this._oReasonDialog.close();
            this._finalizeBitir(sEditReason);
        },

        onReasonDialogCancel: function() {
            this._oReasonDialog.close();
        },

        _finalizeBitir: function(sEditReason) {
            var oItem = this._oCurrentBitirContext.getObject();

            // OPTIMISTIC UPDATE
            var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
            var aPackages = oIssuePackagesModel.getData();
            var oPackage = aPackages.find(function(pkg) {
                return pkg.PackingNumber === oItem.PackingNumber;
            });

            if (oPackage && oPackage.ToItems) {
                oPackage.ToItems.results.forEach(function(oBackendItem) {
                    if (oBackendItem.Material === oItem.Material) {
                        oBackendItem.Approved = "X";
                        oBackendItem.EditReason = sEditReason;
                        oBackendItem.LocalStatus = "COMPLETED";
                    }
                });
                oIssuePackagesModel.refresh();
                this._calculateAndRenderItems();
            }

            this._updateItemInBackend(oItem, parseFloat(oItem.CountedQuantity), sEditReason, "X")
                .then(function() {
                    MessageToast.show("Ürün onaylandı.");
                }.bind(this))
                .catch(function() {
                    this._refreshSinglePackage(oItem.PackingNumber);
                }.bind(this));
        },

        _performSmartSave: function(sLocalStatus, sApproved) {
            var oSmartModel = this.getView().getModel("smartCountModel");
            var oSmartData = oSmartModel.getData();
            var oItem = this._oCurrentSmartContext.getObject();

            this._oSmartDialog.close();

            this._updateItemInBackend(oItem, parseFloat(oSmartData.totalCalculated), oSmartData.editReason, sApproved)
                .then(function() {
                }.bind(this))
                .catch(function() {
                }.bind(this));
        },

        onSmartDialogCancel: function() {
            this._oSmartDialog.close();
        },

        _calculateAndRenderItems: function() {
            var oL1List = this.byId("idGIPackagesList");
            if (!oL1List) return;
            var aL1Items = oL1List.getItems();

            aL1Items.forEach(function(oL1Item) {
                var oPanel = oL1Item.getContent()[0];
                if (!oPanel) return;
                var oL1Context = oPanel.getBindingContext("issuePackagesModel");
                var sPackingNumber = oL1Context.getObject().PackingNumber;
                var sStatus = oL1Context.getObject().Status;

                var oMaterialMap = {};
                var aTotalCounts = {
                    Total1: 0, Total2: 0, Total3: 0, Total4: 0, Total5: 0,
                    Total6: 0, Total7: 0, Total8: 0, Total9: 0,
                    TotalPorsiyon: 0, TotalDepozito: 0
                };

                var oVBoxContainer = oPanel.getContent()[0];
                if (!oVBoxContainer) return;

                var oL3Section = oVBoxContainer.getItems()[0];
                var oIconTabBar = oL3Section ? oL3Section.getItems()[0] : null;
                var oTable = oL3Section ? oL3Section.getItems()[1] : null;

                var oPackage = oL1Context.getObject();
                if (oPackage.ToItems && oPackage.ToItems.results) {
                    oPackage.ToItems.results.forEach(function(oItem) {
                        var sMaterial = oItem.Material;
                        var sCountedQtyToUse = oItem.CountedQuantity;
                        var sApprovedToUse = oItem.Approved || "";
                        var sEditReasonToUse = oItem.EditReason || "";
                        var sLocalStatus = oItem.LocalStatus || "";

                        if (!sLocalStatus) {
                            sLocalStatus = sApprovedToUse === "X" ? "COMPLETED" : parseFloat(sCountedQtyToUse) > 0 ? "IP" : "";
                        }

                        if (!oMaterialMap[sMaterial]) {
                            oMaterialMap[sMaterial] = {
                                PackingNumber: sPackingNumber,
                                Status: sStatus,
                                Material: oItem.Material,
                                MaterialText: oItem.MaterialText,
                                Kategori: oItem.Kategori,
                                KategoriText: oItem.KategoriText,
                                TargetQuantity: oItem.TargetQuantity,
                                CountedQuantity: sCountedQtyToUse,
                                UoM: oItem.UoM,
                                SM: oItem.SM,
                                Approved: sApprovedToUse,
                                EditReason: sEditReasonToUse,
                                LocalStatus: sLocalStatus,
                                Palet: oItem.Palet,
                                Sepet: oItem.Sepet,
                                PalletCount: oItem.PalletCount,
                                CrateCount: oItem.CrateCount,
                                DeliveryNumber: oItem.DeliveryNumber,
                                DeliveryItemNr: oItem.DeliveryItemNr
                            };
                        }
                    }.bind(this));
                }

                var aItemsToShow = [];
                for (var sMat in oMaterialMap) {
                    aItemsToShow.push(oMaterialMap[sMat]);
                }

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
                    else if (sPrefix === "98") aTotalCounts.TotalPorsiyon++;
                    else if (sPrefix === "99") aTotalCounts.TotalDepozito++;
                });

                var sModelName = "itemsModel_" + sPackingNumber;
                var oItemsModel = this.getView().getModel(sModelName);
                if (!oItemsModel) {
                    oItemsModel = new JSONModel();
                    oItemsModel.setSizeLimit(9999);
                    oItemsModel.setDefaultBindingMode("OneWay");
                    this.getView().setModel(oItemsModel, sModelName);
                }
                oItemsModel.setData(aItemsToShow);

                var oSorter = new sap.ui.model.Sorter("Kategori", false, false);
                if (oTable) {
                    var oBinding = oTable.getBinding("items");
                    if (!oBinding || oBinding.getModel().getId() !== oItemsModel.getId()) {
                        oTable.bindItems({
                            path: sModelName + ">/",
                            template: this._createTableItemTemplate(sModelName),
                            templateShareable: false
                        });
                        oBinding = oTable.getBinding("items");
                        if (oBinding) {
                            oBinding.sort(oSorter);
                        }
                    } else {
                        oBinding.sort(oSorter);
                        oBinding.refresh();
                    }
                }

                if (oL3Section) {
                    var bShouldShow = aItemsToShow.length > 0;
                    if (bShouldShow && oIconTabBar) {
                        this._updateCategoryFiltersForTabBar(aTotalCounts, oIconTabBar, sPackingNumber);
                    }
                    setTimeout(function() {
                        oL3Section.setVisible(bShouldShow);
                        if (bShouldShow) {
                            oL3Section.invalidate();
                        }
                    }, 50);
                }
            }.bind(this));
        },

        _updateCategoryFiltersForTabBar: function(aTotalCounts, oIconTabBar, sPackingNumber) {
            if (!oIconTabBar) return;
            oIconTabBar.data("packingNumber", sPackingNumber);
            oIconTabBar.destroyItems();
            var iTotalCount = 0;
            for (var key in aTotalCounts) {
                iTotalCount += aTotalCounts[key];
            }
            oIconTabBar.addItem(new sap.m.IconTabFilter({ key: "all", text: "Tümü", count: iTotalCount }));
            oIconTabBar.addItem(new sap.m.IconTabSeparator());
        },

        onCategoryFilterSelect: function(oEvent) {
            var sSelectedKey = oEvent.getParameter("key");
            var oIconTabBar = oEvent.getSource();
            var sPackingNumber = oIconTabBar.data("packingNumber");
            if (!sPackingNumber) return;
            var oL3Section = oIconTabBar.getParent();
            if (!oL3Section) return;
            var oTable = oL3Section.getItems()[1];
            if (!oTable) return;
            var oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            var oSorter = new sap.ui.model.Sorter("Kategori", false, false);
            oBinding.sort(oSorter);

            if (sSelectedKey === "all") {
                oBinding.filter([]);
            } else {
                var oFilter = new Filter("Kategori", FilterOperator.StartsWith, sSelectedKey);
                oBinding.filter([oFilter]);
            }
        },

        onStatusFilterSelect: function(oEvent) {
            var sKey = oEvent.getParameter("key");
            this._collapseAllPanels();
            this._applyStatusFilter(sKey);
        },

        _collapseAllPanels: function() {
            var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
            if (!oIssuePackagesModel) return;
            var aData = oIssuePackagesModel.getData();
            if (aData && Array.isArray(aData)) {
                aData.forEach(function(oItem) {
                    oItem.expanded = false;
                });
                oIssuePackagesModel.refresh();
            }

            if (oIssuePackagesModel) {
                var aPackages = oIssuePackagesModel.getData();
                if (aPackages && aPackages.length > 0) {
                    aPackages.forEach(function(oPkg) {
                        var sModelName = "itemsModel_" + oPkg.PackingNumber;
                        var oModel = this.getView().getModel(sModelName);
                        if (oModel) oModel.setData([]);
                    }.bind(this));
                }
            }

            var oList = this.byId("idGIPackagesList");
            if (oList) {
                var aItems = oList.getItems();
                aItems.forEach(function(oItem) {
                    var oPanel = oItem.getContent()[0];
                    if (oPanel && oPanel.getContent) {
                        var oVBoxContainer = oPanel.getContent()[0];
                        if (oVBoxContainer && oVBoxContainer.getItems) {
                            var oL3Section = oVBoxContainer.getItems()[0];
                            if (oL3Section && oL3Section.setVisible) {
                                oL3Section.setVisible(false);
                            }
                        }
                    }
                });
            }
        },

        _applyStatusFilter: function(sStatus) {
            var oList = this.byId("idGIPackagesList");
            var oBinding = oList.getBinding("items");
            if (!oBinding) return;
            var aFilters = [];
            if (sStatus === "pending") {
                aFilters.push(new Filter("Status", FilterOperator.NE, "X"));
            } else if (sStatus === "completed") {
                aFilters.push(new Filter("Status", FilterOperator.EQ, "X"));
            }
            oBinding.filter(aFilters);
        },

        _updateStatusFilterCounts: function() {
            var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
            if (!oIssuePackagesModel) return;
            var aData = oIssuePackagesModel.getData() || [];
            var iPendingCount = 0;
            var iCompletedCount = 0;
            aData.forEach(function(oItem) {
                if (oItem.Status === "X") iCompletedCount++;
                else iPendingCount++;
            });
            var oPendingTab = this.byId("idGIPendingTab");
            var oCompletedTab = this.byId("idGICompletedTab");
            if (oPendingTab) oPendingTab.setCount(iPendingCount.toString());
            if (oCompletedTab) oCompletedTab.setCount(iCompletedCount.toString());
        },

        onMalCikisPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oPanel = oButton.getParent();
            while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
                oPanel = oPanel.getParent();
            }
            if (!oPanel) {
                MessageBox.error("Panel bulunamadı.");
                return;
            }
            var oL1Context = oPanel.getBindingContext("issuePackagesModel");
            if (!oL1Context) {
                MessageBox.error("Package context bulunamadı.");
                return;
            }
            var oPackage = oL1Context.getObject();
            var sPackingNumber = oPackage.PackingNumber;

            this._executePostGoodsIssue(sPackingNumber);
        },

        _executePostGoodsIssue: function(sPackingNumber) {
            var oModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var sUserId = oSessionModel ? oSessionModel.getProperty("/Login/Username") : "";

            sap.ui.core.BusyIndicator.show(0);

            oModel.callFunction("/PostGoodsIssue", {
                method: "POST",
                urlParameters: {
                    PackingNumber: sPackingNumber,
                    UserID: sUserId
                },
                success: function(oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.success("Mal çıkış işlemi başarıyla tamamlandı!", {
                        onClose: function() {
                            this._loadGoodsIssueData();
                        }.bind(this)
                    });
                }.bind(this),
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var sErrorMsg = "Mal çıkış işlemi başarısız.";
                    if (oError && oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                sErrorMsg = oErrorResponse.error.message.value;
                            }
                        } catch (e) {}
                    }
                    MessageBox.error(sErrorMsg);
                }.bind(this)
            });
        },

        onPackageExpand: function(oEvent) {
            var oPanel = oEvent.getSource();
            var bExpanded = oEvent.getParameter("expand");
            var oContext = oPanel.getBindingContext("issuePackagesModel");
            if (!oContext) return;

            if (bExpanded) {
                var aContent = oPanel.getContent();
                if (aContent.length > 0) {
                    var oVBox = aContent[0];
                    oVBox.setBindingContext(oContext, "issuePackagesModel");
                }
                this._calculateAndRenderItems();
            }
        },

        _updateItemInBackend: function(oItem, fCountedQuantity, sEditReason, sApproved) {
            var oModel = this.getOwnerComponent().getModel();
            var sPath = "/IssueItemSet(PackingNumber='" + oItem.PackingNumber + 
                        "',DeliveryNumber='" + oItem.DeliveryNumber + 
                        "',DeliveryItemNr='" + oItem.DeliveryItemNr + "')";

            var oUpdateData = {
                CountedQuantity: String(fCountedQuantity),
                EditReason: sEditReason || "",
                Approved: sApproved || ""
            };

            return new Promise(function(resolve, reject) {
                oModel.update(sPath, oUpdateData, {
                    success: function() {
                        this._refreshSinglePackage(oItem.PackingNumber);
                        resolve();
                    }.bind(this),
                    error: function(oError) {
                        console.error("Update failed:", oError);
                        var sErrorMsg = "Güncelleme başarısız.";
                        if (oError && oError.responseText) {
                            try {
                                var oErrorResponse = JSON.parse(oError.responseText);
                                if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                                    sErrorMsg = oErrorResponse.error.message.value;
                                }
                            } catch (e) {}
                        }
                        MessageBox.error(sErrorMsg);
                        reject();
                    }.bind(this)
                });
            }.bind(this));
        },

        _refreshSinglePackage: function(sPackingNumber) {
            var oModel = this.getOwnerComponent().getModel();
            var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
            var aPackages = oIssuePackagesModel.getData();
            var oCurrentPkg = aPackages.find(function(pkg) {
                return pkg.PackingNumber === sPackingNumber;
            });

            if (!oCurrentPkg) return;

            var aFilters = [
                new Filter("PackingNumber", FilterOperator.EQ, sPackingNumber)
            ];

            oModel.read("/IssuePackageSet", {
                filters: aFilters,
                urlParameters: { $expand: "ToItems" },
                success: function(oData) {
                    if (oData.results && oData.results.length > 0) {
                        var oUpdatedPkg = oData.results[0];
                        oUpdatedPkg.expanded = oCurrentPkg.expanded;
                        oUpdatedPkg._refreshTrigger = (oCurrentPkg._refreshTrigger || 0) + 1;

                        var iPkgIndex = aPackages.findIndex(function(p) {
                            return p.PackingNumber === sPackingNumber;
                        });
                        if (iPkgIndex >= 0) {
                            aPackages[iPkgIndex] = oUpdatedPkg;
                            oIssuePackagesModel.refresh();
                            this._calculateAndRenderItems();
                        }
                    }
                }.bind(this),
                error: function(oError) {
                    console.error("Refresh failed:", oError);
                }.bind(this)
            });
        }
    });
});