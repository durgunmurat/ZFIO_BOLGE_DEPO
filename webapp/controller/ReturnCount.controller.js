sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast
) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.ReturnCount", {
        onInit: function() {
            var oReturnCountModel = new JSONModel({
                groups: [],
                visibleGroups: [],
                selectedType: "MD",
                selectedStatus: "pending",
                mdCount: 0,
                opCount: 0,
                pendingCount: 0,
                completedCount: 0
            });
            oReturnCountModel.setSizeLimit(9999);
            this.getView().setModel(oReturnCountModel, "returnCountModel");

            this.getRouter()
                .getRoute("returnCount")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function() {
            this.byId("idReturnTypeFilterBar").setSelectedKey("MD");
            this.byId("idReturnStatusFilterBar").setSelectedKey("pending");
            var oModel = this.getView().getModel("returnCountModel");
            oModel.setProperty("/selectedType", "MD");
            oModel.setProperty("/selectedStatus", "pending");
            this._loadReturnCountData();
        },

        onDateChange: function(oEvent) {
            var oDate = oEvent.getSource().getDateValue();
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");

            if (!oDate || !oFilterModel) {
                MessageBox.warning("Geçerli bir tarih seçin.");
                return;
            }

            var sSelectedDate = [
                oDate.getFullYear(),
                String(oDate.getMonth() + 1).padStart(2, "0"),
                String(oDate.getDate()).padStart(2, "0")
            ].join("-");

            oFilterModel.setProperty("/selectedDate", sSelectedDate);
            oFilterModel.setProperty(
                "/selectedDateFormatted",
                sSelectedDate + "T00:00:00"
            );
            this._loadReturnCountData();
        },

        _loadReturnCountData: function() {
            var oODataModel = this.getOwnerComponent().getModel();
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");
            var sWarehouseNum = oSessionModel
                ? oSessionModel.getProperty("/Login/WarehouseNum")
                : "";
            var sSelectedDate = oFilterModel
                ? oFilterModel.getProperty("/selectedDate")
                : "";

            if (!sWarehouseNum || !sSelectedDate) {
                MessageBox.error("Depo numarası ve sevkiyat tarihi zorunludur.");
                return;
            }

            var aDateParts = sSelectedDate.split("-");
            var oReturnDate = new Date(Date.UTC(
                parseInt(aDateParts[0], 10),
                parseInt(aDateParts[1], 10) - 1,
                parseInt(aDateParts[2], 10),
                0,
                0,
                0
            ));
            var aFilters = [
                // ReturnHeader exposes the warehouse/date fields as Lgort
                // and IrsTar in the OData metadata.
                new Filter("Lgort", FilterOperator.EQ, sWarehouseNum),
                new Filter("IrsTar", FilterOperator.EQ, oReturnDate)
            ];

            sap.ui.core.BusyIndicator.show(0);
            // Execute this potentially large deep read outside $batch.
            // Gateway then returns the actual OData error instead of a
            // generic batch/connection timeout response.
            oODataModel.setUseBatch(false);
            oODataModel.read("/ReturnHeaderSet", {
                filters: aFilters,
                urlParameters: {
                    "$expand": "ToItems"
                },
                success: function(oData) {
                    oODataModel.setUseBatch(true);
                    sap.ui.core.BusyIndicator.hide();
                    this._setReturnCountData(oData.results || []);
                }.bind(this),
                error: function(oError) {
                    oODataModel.setUseBatch(true);
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(this._getErrorMessage(
                        oError,
                        "İade sayım verileri yüklenemedi."
                    ));
                }.bind(this)
            });
        },

        _setReturnCountData: function(aHeaders) {
            var mGroups = {};
            var aGroups = [];
            var iMdCount = 0;
            var iOpCount = 0;

            aHeaders.forEach(function(oRawHeader) {
                var oHeader = this._normalizeReturnHeader(oRawHeader);
                oHeader.ShipmentType = String(
                    oHeader.ShipmentType || ""
                ).toUpperCase();
                var sGroupKey = oHeader.Plasiyer || "";
                var sStatusKey = this._getStatusKey(oHeader);
                var aItems = oHeader.ToItems && oHeader.ToItems.results
                    ? oHeader.ToItems.results
                    : (oHeader.ToItems || []);

                oHeader._statusKey = sStatusKey;
                oHeader.selected = false;
                oHeader.ReturnTypeText = oHeader.ReturnType === "P"
                    ? "Plasiyer iade irsaliyesi"
                    : "Müşteri iade irsaliyesi";
                oHeader.ToItems = { results: aItems };

                aItems.forEach(function(oItem) {
                    oItem.MengeSiparis = this._toNumber(oItem.MengeSiparis);
                    oItem.MengeFire = this._toNumber(oItem.MengeFire);
                    oItem.MengeKalite = this._toNumber(oItem.MengeKalite);
                    oItem.MengeSatilab = this._toNumber(oItem.MengeSatilab);
                    oItem.MaterialDisplayCode = this._formatMaterialCode(
                        oItem.Matnr
                    );
                    oItem._completed = sStatusKey === "completed";
                    oItem.MengeSayim = oItem.MengeFire +
                        oItem.MengeKalite +
                        oItem.MengeSatilab;
                }.bind(this));

                if (!mGroups[sGroupKey]) {
                    mGroups[sGroupKey] = {
                        Plasiyer: oHeader.Plasiyer,
                        PlasiyerDisplay: this._formatNumericCode(
                            oHeader.Plasiyer
                        ),
                        PlasiyerName: oHeader.PlasiyerName,
                        expanded: false,
                        selectAll: false,
                        Waybills: [],
                        Items: []
                    };
                    aGroups.push(mGroups[sGroupKey]);
                }
                mGroups[sGroupKey].Waybills.push(oHeader);

                if (oHeader.ShipmentType === "MD") {
                    iMdCount++;
                } else if (oHeader.ShipmentType === "OP") {
                    iOpCount++;
                }
            }.bind(this));

            var oModel = this.getView().getModel("returnCountModel");
            oModel.setProperty("/groups", aGroups);
            oModel.setProperty("/mdCount", iMdCount);
            oModel.setProperty("/opCount", iOpCount);
            this._applyStatusFilter();
        },

        _normalizeReturnHeader: function(oHeader) {
            var oIncludedHeader = oHeader &&
                (oHeader.INCLUDE || oHeader.Include || oHeader.include);

            if (!oIncludedHeader || typeof oIncludedHeader !== "object") {
                return oHeader;
            }

            // Standard OData responses expose header properties at the top
            // level. Keep compatibility with custom deep structures that
            // serialize the ABAP include group as a nested object.
            return Object.assign({}, oIncludedHeader, oHeader);
        },

        _getStatusKey: function(oHeader) {
            var sStatus = String(
                oHeader.Status || oHeader.CountStatus || ""
            ).toUpperCase();
            return sStatus === "X" ||
                sStatus === "1" ||
                sStatus === "COMPLETED"
                ? "completed"
                : "pending";
        },

        onStatusFilterSelect: function(oEvent) {
            this.getView().getModel("returnCountModel")
                .setProperty("/selectedStatus", oEvent.getParameter("key"));
            this._applyStatusFilter();
        },

        onTypeFilterSelect: function(oEvent) {
            var oModel = this.getView().getModel("returnCountModel");
            oModel.setProperty("/selectedType", oEvent.getParameter("key"));
            oModel.setProperty("/selectedStatus", "pending");
            this.byId("idReturnStatusFilterBar").setSelectedKey("pending");
            this._applyStatusFilter();
        },

        _applyStatusFilter: function() {
            var oModel = this.getView().getModel("returnCountModel");
            var sType = oModel.getProperty("/selectedType");
            var sStatus = oModel.getProperty("/selectedStatus");
            var aGroups = oModel.getProperty("/groups") || [];
            var aVisibleGroups = [];
            var iPendingCount = 0;
            var iCompletedCount = 0;

            aGroups.forEach(function(oGroup) {
                var aTypeWaybills = oGroup.Waybills.filter(function(oWaybill) {
                    return oWaybill.ShipmentType === sType;
                });
                var aWaybills = aTypeWaybills.filter(function(oWaybill) {
                    return oWaybill._statusKey === sStatus;
                });

                aTypeWaybills.forEach(function(oWaybill) {
                    if (oWaybill._statusKey === "completed") {
                        iCompletedCount++;
                    } else {
                        iPendingCount++;
                    }
                });

                if (aWaybills.length) {
                    aVisibleGroups.push({
                        Plasiyer: oGroup.Plasiyer,
                        PlasiyerDisplay: oGroup.PlasiyerDisplay,
                        PlasiyerName: oGroup.PlasiyerName,
                        expanded: false,
                        selectAll: false,
                        isCompleted: sStatus === "completed",
                        Waybills: aWaybills,
                        Items: []
                    });
                }
            });

            oModel.setProperty("/pendingCount", iPendingCount);
            oModel.setProperty("/completedCount", iCompletedCount);
            oModel.setProperty("/visibleGroups", aVisibleGroups);
        },

        _formatMaterialCode: function(sMatnr) {
            return this._formatNumericCode(sMatnr);
        },

        _formatNumericCode: function(sValue) {
            var sCode = String(sValue || "").replace(/^0+/, "");
            return sCode || "0";
        },

        onSelectAllWaybills: function(oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var oContext = oEvent.getSource()
                .getBindingContext("returnCountModel");
            var oGroup = oContext.getObject();

            oGroup.Waybills.forEach(function(oWaybill) {
                oWaybill.selected = oWaybill.ReturnType === "P"
                    ? false
                    : bSelected;
            });
            this._refreshGroupItems(oContext);
        },

        onWaybillSelect: function(oEvent) {
            var oWaybillContext = oEvent.getSource()
                .getBindingContext("returnCountModel");
            var oGroupContext = this._getParentContext(oWaybillContext);

            if (oGroupContext) {
                this._refreshGroupItems(oGroupContext);
            }
        },

        _getParentContext: function(oWaybillContext) {
            var sPath = oWaybillContext.getPath();
            var iWaybillSegment = sPath.lastIndexOf("/Waybills/");
            var sGroupPath = iWaybillSegment >= 0
                ? sPath.substring(0, iWaybillSegment)
                : "";
            return sGroupPath
                ? oWaybillContext.getModel().getContext(sGroupPath)
                : null;
        },

        _refreshGroupItems: function(oGroupContext) {
            var oModel = oGroupContext.getModel();
            var sGroupPath = oGroupContext.getPath();
            var oGroup = oGroupContext.getObject();
            var aItems = [];
            var aStandardWaybills = oGroup.Waybills.filter(function(oWaybill) {
                return oWaybill.ReturnType !== "P";
            });

            oGroup.Waybills.forEach(function(oWaybill) {
                if (oWaybill.selected && oWaybill.ToItems) {
                    aItems = aItems.concat(oWaybill.ToItems.results || []);
                }
            });

            oModel.setProperty(sGroupPath + "/Items", aItems);
            oModel.setProperty(
                sGroupPath + "/selectAll",
                aStandardWaybills.length > 0 &&
                aStandardWaybills.every(function(oWaybill) {
                    return oWaybill.selected;
                })
            );
            oModel.refresh(true);
        },

        onCountLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext("returnCountModel");
            var oItem = oContext.getObject();
            var oModel = oContext.getModel();
            var sPath = oContext.getPath();
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

            var fTotal = this._toNumber(oItem.MengeFire) +
                this._toNumber(oItem.MengeKalite) +
                this._toNumber(oItem.MengeSatilab);

            oModel.setProperty(sPath + "/MengeSayim", fTotal);
        },

        onApproveCountPress: function(oEvent) {
            var oGroupContext = oEvent.getSource()
                .getBindingContext("returnCountModel");
            var oGroup = oGroupContext.getObject();
            var aSelectedWaybills = oGroup.Waybills.filter(function(oWaybill) {
                return oWaybill.selected;
            });

            if (!aSelectedWaybills.length) {
                MessageBox.warning("Onaylamak için en az bir irsaliye seçin.");
                return;
            }

            var aPayloads = aSelectedWaybills.map(
                this._buildDeepInsertPayload.bind(this)
            );

            MessageBox.confirm(
                aPayloads.length + " irsaliyenin sayımı onaylanacak.",
                {
                    title: "Sayımı Onayla",
                    onClose: function(sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._submitPayloads(aPayloads);
                        }
                    }.bind(this)
                }
            );
        },

        _buildDeepInsertPayload: function(oHeader) {
            var aItems = oHeader.ToItems && oHeader.ToItems.results
                ? oHeader.ToItems.results
                : [];

            return {
                LogUid: oHeader.LogUid || "",
                VbelnVa: oHeader.VbelnVa || "",
                IrsNo: oHeader.IrsNo || "",
                IrsTar: oHeader.IrsTar || null,
                Lgort: oHeader.Lgort || "",
                Plasiyer: oHeader.Plasiyer || "",
                PlasiyerName: oHeader.PlasiyerName || "",
                Kunnr: oHeader.Kunnr || "",
                ShipmentType: oHeader.ShipmentType || "",
                ReturnType: oHeader.ReturnType || "",
                ToItems: aItems.map(function(oItem) {
                    return {
                        LogUid: oItem.LogUid || "",
                        Posnr: oItem.Posnr || "",
                        Matnr: oItem.Matnr || "",
                        Maktx: oItem.Maktx || "",
                        Meins: oItem.Meins || "",
                        MengeSiparis: this._toNumber(oItem.MengeSiparis),
                        MengeSayim: this._toNumber(oItem.MengeSayim),
                        MengeFire: this._toNumber(oItem.MengeFire),
                        MengeKalite: this._toNumber(oItem.MengeKalite),
                        MengeSatilab: this._toNumber(oItem.MengeSatilab),
                        IsDepozito: oItem.IsDepozito === true ||
                            oItem.IsDepozito === "X"
                    };
                }.bind(this))
            };
        },

        _submitPayloads: function(aPayloads) {
            var oODataModel = this.getOwnerComponent().getModel();
            sap.ui.core.BusyIndicator.show(0);

            Promise.all(aPayloads.map(function(oPayload) {
                return new Promise(function(resolve, reject) {
                    oODataModel.create("/ReturnHeaderSet", oPayload, {
                        success: resolve,
                        error: reject
                    });
                });
            })).then(function() {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("İade sayımları başarıyla onaylandı.");
                this.refreshDashboardData();
                this._loadReturnCountData();
            }.bind(this)).catch(function(oError) {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(this._getErrorMessage(
                    oError,
                    "İade sayımı onaylanamadı."
                ));
            }.bind(this));
        },

        _toNumber: function(vValue) {
            var fValue = parseFloat(vValue);
            return isNaN(fValue) ? 0 : fValue;
        },

        _getErrorMessage: function(oError, sFallback) {
            try {
                var oResponse = JSON.parse(oError.responseText);
                return oResponse.error.message.value || sFallback;
            } catch (e) {
                var sResponseText = oError && oError.responseText
                    ? oError.responseText
                    : "";
                var aXmlMessage = sResponseText.match(
                    /<message(?:\s[^>]*)?>([\s\S]*?)<\/message>/i
                );
                if (aXmlMessage && aXmlMessage[1]) {
                    return aXmlMessage[1]
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .replace(/&amp;/g, "&")
                        .replace(/&quot;/g, "\"")
                        .replace(/&#39;/g, "'");
                }
                return oError && oError.message
                    ? oError.message
                    : sFallback;
            }
        }
    });
});
