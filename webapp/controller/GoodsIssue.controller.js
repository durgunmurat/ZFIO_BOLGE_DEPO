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

    return BaseController.extend("com.sut.bolgeyonetim.controller.GoodsIssue", {
      // --- STATE PROPERTIES ---
      _oCurrentSmartContext: null,
      _sCurrentItemsModelName: null,
      _oCurrentBitirContext: null,
      _sCurrentBitirModelName: null,
      _sCurrentPackingNumber: null,
      _oCurrentNoteContext: null,
      _sCurrentNotePackingNumber: null,
      _mTableGrowingState: {}, // Map to store growing state per table
      
      // --- FEATURE FLAGS ---
      // Mal Çıkış öncesi Depozito Ekleme dialogunu göster/gizle
      // true: Dialog gösterilir, false: Dialog atlanır ve direkt Mal Çıkış yapılır
      // İleride tekrar açmak için bu değeri true yapmanız yeterlidir
      _bShowDepositDialogBeforeMalCikis: false,

      // --- FORMATTERS ---

      formatSmartButtonText: function (sStatus, fQty) {
        if (sStatus === "COMPLETED" || sStatus === "IP") {
          return String(parseFloat(fQty || "0"));
        }
        return "";
      },

      formatSmartButtonType: function (sStatus) {
        if (sStatus === "COMPLETED") return "Accept";
        if (sStatus === "IP") return "Emphasized";
        return "Default";
      },

      formatSmartButtonIcon: function (sStatus) {
        if (sStatus === "COMPLETED") return "sap-icon://accept";
        if (sStatus === "IP") return "sap-icon://edit";
        return "sap-icon://add";
      },

      formatSmartButtonTooltip: function (sStatus, fQty) {
        if (sStatus === "COMPLETED")
          return "Tamamlandı (" + parseFloat(fQty || "0") + ")";
        if (sStatus === "IP")
          return "Devam Et (" + parseFloat(fQty || "0") + ")";
        return "Giriş Yap";
      },

      formatRowHighlight: function (sCountedQty, sTargetQty, sApproved) {
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

      formatNumberWithSeparator: function (vValue) {
        if (!vValue && vValue !== 0) {
          return "";
        }
        var fNumber = parseFloat(vValue);
        if (isNaN(fNumber)) {
          return vValue;
        }
        return fNumber.toLocaleString("tr-TR");
      },

      isMalCikisEnabled: function (sPackingNumber, refreshTrigger) {
        if (!sPackingNumber) {
          return false;
        }

        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        if (!oIssuePackagesModel) {
          return false;
        }

        var aPackages = oIssuePackagesModel.getData();
        var oPackage = aPackages.find(function (oPkg) {
          return oPkg.PackingNumber === sPackingNumber;
        });

        if (!oPackage || !oPackage.ToItems || !oPackage.ToItems.results) {
          return false;
        }

        var aItems = oPackage.ToItems.results;
        if (aItems.length === 0) {
          return false;
        }

        var bAllApproved = aItems.every(function (oItem) {
          return oItem.Approved === "X";
        });

        return bAllApproved;
      },

      // --- LIFECYCLE METHODS ---

      onInit: function () {
        var oItemsModel = new JSONModel([]);
        oItemsModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
        oItemsModel.setSizeLimit(9999);
        this.getView().setModel(oItemsModel, "itemsModel");

        var oEditReasonsModel = new JSONModel([]);
        this.getView().setModel(oEditReasonsModel, "editReasonsModel");
        this._loadEditReasons();

        this.getRouter()
          .getRoute("goodsIssue")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        this._cleanupView();
        this._loadGoodsIssueData();
      },

      _createTableItemTemplate: function (sModelName) {
        var oTemplate = new sap.m.ColumnListItem({
          highlight: {
            parts: [
              { path: sModelName + ">CountedQuantity" },
              { path: sModelName + ">TargetQuantity" },
              { path: sModelName + ">Approved" }
            ],
            formatter: this.formatRowHighlight.bind(this)
          },
          cells: [
            new sap.m.Text({
              text: "{= parseInt(${" + sModelName + ">Material}) }",
            }),
            new sap.m.Text({ text: "{" + sModelName + ">MaterialDesc}" }),
            new sap.m.ObjectNumber({
              number: {
                path: sModelName + ">TargetQuantity",
                formatter: this.formatNumberWithSeparator.bind(this),
              },
              unit: "{" + sModelName + ">UoM}",
              state: "None",
            }).addStyleClass("giTargetQty"),
            new sap.m.Text({
              text: {
                path: sModelName + ">CountedQuantity",
                formatter: this.formatNumberWithSeparator.bind(this),
              },
              textAlign: "Center",
            }),
            new sap.m.Text({ text: "{" + sModelName + ">SM}" }),
            // Fiyatlı Column
            new sap.m.Text({ text: "{" + sModelName + ">Fiyatli}" }),
            // new sap.m.Text({
            //     text: "{= ${" + sModelName + ">Fiyatli} === 'X' ? 'Evet' : 'Hayır'}",
            //     textAlign: "Center"
            // }),

            // ACTION BUTTONS
            new sap.m.HBox({
              justifyContent: "SpaceAround",
              width: "100%",
              items: [
                new sap.m.Button({
                  type: {
                    path: sModelName + ">LocalStatus",
                    formatter: this.formatSmartButtonType,
                  },
                  icon: {
                    path: sModelName + ">LocalStatus",
                    formatter: this.formatSmartButtonIcon,
                  },
                  tooltip: {
                    parts: [
                      { path: sModelName + ">LocalStatus" },
                      { path: sModelName + ">CountedQuantity" },
                    ],
                    formatter: this.formatSmartButtonTooltip,
                  },
                  press: this.onSmartCountPress.bind(this),
                  visible: "{= ${" + sModelName + ">Status} !== 'X' }",
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
                      { path: sModelName + ">Status" },
                      { path: sModelName + ">LocalStatus" },
                    ],
                    formatter: function (sCountedQty, sApproved, sStatus, sLocalStatus) {
                      // Show button if:
                      // - Status is not completed (X)
                      // - Not already approved
                      // - Either has positive quantity OR has been counted via dialog (LocalStatus is IP)
                      var bHasBeenCounted = sLocalStatus === "IP";
                      return (
                        sStatus !== "X" &&
                        sApproved !== "X" &&
                        (parseFloat(sCountedQty || "0") > 0 || bHasBeenCounted)
                      );
                    },
                  },
                }),
              ],
            }),
          ],
        });

        oTemplate.bindProperty("highlight", {
          parts: [
            { path: sModelName + ">CountedQuantity" },
            { path: sModelName + ">TargetQuantity" },
            { path: sModelName + ">Approved" },
          ],
          formatter: this.formatRowHighlight.bind(this),
        });

        return oTemplate;
      },

      _loadEditReasons: function () {
        var oModel = this.getOwnerComponent().getModel();
        var oEditReasonsModel = this.getView().getModel("editReasonsModel");
        if (oEditReasonsModel.getData().length > 0) return;
        oModel.read("/EditReasonGISet", {
          success: function (oData) {
            oEditReasonsModel.setData(oData.results || []);
          },
          error: function (oError) {
            oEditReasonsModel.setData([]);
          },
        });
      },

      _cleanupView: function () {
        var oItemsModel = this.getView().getModel("itemsModel");
        if (oItemsModel) oItemsModel.setData([]);
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        if (oIssuePackagesModel) oIssuePackagesModel.setData([]);
      },

      _loadGoodsIssueData: function () {
        var oModel = this.getOwnerComponent().getModel();
        var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
        var sSicilNo = oSessionModel
          ? oSessionModel.getProperty("/Login/Username")
          : null;

        var oFilterModel = this.getOwnerComponent().getModel("filterModel");
        var sWarehouseNum = oSessionModel
          ? oSessionModel.getProperty("/Login/WarehouseNum")
          : null;
        var sSelectedDate = oFilterModel
          ? oFilterModel.getProperty("/selectedDate")
          : null;
        var oDateForFilter;

        if (!sSelectedDate) {
          var oToday = new Date();
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
          var aParts = sSelectedDate.split("-");
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

        var aFilters = [
          new Filter("Sicil", FilterOperator.EQ, sSicilNo),
          new Filter("Warehouse", FilterOperator.EQ, sWarehouseNum),
          new Filter("PlanDate", FilterOperator.EQ, oDateForFilter),
        ];

        oModel.read("/IssuePackageSet", {
          filters: aFilters,
          urlParameters: { $expand: "ToItems" },
          success: function (oData) {
            var aResults = oData.results || [];
            aResults.forEach(function (oItem) {
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
          error: function (oError) {
            MessageBox.error("Mal çıkış verileri yüklenemedi.");
          }.bind(this),
        });
      },

      // --- SMART COUNT LOGIC ---

      onSmartCountPress: function (oEvent) {
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

        if (
          this.getView().getModel("editReasonsModel").getData().length === 0
        ) {
          this._loadEditReasons();
        }

        var oSmartData = {
          materialText: oItem.MaterialDesc,
          materialNumber: parseInt(oItem.Material, 10),
          expectedQuantity: parseFloat(oItem.TargetQuantity),
          uom: oItem.UoM,
          palletFactor: fPalletFactor,
          crateFactor: fCrateFactor,
          baseQuantity: fBaseQuantity,
          palletCount: fInitialPallet,
          crateCount: fInitialCrate,
          totalCalculated:
            fBaseQuantity +
            fInitialPallet * fPalletFactor +
            fInitialCrate * fCrateFactor,
          editReason: sInitialReason,
          showReasonError: false,
          reasonErrorState: false,
          quantityExceeded: false,
          quantityErrorState: false,
        };

        var oSmartModel = new JSONModel(oSmartData);
        this.getView().setModel(oSmartModel, "smartCountModel");

        if (!this._oSmartDialog) {
          this._oSmartDialog = sap.ui.xmlfragment(
            "com.sut.bolgeyonetim.view.SmartCountDialogGI",
            this
          );
          this.getView().addDependent(this._oSmartDialog);
        }
        this._oSmartDialog.open();
      },

      onSmartInputChanged: function () {
        var oModel = this.getView().getModel("smartCountModel");
        var oData = oModel.getData();
        var fTotal =
          oData.baseQuantity +
          oData.palletCount * oData.palletFactor +
          oData.crateCount * oData.crateFactor;
        fTotal = parseFloat(fTotal.toFixed(3));

        // Beklenen miktardan fazla giriş kontrolü
        if (fTotal > oData.expectedQuantity) {
          oModel.setProperty("/quantityErrorState", true);
          oModel.setProperty("/quantityExceeded", true);
        } else {
          oModel.setProperty("/quantityErrorState", false);
          oModel.setProperty("/quantityExceeded", false);
        }

        oModel.setProperty("/totalCalculated", fTotal);
        if (fTotal === oData.expectedQuantity) {
          oModel.setProperty("/showReasonError", false);
          oModel.setProperty("/reasonErrorState", false);
        }
      },

      onTotalManualChange: function (oEvent) {
        var fVal = parseFloat(oEvent.getParameter("value"));
        if (isNaN(fVal)) fVal = 0;
        var oModel = this.getView().getModel("smartCountModel");
        var oData = oModel.getData();

        // Beklenen miktardan fazla giriş kontrolü
        if (fVal > oData.expectedQuantity) {
          oModel.setProperty("/quantityErrorState", true);
          oModel.setProperty("/quantityExceeded", true);
        } else {
          oModel.setProperty("/quantityErrorState", false);
          oModel.setProperty("/quantityExceeded", false);
        }

        oModel.setProperty("/baseQuantity", fVal);
        oModel.setProperty("/palletCount", 0);
        oModel.setProperty("/crateCount", 0);
        oModel.setProperty("/totalCalculated", fVal);
        if (fVal === oData.expectedQuantity) {
          oModel.setProperty("/showReasonError", false);
          oModel.setProperty("/reasonErrorState", false);
        }
      },

      onCopyExpectedToReceived: function () {
        var oModel = this.getView().getModel("smartCountModel");
        var fExpected = oModel.getProperty("/expectedQuantity");
        oModel.setProperty("/totalCalculated", fExpected);
        oModel.setProperty("/showReasonError", false);
        oModel.setProperty("/reasonErrorState", false);
      },

      onSmartSaveIntermediate: function () {
        this._performSmartSave("IP", "");
      },

      onSmartSaveIntermediateGI: function () {
        var oSmartModel = this.getView().getModel("smartCountModel");
        var oSmartData = oSmartModel.getData();
        var oItem = this._oCurrentSmartContext.getObject();
        var fTotal = parseFloat(oSmartData.totalCalculated);
        var fExpected = parseFloat(oSmartData.expectedQuantity);
        var sPackingNumber = oItem.PackingNumber;

        // Beklenen miktardan fazla giriş kontrolü
        // Beklenen miktardan fazla giriş kontrolü (sadece ürünler için, depozitolarda atlanır)
        if (oItem.DeliveryType !== "D" && fTotal > fExpected) {
          oSmartModel.setProperty("/quantityErrorState", true);
          MessageToast.show("Beklenen miktardan fazla giriş yapamazsınız.");
          return;
        }

        this._oSmartDialog.close();

        // OPTIMISTIC UPDATE - immediate UI feedback
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        var aPackages = oIssuePackagesModel.getData();
        var oPackage = aPackages.find(function (pkg) {
          return pkg.PackingNumber === sPackingNumber;
        });

        if (oPackage && oPackage.ToItems) {
          oPackage.ToItems.results.forEach(function (oBackendItem) {
            if (oBackendItem.Material === oItem.Material) {
              oBackendItem.CountedQuantity = String(fTotal);
              oBackendItem.EditReason = oSmartData.editReason || "";
              oBackendItem.LocalStatus = "IP";
              oBackendItem._hasBeenCounted = true;
            }
          });
          oPackage._refreshTrigger = (oPackage._refreshTrigger || 0) + 1;
          oIssuePackagesModel.refresh(true);
          this._calculateAndRenderItems();
        }

        sap.ui.core.BusyIndicator.show(0);

        var oModel = this.getOwnerComponent().getModel();
        oModel.callFunction("/UpdateIssueQuantity", {
          method: "POST",
          groupId: "updateIssueQty",
          changeSetId: "updateIssueQtyCS",
          urlParameters: {
            PackingNumber: sPackingNumber,
            Matnr: oItem.Material,
            Quantity: fTotal,
            OriginalQty: parseFloat(oItem.TargetQuantity) || 0,
            EditReason: oSmartData.editReason || "",
            Harici: false,
            Status: "0",
            Approved: "",
            Uom: oItem.UoM || "",
          },
          success: function () {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Miktar kaydedildi");
            // Skip refresh - optimistic update already done
          }.bind(this),
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            console.error("UpdateIssueQuantity error:", oError);
            // On error, refresh from backend to revert optimistic update
            this._refreshSinglePackage(sPackingNumber);
            var sErrorMsg = "Kaydetme başarısız.";
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
              } catch (e) {}
            }
            MessageBox.error(sErrorMsg);
          }.bind(this),
        });
      },

      onSmartSaveFinal: function () {
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

      onTableBitirPress: function (oEvent) {
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

        // Check if item has been counted (via dialog) - allows 0 quantity if explicitly entered
        if (!oItem._hasBeenCounted && fCounted <= 0) {
          MessageToast.show("Onaylamak için önce miktar girişi yapmalısınız.");
          return;
        }

        if (fCounted !== fExpected) {
          this._showReasonDialog(oItem.EditReason || "");
        } else {
          this._finalizeBitir("");
        }
      },

      _showReasonDialog: function (sCurrentReason) {
        if (!this._oReasonDialog) {
          this._oReasonDialog = sap.ui.xmlfragment(
            "reasonDialog",
            "com.sut.bolgeyonetim.view.ReasonDialog",
            this
          );
          this.getView().addDependent(this._oReasonDialog);
        }
        var oReasonDialogModel = new sap.ui.model.json.JSONModel({
          editReason: sCurrentReason,
          reasonErrorState: false,
        });
        this.getView().setModel(oReasonDialogModel, "reasonDialogModel");
        this._oReasonDialog.open();
      },

      onReasonDialogConfirm: function () {
        // Get value directly from ComboBox to ensure we have the selected value
        var oComboBox = sap.ui.core.Fragment.byId("reasonDialog", "idReasonDialogCombo");
        var sEditReason = oComboBox ? oComboBox.getSelectedKey() : "";
        
        if (!sEditReason) {
          var oReasonDialogModel = this.getView().getModel("reasonDialogModel");
          oReasonDialogModel.setProperty("/reasonErrorState", true);
          MessageToast.show("Lütfen bir neden seçiniz.");
          return;
        }
        this._oReasonDialog.close();
        this._finalizeBitir(sEditReason);
      },

      onReasonDialogCancel: function () {
        this._oReasonDialog.close();
      },

      _finalizeBitir: function (sEditReason) {
        var oItem = this._oCurrentBitirContext.getObject();
        var sPackingNumber = oItem.PackingNumber;

        // OPTIMISTIC UPDATE - immediate UI feedback
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        var aPackages = oIssuePackagesModel.getData();
        var oPackage = aPackages.find(function (pkg) {
          return pkg.PackingNumber === sPackingNumber;
        });

        if (oPackage && oPackage.ToItems) {
          oPackage.ToItems.results.forEach(function (oBackendItem) {
            if (oBackendItem.Material === oItem.Material) {
              oBackendItem.Approved = "X";
              oBackendItem.EditReason = sEditReason;
              oBackendItem.LocalStatus = "COMPLETED";
            }
          });
          // Increment refresh trigger to update Mal Çıkış button state
          oPackage._refreshTrigger = (oPackage._refreshTrigger || 0) + 1;
          oIssuePackagesModel.refresh(true);
          this._calculateAndRenderItems();
        }

        // Backend update - skip refresh on success since optimistic update already done
        this._updateItemInBackend(
          oItem,
          parseFloat(oItem.CountedQuantity),
          sEditReason,
          "X",
          true // skipRefresh flag
        )
          .then(
            function () {
              MessageToast.show("Ürün onaylandı.");
            }.bind(this)
          )
          .catch(
            function () {
              // On error, refresh from backend to revert optimistic update
              this._refreshSinglePackage(sPackingNumber);
            }.bind(this)
          );
      },

      _performSmartSave: function (sLocalStatus, sApproved) {
        var oSmartModel = this.getView().getModel("smartCountModel");
        var oSmartData = oSmartModel.getData();
        var oItem = this._oCurrentSmartContext.getObject();

        this._oSmartDialog.close();

        this._updateItemInBackend(
          oItem,
          parseFloat(oSmartData.totalCalculated),
          oSmartData.editReason,
          sApproved
        )
          .then(function () {}.bind(this))
          .catch(function () {}.bind(this));
      },

      onSmartDialogCancel: function () {
        this._oSmartDialog.close();
      },

      _calculateAndRenderItems: function () {
        var oL1List = this.byId("idGIPackagesList");
        if (!oL1List) return;
        var aL1Items = oL1List.getItems();

        aL1Items.forEach(
          function (oL1Item) {
            var oPanel = oL1Item.getContent()[0];
            if (!oPanel) return;
            var oL1Context = oPanel.getBindingContext("issuePackagesModel");
            var sPackingNumber = oL1Context.getObject().PackingNumber;
            var sStatus = oL1Context.getObject().Status;

            var oMaterialMap = {};
            var oPackage = oL1Context.getObject();

            // Process all items and group by Material
            if (oPackage.ToItems && oPackage.ToItems.results) {
              oPackage.ToItems.results.forEach(
                function (oItem) {
                  var sMaterial = oItem.Material;
                  var sCountedQtyToUse = oItem.CountedQuantity;
                  var sApprovedToUse = oItem.Approved || "";
                  var sEditReasonToUse = oItem.EditReason || "";
                  var sLocalStatus = oItem.LocalStatus || "";

                  if (!sLocalStatus) {
                    var bHasBeenCounted = oItem._hasBeenCounted === true;
                    sLocalStatus =
                      sApprovedToUse === "X"
                        ? "COMPLETED"
                        : (parseFloat(sCountedQtyToUse) > 0 || bHasBeenCounted)
                        ? "IP"
                        : "";
                  }

                  if (!oMaterialMap[sMaterial]) {
                    // Debug: Log first item to see all available fields from backend
                    if (Object.keys(oMaterialMap).length === 0) {
                      console.log("Backend Item Fields:", Object.keys(oItem));
                      console.log("Fiyatli value:", oItem.Fiyatli);
                    }
                    oMaterialMap[sMaterial] = {
                      PackingNumber: sPackingNumber,
                      Status: sStatus,
                      Material: oItem.Material,
                      MaterialDesc: oItem.MaterialDesc,
                      Kategori: oItem.Kategori,
                      KategoriText: oItem.KategoriText,
                      DeliveryType: oItem.DeliveryType,
                      TargetQuantity: oItem.TargetQuantity,
                      CountedQuantity: sCountedQtyToUse,
                      UoM: oItem.UoM,
                      SM: oItem.SM,
                      Fiyatli: oItem.Fiyatli || "",
                      Approved: sApprovedToUse,
                      EditReason: sEditReasonToUse,
                      LocalStatus: sLocalStatus,
                      Palet: oItem.Palet,
                      Sepet: oItem.Sepet,
                      PalletCount: oItem.PalletCount,
                      CrateCount: oItem.CrateCount,
                      PaletSepet: oItem.PaletSepet || "",
                      _hasBeenCounted: oItem._hasBeenCounted || false,
                    };
                  }
                }.bind(this)
              );
            }

            // Separate items by DeliveryType
            var aProductItems = []; // DeliveryType = M
            var aDepositItems = []; // DeliveryType = D
            var oCategoryMap = {}; // For category tabs

            for (var sMat in oMaterialMap) {
              var oItem = oMaterialMap[sMat];
              if (oItem.DeliveryType === "D") {
                aDepositItems.push(oItem);
              } else {
                // M or any other value defaults to Product
                aProductItems.push(oItem);
                // Build category map for products only
                var sKategori = oItem.Kategori || "";
                var sKategoriText = oItem.KategoriText || "";
                if (sKategori && !oCategoryMap[sKategori]) {
                  oCategoryMap[sKategori] = {
                    key: sKategori,
                    text: sKategoriText,
                    count: 0,
                  };
                }
                if (sKategori) {
                  oCategoryMap[sKategori].count++;
                }
              }
            }

            // Get panel content elements
            var oVBoxContainer = oPanel.getContent()[0];
            if (!oVBoxContainer) return;

            var oProductPanel = null;
            var oDepositPanel = null;
            var aVBoxItems = oVBoxContainer.getItems();

            aVBoxItems.forEach(function (oItem) {
              if (
                oItem.hasStyleClass &&
                oItem.hasStyleClass("giProductPanel")
              ) {
                oProductPanel = oItem;
              } else if (
                oItem.hasStyleClass &&
                oItem.hasStyleClass("giDepositPanel")
              ) {
                oDepositPanel = oItem;
              }
            });

            // Update completion stats in the main model
            var iTotalItems = aProductItems.length + aDepositItems.length;
            var iCompletedItems = 0;
            for (var sMat2 in oMaterialMap) {
              if (oMaterialMap[sMat2].Approved === "X") {
                iCompletedItems++;
              }
            }
            var iCompletionPercentage =
              iTotalItems > 0
                ? Math.round((iCompletedItems / iTotalItems) * 100)
                : 0;

            // Update the package model with completion stats
            var oIssuePackagesModel =
              this.getView().getModel("issuePackagesModel");
            var aPackages = oIssuePackagesModel.getData();
            var oCurrentPkg = aPackages.find(function (p) {
              return p.PackingNumber === sPackingNumber;
            });
            if (oCurrentPkg) {
              oCurrentPkg.TotalItemCount = iTotalItems;
              oCurrentPkg.CompletedItemCount = iCompletedItems;
              oCurrentPkg.CompletionPercentage = iCompletionPercentage;
            }

            // Setup Product Panel
            if (oProductPanel) {
              this._setupItemPanel(
                oProductPanel,
                aProductItems,
                sPackingNumber,
                "product",
                oCategoryMap
              );
              oProductPanel.setVisible(aProductItems.length > 0);

              // Update product count
              var oProductToolbar = oProductPanel.getHeaderToolbar();
              if (oProductToolbar) {
                var aToolbarItems = oProductToolbar.getContent();
                aToolbarItems.forEach(function (oToolbarItem) {
                  if (
                    oToolbarItem.hasStyleClass &&
                    oToolbarItem.hasStyleClass("giProductCount")
                  ) {
                    oToolbarItem.setNumber(aProductItems.length);
                  }
                });
              }
            }

            // Setup Deposit Panel
            if (oDepositPanel) {
              this._setupItemPanel(
                oDepositPanel,
                aDepositItems,
                sPackingNumber,
                "deposit",
                null
              );
              oDepositPanel.setVisible(aDepositItems.length > 0);

              // Calculate total Palet and Sepet quantities from PaletSepet field
              var iTotalPalet = 0;
              var iTotalSepet = 0;
              aDepositItems.forEach(function (oDepItem) {
                var fQuantity = parseFloat(oDepItem.TargetQuantity) || 0;
                if (oDepItem.PaletSepet === "P") {
                  iTotalPalet += fQuantity;
                } else if (oDepItem.PaletSepet === "S") {
                  iTotalSepet += fQuantity;
                }
              });

              // Update deposit count and Palet/Sepet totals
              var oDepositToolbar = oDepositPanel.getHeaderToolbar();
              if (oDepositToolbar) {
                var aToolbarItems = oDepositToolbar.getContent();
                aToolbarItems.forEach(function (oToolbarItem) {
                  if (
                    oToolbarItem.hasStyleClass &&
                    oToolbarItem.hasStyleClass("giDepositCount")
                  ) {
                    oToolbarItem.setNumber(aDepositItems.length);
                  }
                  if (
                    oToolbarItem.hasStyleClass &&
                    oToolbarItem.hasStyleClass("giTotalPalet")
                  ) {
                    oToolbarItem.setNumber(iTotalPalet);
                  }
                  if (
                    oToolbarItem.hasStyleClass &&
                    oToolbarItem.hasStyleClass("giTotalSepet")
                  ) {
                    oToolbarItem.setNumber(iTotalSepet);
                  }
                });
              }
            }

            oIssuePackagesModel.refresh(true);
          }.bind(this)
        );
      },

      _setupItemPanel: function (
        oPanel,
        aItems,
        sPackingNumber,
        sType,
        oCategoryMap
      ) {
        var oPanelContent = oPanel.getContent()[0]; // VBox
        if (!oPanelContent) return;

        var sModelName = "itemsModel_" + sPackingNumber + "_" + sType;
        var oItemsModel = this.getView().getModel(sModelName);
        if (!oItemsModel) {
          oItemsModel = new JSONModel();
          oItemsModel.setSizeLimit(9999);
          oItemsModel.setDefaultBindingMode("OneWay");
          this.getView().setModel(oItemsModel, sModelName);
        }
        oItemsModel.setData(aItems);

        var oTable = null;
        var oIconTabBar = null;
        var aPanelItems = oPanelContent.getItems();

        aPanelItems.forEach(function (oItem) {
          if (oItem.getMetadata().getName() === "sap.m.Table") {
            oTable = oItem;
          } else if (oItem.getMetadata().getName() === "sap.m.IconTabBar") {
            oIconTabBar = oItem;
          }
        });

        // Setup Category IconTabBar (only for products)
        if (oIconTabBar && oCategoryMap && sType === "product") {
          this._updateCategoryFiltersForTabBar(
            oCategoryMap,
            oIconTabBar,
            sPackingNumber,
            sType,
            aItems.length,
            aItems
          );
        }

        // Bind table
        if (oTable) {
          var oSorter = new sap.ui.model.Sorter("Kategori", false, false);
          var oBinding = oTable.getBinding("items");
          
          // Generate a unique key for this table to track growing state
          var sTableKey = sPackingNumber + "_" + sType;
          
          // Save current growing state before refresh/rebind
          if (oTable.getGrowingInfo && oTable.getGrowingInfo()) {
            var oGrowingInfo = oTable.getGrowingInfo();
            if (oGrowingInfo.actual > 30) { // Default threshold is 30
              this._mTableGrowingState[sTableKey] = oGrowingInfo.actual;
            }
          }
          
          // If user has previously expanded this table, set threshold to show all
          var iSavedCount = this._mTableGrowingState[sTableKey];
          if (iSavedCount && iSavedCount > 30) {
            oTable.setGrowingThreshold(Math.max(iSavedCount, aItems.length));
          }
          
          if (!oBinding || oBinding.getPath() !== sModelName + ">/") {
            oTable.bindItems({
              path: sModelName + ">/",
              template: this._createTableItemTemplate(sModelName),
              templateShareable: false,
            });
            oBinding = oTable.getBinding("items");
            if (oBinding) {
              oBinding.sort(oSorter);
            }
          } else {
            oBinding.sort(oSorter);
            oBinding.refresh();
          }

          // Reapply category filter AFTER table binding is ready (only for products)
          if (oIconTabBar && oCategoryMap && sType === "product") {
            this._reapplyCategoryFilter(oIconTabBar, oTable);
          }
        }
      },

      _updateCategoryFiltersForTabBar: function (
        oCategoryMap,
        oIconTabBar,
        sPackingNumber,
        sType,
        iTotalCount,
        aItems
      ) {
        if (!oIconTabBar) return;

        // Save current selected key before destroying items
        var sCurrentSelectedKey = oIconTabBar.getSelectedKey() || "all";

        // Calculate pending items count (CountedQuantity = 0 and Approved != 'X')
        var iPendingCount = 0;
        if (aItems && aItems.length > 0) {
          iPendingCount = aItems.filter(function (oItem) {
            var fCounted = parseFloat(oItem.CountedQuantity || "0");
            return fCounted === 0 && oItem.Approved !== "X";
          }).length;
        }

        oIconTabBar.data("packingNumber", sPackingNumber);
        oIconTabBar.data("itemType", sType);
        oIconTabBar.destroyItems();

        // Add "Tümü" tab
        oIconTabBar.addItem(
          new sap.m.IconTabFilter({
            key: "all",
            text: "Tümü",
            count: String(iTotalCount),
          })
        );

        // Add "Bekleyen" (Pending) tab
        var bPendingKeyExists = sCurrentSelectedKey === "pending";
        oIconTabBar.addItem(
          new sap.m.IconTabFilter({
            key: "pending",
            text: "Bekleyen",
            count: String(iPendingCount),
          })
        );

        oIconTabBar.addItem(new sap.m.IconTabSeparator());

        // Add category tabs from the map
        var aCategories = Object.keys(oCategoryMap).sort();
        var bSelectedKeyExists = sCurrentSelectedKey === "all" || bPendingKeyExists;
        aCategories.forEach(function (sKey) {
          var oCategory = oCategoryMap[sKey];
          oIconTabBar.addItem(
            new sap.m.IconTabFilter({
              key: oCategory.key,
              text: oCategory.text || oCategory.key,
              count: String(oCategory.count),
            })
          );
          if (oCategory.key === sCurrentSelectedKey) {
            bSelectedKeyExists = true;
          }
        });

        // Restore selected key if it still exists, otherwise default to "all"
        if (bSelectedKeyExists) {
          oIconTabBar.setSelectedKey(sCurrentSelectedKey);
        } else {
          oIconTabBar.setSelectedKey("all");
        }
      },

      _reapplyCategoryFilter: function (oIconTabBar, oTable) {
        if (!oIconTabBar || !oTable) return;

        var sSelectedKey = oIconTabBar.getSelectedKey() || "all";
        var oBinding = oTable.getBinding("items");
        if (!oBinding) return;

        var oSorter = new sap.ui.model.Sorter("Kategori", false, false);
        oBinding.sort(oSorter);

        if (sSelectedKey === "all") {
          oBinding.filter([]);
        } else if (sSelectedKey === "pending") {
          // Filter for pending items: CountedQuantity = 0 AND Approved != 'X'
          var oPendingFilter = new Filter({
            filters: [
              new Filter("CountedQuantity", FilterOperator.EQ, "0"),
              new Filter("Approved", FilterOperator.NE, "X")
            ],
            and: true
          });
          oBinding.filter([oPendingFilter]);
        } else {
          var oFilter = new Filter("Kategori", FilterOperator.EQ, sSelectedKey);
          oBinding.filter([oFilter]);
        }
      },

      onCategoryFilterSelect: function (oEvent) {
        var sSelectedKey = oEvent.getParameter("key");
        var oIconTabBar = oEvent.getSource();
        var sPackingNumber = oIconTabBar.data("packingNumber");
        var sType = oIconTabBar.data("itemType");
        if (!sPackingNumber) return;

        // Find the table in the same VBox as the IconTabBar
        var oVBox = oIconTabBar.getParent();
        if (!oVBox) return;

        var oTable = null;
        oVBox.getItems().forEach(function (oItem) {
          if (oItem.getMetadata().getName() === "sap.m.Table") {
            oTable = oItem;
          }
        });

        if (!oTable) return;
        var oBinding = oTable.getBinding("items");
        if (!oBinding) return;

        var oSorter = new sap.ui.model.Sorter("Kategori", false, false);
        oBinding.sort(oSorter);

        if (sSelectedKey === "all") {
          oBinding.filter([]);
        } else if (sSelectedKey === "pending") {
          // Filter for pending items: CountedQuantity = 0 AND Approved != 'X'
          var oPendingFilter = new Filter({
            filters: [
              new Filter("CountedQuantity", FilterOperator.EQ, "0"),
              new Filter("Approved", FilterOperator.NE, "X")
            ],
            and: true
          });
          oBinding.filter([oPendingFilter]);
        } else {
          var oFilter = new Filter("Kategori", FilterOperator.EQ, sSelectedKey);
          oBinding.filter([oFilter]);
        }
      },

      onStatusFilterSelect: function (oEvent) {
        var sKey = oEvent.getParameter("key");
        this._collapseAllPanels();
        this._applyStatusFilter(sKey);
      },

      _collapseAllPanels: function () {
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        if (!oIssuePackagesModel) return;
        var aData = oIssuePackagesModel.getData();
        if (aData && Array.isArray(aData)) {
          aData.forEach(function (oItem) {
            oItem.expanded = false;
          });
          oIssuePackagesModel.refresh();
        }

        if (oIssuePackagesModel) {
          var aPackages = oIssuePackagesModel.getData();
          if (aPackages && aPackages.length > 0) {
            aPackages.forEach(
              function (oPkg) {
                // Clear both product and deposit models
                var sProductModelName =
                  "itemsModel_" + oPkg.PackingNumber + "_product";
                var sDepositModelName =
                  "itemsModel_" + oPkg.PackingNumber + "_deposit";
                var oProductModel = this.getView().getModel(sProductModelName);
                var oDepositModel = this.getView().getModel(sDepositModelName);
                if (oProductModel) oProductModel.setData([]);
                if (oDepositModel) oDepositModel.setData([]);
              }.bind(this)
            );
          }
        }

        var oList = this.byId("idGIPackagesList");
        if (oList) {
          var aItems = oList.getItems();
          aItems.forEach(function (oItem) {
            var oPanel = oItem.getContent()[0];
            if (oPanel && oPanel.getContent) {
              var oVBoxContainer = oPanel.getContent()[0];
              if (oVBoxContainer && oVBoxContainer.getItems) {
                // Hide both product and deposit panels
                oVBoxContainer.getItems().forEach(function (oChildPanel) {
                  if (oChildPanel && oChildPanel.setVisible) {
                    oChildPanel.setVisible(false);
                  }
                });
              }
            }
          });
        }
      },

      _applyStatusFilter: function (sStatus) {
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

      _updateStatusFilterCounts: function () {
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        if (!oIssuePackagesModel) return;
        var aData = oIssuePackagesModel.getData() || [];
        var iPendingCount = 0;
        var iCompletedCount = 0;
        aData.forEach(function (oItem) {
          if (oItem.Status === "X") iCompletedCount++;
          else iPendingCount++;
        });
        var oPendingTab = this.byId("idGIPendingTab");
        var oCompletedTab = this.byId("idGICompletedTab");
        if (oPendingTab) oPendingTab.setCount(iPendingCount.toString());
        if (oCompletedTab) oCompletedTab.setCount(iCompletedCount.toString());
      },

      /**
       * Open deposit add dialog from Deposit panel header button (without Mal Çıkış)
       */
      onDepositAddPress: function (oEvent) {
        var oButton = oEvent.getSource();
        // Navigate up to find the main Package Panel to get PackingNumber
        var oPanel = oButton.getParent();
        while (oPanel && !oPanel.getBindingContext("issuePackagesModel")) {
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
        this._sCurrentPackingNumber = oPackage.PackingNumber;
        this._bDepositOnlyMode = true; // Flag to indicate deposit-only mode (no Mal Çıkış after)

        // Load deposit items for adding
        this._loadDepositAddItems(oPackage.PackingNumber);
      },

      onMalCikisPress: function (oEvent) {
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
        this._sCurrentPackingNumber = oPackage.PackingNumber;
        this._bDepositOnlyMode = false; // Flag to indicate Mal Çıkış mode

        // Depozito Ekleme dialogu gösterilsin mi kontrolü
        // _bShowDepositDialogBeforeMalCikis = false ise dialog atlanır, direkt Mal Çıkış yapılır
        if (this._bShowDepositDialogBeforeMalCikis) {
          // Load external deposit items and show dialog
          this._loadDepositAddItems(oPackage.PackingNumber);
        } else {
          // Depozito dialogu atla, direkt Mal Çıkış yap
          this._executePostGoodsIssue(oPackage.PackingNumber);
        }
      },

      _loadDepositAddItems: function (sPackingNumber) {
        var oModel = this.getOwnerComponent().getModel();
        sap.ui.core.BusyIndicator.show(0);

        // Get existing deposit materials from the current package
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        var aPackages = oIssuePackagesModel.getData();
        var oCurrentPackage = aPackages.find(function (pkg) {
          return pkg.PackingNumber === sPackingNumber;
        });

        // Collect existing deposit material codes (DeliveryType = D)
        // Also collect externally added deposits (Harici = 'X' or true)
        var aExistingDepositMatnrs = [];
        var oExternalDepositMap = {}; // Map of Matnr -> CountedQuantity for externally added
        console.log("=== DEBUG: ToItems ===");
        if (oCurrentPackage && oCurrentPackage.ToItems && oCurrentPackage.ToItems.results) {
          oCurrentPackage.ToItems.results.forEach(function (oItem) {
            console.log("Item:", oItem.Material, "DeliveryType:", oItem.DeliveryType, "Harici:", oItem.Harici, "CountedQty:", oItem.CountedQuantity, "TargetQty:", oItem.TargetQuantity);
            if (oItem.DeliveryType === "D") {
              // Normalize material number (remove leading zeros for comparison)
              var sNormalizedMat = oItem.Material ? oItem.Material.replace(/^0+/, '') : '';
              aExistingDepositMatnrs.push(sNormalizedMat);
              // If Harici = 'X' or true, it was added by user externally
              if (oItem.Harici === "X" || oItem.Harici === true) {
                // Use TargetQuantity since CountedQuantity might be 0 for externally added
                var fCountedQty = parseFloat(oItem.CountedQuantity) || 0;
                var fTargetQty = parseFloat(oItem.TargetQuantity) || 0;
                var sQty = fCountedQty > 0 ? String(fCountedQty) : (fTargetQty > 0 ? String(fTargetQty) : "0");
                oExternalDepositMap[sNormalizedMat] = sQty;
                console.log("External deposit found:", sNormalizedMat, "CountedQty:", fCountedQty, "TargetQty:", fTargetQty, "Using:", sQty);
              }
            }
          });
        }
        console.log("aExistingDepositMatnrs:", aExistingDepositMatnrs);
        console.log("oExternalDepositMap:", oExternalDepositMap);

        oModel.read("/DepositGISet", {
          // filters: aFilters,
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            var aItems = oData.results || [];

            // Mark items status:
            // - IsExisting: exists in delivery (from backend, not editable)
            // - IsExternal: added by user externally (Harici = 'X', show current quantity, editable)
            console.log("=== DEBUG: DepositGISet items ===");
            aItems.forEach(function (oItem) {
              // Normalize material number for comparison
              var sNormalizedMatnr = oItem.Matnr ? oItem.Matnr.replace(/^0+/, '') : '';
              
              var bIsExternal = !!oExternalDepositMap[sNormalizedMatnr];
              var bIsOriginal = aExistingDepositMatnrs.indexOf(sNormalizedMatnr) !== -1 && !bIsExternal;
              
              console.log("Matnr:", oItem.Matnr, "Normalized:", sNormalizedMatnr, "IsExternal:", bIsExternal, "IsOriginal:", bIsOriginal);
              
              oItem.IsExisting = bIsOriginal; // Original deposit from delivery - disable input
              oItem.IsExternal = bIsExternal; // User added externally - editable
              
              if (bIsExternal) {
                oItem.Quantity = oExternalDepositMap[sNormalizedMatnr];
                console.log("Setting quantity for external:", sNormalizedMatnr, "to", oItem.Quantity);
                // IsExisting stays false so it remains editable
              } else {
                oItem.Quantity = "";
              }
            });

            // Always show the dialog so user can cancel if needed
            this._showDepositAddDialog(aItems);
          }.bind(this),
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            console.error("DepositGISet load error:", oError);
            // On error, if in Mal Çıkış mode, proceed anyway
            if (!this._bDepositOnlyMode) {
              this._executePostGoodsIssue(sPackingNumber);
            } else {
              MessageBox.error("Depozito listesi yüklenemedi.");
            }
          }.bind(this),
        });
      },

      _showDepositAddDialog: function (aItems) {
        var oDepositAddModel = new JSONModel({
          items: aItems,
          packingNumber: this._sCurrentPackingNumber,
        });
        this.getView().setModel(oDepositAddModel, "depositAddModel");

        if (!this._oDepositAddDialog) {
          this._oDepositAddDialog = sap.ui.xmlfragment(
            "com.sut.bolgeyonetim.view.DepositAddDialog",
            this
          );
          this.getView().addDependent(this._oDepositAddDialog);
        }

        // Update button texts and visibility based on mode
        var bDepositOnlyMode = this._bDepositOnlyMode;
        var aButtons = this._oDepositAddDialog.getButtons();
        
        aButtons.forEach(function(oBtn) {
          var sId = oBtn.getId();
          if (sId && sId.indexOf("idDepositSaveBtn") !== -1) {
            // Save button - update text based on mode
            if (bDepositOnlyMode) {
              oBtn.setText("Kaydet");
            } else {
              oBtn.setText("Kaydet ve Mal Çıkış");
            }
          } else if (sId && sId.indexOf("idDepositSkipBtn") !== -1) {
            // Skip button - only visible in Mal Çıkış mode
            oBtn.setVisible(!bDepositOnlyMode);
          }
        });

        this._oDepositAddDialog.open();
      },

      onDepositQuantityChange: function (oEvent) {
        // Optional: Add validation logic here
        var sValue = oEvent.getParameter("value");
        var oInput = oEvent.getSource();
        var fValue = parseFloat(sValue);

        if (sValue && (isNaN(fValue) || fValue < 0)) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Geçerli bir miktar giriniz");
        } else {
          oInput.setValueState("None");
        }
      },

      onDepositAddSave: function () {
        var oDepositAddModel = this.getView().getModel("depositAddModel");
        var aItems = oDepositAddModel.getProperty("/items");
        var sPackingNumber = this._sCurrentPackingNumber;
        var bDepositOnlyMode = this._bDepositOnlyMode;

        // Filter items with quantity > 0 AND not already saved (IsExternal = false or new)
        var aItemsToSave = aItems.filter(function (oItem) {
          var fQty = parseFloat(oItem.Quantity);
          // Only save if has quantity, not original existing, and not already saved external
          return !isNaN(fQty) && fQty > 0 && !oItem.IsExisting;
        });

        if (aItemsToSave.length === 0) {
          // No new deposits to save
          this._oDepositAddDialog.close();
          if (!bDepositOnlyMode) {
            // Mal Çıkış mode - proceed to goods issue
            this._executePostGoodsIssue(sPackingNumber);
          } else {
            MessageToast.show("Kaydedilecek yeni depozito yok.");
          }
          return;
        }

        // Save each deposit item via UpdateIssueQuantity - sequentially
        sap.ui.core.BusyIndicator.show(0);
        var oModel = this.getOwnerComponent().getModel();
        var iErrorCount = 0;
        var that = this;

        // Sequential processing to avoid batch changeset issues
        var fnProcessNext = function (iIndex) {
          if (iIndex >= aItemsToSave.length) {
            that._onDepositSaveComplete(iErrorCount, sPackingNumber, bDepositOnlyMode);
            return;
          }

          var oItem = aItemsToSave[iIndex];
          oModel.callFunction("/UpdateIssueQuantity", {
            method: "POST",
            groupId: "depositSave" + iIndex,
            changeSetId: "depositSaveCS" + iIndex,
            urlParameters: {
              PackingNumber: sPackingNumber,
              Matnr: oItem.Matnr,
              Quantity: parseFloat(oItem.Quantity),
              OriginalQty: parseFloat(oItem.TargetQuantity) || 0,
              EditReason: "",
              Harici: true,
              Status: "0",
              Approved: "X",
              Uom: oItem.Uom || "ADT",
            },
            success: function () {
              fnProcessNext(iIndex + 1);
            },
            error: function (oError) {
              console.error("UpdateIssueQuantity error:", oError);
              iErrorCount++;
              fnProcessNext(iIndex + 1);
            },
          });
        };

        fnProcessNext(0);
      },

      _onDepositSaveComplete: function (iErrorCount, sPackingNumber, bDepositOnlyMode) {
        sap.ui.core.BusyIndicator.hide();
        this._oDepositAddDialog.close();

        if (bDepositOnlyMode) {
          // Deposit-only mode: just show message and refresh
          if (iErrorCount > 0) {
            MessageBox.warning(
              "Bazı harici depozitolar kaydedilemedi (" + iErrorCount + " hata)."
            );
          } else {
            MessageToast.show("Harici depozitolar kaydedildi");
          }
          // Refresh package data to show new deposits
          this._refreshSinglePackageWithExpand(sPackingNumber);
        } else {
          // Mal Çıkış mode: proceed to goods issue
          if (iErrorCount > 0) {
            MessageBox.warning(
              "Bazı harici depozitolar kaydedilemedi (" +
                iErrorCount +
                " hata). Mal çıkış işlemine devam edilecek.",
              {
                onClose: function () {
                  this._executePostGoodsIssue(sPackingNumber);
                }.bind(this),
              }
            );
          } else {
            MessageToast.show("Harici depozitolar kaydedildi");
            this._executePostGoodsIssue(sPackingNumber);
          }
        }
      },
      onDepositAddCancel: function () {
        this._oDepositAddDialog.close();
      },
      onDepositAddSkip: function () {
        this._oDepositAddDialog.close();
        // Only proceed to Mal Çıkış if not in deposit-only mode
        if (!this._bDepositOnlyMode) {
          this._executePostGoodsIssue(this._sCurrentPackingNumber);
        }
      },

      _executePostGoodsIssue: function (sPackingNumber) {
        var oModel = this.getOwnerComponent().getModel();
        var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
        var sUserId = oSessionModel
          ? oSessionModel.getProperty("/Login/Username")
          : "";
        var sWarehouseNum = oSessionModel
          ? oSessionModel.getProperty("/Login/WarehouseNum")
          : "";

        // Get date from filterModel or use today
        var oFilterModel = this.getOwnerComponent().getModel("filterModel");
        var sSelectedDate = oFilterModel
          ? oFilterModel.getProperty("/selectedDate")
          : null;
        var oDateForPost;

        if (!sSelectedDate) {
          var oToday = new Date();
          oDateForPost = new Date(
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
          var aParts = sSelectedDate.split("-");
          oDateForPost = new Date(
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

        sap.ui.core.BusyIndicator.show(0);

        oModel.callFunction("/PostGoodsIssue", {
          method: "POST",
          urlParameters: {
            PackingNumber: sPackingNumber,
            UserID: sUserId,
            Date: oDateForPost,
            Warehouse: sWarehouseNum,
          },
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.success("Mal çıkış işlemi başarıyla tamamlandı!", {
              onClose: function () {
                // Refresh dashboard data to update pending counts after user closes dialog
                this.refreshDashboardData();
                this._loadGoodsIssueData();
              }.bind(this),
            });
          }.bind(this),
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            var sErrorMsg = "Mal çıkış işlemi başarısız.";
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
              } catch (e) {}
            }
            MessageBox.error(sErrorMsg);
          }.bind(this),
        });
      },

      onPackageExpand: function (oEvent) {
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

      _updateItemInBackend: function (
        oItem,
        fCountedQuantity,
        sEditReason,
        sApproved,
        bSkipRefresh
      ) {
        var oModel = this.getOwnerComponent().getModel();
        var sPath =
          "/IssueItemSet(PackingNumber='" +
          oItem.PackingNumber +
          "',Material='" +
          oItem.Material +
          "')";

        var oUpdateData = {
          CountedQuantity: String(fCountedQuantity),
          EditReason: sEditReason || "",
          Approved: sApproved || "",
        };

        return new Promise(
          function (resolve, reject) {
            oModel.update(sPath, oUpdateData, {
              success: function () {
                // Only refresh if not skipped (for optimistic updates)
                if (!bSkipRefresh) {
                  this._refreshSinglePackage(oItem.PackingNumber);
                }
                resolve();
              }.bind(this),
              error: function (oError) {
                console.error("Update failed:", oError);
                var sErrorMsg = "Güncelleme başarısız.";
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
                  } catch (e) {}
                }
                MessageBox.error(sErrorMsg);
                reject();
              }.bind(this),
            });
          }.bind(this)
        );
      },

      _refreshSinglePackage: function (sPackingNumber) {
        var oModel = this.getOwnerComponent().getModel();
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        var aPackages = oIssuePackagesModel.getData();
        var oCurrentPkg = aPackages.find(function (pkg) {
          return pkg.PackingNumber === sPackingNumber;
        });

        if (!oCurrentPkg) return;

        var aFilters = [
          new Filter("PackingNumber", FilterOperator.EQ, sPackingNumber),
        ];

        oModel.read("/IssuePackageSet", {
          filters: aFilters,
          urlParameters: { $expand: "ToItems" },
          success: function (oData) {
            if (oData.results && oData.results.length > 0) {
              var oUpdatedPkg = oData.results[0];
              oUpdatedPkg.expanded = oCurrentPkg.expanded;
              oUpdatedPkg._refreshTrigger =
                (oCurrentPkg._refreshTrigger || 0) + 1;

              var iPkgIndex = aPackages.findIndex(function (p) {
                return p.PackingNumber === sPackingNumber;
              });
              if (iPkgIndex >= 0) {
                aPackages[iPkgIndex] = oUpdatedPkg;
                oIssuePackagesModel.refresh(true);
                this._calculateAndRenderItems();
              }
            }
          }.bind(this),
          error: function (oError) {
            console.error("Refresh failed:", oError);
          }.bind(this),
        });
      },

      _refreshSinglePackageWithExpand: function (sPackingNumber) {
        var oModel = this.getOwnerComponent().getModel();
        var oIssuePackagesModel = this.getView().getModel("issuePackagesModel");
        var aPackages = oIssuePackagesModel.getData();
        var oCurrentPkg = aPackages.find(function (pkg) {
          return pkg.PackingNumber === sPackingNumber;
        });

        if (!oCurrentPkg) return;

        var aFilters = [
          new Filter("PackingNumber", FilterOperator.EQ, sPackingNumber),
        ];

        sap.ui.core.BusyIndicator.show(0);
        oModel.read("/IssuePackageSet", {
          filters: aFilters,
          urlParameters: { $expand: "ToItems" },
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            if (oData.results && oData.results.length > 0) {
              var oUpdatedPkg = oData.results[0];
              // Keep panel expanded to show new deposits
              oUpdatedPkg.expanded = true;
              oUpdatedPkg._refreshTrigger =
                (oCurrentPkg._refreshTrigger || 0) + 1;

              var iPkgIndex = aPackages.findIndex(function (p) {
                return p.PackingNumber === sPackingNumber;
              });
              if (iPkgIndex >= 0) {
                aPackages[iPkgIndex] = oUpdatedPkg;
                oIssuePackagesModel.refresh(true);
                // Use timeout to ensure model is updated before rendering
                setTimeout(function() {
                  this._calculateAndRenderItems();
                }.bind(this), 100);
              }
            }
          }.bind(this),
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            console.error("Refresh failed:", oError);
            MessageBox.error("Veriler yenilenemedi.");
          }.bind(this),
        });
      },

      // --- NOTE MANAGEMENT (GI) ---

      onNoteGIPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPanel = oButton.getParent();
        while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") {
          oPanel = oPanel.getParent();
        }
        if (!oPanel) {
          MessageBox.error("Panel bulunamadı.");
          return;
        }
        var oContext = oPanel.getBindingContext("issuePackagesModel");
        if (!oContext) {
          MessageBox.error("Package bilgisi bulunamadı.");
          return;
        }
        var oPackage = oContext.getObject();
        var sPackingNumber = oPackage.PackingNumber;

        this._oCurrentNoteContext = oContext;
        this._sCurrentNotePackingNumber = sPackingNumber;

        // Initialize note dialog model
        var oNoteDialogModelGI = new JSONModel({
          newNote: "",
        });
        this.getView().setModel(oNoteDialogModelGI, "noteDialogModelGI");

        if (!this._oNoteDialogGI) {
          this._oNoteDialogGI = sap.ui.xmlfragment(
            "noteDialogGI",
            "com.sut.bolgeyonetim.view.NoteDialogGI",
            this
          );
          this.getView().addDependent(this._oNoteDialogGI);
        }

        // Load existing notes
        this._loadNotesGI(sPackingNumber);
        this._oNoteDialogGI.open();
      },

      _loadNotesGI: function (sPackingNumber) {
        var oModel = this.getOwnerComponent().getModel();
        var oNoteDialogModelGI = this.getView().getModel("noteDialogModelGI");

        if (!sPackingNumber) {
          console.error("PackingNumber is missing");
          return;
        }

        sap.ui.core.BusyIndicator.show(0);

        var aFilters = [
          new Filter("PackingNumber", FilterOperator.EQ, sPackingNumber),
        ];

        oModel.read("/NoteGISet", {
          filters: aFilters,
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            var sNote = "";
            if (oData.results && oData.results.length > 0) {
              sNote = oData.results[0].Note || "";
            }
            oNoteDialogModelGI.setProperty("/newNote", sNote);
          }.bind(this),
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            console.error("Failed to load notes:", oError);
            MessageBox.error("Notlar yüklenirken hata oluştu.");
          }.bind(this),
        });
      },

      onSaveNoteGI: function () {
        var oNoteDialogModelGI = this.getView().getModel("noteDialogModelGI");
        var sNewNote = oNoteDialogModelGI.getProperty("/newNote");

        if (!sNewNote || sNewNote.trim().length === 0) {
          MessageBox.warning("Lütfen bir not girin.");
          return;
        }

        if (sNewNote.length > 255) {
          MessageBox.error("Not en fazla 255 karakter olabilir.");
          return;
        }

        var oModel = this.getOwnerComponent().getModel();

        sap.ui.core.BusyIndicator.show(0);

        oModel.callFunction("/SaveNoteGI", {
          method: "POST",
          urlParameters: {
            PackingNumber: this._sCurrentNotePackingNumber,
            Note: sNewNote.trim(),
          },
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Not başarıyla kaydedildi.");

            // Clear input
            oNoteDialogModelGI.setProperty("/newNote", "");

            // Reload notes
            this._loadNotesGI(this._sCurrentNotePackingNumber);
          }.bind(this),
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            var sErrorMsg = "Not kaydedilemedi.";

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
              } catch (e) {}
            }

            MessageBox.error(sErrorMsg);
          }.bind(this),
        });
      },

      onCloseNoteDialogGI: function () {
        if (this._oNoteDialogGI) {
          this._oNoteDialogGI.close();
        }
      },
    });
  }
);
