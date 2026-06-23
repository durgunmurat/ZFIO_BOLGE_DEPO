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
            items: [],
            selectedVehicleKey: "",
            selectedVehicle: null,
            warehouse: "",
            sourceWarehouse: "",
            selectedDate: "",
            totalItemCount: 0,
            confirmedItemCount: 0,
            canSubmit: false,
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

              if (this._toNumber(oInput.value) === 0) {
                setTimeout(function () {
                  oInput.select();
                }, 0);
              }
            }.bind(this),
          );
        },

        onExit: function () {
          this.getView().$().off(".returnFactoryZeroSelect");
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
              items: [],
              selectedVehicleKey: "",
              selectedVehicle: null,
              warehouse: sWarehouseNum,
              sourceWarehouse: sSourceWarehouse,
              selectedDate: sSelectedDate,
              totalItemCount: 0,
              confirmedItemCount: 0,
              canSubmit: false,
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
                var oSelectedVehicle = aVehicles[0] || null;

                oViewModel.setProperty("/vehicles", aVehicles);
                oViewModel.setProperty(
                  "/selectedVehicleKey",
                  oSelectedVehicle ? oSelectedVehicle.VehicleKey : "",
                );
                oViewModel.setProperty("/selectedVehicle", oSelectedVehicle);
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
                    MengeSayim: 0,
                    MengeFire: 0,
                    MengeKalite: 0,
                    MengeLansman: 0,
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
            aVehicles.find(function (oItem) {
              return oItem.VehicleKey === sSelectedKey;
            }) || null;

          oModel.setProperty("/selectedVehicleKey", sSelectedKey);
          oModel.setProperty("/selectedVehicle", oVehicle);
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
            this._toNumber(oItem.MengeFire) +
            this._toNumber(oItem.MengeKalite) +
            this._toNumber(oItem.MengeLansman);
          oModel.setProperty(sPath + "/MengeSayim", fTotal);
          oModel.setProperty(sPath + "/_countConfirmed", false);
          this._updateItemState(oModel, sPath, Object.assign({}, oItem, {
            MengeSayim: fTotal,
            _countConfirmed: false,
          }));
          this._recalculateSubmitState();
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

        _updateItemState: function (oModel, sPath, oItem) {
          var fCount = this._toNumber(oItem.MengeSayim);
          var fStock = this._toNumber(oItem.SapStock);
          var bDifferent = fCount !== fStock;
          var bExceeded = fCount > fStock;

          oModel.setProperty(sPath + "/RowHighlight", bDifferent ? "Error" : "None");
          oModel.setProperty(sPath + "/StockExceeded", bExceeded);
          oModel.setProperty(
            sPath + "/RowStateText",
            bExceeded
              ? "Sayım iade depo stoğundan fazla. Gönderim yapılamaz."
              : bDifferent
                ? "Sayım iade depo stoğundan farklı."
                : "",
          );
        },

        _recalculateSubmitState: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var sSelectedVehicleKey = oModel.getProperty("/selectedVehicleKey");
          var oSelectedVehicle = oModel.getProperty("/selectedVehicle");
          var iConfirmed = 0;
          var bHasStockExceeded = false;

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
              if (this._toNumber(oItem.MengeSayim) > this._toNumber(oItem.SapStock)) {
                bHasStockExceeded = true;
              }
            }.bind(this),
          );

          oModel.setProperty("/confirmedItemCount", iConfirmed);
          oModel.setProperty(
            "/canSubmit",
            Boolean(sSelectedVehicleKey) &&
              aItems.length > 0 &&
              iConfirmed === aItems.length &&
              !bHasStockExceeded,
          );
        },

        onSubmitPress: function () {
          var oModel = this.getView().getModel("returnFactoryShipmentModel");
          var aItems = oModel.getProperty("/items") || [];
          var oVehicle = oModel.getProperty("/selectedVehicle");

          if (!oVehicle) {
            MessageBox.warning("Gönderim yapılacak plakayı seçin.");
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
          var oPayload = {
            Lgort: oModel.getProperty("/warehouse"),
            SourceLgort: oModel.getProperty("/sourceWarehouse"),
            IrsTar: this._toODataDate(oModel.getProperty("/selectedDate")),
            PlakaNo: oVehicle.PlakaNo || "",
            ToItems: aItems.map(
              function (oItem, iIndex) {
                return {
                  Lgort: oModel.getProperty("/warehouse"),
                  IrsTar: this._toODataDate(oModel.getProperty("/selectedDate")),
                  PlakaNo: oVehicle.PlakaNo || "",
                  Posnr: oItem.Posnr || String((iIndex + 1) * 10).padStart(6, "0"),
                  Matnr: oItem.Matnr || "",
                  Maktx: oItem.Maktx || "",
                  Meins: oItem.Meins || "",
                  SapStock: this._toODataDecimal(oItem.SapStock),
                  MengeSayim: this._toODataDecimal(oItem.MengeSayim),
                  MengeFire: this._toODataDecimal(oItem.MengeFire),
                  MengeKalite: this._toODataDecimal(oItem.MengeKalite),
                  MengeLansman: this._toODataDecimal(oItem.MengeLansman),
                };
              }.bind(this),
            ),
          };
          var oODataModel = this.getOwnerComponent().getModel();

          sap.ui.core.BusyIndicator.show(0);
          oODataModel.setUseBatch(false);
          oODataModel.create("/ReturnFactoryShipmentSet", oPayload, {
            success: function () {
              oODataModel.setUseBatch(true);
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("İade gönderimi başarıyla oluşturuldu.");
              this.refreshDashboardData();
              this._loadData();
            }.bind(this),
            error: function (oError) {
              oODataModel.setUseBatch(true);
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(
                this._getErrorMessage(oError, "İade gönderimi oluşturulamadı."),
              );
            }.bind(this),
          });
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

        _toNumber: function (vValue) {
          var fValue = parseFloat(vValue);
          return isNaN(fValue) ? 0 : fValue;
        },

        _toODataDecimal: function (vValue) {
          return String(this._toNumber(vValue));
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
