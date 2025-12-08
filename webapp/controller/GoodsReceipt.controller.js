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
        // --- FORMATTERS ---

        // Buton Metni: "Tamamlandı (100)" veya "Devam Et (50)"
        /**
         * Formatter: Smart Button Text
         * Default: Icon Only (no text)
         * In Progress: Show quantity
         * Completed: Show quantity
         */
        formatSmartButtonText: function (sStatus, fQty) {
          if (sStatus === "COMPLETED" || sStatus === "IP") {
            return String(parseFloat(fQty || "0"));
          }
          return ""; // Icon only for new items
        },

        /**
         * Formatter: Smart Button Type
         * COMPLETED -> Success (Green)
         * IP -> Warning (Orange)
         * Default -> Default (Gray/Blue)
         */
        formatSmartButtonType: function (sStatus) {
          if (sStatus === "COMPLETED") return "Accept";
          if (sStatus === "IP") return "Emphasized";
          return "Default";
        },

        /**
         * Formatter: Smart Button Icon
         * COMPLETED -> accept icon
         * IP -> edit icon
         * Default -> add icon
         */
        formatSmartButtonIcon: function (sStatus) {
          if (sStatus === "COMPLETED") return "sap-icon://accept";
          if (sStatus === "IP") return "sap-icon://edit";
          return "sap-icon://add";
        },

        /**
         * Formatter: Smart Button Tooltip
         * Provides context-aware tooltip
         */
        formatSmartButtonTooltip: function (sStatus, fQty) {
          if (sStatus === "COMPLETED") return "Tamamlandı (" + parseFloat(fQty || "0") + ")";
          if (sStatus === "IP") return "Devam Et (" + parseFloat(fQty || "0") + ")";
          return "Giriş Yap";
        },

        formatRowHighlight: function (sReceivedQty, sExpectedQty, sApproved) {
          var fReceived = parseFloat(sReceivedQty || "0");
          var fExpected = parseFloat(sExpectedQty || "0");

          // If ReceivedQuantity is 0 AND not approved, it's not counted yet (Yellow)
          if (fReceived === 0) {
            if (sApproved === "X") {
              return sap.ui.core.MessageType.Error;
            } else {
              return sap.ui.core.MessageType.Warning;
            }
          } else if (fReceived !== fExpected) {
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

        /**
         * Formatter: Determines if "Mal Kabul" button should be enabled
         * Returns true only if ALL items from ALL delivery notes of this LpId are approved
         * CRITICAL: Must check goodsReceiptModel (all items), not itemsModel (visible items only)
         * BUG FIX 2: Added refreshTrigger parameter to force re-evaluation when items are approved
         */
        isMalKabulEnabled: function (sLpId, refreshTrigger) {
          // refreshTrigger is intentionally unused - it just forces re-binding
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

          // Collect ALL items from ALL delivery notes
          var aAllItems = [];
          aDeliveryNotes.forEach(function (oDeliveryNote) {
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              aAllItems = aAllItems.concat(oDeliveryNote.ToItems.results);
            }
          });

          if (aAllItems.length === 0) {
            return false;
          }

          // Check if ALL items are approved (Approved === 'X')
          var bAllApproved = aAllItems.every(function (oItem) {
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

          var oPhotoModel = new JSONModel({
            photos: [],
            photoCount: 0,
            lpId: null,
          });
          this.getView().setModel(oPhotoModel, "photoModel");

          this.getRouter()
            .getRoute("goodsReceipt")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
          this._cleanupView();
          this._loadGoodsReceiptData();
        },

        _createTableItemTemplate: function (sModelName) {
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
              
              // ACTION BUTTONS - HBox with Smart Count and Bitir buttons
              new sap.m.HBox({
                justifyContent: "SpaceAround",
                width: "100%",
                items: [
                  // SMART COUNT BUTTON
                  new sap.m.Button({
                    // text: {
                    //   parts: [
                    //     { path: sModelName + ">LocalStatus" },
                    //     { path: sModelName + ">ReceivedQuantity" },
                    //   ],
                    //   formatter: this.formatSmartButtonText,
                    // },
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
                        { path: sModelName + ">ReceivedQuantity" },
                      ],
                      formatter: this.formatSmartButtonTooltip,
                    },
                    press: this.onSmartCountPress.bind(this),
                    visible: "{= ${" + sModelName + ">Status} !== 'X' }",
                  }),
                  
                  // BITIR BUTTON - Only visible when ReceivedQuantity > 0 and not approved
                  new sap.m.Button({
                    text: "",
                    icon: "sap-icon://accept",
                    type: "Emphasized",
                    press: this.onTableBitirPress.bind(this),
                    visible: {
                      parts: [
                        { path: sModelName + ">ReceivedQuantity" },
                        { path: sModelName + ">Approved" },
                        { path: sModelName + ">Status" },
                      ],
                      formatter: function(sReceivedQty, sApproved, sStatus) {
                        return sStatus !== 'X' && parseFloat(sReceivedQty || "0") > 0 && sApproved !== "X";
                      }
                    },
                  }),
                ],
              }),
            ],
          });

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

        // --- SMART COUNT LOGIC (AKILLI SAYIM) ---

        /**
         * Smart Count Dialog - Open with initialization
         * Online-First Architecture:
         * - New items: Start fresh (qty=0)
         * - Existing drafts: Restore from localStorage backup
         * - Backend ReceivedQuantity > 0: Load from backend (backup ignored)
         */
        onSmartCountPress: function (oEvent) {
          var oButton = oEvent.getSource();
          
          // Find binding context and model
          var oBindingContext = null;
          var sModelName = null;
          var oItemsModel = null;

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

          var oItem = oBindingContext.getObject();

          // Save context for later use
          this._oCurrentSmartContext = oBindingContext;
          this._sCurrentItemsModelName = sModelName;

          // 1. SAFETY CHECK: Read Palet/Sepet factors with defaults
          var fPalletFactor = parseFloat(oItem.Palet);
          if (isNaN(fPalletFactor) || fPalletFactor <= 0) fPalletFactor = 1;
          
          var fCrateFactor = parseFloat(oItem.Sepet);
          if (isNaN(fCrateFactor) || fCrateFactor <= 0) fCrateFactor = 1;

          // 2. INITIALIZATION LOGIC - ACCUMULATION MODE
          // BUG FIX: Implement baseQuantity concept to prevent overwriting existing quantities
          // Formula: Total = BaseQuantity + (Pallet * Factor) + (Crate * Factor)
          var aSelectedDeliveryNotes = this._getSelectedDeliveryNotesForLpId(oItem.LpId);
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          
          var fBaseQuantity = 0;
          var fInitialPallet = 0;
          var fInitialCrate = 0;
          var sInitialReason = "";
          var bDraftFound = false;
          
          if (sSicilNo && aSelectedDeliveryNotes.length > 0) {
            // Check if ANY draft exists for this material
            for (var i = 0; i < aSelectedDeliveryNotes.length; i++) {
              var oDeliveryNote = aSelectedDeliveryNotes[i];
              if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
                oDeliveryNote.ToItems.results.forEach(function(oOriginalItem) {
                  if (oOriginalItem.Material === oItem.Material) {
                    var sKey = sSicilNo + "_" + oOriginalItem.DeliveryItemId;
                    var sDraftStr = localStorage.getItem(sKey);
                    if (sDraftStr) {
                      try {
                        var oDraft = JSON.parse(sDraftStr);
                        // CRITICAL FIX: receivedquantity is the FINAL calculated value (base + increments)
                        // We show this as baseQuantity in dialog, and reset pallet/crate to 0
                        fBaseQuantity += parseFloat(oDraft.receivedquantity || "0");
                        // Don't load pallet/crate from draft - user starts fresh increments
                        // fInitialPallet = 0, fInitialCrate = 0 (already initialized)
                        if (!sInitialReason && oDraft.editreason) {
                          sInitialReason = oDraft.editreason;
                        }
                        bDraftFound = true;
                      } catch(e) {
                        console.error("Failed to parse draft for key:", sKey, e);
                      }
                    }
                  }
                });
              }
            }
          }
          
          // If NO draft found, initialize baseQuantity from ReceivedQuantity
          // Pallet/Crate start at 0 (user will ADD to existing quantity)
          if (!bDraftFound) {
            fBaseQuantity = parseFloat(oItem.ReceivedQuantity || "0");
            fInitialPallet = 0;
            fInitialCrate = 0;
            sInitialReason = oItem.EditReason || "";
          }

          // Load edit reasons if not already loaded
          if(this.getView().getModel("editReasonsModel").getData().length === 0) {
              this._loadEditReasons();
          }

          var oSmartData = {
            materialText: oItem.MaterialText,
            expectedQuantity: parseFloat(oItem.ExpectedQuantity),
            uom: oItem.UoM,
            
            palletFactor: fPalletFactor,
            crateFactor: fCrateFactor,

            // BUG FIX: Base quantity (existing) + incremental (pallet/crate)
            baseQuantity: fBaseQuantity,
            palletCount: fInitialPallet,
            crateCount: fInitialCrate,
            totalCalculated: fBaseQuantity + (fInitialPallet * fPalletFactor) + (fInitialCrate * fCrateFactor),

            // Other fields
            editReason: sInitialReason,
            showReasonError: false,
            reasonErrorState: false,
            quantityExceeded: false,
            quantityErrorState: false
          };

          var oSmartModel = new JSONModel(oSmartData);
          this.getView().setModel(oSmartModel, "smartCountModel");

          // Open dialog
          if (!this._oSmartDialog) {
            this._oSmartDialog = sap.ui.xmlfragment(
              "com.sut.bolgeyonetim.view.SmartCountDialog",
              this
            );
            this.getView().addDependent(this._oSmartDialog);
          }
          this._oSmartDialog.open();
        },

        // + / - Butonlarına basıldığında çalışır
        onSmartInputChanged: function () {
          var oModel = this.getView().getModel("smartCountModel");
          var oData = oModel.getData();

          // BUG FIX: Formula = BaseQuantity + (Pallet * Factor) + (Crate * Factor)
          // This ensures we ADD to existing quantity instead of overwriting
          // Support decimal values for pallet/crate (e.g., 3.5 pallets)
          var fTotal = oData.baseQuantity + 
                       (oData.palletCount * oData.palletFactor) + 
                       (oData.crateCount * oData.crateFactor);
          
          // Keep precision for decimal inputs (up to 3 decimal places)
          fTotal = parseFloat(fTotal.toFixed(3));

          oModel.setProperty("/totalCalculated", fTotal);

          // VALIDATION: Check if total exceeds expected
          // if (fTotal > oData.expectedQuantity) {
          //   oModel.setProperty("/quantityExceeded", true);
          //   oModel.setProperty("/quantityErrorState", true);
          //   MessageToast.show("Beklenen miktardan fazla giremezsiniz.");
          // } else {
            oModel.setProperty("/quantityExceeded", false);
            oModel.setProperty("/quantityErrorState", false);
          // }

          // Miktar eşitlendiyse hata mesajını gizle
          if (fTotal === oData.expectedQuantity) {
            oModel.setProperty("/showReasonError", false);
            oModel.setProperty("/reasonErrorState", false);
          }
        },

        // Miktar alanına elle giriş yapıldığında
        // BUG FIX: Manual entry overrides baseQuantity and resets pallet/crate to 0
        onTotalManualChange: function(oEvent) {
            var fVal = parseFloat(oEvent.getParameter("value"));
            if (isNaN(fVal)) fVal = 0;
            
            var oModel = this.getView().getModel("smartCountModel");
            var oData = oModel.getData();
            
            // Manual override: new value becomes baseQuantity, reset incremental inputs
            oModel.setProperty("/baseQuantity", fVal);
            oModel.setProperty("/palletCount", 0);
            oModel.setProperty("/crateCount", 0);
            oModel.setProperty("/totalCalculated", fVal);
            
            // VALIDATION: Check if total exceeds expected
            // if (fVal > oData.expectedQuantity) {
            //   oModel.setProperty("/quantityExceeded", true);
            //   oModel.setProperty("/quantityErrorState", true);
            //   MessageToast.show("Beklenen miktardan fazla giremezsiniz.");
            // } else {
              oModel.setProperty("/quantityExceeded", false);
              oModel.setProperty("/quantityErrorState", false);
            // }
            
            if (fVal === oData.expectedQuantity) {
                oModel.setProperty("/showReasonError", false);
                oModel.setProperty("/reasonErrorState", false);
            }
        },
        
        // "Hepsini Al" Linki
        onCopyExpectedToReceived: function() {
             var oModel = this.getView().getModel("smartCountModel");
             var fExpected = oModel.getProperty("/expectedQuantity");
             oModel.setProperty("/totalCalculated", fExpected);
             oModel.setProperty("/showReasonError", false);
             oModel.setProperty("/reasonErrorState", false);
        },

        onSmartSaveIntermediate: function () {
          // Kaydet -> Ara Kayıt (Validation YOK)
          this._performSmartSave("IP", "");
        },

        onSmartSaveFinal: function () {
          // Bitir -> Final Kayıt (Validation VAR)
          var oModel = this.getView().getModel("smartCountModel");
          var oData = oModel.getData();
          
          var fTotal = parseFloat(oData.totalCalculated);
          var fExpected = parseFloat(oData.expectedQuantity);

          // VALIDATION 1: Check if quantity exceeded
          // if (fTotal > fExpected) {
          //   MessageBox.error("Beklenen miktardan fazla giremezsiniz.");
          //   return;
          // }

          // VALIDATION 2: Miktar Farklı ise Neden Zorunlu
          if (fTotal !== fExpected) {
             // Modeldeki showReasonError flag'ini aç
             oModel.setProperty("/showReasonError", true);
             
             // Neden seçili değilse
             if (!oData.editReason) {
               oModel.setProperty("/reasonErrorState", true);
               MessageToast.show("Miktar farkı var. Lütfen bir neden seçiniz.");
               return; // Kapatma, durdur.
             }
          }

          this._performSmartSave("COMPLETED", "X");
        },

        /**
         * Handler for "Bitir" button in table
         * Validates quantity difference and shows ReasonDialog if needed
         */
        onTableBitirPress: function (oEvent) {
          var oButton = oEvent.getSource();
          
          // Find binding context and model
          var oBindingContext = null;
          var sModelName = null;
          var oItemsModel = null;

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

          var oItem = oBindingContext.getObject();
          
          // Save context for later use
          this._oCurrentBitirContext = oBindingContext;
          this._sCurrentBitirModelName = sModelName;

          var fExpected = parseFloat(oItem.ExpectedQuantity || "0");
          var fReceived = parseFloat(oItem.ReceivedQuantity || "0");

          // VALIDATION 1: Check if quantity exceeded
          // if (fReceived > fExpected) {
          //   MessageBox.error("Beklenen miktardan fazla giremezsiniz.");
          //   return;
          // }

          // VALIDATION 2: If quantity differs, show ReasonDialog
          if (fReceived !== fExpected) {
            this._showReasonDialog(oItem.EditReason || "");
          } else {
            // No difference, directly approve
            this._finalizeBitir("");
          }
        },

        _showReasonDialog: function (sCurrentReason) {
          if (!this._oReasonDialog) {
            this._oReasonDialog = sap.ui.xmlfragment(
              "com.sut.bolgeyonetim.view.ReasonDialog",
              this
            );
            this.getView().addDependent(this._oReasonDialog);
          }

          // Initialize reason dialog model
          var oReasonDialogModel = new sap.ui.model.json.JSONModel({
            editReason: sCurrentReason,
            reasonErrorState: false
          });
          this.getView().setModel(oReasonDialogModel, "reasonDialogModel");

          this._oReasonDialog.open();
        },

        onReasonDialogConfirm: function () {
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

        onReasonDialogCancel: function () {
          this._oReasonDialog.close();
        },

        _finalizeBitir: function (sEditReason) {
          var oItemsModel = this.getView().getModel(this._sCurrentBitirModelName);
          var sPath = this._oCurrentBitirContext.getPath();
          var oItem = this._oCurrentBitirContext.getObject();

          // Update itemsModel
          oItemsModel.setProperty(sPath + "/EditReason", sEditReason);
          oItemsModel.setProperty(sPath + "/LocalStatus", "COMPLETED");
          oItemsModel.setProperty(sPath + "/Approved", "X");

          // CRITICAL FIX: Also update goodsReceiptModel's original ToItems
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();
          
          for (var i = 0; i < aLicensePlates.length; i++) {
            if (aLicensePlates[i].LpId === oItem.LpId) {
              if (aLicensePlates[i].ToDeliveryNotes && aLicensePlates[i].ToDeliveryNotes.results) {
                aLicensePlates[i].ToDeliveryNotes.results.forEach(function(oDN) {
                  if (oDN.ToItems && oDN.ToItems.results) {
                    oDN.ToItems.results.forEach(function(oOriginalItem) {
                      if (oOriginalItem.Material === oItem.Material) {
                        oOriginalItem.EditReason = sEditReason;
                        oOriginalItem.LocalStatus = "COMPLETED";
                        oOriginalItem.Approved = "X";
                      }
                    });
                  }
                });
              }
              
              // Update refresh trigger
              aLicensePlates[i]._refreshTrigger = new Date().getTime();
              oGoodsReceiptModel.setProperty("/" + i + "/_refreshTrigger", aLicensePlates[i]._refreshTrigger);
              break;
            }
          }

          // Backup to localStorage
          var aSelectedDeliveryNotes = this._getSelectedDeliveryNotesForLpId(oItem.LpId);
          this._backupItemToStorage(
            oItem.LpId,
            {
              ...oItem,
              receivedquantity: oItem.ReceivedQuantity,
              baseQuantity: parseFloat(oItem.ReceivedQuantity || "0"),
              palletCount: parseFloat(oItem.PalletCount || "0"),
              crateCount: parseFloat(oItem.CrateCount || "0"),
              unitCount: 0,
              editreason: sEditReason,
              status: "COMPLETED",
              approved: "X",
            },
            aSelectedDeliveryNotes
          );

          oItemsModel.refresh(true);
          oGoodsReceiptModel.refresh(true);

          MessageToast.show("Ürün onaylandı.");
        },

        _performSmartSave: function (sLocalStatus, sApproved) {
          var oSmartModel = this.getView().getModel("smartCountModel");
          var oSmartData = oSmartModel.getData();
          
          var oItemsModel = this.getView().getModel(this._sCurrentItemsModelName);
          var sPath = this._oCurrentSmartContext.getPath();
          var oItem = this._oCurrentSmartContext.getObject();

          // 1. UI Modelini Güncelle (itemsModel - görünen tablo)
          var sTotalStr = oSmartData.totalCalculated.toString();
          
          oItemsModel.setProperty(sPath + "/ReceivedQuantity", sTotalStr);
          oItemsModel.setProperty(sPath + "/PalletCount", oSmartData.palletCount);
          oItemsModel.setProperty(sPath + "/CrateCount", oSmartData.crateCount);
          oItemsModel.setProperty(sPath + "/EditReason", oSmartData.editReason);
          oItemsModel.setProperty(sPath + "/LocalStatus", sLocalStatus); // IP / COMPLETED
          oItemsModel.setProperty(sPath + "/Approved", sApproved); // '' veya 'X'

          // CRITICAL FIX: Also update goodsReceiptModel's original ToItems
          // This is needed for isMalKabulEnabled formatter to see the Approved status
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();
          var aSelectedDeliveryNotes = this._getSelectedDeliveryNotesForLpId(oItem.LpId);
          
          for (var i = 0; i < aLicensePlates.length; i++) {
            if (aLicensePlates[i].LpId === oItem.LpId) {
              if (aLicensePlates[i].ToDeliveryNotes && aLicensePlates[i].ToDeliveryNotes.results) {
                aLicensePlates[i].ToDeliveryNotes.results.forEach(function(oDN) {
                  if (oDN.ToItems && oDN.ToItems.results) {
                    oDN.ToItems.results.forEach(function(oOriginalItem) {
                      if (oOriginalItem.Material === oItem.Material) {
                        // Update the original item in goodsReceiptModel
                        oOriginalItem.ReceivedQuantity = sTotalStr;
                        oOriginalItem.PalletCount = oSmartData.palletCount;
                        oOriginalItem.CrateCount = oSmartData.crateCount;
                        oOriginalItem.EditReason = oSmartData.editReason;
                        oOriginalItem.LocalStatus = sLocalStatus;
                        oOriginalItem.Approved = sApproved;
                      }
                    });
                  }
                });
              }
              break;
            }
          }

          // 2. LocalStorage Kaydı (BUG FIX: Include baseQuantity)
          this._backupItemToStorage(
            oItem.LpId,
            {
              ...oItem,
              receivedquantity: sTotalStr,
              baseQuantity: oSmartData.baseQuantity,
              palletCount: oSmartData.palletCount,
              crateCount: oSmartData.crateCount,
              unitCount: 0,
              editreason: oSmartData.editReason,
              status: sLocalStatus,
              approved: sApproved,
            },
            aSelectedDeliveryNotes
          );

          // Refresh
          oItemsModel.refresh(true);
          
          // BUG FIX: Force re-evaluation of isMalKabulEnabled
          // Update the specific license plate's _refreshTrigger to trigger binding refresh
          for (var i = 0; i < aLicensePlates.length; i++) {
            if (aLicensePlates[i].LpId === oItem.LpId) {
              // Update the property directly and notify binding
              aLicensePlates[i]._refreshTrigger = new Date().getTime();
              oGoodsReceiptModel.setProperty("/" + i + "/_refreshTrigger", aLicensePlates[i]._refreshTrigger);
              break;
            }
          }
          oGoodsReceiptModel.refresh(true);

          this._oSmartDialog.close();
          MessageToast.show(sLocalStatus === "COMPLETED" ? "Sayım tamamlandı." : "Ara kayıt alındı.");
        },

        onSmartDialogCancel: function () {
          this._oSmartDialog.close();
        },

        /**
         * Build distributed payload from aggregated item
         * Distributes the totalCalculated quantity across selected delivery notes
         */
        _buildDistributedPayload: function(oAggregatedItem, sTotalQty, sEditReason, sApproved, aSelectedDeliveryNotes) {
          var aPendingItems = [];
          var fAggregatedReceivedQty = parseFloat(sTotalQty || "0");

          // Find all original items for this material
          var aOriginalItemsForMaterial = [];
          for (var i = 0; i < aSelectedDeliveryNotes.length; i++) {
            var oDeliveryNote = aSelectedDeliveryNotes[i];
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              oDeliveryNote.ToItems.results.forEach(function (oOriginalItem) {
                if (oOriginalItem.Material === oAggregatedItem.Material) {
                  aOriginalItemsForMaterial.push(oOriginalItem);
                }
              });
            }
          }

          if (aOriginalItemsForMaterial.length === 0) return [];

          // Calculate total expected
          var fTotalOriginalExpected = 0;
          aOriginalItemsForMaterial.forEach(function (oItem) {
            fTotalOriginalExpected += parseFloat(oItem.ExpectedQuantity || "0");
          });

          // Distribute proportionally
          var aDistributedAmounts = [];
          var iTotalDistributed = 0;

          aOriginalItemsForMaterial.forEach(function (oOriginalItem) {
            var fOriginalExpected = parseFloat(oOriginalItem.ExpectedQuantity || "0");
            var fProportionalReceived;

            if (fTotalOriginalExpected > 0) {
              fProportionalReceived = (fOriginalExpected / fTotalOriginalExpected) * fAggregatedReceivedQty;
            } else {
              fProportionalReceived = fAggregatedReceivedQty / aOriginalItemsForMaterial.length;
            }

            var iFlooredAmount = Math.floor(fProportionalReceived);
            aDistributedAmounts.push(iFlooredAmount);
            iTotalDistributed += iFlooredAmount;
          });

          // Add remainder to last item
          var iRemainder = Math.floor(fAggregatedReceivedQty) - iTotalDistributed;
          if (aDistributedAmounts.length > 0) {
            aDistributedAmounts[aDistributedAmounts.length - 1] += iRemainder;
          }

          // Build payload items
          aOriginalItemsForMaterial.forEach(function (oOriginalItem, index) {
            aPendingItems.push({
              lpid: oAggregatedItem.LpId,
              deliveryitemid: oOriginalItem.DeliveryItemId,
              receivedquantity: String(aDistributedAmounts[index]),
              approved: sApproved,
              editreason: sEditReason,
            });
          });

          return aPendingItems;
        },

        /**
         * Backup item to localStorage (Safety Buffer)
         * Simplified backup - stores minimal data for crash recovery
         */
        _backupItemToStorage: function(oItem, sTotalQty, sEditReason, sLocalStatus, sApproved, iPalletCount, iCrateCount) {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          
          if (!sSicilNo) return;

          var sKey = sSicilNo + "_" + oItem.DeliveryItemId;
          var oBackup = {
            timestamp: new Date().toISOString(),
            lpid: oItem.LpId,
            deliveryitemid: oItem.DeliveryItemId,
            material: oItem.Material,
            receivedquantity: sTotalQty,
            palletCount: iPalletCount,
            crateCount: iCrateCount,
            editreason: sEditReason,
            localStatus: sLocalStatus,
            approved: sApproved
          };

          try {
            localStorage.setItem(sKey, JSON.stringify(oBackup));
          } catch (e) {
            console.error("Backup failed:", e);
            if (e.name === 'QuotaExceededError') {
              this.getOwnerComponent().cleanOldLocalStorageData();
            }
          }
        },

        /**
         * Clear backup from localStorage after successful backend save
         */
        _clearBackupForItem: function(oItem, aSelectedDeliveryNotes) {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          
          if (!sSicilNo) return;

          // Find all delivery item IDs for this material
          var aKeysToRemove = [];
          for (var i = 0; i < aSelectedDeliveryNotes.length; i++) {
            var oDeliveryNote = aSelectedDeliveryNotes[i];
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              oDeliveryNote.ToItems.results.forEach(function (oOriginalItem) {
                if (oOriginalItem.Material === oItem.Material) {
                  aKeysToRemove.push(sSicilNo + "_" + oOriginalItem.DeliveryItemId);
                }
              });
            }
          }

          // Remove backups
          aKeysToRemove.forEach(function(sKey) {
            localStorage.removeItem(sKey);
            console.log("Backup cleared:", sKey);
          });
        },

        // --- LEGACY STORAGE METHOD (KEPT FOR COMPATIBILITY) ---

        _saveSmartDraftToStorage: function (sLpId, oDraftData, aSelectedDeliveryNotes) {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel
            ? oSessionModel.getProperty("/Login/Username")
            : null;
          
          // Eğer seçili teslimat notu yoksa (Fallback), ana listeden bul
          if (!aSelectedDeliveryNotes || aSelectedDeliveryNotes.length === 0) {
               // Fallback logic already in _getSelectedDeliveryNotesForLpId but safety check
               console.warn("No delivery notes selected for distribution. Check logic.");
          }
          
          // *** DAĞITIM MANTIĞI (MEVCUT MANTIĞIN AYNISI, SADECE YENİ ALANLAR EKLENDİ) ***
          // Burada oDraftData.receivedquantity (Toplam) değeri seçili irsaliyelere dağıtılır.
          
          // Önce ilgili malzemeye ait orijinal kalemleri bul
          var aOriginalItemsForMaterial = [];
          for (var i = 0; i < aSelectedDeliveryNotes.length; i++) {
            var oDeliveryNote = aSelectedDeliveryNotes[i];
            if (oDeliveryNote.ToItems && oDeliveryNote.ToItems.results) {
              var aL3Items = oDeliveryNote.ToItems.results;
              aL3Items.forEach(function (oOriginalItem) {
                if (oOriginalItem.Material === oDraftData.Material) {
                  aOriginalItemsForMaterial.push({
                    item: oOriginalItem,
                    deliveryNote: oDeliveryNote,
                  });
                }
              });
            }
          }
          
          if (aOriginalItemsForMaterial.length === 0) return;

          // Toplam Beklenen
          var fTotalOriginalExpected = 0;
          aOriginalItemsForMaterial.forEach(function (oItemData) {
            fTotalOriginalExpected += parseFloat(oItemData.item.ExpectedQuantity || "0");
          });

          var fAggregatedReceivedQty = parseFloat(oDraftData.receivedquantity || "0");

          // Dağıtım Hesapla
          var aDistributedAmounts = [];
          var iTotalDistributed = 0;

          // BUG FIX: Use Math.round instead of Math.floor for better distribution accuracy
          var iLargestIndex = 0;
          var fLargestExpected = 0;
          
          aOriginalItemsForMaterial.forEach(function (oItemData, index) {
            var fOriginalExpected = parseFloat(oItemData.item.ExpectedQuantity || "0");
            var fProportionalReceived;

            if (fTotalOriginalExpected > 0) {
              fProportionalReceived = (fOriginalExpected / fTotalOriginalExpected) * fAggregatedReceivedQty;
            } else {
              fProportionalReceived = fAggregatedReceivedQty / aOriginalItemsForMaterial.length;
            }

            // Rounded amount for better accuracy
            var iRoundedAmount = Math.round(fProportionalReceived);
            aDistributedAmounts.push(iRoundedAmount);
            iTotalDistributed += iRoundedAmount;
            
            // Track item with largest expected quantity
            if (fOriginalExpected > fLargestExpected) {
              fLargestExpected = fOriginalExpected;
              iLargestIndex = index;
            }
          });

          // Add remainder to item with largest expected quantity to ensure exact match
          var iRemainder = Math.round(fAggregatedReceivedQty) - iTotalDistributed;
          if (aDistributedAmounts.length > 0) {
            aDistributedAmounts[iLargestIndex] += iRemainder;
          }

          // Draftları Kaydet (YENİ ALANLARLA)
          aOriginalItemsForMaterial.forEach(function (oItemData, index) {
            var oOriginalItem = oItemData.item;
            var iProportionalReceived = aDistributedAmounts[index];

            var oDraft = {
               // Temel Alanlar
               lpid: sLpId,
               deliveryitemid: oOriginalItem.DeliveryItemId,
               receivedquantity: String(iProportionalReceived),
               
               // YENİ DETAY ALANLARI (Her parçaya aynısını yazıyoruz ki geri yüklerken biri okunsun)
               palletCount: oDraftData.palletCount,
               crateCount: oDraftData.crateCount,
               unitCount: oDraftData.unitCount,
               localStatus: oDraftData.localStatus, 
               approved: oDraftData.approved,
               editreason: oDraftData.editreason,
               
               timestamp: new Date().toISOString()
            };
            
            var sKey = sSicilNo + "_" + oDraft.deliveryitemid;
            try {
                localStorage.setItem(sKey, JSON.stringify(oDraft));
            } catch(e) { console.error(e); }
          });
        },

        _restoreBackupsIfNeeded: function () {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          if (!sSicilNo) return;

          var sPrefix = sSicilNo + "_";
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();

          // BUG FIX: Iterate backwards to avoid index shift during removeItem
          for (var i = localStorage.length - 1; i >= 0; i--) {
            var sKey = localStorage.key(i);
            if (!sKey || sKey.indexOf(sPrefix) !== 0) continue;
            
            try {
              var oDraft = JSON.parse(localStorage.getItem(sKey));
              if (!oDraft || !oDraft.deliveryitemid) {
                localStorage.removeItem(sKey);
                console.log("Invalid backup deleted:", sKey);
                continue;
              }
              
              // Modeli gez ve eşleşeni bul
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
                          
                          // ONLINE-FIRST LOGIC: Backend wins if has data
                          var fBackendQty = parseFloat(oItem.ReceivedQuantity || "0");
                          
                          if (fBackendQty > 0) {
                            // Backend has data - Backend WINS, delete backup
                            localStorage.removeItem(sKey);
                            console.log("Backend wins, backup deleted:", sKey);
                          } else {
                            // Backend has no data - Restore from BACKUP
                            oItem.ReceivedQuantity = oDraft.receivedquantity;
                            oItem.PalletCount = parseFloat(oDraft.palletCount || "0");
                            oItem.CrateCount = parseFloat(oDraft.crateCount || "0");
                            oItem.EditReason = oDraft.editreason;
                            oItem.LocalStatus = oDraft.localStatus || "";
                            oItem.Approved = oDraft.approved || "";
                            console.log("Backup restored:", sKey);
                          }
                          
                          bFound = true;
                          break;
                        }
                      }
                    }
                  }
                }
              }
              
              // If not found in model, item may have been removed - delete backup
              if (!bFound) {
                localStorage.removeItem(sKey);
                console.log("Orphaned backup deleted:", sKey);
              }
              
            } catch (e) { 
              console.error("Failed to parse backup:", sKey, e);
              // Invalid backup - delete it
              localStorage.removeItem(sKey);
            }
          }
          oGoodsReceiptModel.refresh(true);
        },
        
        _loadEditReasons: function () {
          var oModel = this.getOwnerComponent().getModel();
          var oEditReasonsModel = this.getView().getModel("editReasonsModel");
          if (oEditReasonsModel.getData().length > 0) return;
          oModel.read("/EditReasonSet", {
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
              var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
              if (oGoodsReceiptModel) oGoodsReceiptModel.setData([]);
        },
        
        _loadGoodsReceiptData: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");
            var sWarehouseNum = oSessionModel ? oSessionModel.getProperty("/Login/WarehouseNum") : null;
            var sArrivalDate = oFilterModel ? oFilterModel.getProperty("/selectedDate") : null;
            var oDateForFilter;

            if (!sArrivalDate) {
                var oToday = new Date();
                var sYear = oToday.getFullYear();
                var sMonth = String(oToday.getMonth() + 1).padStart(2, "0");
                var sDay = String(oToday.getDate()).padStart(2, "0");
                sArrivalDate = sYear + sMonth + sDay;
                oDateForFilter = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), 0, 0, 0));
            } else {
                sArrivalDate = sArrivalDate.replace(/-/g, "");
                var aParts = oFilterModel.getProperty("/selectedDate").split("-");
                oDateForFilter = new Date(Date.UTC(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]), 0, 0, 0));
            }

            var aFilters = [
                new Filter("WarehouseNum", FilterOperator.EQ, sWarehouseNum),
                new Filter("ArrivalDate", FilterOperator.EQ, oDateForFilter),
            ];

            oModel.read("/LicensePlateSet", {
                filters: aFilters,
                urlParameters: { $expand: "ToDeliveryNotes/ToItems" },
                success: function (oData) {
                    var aResults = oData.results || [];
                    aResults.forEach(function (oItem) {
                        oItem.expanded = false;
                        oItem._refreshTrigger = 0; // Initialize trigger for Mal Kabul button binding
                        if (oItem.ToDeliveryNotes && oItem.ToDeliveryNotes.results) {
                            oItem.ToDeliveryNotes.results.forEach(function (oDeliveryNote) {
                                oDeliveryNote.selected = false;
                            });
                        }
                    });

                    var oGoodsReceiptModel = new JSONModel(aResults);
                    this.getView().setModel(oGoodsReceiptModel, "goodsReceiptModel");
                    this._loadDraftsFromLocalStorage(); // Load drafts
                    this._updateStatusFilterCounts();
                    var oStatusFilterBar = this.byId("idStatusFilterBar");
                    if (oStatusFilterBar) {
                        oStatusFilterBar.setSelectedKey("pending");
                        this._applyStatusFilter("pending");
                    }
                }.bind(this),
                error: function (oError) {
                     // Error handling
                }.bind(this)
            });
        },
        
        onDeliveryNoteSelect: function (oEvent) {
            if (this._iDelayTimer) clearTimeout(this._iDelayTimer);
            this._iDelayTimer = setTimeout(function () {
                this._calculateAndRenderItems();
            }.bind(this), 200);
        },
        
        onSelectAllDeliveryNotes: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var oCheckBox = oEvent.getSource();
             var oPanel = oCheckBox.getParent().getParent();
             while (oPanel && oPanel.getMetadata().getName() !== "sap.m.Panel") { oPanel = oPanel.getParent(); }
             if (!oPanel) return;
             var oVBoxContainer = oPanel.getContent()[0];
             var oList = oVBoxContainer.getItems()[0];
             var aItems = oList.getItems();
             aItems.forEach(function (oItem) {
                var oBindingContext = oItem.getBindingContext("goodsReceiptModel");
                if (oBindingContext) {
                    var oDeliveryNote = oBindingContext.getObject();
                    if (oDeliveryNote.Status !== "X") {
                        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/selected", bSelected);
                    }
                }
             });
             if (this._iDelayTimer) clearTimeout(this._iDelayTimer);
             this._iDelayTimer = setTimeout(function () {
                 this._calculateAndRenderItems();
             }.bind(this), 200);
        },
        
        _calculateAndRenderItems: function () {
             var oL1List = this.byId("idL1List");
             if (!oL1List) return;
             var aL1Items = oL1List.getItems();
             var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
             var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;

             aL1Items.forEach(function (oL1Item) {
                 var oPanel = oL1Item.getContent()[0];
                 if (!oPanel) return;
                 var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
                 var sLpId = oL1Context.getObject().LpId;
                 var sStatus = oL1Context.getObject().Status;
                 
                 // Per-panel data structures
                 var oMaterialMap = {}; 
                 var oMaterialDeliveryCount = {};
                 var oMaterialApprovedCount = {};
                 var aTotalCounts = {
                    Total1: 0, Total2: 0, Total3: 0, Total4: 0, Total5: 0,
                    Total6: 0, Total7: 0, Total8: 0, Total9: 0, TotalDepozito: 0,
                 };
                 var oCategoryTextMap = {};

                 var oVBoxContainer = oPanel.getContent()[0];
                 if (!oVBoxContainer) return;

                 var oL3Section = oVBoxContainer.getItems()[1];
                 var oIconTabBar = oL3Section ? oL3Section.getItems()[0] : null;
                 var oTable = oL3Section ? oL3Section.getItems()[1] : null;

                 var oL2List = oVBoxContainer.getItems()[0];
                 if (!oL2List) return;

                 var aL2Items = oL2List.getItems();
                 var bHasSelectedInThisPanel = false;

                 aL2Items.forEach(function (oL2Item) {
                      var oChkBox = oL2Item.getContent()[0].getItems ? oL2Item.getContent()[0].getItems()[0] : null;
                      if (oChkBox && oChkBox.getSelected && oChkBox.getSelected()) {
                        bHasSelectedInThisPanel = true;
                        var oCtx = oChkBox.getBindingContext("goodsReceiptModel");
                        if (oCtx) {
                          var oDeliveryNote = oCtx.getObject();
                          var aTextFields = ["Total1Text","Total2Text","Total3Text","Total4Text","Total5Text","Total6Text","Total7Text","Total8Text","Total9Text","TotalDepozitoText"];
                          aTextFields.forEach(function (sTextField) {
                            if (oDeliveryNote[sTextField]) {
                              oCategoryTextMap[sTextField] = oDeliveryNote[sTextField];
                            }
                          });

                          var aL3Items = oCtx.getProperty("ToItems/results");
                          if (aL3Items && aL3Items.length > 0) {
                            aL3Items.forEach(function (oItem) {
                                var sMaterial = oItem.Material;
                                var sKey = sSicilNo + "_" + oItem.DeliveryItemId;
                                var oDraft = null;
                                var sReceivedQtyToUse = oItem.ReceivedQuantity;
                                var sApprovedToUse = oItem.Approved || "";
                                var sEditReasonToUse = oItem.EditReason || "";
                                var sLocalStatus = oItem.LocalStatus || "";

                                if (sSicilNo) {
                                  try {
                                    var sDraftStr = localStorage.getItem(sKey);
                                    if (sDraftStr) {
                                      oDraft = JSON.parse(sDraftStr);
                                      sReceivedQtyToUse = oDraft.receivedquantity || "0";
                                      sApprovedToUse = oDraft.approved || "";
                                      sEditReasonToUse = oDraft.editreason || "";
                                      
                                      if (oDraft.localStatus) {
                                          sLocalStatus = oDraft.localStatus;
                                      } else {
                                          sLocalStatus = (sApprovedToUse === 'X') ? 'COMPLETED' : (parseFloat(sReceivedQtyToUse) > 0 ? 'IP' : '');
                                      }
                                    }
                                  } catch (e) { console.error(e); }
                                }

                                if (oMaterialMap[sMaterial]) {
                                  var fExpectedQty = parseFloat(oMaterialMap[sMaterial].ExpectedQuantity || "0");
                                  var fNewExpectedQty = parseFloat(oItem.ExpectedQuantity || "0");
                                  oMaterialMap[sMaterial].ExpectedQuantity = String(fExpectedQty + fNewExpectedQty);

                                  var fReceivedQty = parseFloat(oMaterialMap[sMaterial].ReceivedQuantity || "0");
                                  var fNewReceivedQty = parseFloat(sReceivedQtyToUse || "0");
                                  oMaterialMap[sMaterial].ReceivedQuantity = String(fReceivedQty + fNewReceivedQty);

                                  oMaterialDeliveryCount[sMaterial] = (oMaterialDeliveryCount[sMaterial] || 0) + 1;
                                  if (sApprovedToUse === "X") {
                                    oMaterialApprovedCount[sMaterial] = (oMaterialApprovedCount[sMaterial] || 0) + 1;
                                  }
                                } else {
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
                                    LocalStatus: sLocalStatus,
                                    Palet: oItem.Palet,
                                    Sepet: oItem.Sepet,
                                    PalletCount: oItem.PalletCount, 
                                    CrateCount: oItem.CrateCount,
                                    UnitCount: oItem.UnitCount
                                  };
                                  oMaterialDeliveryCount[sMaterial] = 1;
                                  oMaterialApprovedCount[sMaterial] = sApprovedToUse === "X" ? 1 : 0;
                                }
                              }.bind(this));
                          }
                        }
                      }
                 }.bind(this));

                 var aItemsToShow = [];
                 for (var sMat in oMaterialMap) {
                    var oAggItem = oMaterialMap[sMat];
                    var iTotalDeliveryItems = oMaterialDeliveryCount[sMat] || 0;
                    var iApprovedDeliveryItems = oMaterialApprovedCount[sMat] || 0;

                    if (iTotalDeliveryItems > 0 && iTotalDeliveryItems === iApprovedDeliveryItems) {
                      oAggItem.Approved = "X";
                      oAggItem.LocalStatus = 'COMPLETED';
                    } else {
                      // If partial, check received quantity
                      if (parseFloat(oAggItem.ReceivedQuantity) > 0 && oAggItem.LocalStatus !== 'COMPLETED') {
                          oAggItem.LocalStatus = 'IP';
                      } else {
                          oAggItem.LocalStatus = '';
                      }
                    }
                    aItemsToShow.push(oAggItem);
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
                      else if (sPrefix === "99") aTotalCounts.TotalDepozito++;
                 });

                 var sModelName = "itemsModel_" + sLpId;
                 var oItemsModel = this.getView().getModel(sModelName);
                 if (!oItemsModel) {
                    oItemsModel = new JSONModel();
                    oItemsModel.setSizeLimit(9999);
                    oItemsModel.setDefaultBindingMode("OneWay");
                    this.getView().setModel(oItemsModel, sModelName);
                 }
                 oItemsModel.setData(aItemsToShow);

                 if (oTable) {
                    var oBinding = oTable.getBinding("items");
                    if (!oBinding || oBinding.getModel().getId() !== oItemsModel.getId()) {
                      oTable.bindItems({
                        path: sModelName + ">/",
                        template: this._createTableItemTemplate(sModelName),
                        templateShareable: false,
                      });
                    } else {
                      oBinding.refresh();
                    }
                 }

                 if (oL3Section) {
                    var bShouldShow = bHasSelectedInThisPanel && aItemsToShow.length > 0;
                    if (bShouldShow && oIconTabBar) {
                      this._updateCategoryFiltersForTabBarMulti(oCategoryTextMap, aTotalCounts, oIconTabBar, sLpId);
                    }
                    setTimeout(function () {
                      oL3Section.setVisible(bShouldShow);
                      if (bShouldShow) {
                        oL3Section.invalidate();
                      }
                    }, 50);
                 }
             }.bind(this));
        },

        _updateCategoryFiltersForTabBarMulti: function (
          oCategoryTextMap,
          aTotalCounts,
          oIconTabBar,
          sLpId
        ) {
          if (!oIconTabBar) {
            return;
          }
          oIconTabBar.data("lpId", sLpId);
          oIconTabBar.destroyItems();
          var iTotalCount = 0;
          for (var key in aTotalCounts) {
            iTotalCount += aTotalCounts[key];
          }
          oIconTabBar.addItem(
            new sap.m.IconTabFilter({
              key: "all",
              text: "Tümü",
              count: iTotalCount,
            })
          );
          oIconTabBar.addItem(new sap.m.IconTabSeparator());
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
            { key: "99", totalField: "TotalDepozito", textField: "TotalDepozitoText" },
          ];
          aCategoryMapping.forEach(function (oMapping) {
            var iCount = aTotalCounts[oMapping.totalField];
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

        _updateCategoryFilterCounts: function (aItems) {},

        onCategoryFilterSelect: function (oEvent) {
          var sSelectedKey = oEvent.getParameter("key");
          var oIconTabBar = oEvent.getSource();
          var sLpId = oIconTabBar.data("lpId");
          if (!sLpId) return;
          var oL3Section = oIconTabBar.getParent();
          if (!oL3Section) return;
          var oTable = oL3Section.getItems()[1];
          if (!oTable) return;
          var oBinding = oTable.getBinding("items");
          if (!oBinding) return;

          if (sSelectedKey === "all") {
            oBinding.filter([]);
          } else {
            var oFilter = new Filter("Kategori", FilterOperator.StartsWith, sSelectedKey);
            oBinding.filter([oFilter]);
          }
        },
        
        onStatusFilterSelect: function (oEvent) {
          var sKey = oEvent.getParameter("key");
          this._collapseAllPanels();
          this._applyStatusFilter(sKey);
        },

        _collapseAllPanels: function () {
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          if (!oGoodsReceiptModel) return;
          var aData = oGoodsReceiptModel.getData();
          if (aData && Array.isArray(aData)) {
            aData.forEach(function (oItem) {
              oItem.expanded = false;
              if (oItem.ToDeliveryNotes && oItem.ToDeliveryNotes.results) {
                oItem.ToDeliveryNotes.results.forEach(function (oDeliveryNote) {
                  oDeliveryNote.selected = false;
                });
              }
            });
            oGoodsReceiptModel.refresh();
          }
          
          if (oGoodsReceiptModel) {
            var aLicensePlates = oGoodsReceiptModel.getData();
            if (aLicensePlates && aLicensePlates.length > 0) {
              aLicensePlates.forEach(function (oLp) {
                  var sModelName = "itemsModel_" + oLp.LpId;
                  var oModel = this.getView().getModel(sModelName);
                  if (oModel) oModel.setData([]);
                }.bind(this));
            }
          }

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

        _applyStatusFilter: function (sStatus) {
          var oList = this.byId("idL1List");
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
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          if (!oGoodsReceiptModel) return;
          var aData = oGoodsReceiptModel.getData() || [];
          var iPendingCount = 0;
          var iCompletedCount = 0;
          aData.forEach(function (oItem) {
            if (oItem.Status === "X") iCompletedCount++;
            else iPendingCount++;
          });
          var oPendingTab = this.byId("idPendingTab");
          var oCompletedTab = this.byId("idCompletedTab");
          if (oPendingTab) oPendingTab.setCount(iPendingCount.toString());
          if (oCompletedTab) oCompletedTab.setCount(iCompletedCount.toString());
        },

        // --- REMOVED onApproveItem since we use Smart Logic now ---
        
        _getSelectedDeliveryNotesForLpId: function (sLpId) {
            var aSelectedDeliveryNotes = [];
            var oL1List = this.byId("idL1List");
            if (!oL1List) return aSelectedDeliveryNotes;
            var aL1Items = oL1List.getItems();
            for (var i = 0; i < aL1Items.length; i++) {
                var oL1Item = aL1Items[i];
                var oPanel = oL1Item.getContent()[0];
                if (!oPanel) continue;
                var oL1Context = oPanel.getBindingContext("goodsReceiptModel");
                if (!oL1Context) continue;
                var oLp = oL1Context.getObject();
                if (oLp.LpId !== sLpId) continue;
                
                var oVBoxContainer = oPanel.getContent()[0];
                if (!oVBoxContainer) continue;
                var oL2List = oVBoxContainer.getItems()[0];
                if (!oL2List) continue;

                var aL2Items = oL2List.getItems();
                aL2Items.forEach(function (oL2Item) {
                    var oChkBox = oL2Item.getContent()[0].getItems ? oL2Item.getContent()[0].getItems()[0] : null;
                    if (oChkBox && oChkBox.getSelected && oChkBox.getSelected()) {
                        var oCtx = oChkBox.getBindingContext("goodsReceiptModel");
                        if (oCtx) aSelectedDeliveryNotes.push(oCtx.getObject());
                    }
                });
                break;
            }
            return aSelectedDeliveryNotes;
        },

        onMalKabulPress: function (oEvent) {
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
          var oLicensePlate = oL1Context.getObject();
          var sLpId = oLicensePlate.LpId;
          this._syncDraftsToBackend(sLpId);
        },

        onPanelExpand: function (oEvent) {
          var oPanel = oEvent.getSource();
          var bExpanded = oEvent.getParameter("expand");
          var oContext = oPanel.getBindingContext("goodsReceiptModel");
          if (!oContext) return;

          if (bExpanded) {
            var aContent = oPanel.getContent();
            if (aContent.length > 0) {
              var oVBox = aContent[0];
              oVBox.setBindingContext(oContext, "goodsReceiptModel");
              var aVBoxItems = oVBox.getItems();
              if (aVBoxItems.length > 0) {
                var oDeliveryNotesList = aVBoxItems[0];
                oDeliveryNotesList.setBindingContext(oContext, "goodsReceiptModel");
                var oListBinding = oDeliveryNotesList.getBinding("items");
                if (oListBinding) {
                  oListBinding.refresh();
                  setTimeout(function () {
                    oDeliveryNotesList.invalidate();
                  }, 50);
                }
              }
              if (aVBoxItems.length > 1) {
                var oL3VBox = aVBoxItems[1];
                oL3VBox.setBindingContext(oContext, "goodsReceiptModel");
                var aL3Items = oL3VBox.getItems();
                if (aL3Items.length > 1) {
                  var oItemsTable = aL3Items[1];
                  oItemsTable.setBindingContext(oContext, "goodsReceiptModel");
                  setTimeout(function () {
                    oItemsTable.invalidate();
                  }, 50);
                }
              }
            }
          }
        },

        onPhotoPress: function (oEvent) {
          if (!navigator.onLine) {
            MessageBox.error("İnternet bağlantısı yok. Fotoğraf yüklenemez.");
            return;
          }
          var oButton = oEvent.getSource();
          var oContext = oButton.getBindingContext("goodsReceiptModel");
          if (!oContext) {
            MessageBox.error("License Plate bilgisi bulunamadı.");
            return;
          }
          var oLicensePlate = oContext.getObject();
          var sLpId = oLicensePlate.LpId;
          var iPhotoCount = parseInt(oLicensePlate.PhotoCount || "0");
          this._oCurrentPhotoContext = oContext;
          this._sCurrentLpId = sLpId;
          var oPhotoModel = this.getView().getModel("photoModel");
          oPhotoModel.setProperty("/lpId", sLpId);
          oPhotoModel.setProperty("/photoCount", iPhotoCount);
          if (!this._oPhotoDialog) {
            this._oPhotoDialog = sap.ui.xmlfragment("photoDialog", "com.sut.bolgeyonetim.view.PhotoUploadDialog", this);
            this.getView().addDependent(this._oPhotoDialog);
          }
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
          var sPath = "/PlatePhotoSet";
          oModel.read(sPath, {
            urlParameters: {
              $filter: "LpId eq '" + sLpId + "'",
              $select: "PhotoId,LpId,FileName,MimeType",
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
              console.warn("Trying to load all photos without filter...");
              oModel.read(sPath, {
                success: function (oData) {
                  var aAllPhotos = oData.results || [];
                  var aFilteredPhotos = aAllPhotos.filter(function (oPhoto) {
                    return oPhoto.LpId === sLpId;
                  });
                  oPhotoModel.setProperty("/photos", aFilteredPhotos);
                  oPhotoModel.setProperty("/photoCount", aFilteredPhotos.length);
                  console.log("Photos loaded (client-side filter):", aFilteredPhotos.length);
                }.bind(this),
                error: function (oErr) {
                  MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoLoadError"));
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
          var oUploadCollection = oEvent.getSource();
          var aSelectedItems = oUploadCollection.getSelectedItems();
          if (!aSelectedItems || aSelectedItems.length === 0) return;
          var oItem = aSelectedItems[0];
          var oContext = oItem.getBindingContext("photoModel");
          if (!oContext) return;
          var oPhoto = oContext.getObject();
          var sPhotoId = oPhoto.PhotoId;
          var sImageUrl = "/sap/opu/odata/sap/ZMM_BOLGE_DEPO_YONETIM_SRV/PlatePhotoSet('" + sPhotoId + "')/$value";
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
            var oLightBoxItem = this._oLightBox.getImageContent()[0];
            oLightBoxItem.setImageSrc(sImageUrl);
            oLightBoxItem.setTitle(oPhoto.FileName || "Fotoğraf");
          }
          this._oLightBox.open();
          setTimeout(function () {
            if (oItem && oItem.setSelected) {
              oItem.setSelected(false);
            }
          }, 100);
        },

        onBeforeUploadStarts: function (oEvent) {
          var oModel = this.getOwnerComponent().getModel();
          oModel.refreshSecurityToken();
          var sToken = oModel.getSecurityToken();
          console.log("CSRF Token:", sToken);
          var sFileName = oEvent.getParameter("fileName");
          var sLpId = this._sCurrentLpId;
          if (!sLpId || !sFileName) {
            MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoInvalidData"));
            oEvent.preventDefault();
            return;
          }
          var sSlug = sLpId + "|" + sFileName;
          var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({ name: "x-csrf-token", value: sToken });
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
          var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({ name: "slug", value: sSlug });
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
          console.log("=== Upload Starting ===");
          console.log("Slug:", sSlug);
          console.log("LpId:", sLpId);
          console.log("FileName:", sFileName);
        },

        onUploadComplete: function (oEvent) {
          console.log("=== Upload Complete ===");
          var mParams = oEvent.getParameters();
          var iStatus = mParams.status || mParams.getParameter("status");
          var sResponse = mParams.response || mParams.getParameter("response");
          if (iStatus === 201) {
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("photoUploadSuccess"));
            this._loadPhotos(this._sCurrentLpId);
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

        onUploadTerminated: function (oEvent) {
          var mParams = oEvent.getParameters();
          var sFileName = mParams.fileName || mParams.getParameter("fileName");
          MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoUploadError") + ": " + sFileName + "\n\nLütfen SAP backend loglarını kontrol edin.");
        },

        onFileChange: function (oEvent) {
          var aFiles = oEvent.getParameter("files");
          if (!aFiles || aFiles.length === 0) return;
          var oFile = aFiles[0];
          var oPhotoModel = this.getView().getModel("photoModel");
          var iPhotoCount = oPhotoModel.getProperty("/photoCount");
          if (iPhotoCount >= 5) {
            MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("photoMaxLimitWarning"));
            oEvent.preventDefault();
            return;
          }
          var iMaxSize = 5 * 1024 * 1024;
          if (oFile.size > iMaxSize) {
            MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoFileSizeError"));
            oEvent.preventDefault();
            return;
          }
        },

        onFileDeleted: function (oEvent) {
          var oItem = oEvent.getParameter("item");
          var sDocumentId = oItem.getDocumentId();
          if (!sDocumentId) {
            MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("photoInvalidId"));
            return;
          }
          this._deletePhoto(sDocumentId);
        },

        _deletePhoto: function (sPhotoId) {
          var oModel = this.getOwnerComponent().getModel();
          var sPath = "/PlatePhotoSet('" + sPhotoId + "')";
          sap.ui.core.BusyIndicator.show(0);
          oModel.remove(sPath, {
            success: function () {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("photoDeleteSuccess"));
              this._loadPhotos(this._sCurrentLpId);
              var oContext = this._oCurrentPhotoContext;
              if (oContext) {
                var sContextPath = oContext.getPath();
                var oGoodsReceiptModel = oContext.getModel();
                var iCurrentCount = parseInt(oContext.getProperty("PhotoCount") || "0");
                oGoodsReceiptModel.setProperty(sContextPath + "/PhotoCount", String(Math.max(0, iCurrentCount - 1)));
              }
            }.bind(this),
            error: function (oError) {
              sap.ui.core.BusyIndicator.hide();
              var sErrorMsg = this.getView().getModel("i18n").getResourceBundle().getText("photoDeleteError");
              if (oError && oError.responseText) {
                try {
                  var oErrorResponse = JSON.parse(oError.responseText);
                  if (oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                    sErrorMsg += "\n\nDetay: " + oErrorResponse.error.message.value;
                  }
                } catch (e) {}
              }
              MessageBox.error(sErrorMsg);
            }.bind(this),
          });
        },

        _getUserId: function () {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          return oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
        },

        // --- REMOVED Deprecated onSavePress ---
        
        _backupItemToStorage: function (
          sLpId,
          oItem,
          sExpectedQuantity,
          sEditReason,
          aSelectedDeliveryNotes
        ) {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          if (!sSicilNo) { console.error("Username not found"); return; }
          if (!sLpId) { console.error("LpId not provided"); return; }

          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();
          var oLicensePlate = null;
          for (var i = 0; i < aLicensePlates.length; i++) {
            if (aLicensePlates[i].LpId === sLpId) {
              oLicensePlate = aLicensePlates[i];
              break;
            }
          }
          if (!oLicensePlate) { console.error("LicensePlate not found"); return; }

          var aDeliveryNotesToUse = aSelectedDeliveryNotes;
          if (!aDeliveryNotesToUse || aDeliveryNotesToUse.length === 0) {
            if (oLicensePlate.ToDeliveryNotes && oLicensePlate.ToDeliveryNotes.results) {
              aDeliveryNotesToUse = oLicensePlate.ToDeliveryNotes.results;
            } else {
              aDeliveryNotesToUse = [];
            }
          }

          var aOriginalItemsForMaterial = [];
          for (var i = 0; i < aDeliveryNotesToUse.length; i++) {
            var oDeliveryNote = aDeliveryNotesToUse[i];
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

          if (aOriginalItemsForMaterial.length === 0) { console.error("No original items found"); return; }

          var fTotalOriginalExpected = 0;
          aOriginalItemsForMaterial.forEach(function (oItemData) {
            fTotalOriginalExpected += parseFloat(oItemData.item.ExpectedQuantity || "0");
          });

          var fAggregatedReceivedQty = parseFloat(oItem.ReceivedQuantity || "0"); // Use the aggregated value passed in oItem

          var aDistributedAmounts = [];
          var iTotalDistributed = 0;
          var iLargestIndex = 0;
          var fLargestExpected = 0;

          // BUG FIX: Use Math.round instead of Math.floor for better accuracy
          aOriginalItemsForMaterial.forEach(function (oItemData, index) {
            var fOriginalExpected = parseFloat(oItemData.item.ExpectedQuantity || "0");
            var fProportionalReceived;
            if (fTotalOriginalExpected > 0) {
              fProportionalReceived = (fOriginalExpected / fTotalOriginalExpected) * fAggregatedReceivedQty;
            } else {
              fProportionalReceived = fAggregatedReceivedQty / aOriginalItemsForMaterial.length;
            }
            var iRoundedAmount = Math.round(fProportionalReceived);
            aDistributedAmounts.push(iRoundedAmount);
            iTotalDistributed += iRoundedAmount;
            
            // Track item with largest expected quantity
            if (fOriginalExpected > fLargestExpected) {
              fLargestExpected = fOriginalExpected;
              iLargestIndex = index;
            }
          });

          // BUG FIX: Add remainder to item with largest ExpectedQuantity to hide rounding noise
          var iRemainder = Math.round(fAggregatedReceivedQty) - iTotalDistributed;
          if (aDistributedAmounts.length > 0) {
            aDistributedAmounts[iLargestIndex] += iRemainder;
          }

          // BUG FIX: Distribute baseQuantity proportionally to avoid multiplication
          // Each item gets its proportional share of baseQuantity based on ExpectedQuantity
          var fTotalBaseQuantity = parseFloat(oItem.baseQuantity || "0");
          var fTotalPalletCount = parseFloat(oItem.palletCount || "0");
          var fTotalCrateCount = parseFloat(oItem.crateCount || "0");
          
          aOriginalItemsForMaterial.forEach(function (oItemData, index) {
            var oOriginalItem = oItemData.item;
            var oDeliveryNote = oItemData.deliveryNote;
            var iProportionalReceived = aDistributedAmounts[index];
            
            // Distribute baseQuantity proportionally
            var fProportionalBase = 0;
            var fProportionalPallet = 0;
            var fProportionalCrate = 0;
            
            if (fTotalOriginalExpected > 0) {
              var fOriginalExpected = parseFloat(oOriginalItem.ExpectedQuantity || "0");
              var fRatio = fOriginalExpected / fTotalOriginalExpected;
              fProportionalBase = fTotalBaseQuantity * fRatio;
              fProportionalPallet = fTotalPalletCount * fRatio;
              fProportionalCrate = fTotalCrateCount * fRatio;
            } else {
              // Equal distribution if no expected quantity
              fProportionalBase = fTotalBaseQuantity / aOriginalItemsForMaterial.length;
              fProportionalPallet = fTotalPalletCount / aOriginalItemsForMaterial.length;
              fProportionalCrate = fTotalCrateCount / aOriginalItemsForMaterial.length;
            }

            var oDraft = {
              timestamp: new Date().toISOString(),
              lpid: oLicensePlate.LpId || "",
              warehousenum: oLicensePlate.WarehouseNum || "",
              platenumber: oLicensePlate.PlateNumber || "",
              arrivaldate: oLicensePlate.ArrivalDate || "",
              werks: oLicensePlate.Werks || "",
              deliveryitemid: oOriginalItem.DeliveryItemId || "",
              deliverynumber: oDeliveryNote.DeliveryNumber || "",
              itemnumber: oOriginalItem.ItemNumber || "",
              material: oOriginalItem.Material || "",
              expectedquantity: oOriginalItem.ExpectedQuantity || "",
              receivedquantity: String(iProportionalReceived),
              baseQuantity: fProportionalBase,
              palletCount: fProportionalPallet,
              crateCount: fProportionalCrate,
              uom: oOriginalItem.UoM || "",
              sm: oOriginalItem.SM || "",
              ebeln: oOriginalItem.Ebeln || "",
              ebelp: oOriginalItem.Ebelp || "",
              approved: oItem.Approved || "",
              editreason: sEditReason || oItem.EditReason || "",
            };

            var sKey = sSicilNo + "_" + oDraft.deliveryitemid;
            try {
              localStorage.setItem(sKey, JSON.stringify(oDraft));
            } catch (e) {
              console.error("Failed to save draft:", e);
              if (e.name === 'QuotaExceededError') {
                this.getOwnerComponent().cleanOldLocalStorageData();
                try {
                  localStorage.setItem(sKey, JSON.stringify(oDraft));
                } catch (e2) {
                  MessageBox.error("Draft kaydedilemedi.");
                }
              } else {
                MessageBox.error("Draft kaydedilemedi.");
              }
            }
          }.bind(this)); // Bind needed for getOwnerComponent call inside loop if any
        },

        _loadDraftsFromLocalStorage: function () {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          if (!sSicilNo) { console.error("Username not found"); return; }

          var sPrefix = sSicilNo + "_";
          var oGoodsReceiptModel = this.getView().getModel("goodsReceiptModel");
          var aLicensePlates = oGoodsReceiptModel.getData();

          for (var i = 0; i < localStorage.length; i++) {
            var sKey = localStorage.key(i);
            if (sKey.indexOf(sPrefix) === 0) {
              try {
                var oDraft = JSON.parse(localStorage.getItem(sKey));
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
                            oItem.ReceivedQuantity = oDraft.receivedquantity;
                            oItem.Approved = oDraft.approved;
                            oItem.EditReason = oDraft.editreason;
                            
                            // Retrieve extended fields if available
                            oItem.PalletCount = parseFloat(oDraft.palletCount || "0");
                            oItem.CrateCount = parseFloat(oDraft.crateCount || "0");
                            oItem.UnitCount = parseFloat(oDraft.unitCount || "0");
                            
                            if (oDraft.localStatus) {
                                oItem.LocalStatus = oDraft.localStatus;
                            } else {
                                oItem.LocalStatus = (oDraft.approved === 'X') ? 'COMPLETED' : (parseFloat(oDraft.receivedquantity) > 0 ? 'IP' : '');
                            }

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
                console.error("Failed to parse draft:", sKey, e);
              }
            }
          }
          oGoodsReceiptModel.refresh(true);
        },

        _refreshHomeDashboard: function () {
          console.log("=== _refreshHomeDashboard called ===");
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");
          if (!oSessionModel || !oFilterModel) { console.warn("Missing models"); return; }
          var oLoginData = oSessionModel.getProperty("/Login");
          if (!oLoginData || !oLoginData.Username || !oLoginData.AuthToken) { console.warn("Missing credentials"); return; }
          
          var sSelectedDate = oFilterModel.getProperty("/selectedDate");
          var oArrivalDate;
          if (sSelectedDate) {
            var aParts = sSelectedDate.split("-");
            oArrivalDate = new Date(Date.UTC(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]), 0, 0, 0));
          } else {
            var oToday = new Date();
            oArrivalDate = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), 0, 0, 0));
          }
          console.log("Calling Login function import with date:", oArrivalDate);
          this.callFunctionImport("Login", {
            urlParameters: {
              Username: oLoginData.Username,
              Password: oLoginData.AuthToken,
              ArrivalDate: oArrivalDate,
            },
          }).then(function (oData) {
            if (!oData || !oData.Login) return;
            var oDashboardModel = this.getOwnerComponent().getModel("dashboardData");
            var oLoginPayload = oData.Login;
            var oDashboardPayload = {
              pendingReceipts: oLoginPayload.PendingGRCount || 0,
              pendingShipments: oLoginPayload.PendingShipAssignCount || 0,
              pendingDeliveries: oLoginPayload.PendingGICount || 0,
              pendingCounts: oLoginPayload.PendingInvCount || 0,
            };
            if (oDashboardModel) {
              oDashboardModel.setData(Object.assign({}, oDashboardModel.getData() || {}, oDashboardPayload));
            }
          }.bind(this)).catch(function (sError) {
             console.error("Failed to refresh dashboard:", sError);
          });
        },

        _syncDraftsToBackend: function (sLpId) {
          var oModel = this.getOwnerComponent().getModel();
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var sSicilNo = oSessionModel ? oSessionModel.getProperty("/Login/Username") : null;
          if (!sSicilNo) { MessageBox.error("Kullanıcı bilgisi bulunamadı."); return; }
          if (!sLpId) { MessageBox.error("License Plate ID bulunamadı."); return; }

          console.log("=== _syncDraftsToBackend Debug ===");
          var sPrefix = sSicilNo + "_";
          var aPendingDrafts = [];
          var aKeysToRemove = [];

          for (var i = 0; i < localStorage.length; i++) {
            var sKey = localStorage.key(i);
            if (sKey.indexOf(sPrefix) === 0) {
              try {
                var oDraft = JSON.parse(localStorage.getItem(sKey));
                if (oDraft.lpid === sLpId) {
                  aPendingDrafts.push(oDraft);
                  aKeysToRemove.push(sKey);
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

          var sJsonPayload = JSON.stringify(aPendingDrafts);
          sap.ui.core.BusyIndicator.show(0);

          oModel.callFunction("/PostGoodsReceipt", {
            method: "POST",
            urlParameters: {
              LpId: sLpId,
              PendingItemsJson: sJsonPayload,
              UserID: sSicilNo,
            },
            success: function (oData, oResponse) {
              sap.ui.core.BusyIndicator.hide();
              aKeysToRemove.forEach(function (sKey) {
                localStorage.removeItem(sKey);
                console.log("Draft removed from localStorage:", sKey);
              });

              // Refresh the goods receipt data to get updated status
              this._loadGoodsReceiptData();
              
              // CRITICAL FIX: Update status filter counts after reload
              // Wait for data to be loaded, then update counts
              setTimeout(function() {
                this._updateStatusFilterCounts();
                
                // Re-apply current filter to show/hide license plates correctly
                var oStatusFilterBar = this.byId("idStatusFilterBar");
                if (oStatusFilterBar) {
                  var sSelectedKey = oStatusFilterBar.getSelectedKey();
                  this._applyStatusFilter(sSelectedKey || "pending");
                }
              }.bind(this), 100);

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