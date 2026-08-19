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
            selectedVehicleKey: "",
            selectedVehicle: null,
            selectedPlantKey: "",
            warehouse: "",
            sourceWarehouse: "",
            selectedDate: "",
            processId: "",
            totalItemCount: 0,
            confirmedItemCount: 0,
            expandedItemCount: 0,
            canSubmit: false,
            hasStockExceeded: false,
            stockExceededMessage: "",
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
          this.getView().$().off(".returnFactoryZeroSelect");
          if (this._oExtraReturnReasonDialog) {
            this._oExtraReturnReasonDialog.$().off(".returnFactoryZeroSelect");
            this._oExtraReturnReasonDialog.destroy();
            this._oExtraReturnReasonDialog = null;
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
              selectedVehicleKey: "",
              selectedVehicle: null,
              selectedPlantKey: "",
              warehouse: sWarehouseNum,
              sourceWarehouse: sSourceWarehouse,
              selectedDate: sSelectedDate,
              processId: this._createProcessId(),
              totalItemCount: 0,
              confirmedItemCount: 0,
              expandedItemCount: 0,
              canSubmit: false,
              hasStockExceeded: false,
              stockExceededMessage: "",
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
                oViewModel.setProperty("/selectedVehicle", null);
                oViewModel.setProperty("/items", aItems);
                oViewModel.setProperty("/totalItemCount", aItems.length);
                this._recalculateSubmitState();
              }.bind(this),
            )
            .catch(
              function (oError) {
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
                    SapStock: this._toNumber(oItem.SapStock || oItem.Labst),
                    MengeSayim: this._calculateItemTotal(oItem),
                    MengeUretimHatali: this._toNumber(oItem.MengeUretimHatali || 0),
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

        onVehicleChange: function (oEvent) {
          var oSelect = oEvent.getSource();
          var sSelectedKey = oSelect.getSelectedKey();
          var oSelectedItem = oSelect.getSelectedItem();

          if (!sSelectedKey && oSelectedItem) {
            sSelectedKey = oSelectedItem.getKey();
          }

          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aVehicles = oModel.getProperty("/vehicles") || [];
          var oVehicle =
            (sSelectedKey &&
              aVehicles.find(function (oItem) {
                return oItem.VehicleKey === sSelectedKey;
              })) ||
            null;

          oModel.setProperty("/selectedVehicleKey", sSelectedKey);
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
          oModel.setProperty(sPath + "/_countConfirmed", false);
          this._updateItemState(oModel, sPath, Object.assign({}, oItem, {
            MengeSayim: fTotal,
            _countConfirmed: false,
          }));
          this._recalculateSubmitState();
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
          oModel.setProperty(sItemPath + "/_countConfirmed", false);
          this._updateItemState(
            oModel,
            sItemPath,
            Object.assign({}, oItem, {
              MengeSayim: fTotal,
              _countConfirmed: false,
            }),
          );
          this._recalculateSubmitState();
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

          oContext
            .getModel()
            .setProperty(oContext.getPath() + "/_countConfirmed", bSelected);
          this._recalculateSubmitState();
        },

        onConfirmAllCountsPress: function (oEvent) {
          var vConfirmed = oEvent.getSource().data("confirmed");
          var bConfirmed = vConfirmed === true || vConfirmed === "true";
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];

          if (
            bConfirmed &&
            aItems.some(function (oItem) {
              return oItem._expanded !== true;
            })
          ) {
            MessageBox.information(
              "Tüm kalemleri tamamlamadan önce 'Tümünü Genişlet' ile ürün detaylarını kontrol edin.",
            );
            return;
          }

          aItems.forEach(function (oItem, iIndex) {
            oItem._countConfirmed = bConfirmed;
            oModel.setProperty(
              "/items/" + iIndex + "/_countConfirmed",
              bConfirmed,
            );
          });
          this._recalculateSubmitState();
          oModel.refresh(true);
        },

        onFactoryItemTogglePress: function (oEvent) {
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
          var vExpanded = oEvent.getSource().data("expanded");
          var bExpanded = vExpanded === true || vExpanded === "true";
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];

          aItems.forEach(function (oItem, iIndex) {
            oItem._expanded = bExpanded;
            oModel.setProperty("/items/" + iIndex + "/_expanded", bExpanded);
          });
          this._recalculateSubmitState();
          oModel.refresh(true);
        },

        _updateItemState: function (oModel, sPath, oItem) {
          var fCount = this._toNumber(oItem.MengeSayim);
          var fStock = this._toNumber(oItem.SapStock);
          var bDifferent = fCount !== fStock;
          var bExceeded = fCount > fStock;
          var fDifference = fStock - fCount;

          oModel.setProperty(sPath + "/RowHighlight", bDifferent ? "Error" : "None");
          oModel.setProperty(sPath + "/StockExceeded", bExceeded);
          oModel.setProperty(sPath + "/DifferenceQuantity", fDifference);
          oModel.setProperty(
            sPath + "/RowState",
            bDifferent ? "Error" : "Success",
          );
          oModel.setProperty(
            sPath + "/RowStateText",
            bExceeded
              ? "Sayım iade depo stoğundan fazla. Gönderim yapılamaz."
              : bDifferent
                ? "Iade depo stoğundan eksik; gönderime izin verilir."
                : "Iade depo stoğu ile eşit.",
          );
        },

        _recalculateSubmitState: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var sSelectedVehicleKey = oModel.getProperty("/selectedVehicleKey");
          var oSelectedVehicle = oModel.getProperty("/selectedVehicle");
          var sSelectedPlantKey = oModel.getProperty("/selectedPlantKey");
          var iConfirmed = 0;
          var iExpanded = 0;
          var iStockExceededItemCount = 0;

          if (!sSelectedVehicleKey && oSelectedVehicle) {
            sSelectedVehicleKey = oSelectedVehicle.VehicleKey || "";
            oModel.setProperty("/selectedVehicleKey", sSelectedVehicleKey);
          }

          aItems.forEach(
            function (oItem, iIndex) {
              var sPath = "/items/" + iIndex;
              this._updateItemState(oModel, sPath, oItem);
              if (oItem._countConfirmed) {
                iConfirmed++;
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
          oModel.setProperty("/expandedItemCount", iExpanded);
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
              iConfirmed === aItems.length &&
              iStockExceededItemCount === 0,
          );
        },

        onSubmitPress: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var oVehicle = oModel.getProperty("/selectedVehicle");
          var sSelectedPlantKey = oModel.getProperty("/selectedPlantKey");

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
              "Tüm kalemleri tamamlayın. Stoktan fazla sayılan kalemler gönderilemez.",
            );
            return;
          }

          MessageBox.confirm(
            oVehicle.PlakaNo + " plakalı araç için iade gönderimi oluşturulacak.",
            {
              title: "Gönderimi Onayla",
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.OK) {
                  this._submitShipment(oVehicle, aItems);
                }
              }.bind(this),
            },
          );
        },

        _submitShipment: function (oVehicle, aItems) {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
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
            ToItems: aItems.map(
              function (oItem, iIndex) {
                return {
                  Lgort: oModel.getProperty("/warehouse"),
                  IrsTar: sShipmentDate,
                  PlakaNo: oVehicle.PlakaNo || "",
                  Posnr: oItem.Posnr || String((iIndex + 1) * 10).padStart(6, "0"),
                  Matnr: oItem.Matnr || "",
                  Maktx: oItem.Maktx || "",
                  Meins: this._toSapUnit(oItem.Meins),
                  SapStock: this._toODataDecimal(oItem.SapStock),
                  MengeSayim: this._toODataDecimal(oItem.MengeSayim),
                  MengeUretimHatali: this._toODataDecimal(
                    oItem.MengeUretimHatali,
                  ),
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

          sap.ui.core.BusyIndicator.show(0);
          jQuery.ajax({
            url: this._buildODataUrl(oODataModel, "/ReturnFactoryShipmentSet"),
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            headers: {
              Accept: "application/json",
              "X-CSRF-Token": oODataModel.getSecurityToken(),
            },
            data: JSON.stringify(oPayload),
            success: function () {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("İade gönderimi başarıyla oluşturuldu.");
              this.refreshDashboardData();
              this._loadData();
            }.bind(this),
            error: function (oError) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(
                this._getErrorMessage(oError, "İade gönderimi oluşturulamadı."),
              );
            }.bind(this),
          });
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

        _toSapUnit: function (sUnit) {
          var sNormalizedUnit = String(sUnit || "").toUpperCase();

          return sNormalizedUnit === "ADT" ? "ST" : sNormalizedUnit;
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
