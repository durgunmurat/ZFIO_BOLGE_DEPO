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
      "com.sut.bolgeyonetim.controller.ReturnFactoryShipment",
      {
        onInit: function () {
          var oModel = new JSONModel({
            vehicles: [],
            plants: this._getPlantOptions(),
            items: [],
            categoryFilters: this._getCategoryFilterOptions([]),
            salesFireFilters: this._getSalesFireFilterOptions([]),
            selectedCategoryFilter: "SATIS_FIRESI",
            selectedSalesFireFilter: "SATIS_FIRESI_KATI",
            selectedCompletionFilter: "ALL",
            productSearchQuery: "",
            visibleItemCount: 0,
            uncountedItemCount: 0,
            filterNoDataText: "Se\u00e7ilen tarih ve depo i\u00e7in iade depo sto\u011fu bulunamad\u0131",
            selectedVehicleKey: "",
            vehicleInput: "",
            selectedVehicle: null,
            selectedPlantKey: "",
            warehouse: "",
            sourceWarehouse: "",
            selectedDate: "",
            processId: "",
            totalItemCount: 0,
            confirmedItemCount: 0,
            confirmationTargetCount: 0,
            expandedItemCount: 0,
            canSubmit: false,
            hasStockExceeded: false,
            stockExceededMessage: "",
            isSubmitting: false,
            createAllowed: true,
            createAllowedConsistent: true,
            creationBlocked: false,
            creationBlockMessage: "",
            blockingLogUid: "",
            blockingStatus: "",
            blockingLastStep: "",
            availabilityBusy: false,
            commissionDialog: {
              allMembers: [],
              members: [],
              searchQuery: "",
              selectedCount: 0,
              region: "",
              busy: false,
            },
            productionDefectDialog: {
              items: [],
              reasons: [],
              busy: false,
            },
            extraReturnDialog: {
              itemPath: "",
              materialText: "",
              value: 0,
            },
          });
          oModel.setSizeLimit(9999);
          this.getView().setModel(oModel, "returnFactoryShipmentModel");

          this.getRouter()
            .getRoute("returnFactoryShipment")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        onAfterRendering: function () {
          var $View = this.getView().$();

          $View.off(".returnFactoryZeroSelect");
          $View.on(
            "focusin.returnFactoryZeroSelect",
            ".returnFactoryQuantityInput input",
            function (oEvent) {
              var oInput = oEvent.currentTarget;

              // if (this._toNumber(oInput.value) === 0) {
                setTimeout(function () {
                  oInput.select();
                }, 0);
              // }
            }.bind(this),
          );
        },

        onExit: function () {
          if (this._iProductSearchTimer) {
            clearTimeout(this._iProductSearchTimer);
            this._iProductSearchTimer = null;
          }
          this.getView().$().off(".returnFactoryZeroSelect");
          if (this._oExtraReturnReasonDialog) {
            this._oExtraReturnReasonDialog.$().off(".returnFactoryZeroSelect");
            this._oExtraReturnReasonDialog.destroy();
            this._oExtraReturnReasonDialog = null;
          }
          if (this._oCommissionDialog) {
            this._oCommissionDialog.destroy();
            this._oCommissionDialog = null;
          }
          if (this._oProductionDefectDetailsDialog) {
            this._oProductionDefectDetailsDialog.destroy();
            this._oProductionDefectDetailsDialog = null;
          }
        },

        _onRouteMatched: function () {
          this._loadData();
        },

        onDateChange: function (oEvent) {
          var oDate = oEvent.getSource().getDateValue();
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");

          if (!oDate || !oFilterModel) {
            MessageBox.warning("Geçerli bir tarih seçin.");
            return;
          }

          var sSelectedDate = [
            oDate.getFullYear(),
            String(oDate.getMonth() + 1).padStart(2, "0"),
            String(oDate.getDate()).padStart(2, "0"),
          ].join("-");

          oFilterModel.setProperty("/selectedDate", sSelectedDate);
          oFilterModel.setProperty(
            "/selectedDateFormatted",
            sSelectedDate + "T00:00:00",
          );
          this._loadData();
        },

        _loadData: function () {
          var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");
          var sWarehouseNum = oSessionModel
            ? oSessionModel.getProperty("/Login/WarehouseNum")
            : "";
          var sSelectedDate = oFilterModel
            ? oFilterModel.getProperty("/selectedDate")
            : "";

          if (!sWarehouseNum || !sSelectedDate) {
            MessageBox.error("Depo numarası ve gönderim tarihi zorunludur.");
            return;
          }

          var sSourceWarehouse = this._deriveReturnWarehouse(sWarehouseNum);
          var oViewModel = this.getView().getModel("returnFactoryShipmentModel");
          oViewModel.setData(
            Object.assign({}, oViewModel.getData(), {
              vehicles: [],
              plants: this._getPlantOptions(),
              items: [],
              categoryFilters: this._getCategoryFilterOptions([]),
              salesFireFilters: this._getSalesFireFilterOptions([]),
              selectedCategoryFilter: "SATIS_FIRESI",
              selectedSalesFireFilter: "SATIS_FIRESI_KATI",
              selectedCompletionFilter: "ALL",
              productSearchQuery: "",
              visibleItemCount: 0,
              uncountedItemCount: 0,
              filterNoDataText:
                "Se\u00e7ilen tarih ve depo i\u00e7in iade depo sto\u011fu bulunamad\u0131",
              selectedVehicleKey: "",
              vehicleInput: "",
              selectedVehicle: null,
              selectedPlantKey: "",
              warehouse: sWarehouseNum,
              sourceWarehouse: sSourceWarehouse,
              selectedDate: sSelectedDate,
              processId: this._createProcessId(),
              totalItemCount: 0,
              confirmedItemCount: 0,
              confirmationTargetCount: 0,
              expandedItemCount: 0,
              canSubmit: false,
              hasStockExceeded: false,
              stockExceededMessage: "",
              isSubmitting: false,
              createAllowed: true,
              createAllowedConsistent: true,
              creationBlocked: false,
              creationBlockMessage: "",
              blockingLogUid: "",
              blockingStatus: "",
              blockingLastStep: "",
              availabilityBusy: false,
              commissionDialog: {
                allMembers: [],
                members: [],
                searchQuery: "",
                selectedCount: 0,
                region: "",
                busy: false,
              },
              productionDefectDialog: {
                items: [],
                reasons: [],
                busy: false,
              },
              extraReturnDialog: {
                itemPath: "",
                materialText: "",
                value: 0,
              },
            }),
          );

          sap.ui.core.BusyIndicator.show(0);
          Promise.all([
            this._readVehicles(sWarehouseNum, sSelectedDate),
            this._readItems(sWarehouseNum),
          ])
            .then(
              function (aResults) {
                var aVehicles = aResults[0];
                var aItems = aResults[1];

                oViewModel.setProperty("/vehicles", aVehicles);
                oViewModel.setProperty("/selectedVehicleKey", "");
                oViewModel.setProperty("/vehicleInput", "");
                oViewModel.setProperty("/selectedVehicle", null);
                oViewModel.setProperty("/items", aItems);
                oViewModel.setProperty("/totalItemCount", aItems.length);
                this._applyCreationAvailability(aItems);
                this._updateCategoryFilters();
                this._applyCategoryFilter();
              }.bind(this),
            )
            .catch(
              function (oError) {
                oModel.setProperty("/createAllowed", false);
                oModel.setProperty("/createAllowedConsistent", false);
                oModel.setProperty("/creationBlocked", true);
                oModel.setProperty(
                  "/creationBlockMessage",
                  this.getResourceBundle().getText(
                    "factoryShipmentAvailabilityRefreshError",
                  ),
                );
                this._recalculateSubmitState();
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    "İade gönderim verileri yüklenemedi.",
                  ),
                );
              }.bind(this),
            )
            .finally(function () {
              sap.ui.core.BusyIndicator.hide();
            });
        },

        _readVehicles: function (sWarehouseNum, sSelectedDate) {
          return this._readSet("/ReturnFactoryVehicleSet", [
            new Filter("Lgort", FilterOperator.EQ, sWarehouseNum),
            new Filter("IrsTar", FilterOperator.EQ, this._toODataDate(sSelectedDate)),
          ]).then(
            function (aVehicles) {
              return aVehicles.map(
                function (oVehicle) {
                  var sPlakaNo = oVehicle.PlakaNo || "";

                  return Object.assign({}, oVehicle, {
                    VehicleKey: sPlakaNo,
                    VehicleText: sPlakaNo || "Plaka yok",
                  });
                }.bind(this),
              );
            }.bind(this),
          );
        },

        _readItems: function (sWarehouseNum) {
          return this._readSet("/ReturnFactoryStockSet", [
            new Filter("Lgort", FilterOperator.EQ, sWarehouseNum),
          ]).then(
            function (aItems) {
              return aItems.map(
                function (oItem) {
                  return Object.assign({}, oItem, {
                    MaterialDisplayCode: this._formatMaterialCode(oItem.Matnr),
                    _searchText: this._getProductSearchText(oItem),
                    SapStock: this._toNumber(oItem.SapStock || oItem.Labst),
                    SelectedCategoryCount: this._calculateItemTotal(oItem),
                    MengeSayim: this._calculateItemTotal(oItem),
                    MengeUretimHatali: this._toNumber(oItem.MengeUretimHatali || 0),
                    UretimAltNeden: oItem.UretimAltNeden || "",
                    UretimSkt: oItem.UretimSkt || "",
                    MengeFabrikaLojistik: this._toNumber(oItem.MengeFabrikaLojistik || 0),
                    MengeSatisFireKati: this._toNumber(oItem.MengeSatisFireKati || 0),
                    MengeSatisFireSivi: this._toNumber(oItem.MengeSatisFireSivi || 0),
                    MengeSatisFireUht: this._toNumber(oItem.MengeSatisFireUht || 0),
                    MengeSatisFireCam: this._toNumber(oItem.MengeSatisFireCam || 0),
                    MengeLansman: this._toNumber(oItem.MengeLansman || 0),
                    DifferenceQuantity: this._toNumber(
                      oItem.SapStock || oItem.Labst,
                    ),
                    _expanded: false,
                    _categoryConfirmations: {},
                    _countConfirmed: false,
                    RowHighlight: "None",
                    RowStateText: "",
                    StockExceeded: false,
                  });
                }.bind(this),
              );
            }.bind(this),
          );
        },

        _readSet: function (sPath, aFilters) {
          var oODataModel = this.getOwnerComponent().getModel();

          return new Promise(function (resolve, reject) {
            oODataModel.read(sPath, {
              filters: aFilters,
              success: function (oData) {
                resolve(oData.results || []);
              },
              error: reject,
            });
          });
        },

        _applyCreationAvailability: function (aItems) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aStockItems = aItems || [];
          var oFirst = aStockItems[0] || {};
          var bFirstAllowed = this._toBoolean(oFirst.CreateAllowed, true);
          var sFirstBlockingLogUid = String(oFirst.BlockingLogUid || "");
          var bConsistent = aStockItems.every(
            function (oItem) {
              return (
                this._toBoolean(oItem.CreateAllowed, true) === bFirstAllowed &&
                String(oItem.BlockingLogUid || "") === sFirstBlockingLogUid
              );
            }.bind(this),
          );
          var bCreateAllowed = bConsistent && bFirstAllowed;
          var sStatus = String(oFirst.BlockingStatus || "").toUpperCase();
          var sLastStep = String(oFirst.BlockingLastStep || "").toUpperCase();
          var sBackendMessage = String(oFirst.BlockingMessage || "").trim();
          var sStatusMessage = bConsistent
            ? this._getCreationStatusMessage(sStatus, sLastStep)
            : this.getResourceBundle().getText(
                "factoryShipmentAvailabilityInconsistent",
              );
          var sBlockMessage = [sStatusMessage, sBackendMessage]
            .filter(function (sText, iIndex, aTexts) {
              return sText && aTexts.indexOf(sText) === iIndex;
            })
            .join(" ");

          if (bCreateAllowed) {
            sBlockMessage = "";
          }

          oModel.setProperty("/createAllowed", bCreateAllowed);
          oModel.setProperty("/createAllowedConsistent", bConsistent);
          oModel.setProperty("/creationBlocked", !bCreateAllowed);
          oModel.setProperty("/creationBlockMessage", sBlockMessage);
          oModel.setProperty("/blockingLogUid", sFirstBlockingLogUid);
          oModel.setProperty("/blockingStatus", sStatus);
          oModel.setProperty("/blockingLastStep", sLastStep);
        },

        _getCreationStatusMessage: function (sStatus, sLastStep) {
          var sStatusKey = sLastStep || sStatus;
          var mMessageKeys = {
            WAIT_APPROVAL: "factoryShipmentBlockedWaitApproval",
            QUEUED: "factoryShipmentBlockedQueued",
            RUNNING: "factoryShipmentBlockedRunning",
            ERROR: "factoryShipmentBlockedError",
            REJECTED: "factoryShipmentAllowedRejected",
            COMPLETE: "factoryShipmentAllowedComplete",
            P: "factoryShipmentBlockedWaitApproval",
            R: "factoryShipmentAllowedRejected",
            S: "factoryShipmentAllowedComplete",
            E: "factoryShipmentBlockedError",
          };

          return mMessageKeys[sStatusKey]
            ? this.getResourceBundle().getText(mMessageKeys[sStatusKey])
            : "";
        },

        _refreshStockAvailabilityPreservingEntries: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var sWarehouse = oModel.getProperty("/warehouse");
          var aCurrentItems = oModel.getProperty("/items") || [];

          oModel.setProperty("/availabilityBusy", true);
          return this._readItems(sWarehouse)
            .then(
              function (aFreshItems) {
                var mFreshByMaterial = {};
                aFreshItems.forEach(function (oItem) {
                  mFreshByMaterial[oItem.Matnr] = oItem;
                });
                aCurrentItems.forEach(function (oItem, iIndex) {
                  var oFreshItem = mFreshByMaterial[oItem.Matnr];
                  if (!oFreshItem) {
                    return;
                  }
                  [
                    "SapStock",
                    "Labst",
                    "Meins",
                    "CreateAllowed",
                    "BlockingLogUid",
                    "BlockingStatus",
                    "BlockingLastStep",
                    "BlockingMessage",
                  ].forEach(function (sProperty) {
                    if (oFreshItem[sProperty] !== undefined) {
                      oItem[sProperty] = oFreshItem[sProperty];
                      oModel.setProperty(
                        "/items/" + iIndex + "/" + sProperty,
                        oFreshItem[sProperty],
                      );
                    }
                  });
                });
                this._applyCreationAvailability(aFreshItems);
                this._recalculateSubmitState();
              }.bind(this),
            )
            .catch(
              function (oError) {
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    this.getResourceBundle().getText(
                      "factoryShipmentAvailabilityRefreshError",
                    ),
                  ),
                );
              }.bind(this),
            )
            .then(function () {
              oModel.setProperty("/availabilityBusy", false);
            });
        },

        onVehicleChange: function (oEvent) {
          var oSelect = oEvent.getSource();
          var sSelectedKey = oSelect.getSelectedKey();
          var oSelectedItem = oSelect.getSelectedItem();
          var sEnteredPlate = oSelect.getValue
            ? String(oSelect.getValue() || "").trim().toUpperCase()
            : "";

          if (!sSelectedKey && oSelectedItem) {
            sSelectedKey = oSelectedItem.getKey();
          }

          if (!sSelectedKey) {
            sSelectedKey = sEnteredPlate;
          }

          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aVehicles = oModel.getProperty("/vehicles") || [];
          var oVehicle =
            (sSelectedKey &&
              aVehicles.find(function (oItem) {
                return oItem.VehicleKey === sSelectedKey;
              })) ||
            (sSelectedKey
              ? {
                  VehicleKey: sSelectedKey,
                  VehicleText: sSelectedKey,
                  PlakaNo: sSelectedKey,
                  IsManualEntry: true,
                }
              : null);

          oModel.setProperty("/selectedVehicleKey", sSelectedKey);
          oModel.setProperty(
            "/vehicleInput",
            oVehicle ? oVehicle.PlakaNo || sSelectedKey : "",
          );
          oModel.setProperty("/selectedVehicle", oVehicle);
          this._recalculateSubmitState();
        },

        onPlantChange: function (oEvent) {
          var oSelect = oEvent.getSource();
          var sSelectedKey = oSelect.getSelectedKey();
          var oSelectedItem = oSelect.getSelectedItem();

          if (!sSelectedKey && oSelectedItem) {
            sSelectedKey = oSelectedItem.getKey();
          }

          this.getView()
            .getModel("returnFactoryShipmentModel")
            .setProperty("/selectedPlantKey", sSelectedKey);
          this._recalculateSubmitState();
        },

        onCategoryFilterPress: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");
          var sFilterKey = oContext ? oContext.getProperty("key") : "ALL";

          this.getView()
            .getModel("returnFactoryShipmentModel")
            .setProperty("/selectedCategoryFilter", sFilterKey || "ALL");
          if (sFilterKey !== "ALL" && sFilterKey !== "DIGER") {
            this._setAllItemExpansion(false, true);
          }
          this._applyCategoryFilter();
        },

        onSalesFireFilterPress: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");
          var sFilterKey = oContext
            ? oContext.getProperty("key")
            : "SATIS_FIRESI_KATI";

          this.getView()
            .getModel("returnFactoryShipmentModel")
            .setProperty(
              "/selectedSalesFireFilter",
              sFilterKey || "SATIS_FIRESI_KATI",
            );
          this._applyCategoryFilter();
        },

        onCompletionFilterPress: function (oEvent) {
          var sFilterKey = oEvent.getParameter("pressed")
            ? "UNCOUNTED"
            : "ALL";

          this.getView()
            .getModel("returnFactoryShipmentModel")
            .setProperty("/selectedCompletionFilter", sFilterKey);
          this._applyCategoryFilter();
        },

        onProductSearch: function (oEvent) {
          var sQuery =
            oEvent.getParameter("newValue") !== undefined
              ? oEvent.getParameter("newValue")
              : oEvent.getParameter("query");

          this.getView()
            .getModel("returnFactoryShipmentModel")
            .setProperty("/productSearchQuery", sQuery || "");
          clearTimeout(this._iProductSearchTimer);
          if (oEvent.getParameter("query") !== undefined) {
            this._applyCategoryFilter();
            return;
          }
          this._iProductSearchTimer = setTimeout(
            function () {
              this._iProductSearchTimer = null;
              this._applyCategoryFilter();
            }.bind(this),
            150,
          );
        },

        _getCategoryFilterDefinitions: function () {
          return [
            {
              key: "SATIS_FIRESI",
              label: "Sat\u0131\u015f Firesi",
              fields: [
                "MengeSatisFireKati",
                "MengeSatisFireSivi",
                "MengeSatisFireUht",
                "MengeSatisFireCam",
              ],
            },
            {
              key: "URETIM_HATALI",
              label: "\u00dcretim Hatal\u0131",
              field: "MengeUretimHatali",
            },
            {
              key: "FABRIKA_LOJISTIK",
              label: "Fabrika Lojistik",
              field: "MengeFabrikaLojistik",
            },
            { key: "DIGER", label: "Di\u011fer", isOther: true },
            { key: "ALL", label: "Hepsi", field: "" },
          ];
        },

        _getSalesFireFilterDefinitions: function () {
          return [
            {
              key: "SATIS_FIRESI_KATI",
              label: "Kat\u0131",
              field: "MengeSatisFireKati",
            },
            {
              key: "SATIS_FIRESI_SIVI",
              label: "S\u0131v\u0131",
              field: "MengeSatisFireSivi",
            },
            {
              key: "SATIS_FIRESI_UHT",
              label: "UHT",
              field: "MengeSatisFireUht",
            },
            {
              key: "SATIS_FIRESI_CAM",
              label: "Cam",
              field: "MengeSatisFireCam",
            },
            {
              key: "SATIS_FIRESI_ALL",
              label: "Hepsi",
              fields: [
                "MengeSatisFireKati",
                "MengeSatisFireSivi",
                "MengeSatisFireUht",
                "MengeSatisFireCam",
              ],
            },
          ];
        },

        _getCategoryCount: function (oItem, oDefinition) {
          if (oDefinition.isOther) {
            return Math.max(
              this._toNumber(oItem.SapStock) - this._calculateItemTotal(oItem),
              0,
            );
          }

          if (oDefinition.field) {
            return this._toNumber(oItem[oDefinition.field]);
          }

          if (oDefinition.fields) {
            return oDefinition.fields.reduce(
              function (fTotal, sField) {
                return fTotal + this._toNumber(oItem[sField]);
              }.bind(this),
              0,
            );
          }

          return this._calculateItemTotal(oItem);
        },

        _getActiveConfirmationFields: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var sCategoryKey =
            oModel.getProperty("/selectedCategoryFilter") || "ALL";
          var oDefinition;

          if (sCategoryKey === "ALL" || sCategoryKey === "DIGER") {
            return null;
          }

          oDefinition = this._getCategoryFilterDefinitions().find(
            function (oItem) {
              return oItem.key === sCategoryKey;
            },
          );

          if (sCategoryKey === "SATIS_FIRESI") {
            var sSalesFireKey =
              oModel.getProperty("/selectedSalesFireFilter") ||
              "SATIS_FIRESI_KATI";
            oDefinition = this._getSalesFireFilterDefinitions().find(
              function (oItem) {
                return oItem.key === sSalesFireKey;
              },
            );
          }

          if (!oDefinition) {
            return null;
          }

          if (oDefinition.isOther) {
            return ["_other"];
          }

          return oDefinition.fields || [oDefinition.field];
        },

        _getRequiredConfirmationFields: function (oItem) {
          var aFields = [
            "MengeUretimHatali",
            "MengeFabrikaLojistik",
            "MengeSatisFireKati",
            "MengeSatisFireSivi",
            "MengeSatisFireUht",
            "MengeSatisFireCam",
            "MengeLansman",
          ].filter(
            function (sField) {
              return this._toNumber(oItem[sField]) > 0;
            }.bind(this),
          );

          return aFields.length ? aFields : ["_item"];
        },

        _getApplicableConfirmationFields: function (oItem, aScopeFields) {
          if (!aScopeFields) {
            return this._getRequiredConfirmationFields(oItem);
          }

          if (aScopeFields.indexOf("_other") !== -1) {
            return this._toNumber(oItem.SapStock) - this._calculateItemTotal(oItem) > 0
              ? ["_item"]
              : [];
          }

          return aScopeFields.filter(
            function (sField) {
              return this._toNumber(oItem[sField]) > 0;
            }.bind(this),
          );
        },

        _isItemConfirmedForScope: function (oItem, aScopeFields) {
          var aFields = this._getApplicableConfirmationFields(
            oItem,
            aScopeFields,
          );
          var oConfirmations = oItem._categoryConfirmations || {};

          return (
            aFields.length > 0 &&
            aFields.every(function (sField) {
              return oConfirmations[sField] === true;
            })
          );
        },

        _setItemConfirmationForScope: function (
          oModel,
          sItemPath,
          oItem,
          aScopeFields,
          bConfirmed,
          bSilent,
        ) {
          var aFields = this._getApplicableConfirmationFields(
            oItem,
            aScopeFields,
          );
          var oConfirmations = Object.assign(
            {},
            oItem._categoryConfirmations || {},
          );

          aFields.forEach(function (sField) {
            oConfirmations[sField] = bConfirmed;
          });
          oItem._categoryConfirmations = oConfirmations;
          if (!bSilent) {
            oModel.setProperty(
              sItemPath + "/_categoryConfirmations",
              oConfirmations,
            );
          }
        },

        _clearItemConfirmation: function (oModel, sItemPath, oItem, sField) {
          var oConfirmations = Object.assign(
            {},
            oItem._categoryConfirmations || {},
          );

          oConfirmations[sField] = false;
          oItem._categoryConfirmations = oConfirmations;
          oModel.setProperty(
            sItemPath + "/_categoryConfirmations",
            oConfirmations,
          );
        },

        _getCategoryFilterOptions: function (aItems) {
          var aProductItems = aItems || [];

          return this._getCategoryFilterDefinitions().map(
            function (oDefinition) {
              var iCount = oDefinition.field || oDefinition.fields || oDefinition.isOther
                ? aProductItems.filter(
                    function (oItem) {
                      return this._getCategoryCount(oItem, oDefinition) > 0;
                    }.bind(this),
                  ).length
                : aProductItems.length;

              return Object.assign({}, oDefinition, {
                count: iCount,
                text: oDefinition.label + " (" + iCount + ")",
              });
            }.bind(this),
          );
        },

        _getSalesFireFilterOptions: function (aItems) {
          var aProductItems = aItems || [];

          return this._getSalesFireFilterDefinitions().map(
            function (oDefinition) {
              var iCount = aProductItems.filter(
                function (oItem) {
                  return this._getCategoryCount(oItem, oDefinition) > 0;
                }.bind(this),
              ).length;

              return Object.assign({}, oDefinition, {
                count: iCount,
                text: oDefinition.label + " (" + iCount + ")",
              });
            }.bind(this),
          );
        },

        _updateCategoryFilters: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];

          oModel.setProperty(
            "/categoryFilters",
            this._getCategoryFilterOptions(aItems),
          );
          oModel.setProperty(
            "/salesFireFilters",
            this._getSalesFireFilterOptions(aItems),
          );
        },

        _applyCategoryFilter: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var sFilterKey = oModel.getProperty("/selectedCategoryFilter") || "ALL";
          var aDefinitions = this._getCategoryFilterDefinitions();
          var oDefinition = aDefinitions.find(function (oItem) {
            return oItem.key === sFilterKey;
          });
          var sSalesFireFilterKey =
            oModel.getProperty("/selectedSalesFireFilter") ||
            "SATIS_FIRESI_KATI";
          var oList = this.byId("returnFactoryProductList");
          var oBinding = oList && oList.getBinding("items");
          var aItems = oModel.getProperty("/items") || [];
          var sSearchQuery = this._normalizeSearchText(
            oModel.getProperty("/productSearchQuery"),
          );
          var sCompletionFilter =
            oModel.getProperty("/selectedCompletionFilter") || "ALL";
          var aBindingFilters = [];
          var aVisibleItems = aItems;
          var aConfirmationFields = this._getActiveConfirmationFields();

          if (!oDefinition) {
            oDefinition = aDefinitions[0];
            oModel.setProperty("/selectedCategoryFilter", "ALL");
          }

          if (oDefinition.key === "SATIS_FIRESI") {
            oDefinition =
              this._getSalesFireFilterDefinitions().find(function (oItem) {
                return oItem.key === sSalesFireFilterKey;
              }) || this._getSalesFireFilterDefinitions()[0];
          }

          aItems.forEach(
            function (oItem) {
              var fSelectedCount = this._getCategoryCount(oItem, oDefinition);
              oItem.SelectedCategoryCount = fSelectedCount;
              oItem._countConfirmed = this._isItemConfirmedForScope(
                oItem,
                aConfirmationFields,
              );
              oItem._matchesSelectedCategory =
                !(oDefinition.field || oDefinition.fields || oDefinition.isOther) ||
                fSelectedCount > 0;
            }.bind(this),
          );

          if (oDefinition.field || oDefinition.fields || oDefinition.isOther) {
            aVisibleItems = aVisibleItems.filter(
              function (oItem) {
                return oItem._matchesSelectedCategory;
              },
            );
            aBindingFilters.push(
              new Filter("_matchesSelectedCategory", FilterOperator.EQ, true),
            );
          }

          if (sCompletionFilter !== "ALL") {
            aVisibleItems = aVisibleItems.filter(function (oItem) {
              return oItem._countConfirmed === false;
            });
            aBindingFilters.push(
              new Filter("_countConfirmed", FilterOperator.EQ, false),
            );
          }

          if (sSearchQuery) {
            aVisibleItems = aVisibleItems.filter(function (oItem) {
              return String(oItem._searchText || "").indexOf(sSearchQuery) !== -1;
            });
            aBindingFilters.push(
              new Filter("_searchText", FilterOperator.Contains, sSearchQuery),
            );
          }

          if (oBinding) {
            oBinding.filter(aBindingFilters, "Application");
          }

          oModel.setProperty("/visibleItemCount", aVisibleItems.length);
          this._recalculateSubmitState(true);
          oModel.setProperty(
            "/filterNoDataText",
            sSearchQuery
              ? "Arama ve kategori kriterlerine uygun \u00fcr\u00fcn bulunamad\u0131."
              : oDefinition.field || oDefinition.fields || oDefinition.isOther
                ? oDefinition.label + " kategorisinde \u00fcr\u00fcn bulunamad\u0131."
                : "Se\u00e7ilen tarih ve depo i\u00e7in iade depo sto\u011fu bulunamad\u0131",
          );
          oModel.checkUpdate(false);
        },

        _normalizeSearchText: function (vValue) {
          return String(vValue || "")
            .toLocaleLowerCase("tr-TR")
            .trim();
        },

        _getProductSearchText: function (oItem) {
          return this._normalizeSearchText(
            [
              oItem.Matnr || "",
              this._formatMaterialCode(oItem.Matnr),
              oItem.Maktx || "",
            ].join(" "),
          );
        },

        onFilteredCountChange: function (oEvent) {
          var oInput = oEvent.getSource();
          var oContext = oInput.getBindingContext(
            "returnFactoryShipmentModel",
          );
          var oModel = oContext.getModel();
          var sPath = oContext.getPath();
          var oItem = oContext.getObject();
          var aCategoryFields = this._getActiveConfirmationFields();
          var aPopulatedFields;
          var sCategoryField;
          var fPreviousValue;
          var fNewValue = this._toNumber(oEvent.getParameter("value"));

          if (!aCategoryFields || oItem._countConfirmed) {
            this._applyCategoryFilter();
            return;
          }

          fPreviousValue = aCategoryFields.reduce(
            function (fTotal, sField) {
              return fTotal + this._toNumber(oItem[sField]);
            }.bind(this),
            0,
          );
          aPopulatedFields = aCategoryFields.filter(
            function (sField) {
              return this._toNumber(oItem[sField]) > 0;
            }.bind(this),
          );

          if (aCategoryFields.length === 1) {
            sCategoryField = aCategoryFields[0];
          } else if (aPopulatedFields.length === 1) {
            sCategoryField = aPopulatedFields[0];
          } else {
            oModel.setProperty(sPath + "/SelectedCategoryCount", fPreviousValue);
            oInput.setValue(fPreviousValue);
            MessageBox.warning(
              "Bu üründe birden fazla Satış Firesi türü var. Miktarı değiştirmek için Katı, Sıvı, UHT veya Cam alt kategorisini seçin.",
            );
            return;
          }

          if (fNewValue < 0) {
            fNewValue = 0;
            oInput.setValue("0");
            oInput.setValueState("Error");
            oInput.setValueStateText("Negatif miktar girilemez.");
          } else {
            oInput.setValueState("None");
          }

          oItem[sCategoryField] = fNewValue;
          oModel.setProperty(sPath + "/" + sCategoryField, fNewValue);
          this._clearItemConfirmation(
            oModel,
            sPath,
            oItem,
            sCategoryField,
          );

          var fTotal = this._calculateItemTotal(oItem);
          oItem.MengeSayim = fTotal;
          oModel.setProperty(sPath + "/MengeSayim", fTotal);
          this._updateItemState(oModel, sPath, oItem);
          this._updateCategoryFilters();
          this._applyCategoryFilter();
        },

        onCountChange: function (oEvent) {
          var oInput = oEvent.getSource();
          var oContext = oInput.getBindingContext("returnFactoryShipmentModel");
          var oModel = oContext.getModel();
          var sPath = oContext.getPath();
          var oItem = oContext.getObject();
          var oValueBinding = oInput.getBinding("value");
          var sQuantityPath = oValueBinding && oValueBinding.getPath();
          var fNewValue = this._toNumber(oEvent.getParameter("value"));

          if (oItem._countConfirmed) {
            if (sQuantityPath) {
              oInput.setValue(oItem[sQuantityPath]);
            }
            return;
          }

          if (fNewValue < 0) {
            fNewValue = 0;
            oInput.setValue("0");
            oInput.setValueState("Error");
            oInput.setValueStateText("Negatif miktar girilemez.");
          } else {
            oInput.setValueState("None");
          }

          if (sQuantityPath) {
            oModel.setProperty(sPath + "/" + sQuantityPath, fNewValue);
            oItem[sQuantityPath] = fNewValue;
          }

          var fTotal =
            this._toNumber(oItem.MengeUretimHatali) +
            this._toNumber(oItem.MengeFabrikaLojistik) +
            this._toNumber(oItem.MengeSatisFireKati) +
            this._toNumber(oItem.MengeSatisFireSivi) +
            this._toNumber(oItem.MengeSatisFireUht) +
            this._toNumber(oItem.MengeSatisFireCam) +
            this._toNumber(oItem.MengeLansman);
          oModel.setProperty(sPath + "/MengeSayim", fTotal);
          if (sQuantityPath) {
            this._clearItemConfirmation(
              oModel,
              sPath,
              oItem,
              sQuantityPath,
            );
          }
          oItem.MengeSayim = fTotal;
          this._updateItemState(oModel, sPath, oItem);
          this._updateCategoryFilters();
          this._applyCategoryFilter();
        },

        onExtraReturnReasonPress: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");
          var oItem = oContext && oContext.getObject();
          var oModel = this.getView().getModel("returnFactoryShipmentModel");

          if (!oContext || !oItem || oItem._countConfirmed) {
            return;
          }

          oModel.setProperty("/extraReturnDialog", {
            itemPath: oContext.getPath(),
            materialText:
              (oItem.Maktx || "") +
              (oItem.MaterialDisplayCode
                ? " (" + oItem.MaterialDisplayCode + ")"
                : ""),
            value: this._toNumber(oItem.MengeLansman),
          });

          if (!this._oExtraReturnReasonDialog) {
            this._oExtraReturnReasonDialog = sap.ui.xmlfragment(
              "returnFactoryExtraReason",
              "com.sut.bolgeyonetim.view.ExtraReturnReasonDialog",
              this,
            );
            this.getView().addDependent(this._oExtraReturnReasonDialog);
          }

          this._oExtraReturnReasonDialog.open();
        },

        onExtraReturnReasonAfterOpen: function () {
          var $Dialog = this._oExtraReturnReasonDialog.$();

          $Dialog.off(".returnFactoryZeroSelect");
          $Dialog.on(
            "focusin.returnFactoryZeroSelect",
            ".returnFactoryQuantityInput input",
            function (oEvent) {
              var oInput = oEvent.currentTarget;

              setTimeout(function () {
                oInput.select();
              }, 0);
            },
          );
        },

        onExtraReturnReasonSave: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var sItemPath = oModel.getProperty("/extraReturnDialog/itemPath");
          var vValue = oModel.getProperty("/extraReturnDialog/value");
          var fValue = this._toNumber(vValue);
          var oItem = sItemPath ? oModel.getProperty(sItemPath) : null;

          if (!oItem) {
            this._oExtraReturnReasonDialog.close();
            return;
          }

          if (fValue < 0) {
            MessageBox.warning("Negatif miktar girilemez.");
            return;
          }

          if (oItem._countConfirmed) {
            MessageBox.warning("Tamamlanan kalem de\u011fi\u015ftirilemez.");
            this._oExtraReturnReasonDialog.close();
            return;
          }

          oModel.setProperty(sItemPath + "/MengeLansman", fValue);
          oItem.MengeLansman = fValue;

          var fTotal = this._calculateItemTotal(oItem);
          oModel.setProperty(sItemPath + "/MengeSayim", fTotal);
          this._clearItemConfirmation(
            oModel,
            sItemPath,
            oItem,
            "MengeLansman",
          );
          oItem.MengeSayim = fTotal;
          this._updateItemState(oModel, sItemPath, oItem);
          this._updateCategoryFilters();
          this._applyCategoryFilter();
          this._oExtraReturnReasonDialog.close();
        },

        onExtraReturnReasonCancel: function () {
          if (this._oExtraReturnReasonDialog) {
            this._oExtraReturnReasonDialog.close();
          }
        },

        _calculateItemTotal: function (oItem) {
          return (
            this._toNumber(oItem.MengeUretimHatali) +
            this._toNumber(oItem.MengeFabrikaLojistik) +
            this._toNumber(oItem.MengeSatisFireKati) +
            this._toNumber(oItem.MengeSatisFireSivi) +
            this._toNumber(oItem.MengeSatisFireUht) +
            this._toNumber(oItem.MengeSatisFireCam) +
            this._toNumber(oItem.MengeLansman)
          );
        },

        onCountConfirmed: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");
          var bSelected = oEvent.getParameter("selected");
          var oItem = oContext.getObject();
          var aConfirmationFields = this._getActiveConfirmationFields();

          this._setItemConfirmationForScope(
            oContext.getModel(),
            oContext.getPath(),
            oItem,
            aConfirmationFields,
            bSelected,
          );
          this._applyCategoryFilter();
        },

        onConfirmAllCountsPress: function (oEvent) {
          var vConfirmed = oEvent.getSource().data("confirmed");
          var bConfirmed = vConfirmed === true || vConfirmed === "true";
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var aConfirmationFields = this._getActiveConfirmationFields();

          if (!oModel.getProperty("/createAllowed")) {
            return;
          }

          aItems.forEach(
            function (oItem, iIndex) {
              this._setItemConfirmationForScope(
                oModel,
                "/items/" + iIndex,
                oItem,
                aConfirmationFields,
                bConfirmed,
                true,
              );
            }.bind(this),
          );
          this._applyCategoryFilter();
        },

        onFactoryItemTogglePress: function (oEvent) {
          var oViewModel = this.getView().getModel(
            "returnFactoryShipmentModel",
          );
          if (
            ["ALL", "DIGER"].indexOf(
              oViewModel.getProperty("/selectedCategoryFilter"),
            ) === -1
          ) {
            return;
          }
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");

          if (!oContext) {
            return;
          }

          var oModel = oContext.getModel();
          var sExpandedPath = oContext.getPath() + "/_expanded";
          oModel.setProperty(
            sExpandedPath,
            oModel.getProperty(sExpandedPath) !== true,
          );
          this._recalculateSubmitState();
        },

        onExpandAllItemsPress: function (oEvent) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          if (
            ["ALL", "DIGER"].indexOf(
              oModel.getProperty("/selectedCategoryFilter"),
            ) === -1
          ) {
            return;
          }
          var vExpanded = oEvent.getSource().data("expanded");
          var bExpanded = vExpanded === true || vExpanded === "true";

          this._setAllItemExpansion(bExpanded);
        },

        _setAllItemExpansion: function (bExpanded, bSkipUpdate) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var bOtherSelected =
            oModel.getProperty("/selectedCategoryFilter") === "DIGER";

          aItems.forEach(function (oItem) {
            if (!bOtherSelected || oItem._matchesSelectedCategory) {
              oItem._expanded = bExpanded;
            }
          });
          if (bSkipUpdate) {
            return;
          }
          this._recalculateSubmitState(true);
          oModel.checkUpdate(false);
        },

        _updateItemState: function (oModel, sPath, oItem) {
          var fCount = this._toNumber(oItem.MengeSayim);
          var fStock = this._toNumber(oItem.SapStock);
          var bDifferent = fCount !== fStock;
          var bExceeded = fCount > fStock;
          var fDifference = fStock - fCount;

          oItem.RowHighlight = bExceeded
            ? "Error"
            : oItem._countConfirmed
              ? "Success"
              : "None";
          oItem.StockExceeded = bExceeded;
          oItem.DifferenceQuantity = fDifference;
          oItem.RowState = bExceeded
            ? "Error"
            : oItem._countConfirmed
              ? "Success"
              : "None";
          oItem.RowStateText = bExceeded
            ? "Sayım iade depo stoğundan fazla. Gönderim yapılamaz."
            : oItem._countConfirmed
              ? "Sayım tamamlandı."
              : bDifferent
                ? "Iade depo stoğundan eksik; gönderime izin verilir."
                : "Iade depo stoğu ile eşit.";
        },

        _recalculateSubmitState: function (bSkipCheckUpdate) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var sSelectedVehicleKey = oModel.getProperty("/selectedVehicleKey");
          var oSelectedVehicle = oModel.getProperty("/selectedVehicle");
          var sSelectedPlantKey = oModel.getProperty("/selectedPlantKey");
          var iConfirmed = 0;
          var iConfirmationTarget = 0;
          var iFullyConfirmed = 0;
          var iExpanded = 0;
          var iStockExceededItemCount = 0;
          var aConfirmationFields = this._getActiveConfirmationFields();

          if (!sSelectedVehicleKey && oSelectedVehicle) {
            sSelectedVehicleKey = oSelectedVehicle.VehicleKey || "";
            oModel.setProperty("/selectedVehicleKey", sSelectedVehicleKey);
          }

          aItems.forEach(
            function (oItem, iIndex) {
              var sPath = "/items/" + iIndex;
              this._updateItemState(oModel, sPath, oItem);
              if (
                this._getApplicableConfirmationFields(
                  oItem,
                  aConfirmationFields,
                ).length > 0
              ) {
                iConfirmationTarget++;
                if (
                  this._isItemConfirmedForScope(oItem, aConfirmationFields)
                ) {
                  iConfirmed++;
                }
              }
              if (this._isItemConfirmedForScope(oItem, null)) {
                iFullyConfirmed++;
              }
              if (oItem._expanded) {
                iExpanded++;
              }
              if (this._toNumber(oItem.MengeSayim) > this._toNumber(oItem.SapStock)) {
                iStockExceededItemCount++;
              }
            }.bind(this),
          );

          oModel.setProperty("/confirmedItemCount", iConfirmed);
          oModel.setProperty(
            "/confirmationTargetCount",
            iConfirmationTarget,
          );
          oModel.setProperty("/expandedItemCount", iExpanded);
          oModel.setProperty(
            "/uncountedItemCount",
            Math.max(iConfirmationTarget - iConfirmed, 0),
          );
          oModel.setProperty(
            "/hasStockExceeded",
            iStockExceededItemCount > 0,
          );
          oModel.setProperty(
            "/stockExceededMessage",
            iStockExceededItemCount > 0
              ? "UYARI: " +
                  iStockExceededItemCount +
                  " kalemde sayım miktarı, depo stoğunu aşıyor. "
              : "",
          );
          oModel.setProperty(
            "/canSubmit",
            Boolean(sSelectedVehicleKey) &&
              Boolean(sSelectedPlantKey) &&
              aItems.length > 0 &&
              iFullyConfirmed === aItems.length &&
              iStockExceededItemCount === 0 &&
              oModel.getProperty("/createAllowed") === true &&
              oModel.getProperty("/createAllowedConsistent") === true,
          );
          if (!bSkipCheckUpdate) {
            oModel.checkUpdate(false);
          }
        },

        onSubmitPress: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var oVehicle = oModel.getProperty("/selectedVehicle");
          var sSelectedPlantKey = oModel.getProperty("/selectedPlantKey");

          if (
            oModel.getProperty("/isSubmitting") ||
            oModel.getProperty("/availabilityBusy")
          ) {
            return;
          }

          if (!oModel.getProperty("/createAllowed")) {
            MessageBox.warning(
              oModel.getProperty("/creationBlockMessage") ||
                this.getResourceBundle().getText(
                  "factoryShipmentCreationNotAllowed",
                ),
            );
            return;
          }

          if (!oVehicle) {
            MessageBox.warning("Gönderim yapılacak plakayı seçin.");
            return;
          }

          if (!sSelectedPlantKey) {
            MessageBox.warning("\u00dcretim yeri se\u00e7in.");
            return;
          }

          if (!oModel.getProperty("/canSubmit")) {
            MessageBox.warning(
              "Tüm kategori sayımlarını tamamlayın. Stoktan fazla sayılan kalemler gönderilemez.",
            );
            return;
          }

          if (
            aItems.some(
              function (oItem) {
                return this._toNumber(oItem.MengeUretimHatali) > 0;
              }.bind(this),
            )
          ) {
            this._openProductionDefectDetailsDialog(oVehicle, aItems);
            return;
          }

          this._openCommissionDialog(oVehicle, aItems);
        },

        _openProductionDefectDetailsDialog: function (oVehicle, aItems) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aDialogItems = aItems
            .map(
              function (oItem, iIndex) {
                if (this._toNumber(oItem.MengeUretimHatali) <= 0) {
                  return null;
                }
                return {
                  itemIndex: iIndex,
                  MaterialDisplayCode:
                    oItem.MaterialDisplayCode ||
                    this._formatMaterialCode(oItem.Matnr),
                  Maktx: oItem.Maktx || "",
                  Meins: oItem.Meins || "",
                  MengeUretimHatali: this._toNumber(
                    oItem.MengeUretimHatali,
                  ),
                  UretimAltNeden: oItem.UretimAltNeden || "",
                  UretimSkt: oItem.UretimSkt || "",
                  _reasonInvalid: false,
                  _dateInvalid: false,
                };
              }.bind(this),
            )
            .filter(Boolean);

          this._oPendingProductionDefectSubmission = {
            vehicle: oVehicle,
            items: aItems,
          };
          oModel.setProperty("/productionDefectDialog/items", aDialogItems);
          oModel.setProperty("/productionDefectDialog/reasons", []);
          oModel.setProperty("/productionDefectDialog/busy", true);

          if (!this._oProductionDefectDetailsDialog) {
            this._oProductionDefectDetailsDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.sut.bolgeyonetim.view.ProductionDefectDetailsDialog",
              this,
            );
            this.getView().addDependent(this._oProductionDefectDetailsDialog);
          }
          this._oProductionDefectDetailsDialog.open();

          this._readSet("/ReturnFactorySubReasonSet", [
            new Filter("Grund", FilterOperator.EQ, "0002"),
          ])
            .then(function (aReasons) {
              oModel.setProperty("/productionDefectDialog/reasons", aReasons);
            })
            .catch(
              function (oError) {
                this._closeProductionDefectDetailsDialog();
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    this.getResourceBundle().getText(
                      "factoryShipmentProductionDefectReasonLoadError",
                    ),
                  ),
                );
              }.bind(this),
            )
            .finally(function () {
              oModel.setProperty("/productionDefectDialog/busy", false);
            });
        },

        onProductionDefectDetailsConfirm: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aDialogItems =
            oModel.getProperty("/productionDefectDialog/items") || [];
          var oPending = this._oPendingProductionDefectSubmission;
          var bInvalid = false;

          aDialogItems.forEach(function (oItem) {
            oItem._reasonInvalid = !oItem.UretimAltNeden;
            oItem._dateInvalid = !oItem.UretimSkt || oItem._dateInvalid;
            bInvalid =
              bInvalid || oItem._reasonInvalid || oItem._dateInvalid;
          });
          oModel.refresh(true);

          if (bInvalid) {
            MessageBox.warning(
              this.getResourceBundle().getText(
                "factoryShipmentProductionDefectRequired",
              ),
            );
            return;
          }
          if (!oPending) {
            return;
          }

          aDialogItems.forEach(function (oDialogItem) {
            var oSourceItem = oPending.items[oDialogItem.itemIndex];
            if (oSourceItem) {
              oSourceItem.UretimAltNeden = oDialogItem.UretimAltNeden;
              oSourceItem.UretimSkt = oDialogItem.UretimSkt;
            }
          });
          this._oProductionDefectDetailsDialog.close();
          this._oPendingProductionDefectSubmission = null;
          this._openCommissionDialog(oPending.vehicle, oPending.items);
        },

        onProductionDefectDateChange: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");
          if (oContext) {
            oContext
              .getModel()
              .setProperty(
                oContext.getPath() + "/_dateInvalid",
                !oEvent.getParameter("valid"),
              );
          }
        },

        onProductionDefectReasonChange: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnFactoryShipmentModel");
          if (oContext) {
            oContext
              .getModel()
              .setProperty(oContext.getPath() + "/_reasonInvalid", false);
          }
        },

        onProductionDefectDetailsCancel: function () {
          this._closeProductionDefectDetailsDialog();
        },

        _closeProductionDefectDetailsDialog: function () {
          if (this._oProductionDefectDetailsDialog) {
            this._oProductionDefectDetailsDialog.close();
          }
          this._oPendingProductionDefectSubmission = null;
        },

        _openCommissionDialog: function (oVehicle, aItems) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var sRegion = this._deriveCommissionRegion(
            oModel.getProperty("/warehouse"),
          );

          this._oPendingCommissionSubmission = {
            vehicle: oVehicle,
            items: aItems,
          };
          oModel.setProperty("/commissionDialog", {
            allMembers: [],
            members: [],
            searchQuery: "",
            selectedCount: 0,
            region: sRegion,
            busy: true,
          });

          if (!this._oCommissionDialog) {
            this._oCommissionDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.sut.bolgeyonetim.view.CommissionMemberDialog",
              this,
            );
            this.getView().addDependent(this._oCommissionDialog);
          }
          this._oCommissionDialog.open();

          this._readSet("/KomisyonListSet", [
            new Filter("Bolge", FilterOperator.EQ, sRegion),
          ])
            .then(function (aMembers) {
              var aPreparedMembers = aMembers.map(
                function (oMember) {
                  return Object.assign({}, oMember, {
                    Selected: false,
                    _normalizedSearchText: this._normalizeTurkishSearchText(
                      [oMember.SicilNo, oMember.AdSoyad, oMember.Unvan].join(
                        " ",
                      ),
                    ),
                  });
                }.bind(this),
              );
              oModel.setProperty(
                "/commissionDialog/allMembers",
                aPreparedMembers,
              );
              oModel.setProperty(
                "/commissionDialog/members",
                aPreparedMembers.slice(),
              );
            }.bind(this))
            .catch(
              function (oError) {
                this._closeCommissionDialog();
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    this.getResourceBundle().getText(
                      "factoryShipmentCommissionLoadError",
                    ),
                  ),
                );
              }.bind(this),
            )
            .finally(function () {
              oModel.setProperty("/commissionDialog/busy", false);
            });
        },

        onCommissionSearch: function (oEvent) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var sQuery = this._normalizeTurkishSearchText(
            oEvent.getParameter("newValue") !== undefined
              ? oEvent.getParameter("newValue")
              : oEvent.getParameter("query"),
          );
          var aAllMembers =
            oModel.getProperty("/commissionDialog/allMembers") || [];

          oModel.setProperty(
            "/commissionDialog/members",
            sQuery
              ? aAllMembers.filter(function (oMember) {
                  return oMember._normalizedSearchText.indexOf(sQuery) !== -1;
                })
              : aAllMembers.slice(),
          );
        },

        onCommissionSelectionChange: function (oEvent) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aAllMembers =
            oModel.getProperty("/commissionDialog/allMembers") || [];
          var aChangedItems = oEvent.getParameter("listItems") || [];
          var oChangedItem = oEvent.getParameter("listItem");
          var bSelected = oEvent.getParameter("selected");
          var aChangedMembers = [];
          var iSelectedCount;
          var bLimitReached = false;

          if (!aChangedItems.length && oChangedItem) {
            aChangedItems = [oChangedItem];
          }

          aChangedItems.forEach(function (oItem) {
            var oContext = oItem.getBindingContext(
              "returnFactoryShipmentModel",
            );
            var oMember = oContext && oContext.getObject();

            if (oMember) {
              aChangedMembers.push(oMember);
            }
          });
          iSelectedCount = aAllMembers.filter(function (oMember) {
            return (
              oMember.Selected && aChangedMembers.indexOf(oMember) === -1
            );
          }).length;

          aChangedItems.forEach(function (oItem, iIndex) {
            var oMember = aChangedMembers[iIndex];

            if (!oMember) {
              return;
            }
            if (!bSelected) {
              oMember.Selected = false;
              return;
            }
            if (iSelectedCount >= 4) {
              oItem.setSelected(false);
              oMember.Selected = false;
              bLimitReached = true;
              return;
            }
            oMember.Selected = true;
            iSelectedCount++;
          });

          oModel.setProperty(
            "/commissionDialog/selectedCount",
            Math.max(0, iSelectedCount),
          );
          oModel.refresh(true);
          if (bLimitReached) {
            MessageToast.show(
              this.getResourceBundle().getText(
                "factoryShipmentCommissionSelectionLimit",
              ),
            );
          }
        },

        onCommissionConfirm: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aSelectedMembers = (
            oModel.getProperty("/commissionDialog/allMembers") || []
          ).filter(function (oMember) {
            return oMember.Selected;
          });
          var oPending = this._oPendingCommissionSubmission;

          if (!oPending) {
            return;
          }
          this._oCommissionDialog.close();

          MessageBox.confirm(
            this.getResourceBundle().getText(
              "factoryShipmentSubmitConfirmation",
              [oPending.vehicle.PlakaNo],
            ),
            {
              title: this.getResourceBundle().getText(
                "factoryShipmentSubmitConfirmationTitle",
              ),
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.OK) {
                  this._submitShipment(
                    oPending.vehicle,
                    oPending.items,
                    aSelectedMembers,
                  );
                }
                this._oPendingCommissionSubmission = null;
              }.bind(this),
            },
          );
        },

        onCommissionCancel: function () {
          this._closeCommissionDialog();
        },

        _closeCommissionDialog: function () {
          if (this._oCommissionDialog) {
            this._oCommissionDialog.close();
          }
          this._oPendingCommissionSubmission = null;
        },

        _submitShipment: function (oVehicle, aItems, aCommissionMembers) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");

          aCommissionMembers = aCommissionMembers || [];

          if (
            oModel.getProperty("/isSubmitting") ||
            oModel.getProperty("/availabilityBusy") ||
            oModel.getProperty("/createAllowed") !== true ||
            oModel.getProperty("/createAllowedConsistent") !== true
          ) {
            return;
          }

          var sSelectedPlantKey = oModel.getProperty("/selectedPlantKey");
          var sShipmentDate = this._toODataJsonDate(
            oModel.getProperty("/selectedDate"),
          );
          var oPayload = {
            LogUid: oModel.getProperty("/processId") || this._createProcessId(),
            Lgort: oModel.getProperty("/warehouse"),
            SourceLgort: oModel.getProperty("/sourceWarehouse"),
            IrsTar: sShipmentDate,
            PlakaNo: oVehicle.PlakaNo || "",
            Werks: sSelectedPlantKey,
            Komisyon1:
              (aCommissionMembers[0] && aCommissionMembers[0].SicilNo) || "",
            Komisyon2:
              (aCommissionMembers[1] && aCommissionMembers[1].SicilNo) || "",
            Komisyon3:
              (aCommissionMembers[2] && aCommissionMembers[2].SicilNo) || "",
            Komisyon4:
              (aCommissionMembers[3] && aCommissionMembers[3].SicilNo) || "",
            ToItems: aItems.map(
              function (oItem, iIndex) {
                return {
                  Lgort: oModel.getProperty("/warehouse"),
                  IrsTar: sShipmentDate,
                  PlakaNo: oVehicle.PlakaNo || "",
                  Posnr: oItem.Posnr || String((iIndex + 1) * 10).padStart(6, "0"),
                  Matnr: oItem.Matnr || "",
                  Maktx: oItem.Maktx || "",
                  Meins: oItem.Meins || "",
                  SapStock: this._toODataDecimal(oItem.SapStock),
                  MengeSayim: this._toODataDecimal(
                    this._calculateItemTotal(oItem),
                  ),
                  MengeUretimHatali: this._toODataDecimal(
                    oItem.MengeUretimHatali,
                  ),
                  UretimAltNeden:
                    this._toNumber(oItem.MengeUretimHatali) > 0
                      ? oItem.UretimAltNeden || ""
                      : "",
                  UretimSkt:
                    this._toNumber(oItem.MengeUretimHatali) > 0
                      ? this._toODataJsonDate(oItem.UretimSkt)
                      : null,
                  MengeFabrikaLojistik: this._toODataDecimal(
                    oItem.MengeFabrikaLojistik,
                  ),
                  MengeSatisFireKati: this._toODataDecimal(
                    oItem.MengeSatisFireKati,
                  ),
                  MengeSatisFireSivi: this._toODataDecimal(
                    oItem.MengeSatisFireSivi,
                  ),
                  MengeSatisFireUht: this._toODataDecimal(
                    oItem.MengeSatisFireUht,
                  ),
                  MengeSatisFireCam: this._toODataDecimal(
                    oItem.MengeSatisFireCam,
                  ),
                  MengeLansman: this._toODataDecimal(oItem.MengeLansman),
                };
              }.bind(this),
            ),
          };
          var oODataModel = this.getOwnerComponent().getModel();
          var sPayloadSignature = JSON.stringify(oPayload);

          if (this._sPendingPayloadSignature === sPayloadSignature) {
            return;
          }

          this._sPendingPayloadSignature = sPayloadSignature;
          oModel.setProperty("/isSubmitting", true);

          oODataModel.create("/ReturnFactoryShipmentSet", oPayload, {
            success: function () {
              oModel.setProperty("/isSubmitting", false);
              this._sPendingPayloadSignature = null;
              MessageToast.show(
                this.getResourceBundle().getText(
                  "factoryShipmentSubmittedForApproval",
                ),
              );
              this.refreshDashboardData(false);
              this._loadData();
            }.bind(this),
            error: function (oError) {
              oModel.setProperty("/isSubmitting", false);
              this._sPendingPayloadSignature = null;
              MessageBox.error(
                this._getErrorMessage(
                  oError,
                  this.getResourceBundle().getText("factoryShipmentSubmitError"),
                ),
              );
              this._refreshStockAvailabilityPreservingEntries();
            }.bind(this),
          });
        },

        onApprovalScreenPress: function () {
          this.getRouter().navTo("factoryShipmentApproval");
        },

        _getPlantOptions: function () {
          return [
            { PlantKey: "", PlantText: "Se\u00e7iniz" },
            { PlantKey: "1100", PlantText: "1100 - Karacabey" },
            { PlantKey: "1200", PlantText: "1200 - Aksaray" },
            { PlantKey: "1300", PlantText: "1300 - Tire" },
            { PlantKey: "1400", PlantText: "1400 - Bing\u00f6l" },
          ];
        },

        _buildODataUrl: function (oODataModel, sPath) {
          var sServiceUrl = oODataModel.sServiceUrl || "";
          var aParts = sServiceUrl.split("?");
          var sBaseUrl = aParts[0].replace(/\/$/, "");
          var sQuery = aParts[1] ? "?" + aParts[1] : "";

          return sBaseUrl + sPath + sQuery;
        },

        _deriveReturnWarehouse: function (sWarehouseNum) {
          var sWarehouse = String(sWarehouseNum || "1900");
          if (sWarehouse.indexOf("19") === 0) {
            return "18" + sWarehouse.substring(2);
          }
          return sWarehouse === "1900" ? "1800" : sWarehouse;
        },

        _deriveCommissionRegion: function (sWarehouseNum) {
          var sWarehouse = String(sWarehouseNum || "").trim();

          if (/^19/.test(sWarehouse)) {
            return sWarehouse;
          }
          if (/^18/.test(sWarehouse)) {
            return "19" + sWarehouse.substring(2);
          }
          if (/^\d{2}$/.test(sWarehouse)) {
            return "19" + sWarehouse;
          }
          return "19" + sWarehouse.slice(-2).padStart(2, "0");
        },

        _normalizeTurkishSearchText: function (vValue) {
          return String(vValue || "")
            .toLocaleLowerCase("tr-TR")
            .replace(/[çÇ]/g, "c")
            .replace(/[ğĞ]/g, "g")
            .replace(/[ıİiI]/g, "i")
            .replace(/[öÖ]/g, "o")
            .replace(/[şŞ]/g, "s")
            .replace(/[üÜ]/g, "u")
            .trim();
        },

        _formatMaterialCode: function (sMatnr) {
          var sCode = String(sMatnr || "").replace(/^0+/, "");
          return sCode || "0";
        },

        _createProcessId: function () {
          var sSeed =
            Date.now().toString(16) +
            Math.random().toString(16).slice(2) +
            Math.random().toString(16).slice(2);

          return (sSeed + "00000000000000000000000000000000")
            .slice(0, 32)
            .toUpperCase();
        },

        _toNumber: function (vValue) {
          var fValue = parseFloat(vValue);
          return isNaN(fValue) ? 0 : fValue;
        },

        _toODataDecimal: function (vValue) {
          return String(this._toNumber(vValue));
        },


        _toBoolean: function (vValue, bDefault) {
          if (vValue === undefined || vValue === null || vValue === "") {
            return bDefault;
          }
          return vValue === true || String(vValue).toLowerCase() === "true";
        },

        _toODataDate: function (vValue) {
          if (vValue instanceof Date) {
            return vValue;
          }

          var aDateParts = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(vValue || "");
          if (!aDateParts) {
            return null;
          }

          return new Date(
            Date.UTC(
              Number(aDateParts[1]),
              Number(aDateParts[2]) - 1,
              Number(aDateParts[3]),
            ),
          );
        },

        _toODataJsonDate: function (vValue) {
          var oDate = this._toODataDate(vValue);

          return oDate ? "/Date(" + oDate.getTime() + ")/" : null;
        },

        _getErrorMessage: function (oError, sFallback) {
          try {
            var oResponse = JSON.parse(oError.responseText);
            return oResponse.error.message.value || sFallback;
          } catch (e) {
            var sResponseText =
              oError && oError.responseText ? oError.responseText : "";
            var aXmlMessage = sResponseText.match(
              /<message(?:\s[^>]*)?>([\s\S]*?)<\/message>/i,
            );
            if (aXmlMessage && aXmlMessage[1]) {
              return aXmlMessage[1]
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
            }
            return oError && oError.message ? oError.message : sFallback;
          }
        },
      },
    );
  },
);
