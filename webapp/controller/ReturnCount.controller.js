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
      "com.sut.bolgeyonetim.controller.ReturnCount",
      {
        _returnDepositListCache: null,
        _oReturnDepositDialog: null,
        _oReturnDepositGroupContext: null,
        _returnDepositDraftQueue: null,

        onInit: function () {
          var oReturnCountModel = new JSONModel({
            groups: [],
            visibleGroups: [],
            selectedType: "MD",
            selectedStatus: "pending",
            mdCount: 0,
            opCount: 0,
            pendingCount: 0,
            completedCount: 0,
          });
          oReturnCountModel.setSizeLimit(9999);
          this.getView().setModel(oReturnCountModel, "returnCountModel");

          this.getRouter()
            .getRoute("returnCount")
            .attachPatternMatched(this._onRouteMatched, this);
        },

        onAfterRendering: function () {
          var $View = this.getView().$();

          this._attachSelectAllInputEvents(
            $View,
            ".returnCountQuantityInput input",
            ".returnCountSelectAll",
          );
        },

        onExit: function () {
          this.getView().$().off(".returnCountSelectAll");
          if (this._oReturnDepositDialog) {
            this._oReturnDepositDialog.$().off(".returnDepositSelectAll");
          }
          if (this._oReturnDepositDialog) {
            this._oReturnDepositDialog.destroy();
            this._oReturnDepositDialog = null;
          }
        },

        _attachSelectAllInputEvents: function ($Root, sSelector, sNamespace) {
          $Root.off(sNamespace);
          $Root.on(
            "focusin" + sNamespace + " click" + sNamespace,
            sSelector,
            function (oEvent) {
              var oInput = oEvent.currentTarget;

              setTimeout(function () {
                if (oInput && oInput.select) {
                  oInput.select();
                }
              }, 0);
            },
          );
        },

        _onRouteMatched: function () {
          this.byId("idReturnTypeFilterBar").setSelectedKey("MD");
          this.byId("idReturnStatusFilterBar").setSelectedKey("pending");
          var oModel = this.getView().getModel("returnCountModel");
          oModel.setProperty("/selectedType", "MD");
          oModel.setProperty("/selectedStatus", "pending");
          this._loadReturnCountData();
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
          this._loadReturnCountData();
        },

        _loadReturnCountData: function () {
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
          var oReturnDate = new Date(
            Date.UTC(
              parseInt(aDateParts[0], 10),
              parseInt(aDateParts[1], 10) - 1,
              parseInt(aDateParts[2], 10),
              0,
              0,
              0,
            ),
          );
          var aFilters = [
            // ReturnHeader exposes the warehouse/date fields as Lgort
            // and IrsTar in the OData metadata.
            new Filter("Lgort", FilterOperator.EQ, sWarehouseNum),
            new Filter("IrsTar", FilterOperator.EQ, oReturnDate),
          ];

          sap.ui.core.BusyIndicator.show(0);
          // Execute this potentially large deep read outside $batch.
          // Gateway then returns the actual OData error instead of a
          // generic batch/connection timeout response.
          oODataModel.setUseBatch(false);
          oODataModel.read("/ReturnHeaderSet", {
            filters: aFilters,
            urlParameters: {
              $expand: "ToItems",
            },
            success: function (oExpandedData) {
              oODataModel.read("/ReturnHeaderSet", {
                filters: aFilters,
                urlParameters: {
                  $select: "LogUid,Status",
                },
                success: function (oStatusData) {
                  var aHeaders = this._mergeReturnHeaderStatuses(
                    oExpandedData.results || [],
                    oStatusData.results || [],
                  );

                  oODataModel.setUseBatch(true);
                  sap.ui.core.BusyIndicator.hide();
                  this._setReturnCountData(aHeaders);
                }.bind(this),
                error: function (oError) {
                  oODataModel.setUseBatch(true);
                  sap.ui.core.BusyIndicator.hide();
                  MessageBox.error(
                    this._getErrorMessage(
                      oError,
                      "İade durum bilgileri yüklenemedi.",
                    ),
                  );
                }.bind(this),
              });
            }.bind(this),
            error: function (oError) {
              oODataModel.setUseBatch(true);
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(
                this._getErrorMessage(
                  oError,
                  "İade sayım verileri yüklenemedi.",
                ),
              );
            }.bind(this),
          });
        },

        _mergeReturnHeaderStatuses: function (
          aExpandedHeaders,
          aStatusHeaders,
        ) {
          var mStatusByLogUid = {};

          aStatusHeaders.forEach(function (oHeader) {
            mStatusByLogUid[oHeader.LogUid] = String(oHeader.Status || "")
              .trim()
              .toUpperCase();
          });

          return aExpandedHeaders.map(function (oHeader) {
            oHeader.Status = mStatusByLogUid[oHeader.LogUid] || "";
            return oHeader;
          });
        },

        _setReturnCountData: function (aHeaders) {
          var mGroups = {};
          var aGroups = [];
          var iMdCount = 0;
          var iOpCount = 0;
          var mMdPlasiyer = {};
          var mOpPlasiyer = {};

          aHeaders.forEach(
            function (oRawHeader) {
              var oHeader = this._normalizeReturnHeader(oRawHeader);
              oHeader.ShipmentType = String(
                oHeader.ShipmentType || "",
              ).toUpperCase();
              oHeader.Status = String(oHeader.Status || "")
                .trim()
                .toUpperCase();
              var sGroupKey = oHeader.Plasiyer || "";
              var aItems =
                oHeader.ToItems && oHeader.ToItems.results
                  ? oHeader.ToItems.results
                  : oHeader.ToItems || [];

              oHeader.selected = false;
              oHeader.ReturnTypeText =
                oHeader.ReturnType === "P"
                  ? "Plasiyer iade irsaliyesi"
                  : "Müşteri iade irsaliyesi";
              oHeader.ToItems = { results: aItems };

              aItems.forEach(
                function (oItem) {
                  oItem.MengeSiparis = this._toNumber(oItem.MengeSiparis);
                  oItem.MengeFire = this._toNumber(oItem.MengeFire);
                  oItem.MengeKalite = this._toNumber(oItem.MengeKalite);
                  oItem.MengeLansman = this._toNumber(oItem.MengeLansman);
                  oItem.MengeSatilab = this._toNumber(oItem.MengeSatilab);
                  oItem.NoLansman = this._normalizeUpperText(oItem.NoLansman);
                  oItem.MaterialDisplayCode = this._formatMaterialCode(
                    oItem.Matnr,
                  );
                  oItem._completed = oHeader.Status === "S";
                  oItem._countConfirmed = oHeader.Status === "S";
                  oItem.MengeSayim = this._getProductCountTotal(oItem);
                }.bind(this),
              );

              if (!mGroups[sGroupKey]) {
                mGroups[sGroupKey] = {
                  Plasiyer: oHeader.Plasiyer,
                  PlasiyerDisplay: this._formatNumericCode(oHeader.Plasiyer),
                  PlasiyerName: oHeader.PlasiyerName,
                  expanded: false,
                  selectionScope: "ALL",
                  canApprove: false,
                  Waybills: [],
                  ProductItems: [],
                  DepositItems: [],
                  ExternalDeposits: [],
                  ProductCount: 0,
                  DepositCount: 0,
                };
                aGroups.push(mGroups[sGroupKey]);
              }
              mGroups[sGroupKey].Waybills.push(oHeader);

              var sPlasiyerCountKey = "$" + String(
                oHeader.Plasiyer || "",
              );

              if (
                oHeader.ShipmentType === "MD" &&
                !mMdPlasiyer[sPlasiyerCountKey]
              ) {
                mMdPlasiyer[sPlasiyerCountKey] = true;
                iMdCount++;
              } else if (
                oHeader.ShipmentType === "OP" &&
                !mOpPlasiyer[sPlasiyerCountKey]
              ) {
                mOpPlasiyer[sPlasiyerCountKey] = true;
                iOpCount++;
              }
            }.bind(this),
          );

          var oModel = this.getView().getModel("returnCountModel");
          oModel.setProperty("/groups", aGroups);
          oModel.setProperty("/mdCount", iMdCount);
          oModel.setProperty("/opCount", iOpCount);
          this._applyStatusFilter();
        },

        _normalizeReturnHeader: function (oHeader) {
          var oIncludedHeader =
            oHeader && (oHeader.INCLUDE || oHeader.Include || oHeader.include);

          if (!oIncludedHeader || typeof oIncludedHeader !== "object") {
            return oHeader;
          }

          // Standard OData responses expose header properties at the top
          // level. Keep compatibility with custom deep structures that
          // serialize the ABAP include group as a nested object.
          return Object.assign({}, oIncludedHeader, oHeader);
        },

        onStatusFilterSelect: function (oEvent) {
          this.getView()
            .getModel("returnCountModel")
            .setProperty("/selectedStatus", oEvent.getParameter("key"));
          this._applyStatusFilter();
        },

        onTypeFilterSelect: function (oEvent) {
          var oModel = this.getView().getModel("returnCountModel");
          oModel.setProperty("/selectedType", oEvent.getParameter("key"));
          oModel.setProperty("/selectedStatus", "pending");
          this.byId("idReturnStatusFilterBar").setSelectedKey("pending");
          this._applyStatusFilter();
        },

        _applyStatusFilter: function () {
          var oModel = this.getView().getModel("returnCountModel");
          var sType = oModel.getProperty("/selectedType");
          var sStatus = oModel.getProperty("/selectedStatus");
          var sBackendStatus = sStatus === "completed" ? "S" : "N";
          var aGroups = oModel.getProperty("/groups") || [];
          var aVisibleGroups = [];
          var iPendingCount = 0;
          var iCompletedCount = 0;
          var mPendingPlasiyer = {};
          var mCompletedPlasiyer = {};

          aGroups.forEach(
            function (oGroup) {
              var aTypeWaybills = oGroup.Waybills.filter(function (oWaybill) {
                return oWaybill.ShipmentType === sType;
              });
              var aWaybills = aTypeWaybills.filter(function (oWaybill) {
                return oWaybill.Status === sBackendStatus;
              });

              aTypeWaybills.forEach(function (oWaybill) {
                var sPlasiyerKey = "$" + String(
                  oWaybill.Plasiyer || "",
                );

                if (
                  oWaybill.Status === "S" &&
                  !mCompletedPlasiyer[sPlasiyerKey]
                ) {
                  mCompletedPlasiyer[sPlasiyerKey] = true;
                  iCompletedCount++;
                } else if (
                  oWaybill.Status === "N" &&
                  !mPendingPlasiyer[sPlasiyerKey]
                ) {
                  mPendingPlasiyer[sPlasiyerKey] = true;
                  iPendingCount++;
                }
              });

              if (aWaybills.length) {
                var aProductItems = [];
                var aDepositItems = [];
                var mDepositItems = {};

                aWaybills.forEach(
                  function (oWaybill) {
                    oWaybill.selected = true;
                    if (oWaybill.ToItems) {
                      (oWaybill.ToItems.results || []).forEach(
                        function (oItem) {
                          if (oItem.IsDepozito === true) {
                            this._addUniqueDepositItem(
                              aDepositItems,
                              mDepositItems,
                              oItem,
                            );
                          } else {
                            aProductItems.push(oItem);
                          }
                        }.bind(this),
                      );
                    }
                  }.bind(this),
                );

                var aAggregatedProductItems = this._aggregateReturnProductItems(
                  aProductItems,
                );
                var aAggregatedDepositItems = this._aggregateReturnDepositItems(
                  aDepositItems,
                );

                aVisibleGroups.push({
                  Plasiyer: oGroup.Plasiyer,
                  PlasiyerDisplay: oGroup.PlasiyerDisplay,
                  PlasiyerName: oGroup.PlasiyerName,
                  expanded: false,
                  selectionScope: "ALL",
                  canApprove: false,
                  isCompleted: sStatus === "completed",
                  Waybills: aWaybills,
                  ProductItems: aAggregatedProductItems,
                  ProductItemsSource: aProductItems,
                  DepositItems: aAggregatedDepositItems,
                  DepositItemsSource: aDepositItems,
                  ExternalDeposits: [],
                  ProductCount: aAggregatedProductItems.length,
                  DepositCount: aAggregatedDepositItems.length,
                });
              }
            }.bind(this),
          );

          oModel.setProperty("/pendingCount", iPendingCount);
          oModel.setProperty("/completedCount", iCompletedCount);
          oModel.setProperty("/visibleGroups", aVisibleGroups);
        },

        _formatMaterialCode: function (sMatnr) {
          return this._formatNumericCode(sMatnr);
        },

        _formatNumericCode: function (sValue) {
          var sCode = String(sValue || "").replace(/^0+/, "");
          return sCode || "0";
        },

        onSelectionScopeSelect: function (oEvent) {
          var oSource = oEvent.getSource();
          var sSelectionScope = oSource.data("selectionScope");
          var oContext = oSource.getBindingContext("returnCountModel");
          var oGroup = oContext.getObject();

          if (
            !oEvent.getParameter("selected") &&
            oGroup.selectionScope === sSelectionScope
          ) {
            oSource.setSelected(true);
            return;
          }

          oGroup.Waybills.forEach(function (oWaybill) {
            oWaybill.selected =
              sSelectionScope === "ALL" ||
              oWaybill.ReturnType === sSelectionScope;
          });
          this._refreshGroupItems(oContext, sSelectionScope);
        },

        onWaybillSelect: function (oEvent) {
          var oWaybillContext = oEvent
            .getSource()
            .getBindingContext("returnCountModel");
          var oGroupContext = this._getParentContext(oWaybillContext);

          if (oGroupContext) {
            this._refreshGroupItems(oGroupContext);
          }
        },

        _getParentContext: function (oWaybillContext) {
          var sPath = oWaybillContext.getPath();
          var iWaybillSegment = sPath.lastIndexOf("/Waybills/");
          var sGroupPath =
            iWaybillSegment >= 0 ? sPath.substring(0, iWaybillSegment) : "";
          return sGroupPath
            ? oWaybillContext.getModel().getContext(sGroupPath)
            : null;
        },

        _refreshGroupItems: function (oGroupContext, sSelectionScope) {
          var oModel = oGroupContext.getModel();
          var sGroupPath = oGroupContext.getPath();
          var oGroup = oGroupContext.getObject();
          var aProductItems = [];
          var aDepositItems = [];
          var mDepositItems = {};

          oGroup.Waybills.forEach(
            function (oWaybill) {
              if (oWaybill.selected && oWaybill.ToItems) {
                (oWaybill.ToItems.results || []).forEach(
                  function (oItem) {
                    if (oItem.IsDepozito === true) {
                      this._addUniqueDepositItem(
                        aDepositItems,
                        mDepositItems,
                        oItem,
                      );
                    } else {
                      aProductItems.push(oItem);
                    }
                  }.bind(this),
                );
              }
            }.bind(this),
          );

          (oGroup.ExternalDeposits || []).forEach(
            function (oItem) {
              this._addUniqueDepositItem(aDepositItems, mDepositItems, oItem);
            }.bind(this),
          );
          var aAggregatedProductItems = this._aggregateReturnProductItems(
            aProductItems,
          );
          var aAggregatedDepositItems = this._aggregateReturnDepositItems(
            aDepositItems,
          );

          oModel.setProperty(sGroupPath + "/ProductItemsSource", aProductItems);
          oModel.setProperty(sGroupPath + "/DepositItemsSource", aDepositItems);
          oModel.setProperty(sGroupPath + "/ProductItems", aAggregatedProductItems);
          oModel.setProperty(sGroupPath + "/DepositItems", aAggregatedDepositItems);
          oModel.setProperty(
            sGroupPath + "/ProductCount",
            aAggregatedProductItems.length,
          );
          oModel.setProperty(
            sGroupPath + "/DepositCount",
            aAggregatedDepositItems.length,
          );
          oModel.setProperty(
            sGroupPath + "/selectionScope",
            sSelectionScope || this._getSelectionScope(oGroup.Waybills),
          );
          this._updateGroupApprovalState(oModel, sGroupPath);
          oModel.refresh(true);
        },

        _updateGroupApprovalState: function (oModel, sGroupPath) {
          var oGroup = oModel.getProperty(sGroupPath);
          var aWaybills = oGroup && oGroup.Waybills ? oGroup.Waybills : [];
          var bAllWaybillsSelected =
            aWaybills.length > 0 &&
            aWaybills.every(function (oWaybill) {
              return oWaybill.selected;
            });
          var bAllItemsConfirmed =
            aWaybills.length > 0 &&
            aWaybills.every(function (oWaybill) {
              var aItems =
                oWaybill.ToItems && oWaybill.ToItems.results
                  ? oWaybill.ToItems.results
                  : [];
              var aProductItems = aItems.filter(function (oItem) {
                return oItem.IsDepozito !== true;
              });
              return aProductItems.every(function (oItem) {
                return oItem._countConfirmed === true;
              });
            });
          var bAllDepositsConfirmed = (oGroup.DepositItems || []).every(
            function (oItem) {
              return oItem._countConfirmed === true;
            },
          );

          oModel.setProperty(
            sGroupPath + "/canApprove",
            bAllWaybillsSelected && bAllItemsConfirmed && bAllDepositsConfirmed,
          );
        },

        _addUniqueDepositItem: function (aDepositItems, mDepositItems, oItem) {
          var sKey = this._normalizeMaterialNumber(oItem.Matnr);

          if (!mDepositItems[sKey]) {
            mDepositItems[sKey] = true;
            aDepositItems.push(oItem);
          }
        },

        _getReturnItemGroupKey: function (oItem) {
          return [
            this._normalizeMaterialNumber(oItem.Matnr),
            String(oItem.Meins || "").trim(),
            this._normalizeUpperText(oItem.NoLansman),
          ].join("|");
        },

        _aggregateReturnProductItems: function (aItems) {
          var mGroups = {};
          var aAggregated = [];

          aItems.forEach(
            function (oItem) {
              var sKey = this._getReturnItemGroupKey(oItem);
              if (!mGroups[sKey]) {
                mGroups[sKey] = Object.assign({}, oItem, {
                  sourceItems: [],
                  MengeSiparis: this._toNumber(oItem.MengeSiparis),
                  MengeFire: this._toNumber(oItem.MengeFire),
                  MengeKalite: this._toNumber(oItem.MengeKalite),
                  MengeLansman: this._toNumber(oItem.MengeLansman),
                  MengeSatilab: this._toNumber(oItem.MengeSatilab),
                  _countConfirmed: oItem._countConfirmed === true,
                  _completed: oItem._completed === true,
                });
                mGroups[sKey].sourceItems = [];
                aAggregated.push(mGroups[sKey]);
              } else {
                mGroups[sKey].MengeSiparis += this._toNumber(oItem.MengeSiparis);
                mGroups[sKey].MengeFire += this._toNumber(oItem.MengeFire);
                mGroups[sKey].MengeKalite += this._toNumber(oItem.MengeKalite);
                mGroups[sKey].MengeLansman += this._toNumber(oItem.MengeLansman);
                mGroups[sKey].MengeSatilab += this._toNumber(oItem.MengeSatilab);
                mGroups[sKey]._countConfirmed =
                  mGroups[sKey]._countConfirmed && oItem._countConfirmed === true;
                mGroups[sKey]._completed =
                  mGroups[sKey]._completed && oItem._completed === true;
              }

              mGroups[sKey].sourceItems.push(oItem);
            }.bind(this),
          );

          aAggregated.forEach(
            function (oItem) {
              oItem.MengeSayim = this._getProductCountTotal(oItem);
            }.bind(this),
          );

          return aAggregated;
        },

        _aggregateReturnDepositItems: function (aItems) {
          var mGroups = {};
          var aAggregated = [];

          aItems.forEach(
            function (oItem) {
              var sKey = this._getReturnItemGroupKey(oItem);
              if (!mGroups[sKey]) {
                mGroups[sKey] = Object.assign({}, oItem, {
                  sourceItems: [],
                  MengeSayim: this._toNumber(oItem.MengeSayim),
                  _countConfirmed: oItem._countConfirmed === true,
                  _completed: oItem._completed === true,
                });
                mGroups[sKey].sourceItems = [];
                aAggregated.push(mGroups[sKey]);
              } else {
                mGroups[sKey].MengeSayim += this._toNumber(oItem.MengeSayim);
                mGroups[sKey]._countConfirmed =
                  mGroups[sKey]._countConfirmed && oItem._countConfirmed === true;
                mGroups[sKey]._completed =
                  mGroups[sKey]._completed && oItem._completed === true;
              }

              mGroups[sKey].sourceItems.push(oItem);
            }.bind(this),
          );

          return aAggregated;
        },

        _distributeReturnItemCounts: function (aAggregatedItems, aRawItems) {
          var oDistributionMap = new WeakMap();
          var mItemGroups = {};

          aRawItems.forEach(
            function (oItem) {
              var sKey = this._getReturnItemGroupKey(oItem);
              if (!mItemGroups[sKey]) {
                mItemGroups[sKey] = [];
              }
              mItemGroups[sKey].push(oItem);
            }.bind(this),
          );

          aAggregatedItems.forEach(
            function (oAggregatedItem) {
              var sKey = this._getReturnItemGroupKey(oAggregatedItem);
              var aGroupItems = mItemGroups[sKey] || [];

              if (!aGroupItems.length) {
                return;
              }

              var aCategories = [
                "MengeFire",
                "MengeKalite",
                "MengeLansman",
                "MengeSatilab",
              ];
              var aAssignments = this._buildCapacityFirstReturnAssignments(
                oAggregatedItem,
                aGroupItems,
                aCategories,
              );

              aAssignments.forEach(function (oAssignment) {
                var oCounts = oAssignment.counts;

                oCounts.MengeSayim =
                  oCounts.MengeFire +
                  oCounts.MengeKalite +
                  oCounts.MengeLansman +
                  oCounts.MengeSatilab;
                oCounts._countConfirmed =
                  oAggregatedItem._countConfirmed === true;
                oCounts._completed = oAggregatedItem._completed === true;
                oDistributionMap.set(oAssignment.item, oCounts);
              });
            }.bind(this),
          );

          return oDistributionMap;
        },

        _buildCapacityFirstReturnAssignments: function (
          oAggregatedItem,
          aGroupItems,
          aCategories,
        ) {
          var aAssignments = aGroupItems.map(
            function (oItem) {
              return {
                item: oItem,
                remainingCapacity: Math.max(
                  0,
                  Math.round(this._toNumber(oItem.MengeSiparis)),
                ),
                counts: {
                  MengeFire: 0,
                  MengeKalite: 0,
                  MengeLansman: 0,
                  MengeSatilab: 0,
                },
              };
            }.bind(this),
          );

          aCategories.forEach(
            function (sCategory) {
              var iRemainingTotal = Math.round(
                this._toNumber(oAggregatedItem[sCategory]),
              );

              aAssignments.forEach(function (oAssignment) {
                if (iRemainingTotal <= 0) {
                  return;
                }

                var iValue = Math.min(
                  oAssignment.remainingCapacity,
                  iRemainingTotal,
                );
                oAssignment.counts[sCategory] += iValue;
                oAssignment.remainingCapacity -= iValue;
                iRemainingTotal -= iValue;
              });

              if (iRemainingTotal > 0 && aAssignments.length) {
                aAssignments[aAssignments.length - 1].counts[sCategory] +=
                  iRemainingTotal;
              }
            }.bind(this),
          );

          return aAssignments;
        },

        _syncAggregatedCountsToRawItems: function (oAggregatedItem, aSourceItems) {
          if (!oAggregatedItem || !aSourceItems || !aSourceItems.length) {
            return;
          }

          if (
            aSourceItems[0].MengeFire === undefined &&
            aSourceItems[0].MengeKalite === undefined &&
            aSourceItems[0].MengeLansman === undefined &&
            aSourceItems[0].MengeSatilab === undefined
          ) {
            var iRemainingTotal = Math.round(
              this._toNumber(oAggregatedItem.MengeSayim),
            );

            aSourceItems.forEach(function (oItem) {
              var iValue = 0;

              if (iRemainingTotal > 0) {
                iValue = Math.min(
                  Math.max(0, Math.round(this._toNumber(oItem.MengeSiparis))),
                  iRemainingTotal,
                );
              }

              iRemainingTotal -= iValue;

              oItem.MengeSayim = iValue;
              oItem.MengeSatilab = iValue;
              oItem._countConfirmed = oAggregatedItem._countConfirmed === true;
              oItem._completed = oAggregatedItem._completed === true;
            }, this);

            if (iRemainingTotal > 0) {
              aSourceItems[aSourceItems.length - 1].MengeSayim +=
                iRemainingTotal;
              aSourceItems[aSourceItems.length - 1].MengeSatilab +=
                iRemainingTotal;
            }
            return;
          }

          var oDistributionMap = this._distributeReturnItemCounts(
            [oAggregatedItem],
            aSourceItems,
          );

          aSourceItems.forEach(function (oItem) {
            var oCounts = oDistributionMap.get(oItem);
            if (!oCounts) {
              return;
            }
            oItem.MengeFire = oCounts.MengeFire;
            oItem.MengeKalite = oCounts.MengeKalite;
            oItem.MengeLansman = oCounts.MengeLansman;
            oItem.MengeSatilab = oCounts.MengeSatilab;
            oItem.MengeSayim = oCounts.MengeSayim;
            oItem._countConfirmed = oCounts._countConfirmed;
            oItem._completed = oCounts._completed;
          });
        },

        _getSelectionScope: function (aWaybills) {
          var aPlasiyerWaybills = aWaybills.filter(function (oWaybill) {
            return oWaybill.ReturnType === "P";
          });
          var aCustomerWaybills = aWaybills.filter(function (oWaybill) {
            return oWaybill.ReturnType === "M";
          });
          var bAllPlasiyerSelected =
            aPlasiyerWaybills.length > 0 &&
            aPlasiyerWaybills.every(function (oWaybill) {
              return oWaybill.selected;
            });
          var bAllCustomersSelected =
            aCustomerWaybills.length > 0 &&
            aCustomerWaybills.every(function (oWaybill) {
              return oWaybill.selected;
            });
          var bAnyPlasiyerSelected = aPlasiyerWaybills.some(
            function (oWaybill) {
              return oWaybill.selected;
            },
          );
          var bAnyCustomerSelected = aCustomerWaybills.some(
            function (oWaybill) {
              return oWaybill.selected;
            },
          );

          if (bAllPlasiyerSelected && bAllCustomersSelected) {
            return "ALL";
          }
          if (bAllPlasiyerSelected && !bAnyCustomerSelected) {
            return "P";
          }
          if (bAllCustomersSelected && !bAnyPlasiyerSelected) {
            return "M";
          }
          return "";
        },

        onCountChange: function (oEvent) {
          var oInput = oEvent.getSource();
          var oContext = oInput.getBindingContext("returnCountModel");
          var oItem = oContext.getObject();
          var oModel = oContext.getModel();
          var sPath = oContext.getPath();
          var oValueBinding = oInput.getBinding("value");
          var sQuantityPath = oValueBinding && oValueBinding.getPath();
          var fNewValue = this._toNumber(oEvent.getParameter("value"));

          if (oItem._completed || oItem._countConfirmed) {
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

          oModel.setProperty(sPath + "/_countConfirmed", false);
          var fTotal = this._getProductCountTotal(oItem);

          oModel.setProperty(sPath + "/MengeSayim", fTotal);

          if (oItem.sourceItems && oItem.sourceItems.length) {
            this._syncAggregatedCountsToRawItems(oItem, oItem.sourceItems);
          }

          this._updateApprovalStateForItemContext(oContext);
        },

        _getProductCountTotal: function (oItem) {
          return (
            this._toNumber(oItem.MengeFire) +
            this._toNumber(oItem.MengeKalite) +
            this._toNumber(oItem.MengeLansman) +
            this._toNumber(oItem.MengeSatilab)
          );
        },

        onCountConfirmed: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnCountModel");
          var bSelected = oEvent.getParameter("selected");
          var oModel = oContext.getModel();
          var sPath = oContext.getPath();
          var oItem = oContext.getObject();

          oModel.setProperty(sPath + "/_countConfirmed", bSelected);
          oItem._countConfirmed = bSelected;

          if (oItem.sourceItems && oItem.sourceItems.length) {
            oItem.sourceItems.forEach(function (oSourceItem) {
              oSourceItem._countConfirmed = bSelected;
            });
          }

          this._updateApprovalStateForItemContext(oContext);

          if (oContext.getProperty("IsDepozito") === true) {
            this._saveReturnDepositDraftItem(oContext, false).catch(
              function (oError) {
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    "Depozito onayı taslağa kaydedilemedi.",
                  ),
                );
              }.bind(this),
            );
          }
        },

        onConfirmAllCountsPress: function (oEvent) {
          var oGroupContext = oEvent
            .getSource()
            .getBindingContext("returnCountModel");

          if (!oGroupContext) {
            MessageBox.error("Sayım grubu bulunamadı.");
            return;
          }

          var vConfirmed = oEvent.getSource().data("confirmed");
          var bConfirmed = vConfirmed === true || vConfirmed === "true";
          var oModel = oGroupContext.getModel();
          var sGroupPath = oGroupContext.getPath();
          var oGroup = oGroupContext.getObject();
          var aProductItems = oGroup.ProductItems || [];
          var aDepositItems = oGroup.DepositItems || [];

          if (bConfirmed) {
            this._confirmProductCountMismatch(oGroup, function () {
              this._setAllCountsConfirmed(
                oGroupContext,
                bConfirmed,
                aProductItems,
                aDepositItems,
              );
            });
            return;
          }

          this._setAllCountsConfirmed(
            oGroupContext,
            bConfirmed,
            aProductItems,
            aDepositItems,
          );
        },

        _setAllCountsConfirmed: function (
          oGroupContext,
          bConfirmed,
          aProductItems,
          aDepositItems,
        ) {
          var oModel = oGroupContext.getModel();
          var sGroupPath = oGroupContext.getPath();
          var oGroup = oGroupContext.getObject();

          aProductItems.forEach(function (oItem, iIndex) {
            oItem._countConfirmed = bConfirmed;
            oModel.setProperty(
              sGroupPath + "/ProductItems/" + iIndex + "/_countConfirmed",
              bConfirmed,
            );
            if (oItem.sourceItems && oItem.sourceItems.length) {
              oItem.sourceItems.forEach(function (oSourceItem) {
                oSourceItem._countConfirmed = bConfirmed;
              });
            }
          });
          aDepositItems.forEach(function (oItem, iIndex) {
            oItem._countConfirmed = bConfirmed;
            oModel.setProperty(
              sGroupPath + "/DepositItems/" + iIndex + "/_countConfirmed",
              bConfirmed,
            );
            if (oItem.sourceItems && oItem.sourceItems.length) {
              oItem.sourceItems.forEach(function (oSourceItem) {
                oSourceItem._countConfirmed = bConfirmed;
              });
            }
          });

          (oGroup.ProductItemsSource || []).forEach(function (oSourceItem) {
            oSourceItem._countConfirmed = bConfirmed;
          });
          (oGroup.DepositItemsSource || []).forEach(function (oSourceItem) {
            oSourceItem._countConfirmed = bConfirmed;
          });

          this._updateGroupApprovalState(oModel, sGroupPath);
          oModel.refresh(true);

          Promise.all(
            aDepositItems.map(
              function (oItem) {
                return this._saveReturnDepositDraftObject(
                  oGroupContext,
                  oItem,
                  false,
                );
              }.bind(this),
            ),
          )
            .then(function () {
              MessageToast.show(
                bConfirmed
                  ? "Tüm kalemler tamamlandı."
                  : "Tamam işaretleri temizlendi.",
              );
            })
            .catch(
              function (oError) {
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    "Depozito onayları taslağa kaydedilemedi.",
                  ),
                );
              }.bind(this),
            );
        },

        _confirmProductCountMismatch: function (oGroup, fnContinue) {
          if (!this._hasProductCountMismatch(oGroup)) {
            fnContinue.call(this);
            return;
          }

          MessageBox.confirm(
            "Sipariş miktarı ile sayım miktarı uyuşmayan kalemler var. Yine de devam etmek istiyor musunuz?",
            {
              title: "Miktar Uyumsuzluğu",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  fnContinue.call(this);
                }
              }.bind(this),
            },
          );
        },

        _hasProductCountMismatch: function (oGroup) {
          return (oGroup.ProductItems || []).some(
            function (oItem) {
              return (
                this._toNumber(oItem.MengeSayim) !==
                this._toNumber(oItem.MengeSiparis)
              );
            }.bind(this),
          );
        },

        onDepositCountChange: function (oEvent) {
          var oInput = oEvent.getSource();
          var oContext = oInput.getBindingContext("returnCountModel");
          var oModel = oContext.getModel();
          var sPath = oContext.getPath();
          var oItem = oContext.getObject();
          var fQuantity = this._toNumber(oEvent.getParameter("value"));

          if (oItem._completed || oItem._countConfirmed) {
            oInput.setValue(oItem.MengeSayim);
            return;
          }

          if (fQuantity < 0) {
            fQuantity = 0;
            oInput.setValue("0");
            oInput.setValueState("Error");
            oInput.setValueStateText("Negatif miktar girilemez.");
          } else {
            oInput.setValueState("None");
          }

          oItem.MengeSayim = fQuantity;
          oItem.MengeSatilab = fQuantity;
          oItem._countConfirmed = false;
          oModel.setProperty(sPath + "/MengeSayim", fQuantity);
          oModel.setProperty(sPath + "/MengeSatilab", fQuantity);
          oModel.setProperty(sPath + "/_countConfirmed", false);

          if (oItem.sourceItems && oItem.sourceItems.length) {
            oItem.sourceItems.forEach(function (oSourceItem) {
              oSourceItem.MengeSayim = fQuantity;
              oSourceItem.MengeSatilab = fQuantity;
              oSourceItem._countConfirmed = false;
            });
          }

          this._updateApprovalStateForItemContext(oContext);
          this._saveReturnDepositDraftItem(oContext, false).catch(
            function (oError) {
              MessageBox.error(
                this._getErrorMessage(
                  oError,
                  "Depozito miktarı taslağa kaydedilemedi.",
                ),
              );
            }.bind(this),
          );
        },

        onReturnDepositAddPress: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("returnCountModel");

          if (!oContext) {
            MessageBox.error("Depozito grubu bulunamadı.");
            return;
          }

          this._oReturnDepositGroupContext = oContext;
          this._loadReturnDepositCatalog();
        },

        _loadReturnDepositCatalog: function () {
          if (this._returnDepositListCache) {
            this._showReturnDepositDialog(
              this._prepareReturnDepositCatalog(this._returnDepositListCache),
            );
            return;
          }

          var oODataModel = this.getOwnerComponent().getModel();
          sap.ui.core.BusyIndicator.show(0);
          oODataModel.read("/DepositGISet", {
            filters: [new Filter("All", FilterOperator.EQ, "X")],
            success: function (oData) {
              sap.ui.core.BusyIndicator.hide();
              this._returnDepositListCache = JSON.parse(
                JSON.stringify(oData.results || []),
              );
              this._showReturnDepositDialog(
                this._prepareReturnDepositCatalog(this._returnDepositListCache),
              );
            }.bind(this),
            error: function (oError) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(
                this._getErrorMessage(oError, "Depozito listesi yüklenemedi."),
              );
            }.bind(this),
          });
        },

        _prepareReturnDepositCatalog: function (aCatalogItems) {
          var oGroup = this._oReturnDepositGroupContext.getObject();
          var mExistingDeposits = {};
          var mExternalDeposits = {};

          (oGroup.DepositItems || []).forEach(
            function (oItem) {
              var sMatnr = this._normalizeMaterialNumber(oItem.Matnr);
              if (oItem._isExternalDeposit) {
                mExternalDeposits[sMatnr] = oItem;
              } else {
                mExistingDeposits[sMatnr] = true;
              }
            }.bind(this),
          );

          return aCatalogItems.map(
            function (oCatalogItem) {
              var sMatnr = this._normalizeMaterialNumber(oCatalogItem.Matnr);
              var oExternalItem = mExternalDeposits[sMatnr];

              return {
                Matnr: oCatalogItem.Matnr,
                MaterialDisplayCode: this._formatMaterialCode(
                  oCatalogItem.Matnr,
                ),
                Maktx: oCatalogItem.Maktx,
                Meins: oCatalogItem.Meins || "ADT",
                Quantity: oExternalItem
                  ? this._toNumber(oExternalItem.MengeSayim)
                  : 0,
                IsExisting: mExistingDeposits[sMatnr] === true,
              };
            }.bind(this),
          );
        },

        _showReturnDepositDialog: function (aItems) {
          this.getView().setModel(
            new JSONModel({
              items: aItems,
            }),
            "returnDepositAddModel",
          );

          if (!this._oReturnDepositDialog) {
            this._oReturnDepositDialog = sap.ui.xmlfragment(
              "returnDepositAdd",
              "com.sut.bolgeyonetim.view.ReturnDepositAddDialog",
              this,
            );
            this.getView().addDependent(this._oReturnDepositDialog);
            this._oReturnDepositDialog.attachAfterOpen(
              this._attachReturnDepositDialogInputEvents,
              this,
            );
          }

          this._resetReturnDepositSearch();
          this._oReturnDepositDialog.open();
        },

        _resetReturnDepositSearch: function () {
          var oSearchField = sap.ui.core.Fragment.byId(
            "returnDepositAdd",
            "idReturnDepositSearchField",
          );
          var oTable = sap.ui.core.Fragment.byId(
            "returnDepositAdd",
            "idReturnDepositAddTable",
          );
          var oBinding = oTable && oTable.getBinding("items");

          if (oSearchField) {
            oSearchField.setValue("");
          }
          if (oBinding) {
            oBinding.filter([]);
          }
        },

        _attachReturnDepositDialogInputEvents: function () {
          this._attachSelectAllInputEvents(
            this._oReturnDepositDialog.$(),
            ".returnDepositQuantityStepInput input",
            ".returnDepositSelectAll",
          );
        },

        onReturnDepositSearch: function (oEvent) {
          var sQuery = String(
            oEvent.getParameter("newValue") || oEvent.getParameter("query") || "",
          ).trim();
          var oTable = sap.ui.core.Fragment.byId(
            "returnDepositAdd",
            "idReturnDepositAddTable",
          );
          var oBinding = oTable && oTable.getBinding("items");

          if (!oBinding) {
            return;
          }

          if (!sQuery) {
            oBinding.filter([]);
            return;
          }

          oBinding.filter([
            new Filter({
              filters: [
                new Filter("Maktx", FilterOperator.Contains, sQuery),
                new Filter(
                  "MaterialDisplayCode",
                  FilterOperator.Contains,
                  sQuery,
                ),
                new Filter("Matnr", FilterOperator.Contains, sQuery),
              ],
              and: false,
            }),
          ]);
        },

        onReturnDepositQuantityChange: function (oEvent) {
          var oInput = oEvent.getSource();
          var fQuantity = this._toNumber(oEvent.getParameter("value"));

          if (fQuantity < 0) {
            oInput.setValue("0");
            oInput.setValueState("Error");
            oInput.setValueStateText("Negatif miktar girilemez.");
          } else {
            oInput.setValueState("None");
          }
        },

        onReturnDepositAddSave: function () {
          var oDialogModel = this.getView().getModel("returnDepositAddModel");
          var aCatalogItems = oDialogModel.getProperty("/items") || [];
          var oGroupContext = this._oReturnDepositGroupContext;
          var oGroup = oGroupContext.getObject();
          var oModel = oGroupContext.getModel();
          var sGroupPath = oGroupContext.getPath();
          var aPreviousExternalDeposits = (
            oGroup.ExternalDeposits || []
          ).slice();
          var aExternalDeposits = aCatalogItems
            .filter(
              function (oItem) {
                return !oItem.IsExisting && this._toNumber(oItem.Quantity) > 0;
              }.bind(this),
            )
            .map(
              function (oItem, iIndex) {
                var fQuantity = this._toNumber(oItem.Quantity);
                return {
                  LogUid: "",
                  Posnr: String(900001 + iIndex),
                  Matnr: oItem.Matnr || "",
                  Maktx: oItem.Maktx || "",
                  Meins: oItem.Meins || "ADT",
                  MengeSiparis: 0,
                  MengeSayim: fQuantity,
                  MengeFire: 0,
                  MengeKalite: 0,
                  MengeLansman: 0,
                  MengeSatilab: fQuantity,
                  IsDepozito: true,
                  MaterialDisplayCode: this._formatMaterialCode(oItem.Matnr),
                  _completed: false,
                  _countConfirmed: false,
                  _isExternalDeposit: true,
                };
              }.bind(this),
            );
          var aBackendDeposits = (oGroup.DepositItems || []).filter(
            function (oItem) {
              return !oItem._isExternalDeposit;
            },
          );
          var mSelectedMaterials = {};
          aExternalDeposits.forEach(
            function (oItem) {
              mSelectedMaterials[this._normalizeMaterialNumber(oItem.Matnr)] =
                true;
            }.bind(this),
          );
          var aDeletedDeposits = aPreviousExternalDeposits.filter(
            function (oItem) {
              return !mSelectedMaterials[
                this._normalizeMaterialNumber(oItem.Matnr)
              ];
            }.bind(this),
          );

          oModel.setProperty(
            sGroupPath + "/ExternalDeposits",
            aExternalDeposits,
          );
          oModel.setProperty(
            sGroupPath + "/DepositItems",
            aBackendDeposits.concat(aExternalDeposits),
          );
          oModel.setProperty(
            sGroupPath + "/DepositCount",
            aBackendDeposits.length + aExternalDeposits.length,
          );
          this._updateGroupApprovalState(oModel, sGroupPath);
          oModel.refresh(true);

          sap.ui.core.BusyIndicator.show(0);
          Promise.all(
            aExternalDeposits
              .map(
                function (oItem) {
                  return this._saveReturnDepositDraftObject(
                    oGroupContext,
                    oItem,
                    false,
                  );
                }.bind(this),
              )
              .concat(
                aDeletedDeposits.map(
                  function (oItem) {
                    return this._saveReturnDepositDraftObject(
                      oGroupContext,
                      oItem,
                      true,
                    );
                  }.bind(this),
                ),
              ),
          )
            .then(
              function () {
                this._oReturnDepositDialog.close();
                MessageToast.show("Depozito taslağı güncellendi.");
              }.bind(this),
            )
            .catch(
              function (oError) {
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    "Depozito taslağı kaydedilemedi.",
                  ),
                );
              }.bind(this),
            )
            .finally(function () {
              sap.ui.core.BusyIndicator.hide();
            });
        },

        onReturnDepositAddCancel: function () {
          this._oReturnDepositDialog.close();
        },

        _normalizeMaterialNumber: function (sMatnr) {
          return String(sMatnr || "").replace(/^0+/, "");
        },

        _updateApprovalStateForItemContext: function (oItemContext) {
          var oGroupContext = this._getGroupContextForItemContext(oItemContext);

          if (oGroupContext) {
            this._updateGroupApprovalState(
              oItemContext.getModel(),
              oGroupContext.getPath(),
            );
          }
        },

        _getGroupContextForItemContext: function (oItemContext) {
          var sPath = oItemContext.getPath();
          var aItemSegments = ["/ProductItems/", "/DepositItems/"];
          var iItemsSegment = -1;

          aItemSegments.some(function (sSegment) {
            iItemsSegment = sPath.lastIndexOf(sSegment);
            return iItemsSegment >= 0;
          });
          var sGroupPath =
            iItemsSegment >= 0 ? sPath.substring(0, iItemsSegment) : "";

          return sGroupPath
            ? oItemContext.getModel().getContext(sGroupPath)
            : null;
        },

        _saveReturnDepositDraftItem: function (oItemContext, bDeleted) {
          var oGroupContext = this._getGroupContextForItemContext(oItemContext);

          if (!oGroupContext) {
            return Promise.reject(new Error("Depozito grubu bulunamadı."));
          }

          return this._saveReturnDepositDraftObject(
            oGroupContext,
            oItemContext.getObject(),
            bDeleted,
          );
        },

        _saveReturnDepositDraftObject: function (
          oGroupContext,
          oItem,
          bDeleted,
        ) {
          this._returnDepositDraftQueue = (
            this._returnDepositDraftQueue || Promise.resolve()
          )
            .catch(function () {
              // Önceki kayıt hatası sonraki kullanıcı işlemini engellemesin.
            })
            .then(
              function () {
                return this._executeReturnDepositDraftSave(
                  oGroupContext,
                  oItem,
                  bDeleted,
                );
              }.bind(this),
            );

          return this._returnDepositDraftQueue;
        },

        _executeReturnDepositDraftSave: function (
          oGroupContext,
          oItem,
          bDeleted,
        ) {
          var oGroup = oGroupContext.getObject();
          var oDraftHeader = this._getReturnDepositDraftHeader(oGroup);
          var sLogUid = oDraftHeader && oDraftHeader.LogUid;

          if (!sLogUid) {
            return Promise.reject(
              new Error("Depozito taslağı için LogUid bulunamadı."),
            );
          }

          return new Promise(
            function (resolve, reject) {
              this.getOwnerComponent()
                .getModel()
                .callFunction("/SaveReturnDepositDraft", {
                  method: "POST",
                  urlParameters: {
                    LogUid: sLogUid,
                    Plasiyer: oGroup.Plasiyer || "",
                    Lgort: oDraftHeader.Lgort || "",
                    Matnr: oItem.Matnr || "",
                    Meins: oItem.Meins || "",
                    MengeSiparis: this._toODataDecimal(oItem.MengeSiparis),
                    MengeSayim: this._toODataDecimal(oItem.MengeSayim),
                    IsExternal: oItem._isExternalDeposit === true,
                    IsConfirmed: oItem._countConfirmed === true,
                    IsDeleted: bDeleted === true,
                  },
                  success: resolve,
                  error: reject,
                });
            }.bind(this),
          );
        },

        _getReturnDepositDraftHeader: function (oGroup) {
          var aWaybills = oGroup && oGroup.Waybills ? oGroup.Waybills : [];

          return (
            aWaybills.find(function (oWaybill) {
              return oWaybill.selected;
            }) || aWaybills[0]
          );
        },

        _syncReturnDepositDraft: function (oGroupContext) {
          var oGroup = oGroupContext.getObject();
          var aDeposits = oGroup.DepositItems || [];

          return Promise.all(
            aDeposits.map(
              function (oItem) {
                return this._saveReturnDepositDraftObject(
                  oGroupContext,
                  oItem,
                  false,
                );
              }.bind(this),
            ),
          );
        },

        onApproveCountPress: function (oEvent) {
          var oGroupContext = oEvent
            .getSource()
            .getBindingContext("returnCountModel");
          var oGroup = oGroupContext.getObject();
          var aSelectedWaybills = oGroup.Waybills.filter(function (oWaybill) {
            return oWaybill.selected;
          });

          if (!aSelectedWaybills.length) {
            MessageBox.warning("Onaylamak için en az bir irsaliye seçin.");
            return;
          }

          if (!oGroup.canApprove) {
            MessageBox.warning(
              "Tüm irsaliyelerdeki tüm kalemlerin sayımını tamamlayıp " +
                '"Tamam" alanını işaretleyin.',
            );
            return;
          }

          (oGroup.ProductItems || []).forEach(function (oAggregatedItem) {
            this._syncAggregatedCountsToRawItems(
              oAggregatedItem,
              oAggregatedItem.sourceItems || [],
            );
          }, this);
          (oGroup.DepositItems || []).forEach(function (oAggregatedItem) {
            this._syncAggregatedCountsToRawItems(
              oAggregatedItem,
              oAggregatedItem.sourceItems || [],
            );
          }, this);

          var aPayloads = aSelectedWaybills.map(
            function (oHeader, iIndex) {
              return this._buildDeepInsertPayload(
                oHeader,
                iIndex === 0 ? oGroup.DepositItems || [] : [],
              );
            }.bind(this),
          );
          this._rebalanceReturnPayloadItems(aPayloads);

          if (
            aPayloads.some(function (oPayload) {
              return !oPayload.IrsTar;
            })
          ) {
            MessageBox.error(
              "İrsaliye tarihi geçersiz. Tarihi yeniden seçip tekrar deneyin.",
            );
            return;
          }

          this._confirmProductCountMismatch(oGroup, function () {
            this._confirmApproveCount(oGroupContext, aPayloads);
          });
        },

        _confirmApproveCount: function (oGroupContext, aPayloads) {
          MessageBox.confirm(
            aPayloads.length + " irsaliyenin sayımı onaylanacak.",
            {
              title: "Sayımı Onayla",
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.OK) {
                  sap.ui.core.BusyIndicator.show(0);
                  this._syncReturnDepositDraft(oGroupContext)
                    .then(
                      function () {
                        return this._returnDepositDraftQueue;
                      }.bind(this),
                    )
                    .then(
                      function () {
                        sap.ui.core.BusyIndicator.hide();
                        this._submitPayloads(aPayloads);
                      }.bind(this),
                    )
                    .catch(
                      function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(
                          this._getErrorMessage(
                            oError,
                            "Depozito taslağı onay öncesinde kaydedilemedi.",
                          ),
                        );
                      }.bind(this),
                    );
                }
              }.bind(this),
            },
          );
        },

        _buildDeepInsertPayload: function (oHeader, aDepositItems) {
          var aItems =
            oHeader.ToItems && oHeader.ToItems.results
              ? oHeader.ToItems.results
              : [];
          aItems = aItems
            .filter(function (oItem) {
              return oItem.IsDepozito !== true;
            })
            .concat(aDepositItems || []);
          var oIrsTar =
            this._toODataDate(oHeader.IrsTar) || this._getSelectedReturnDate();

          return {
            LogUid: oHeader.LogUid || "",
            VbelnVa: oHeader.VbelnVa || "",
            IrsNo: oHeader.IrsNo || "",
            IrsTar: oIrsTar,
            Lgort: oHeader.Lgort || "",
            Plasiyer: oHeader.Plasiyer || "",
            PlasiyerName: oHeader.PlasiyerName || "",
            Kunnr: oHeader.Kunnr || "",
            KunnrName: oHeader.KunnrName || "",
            ShipmentType: oHeader.ShipmentType || "",
            ReturnType: oHeader.ReturnType || "",
            ToItems: aItems.map(
              function (oItem, iIndex) {
                return {
                  LogUid: oItem.LogUid || oHeader.LogUid || "",
                  Posnr: oItem.Posnr || String(900001 + iIndex),
                  Matnr: oItem.Matnr || "",
                  Maktx: oItem.Maktx || "",
                  Meins: oItem.Meins || "",
                  // OData V2 represents Edm.Decimal values as strings.
                  MengeSiparis: this._toODataDecimal(oItem.MengeSiparis),
                  MengeSayim: this._toODataDecimal(oItem.MengeSayim),
                  MengeFire: this._toODataDecimal(oItem.MengeFire),
                  MengeKalite: this._toODataDecimal(oItem.MengeKalite),
                  MengeLansman: this._toODataDecimal(oItem.MengeLansman),
                  MengeSatilab: this._toODataDecimal(oItem.MengeSatilab),
                  NoLansman: this._normalizeUpperText(oItem.NoLansman),
                  IsDepozito: oItem.IsDepozito === true,
                };
              }.bind(this),
            ),
          };
        },

        _rebalanceReturnPayloadItems: function (aPayloads) {
          var mGroups = {};
          var aCategories = [
            "MengeFire",
            "MengeKalite",
            "MengeLansman",
            "MengeSatilab",
          ];

          (aPayloads || []).forEach(
            function (oPayload) {
              (oPayload.ToItems || []).forEach(
                function (oItem) {
                  var sKey;

                  if (oItem.IsDepozito === true) {
                    return;
                  }

                  sKey = this._getReturnItemGroupKey(oItem);
                  if (!mGroups[sKey]) {
                    mGroups[sKey] = [];
                  }
                  mGroups[sKey].push(oItem);
                }.bind(this),
              );
            }.bind(this),
          );

          Object.keys(mGroups).forEach(
            function (sKey) {
              var aItems = mGroups[sKey];
              var oAggregatedItem = {
                MengeFire: 0,
                MengeKalite: 0,
                MengeLansman: 0,
                MengeSatilab: 0,
              };
              var aAssignments;

              aItems.forEach(
                function (oItem) {
                  aCategories.forEach(
                    function (sCategory) {
                      oAggregatedItem[sCategory] += this._toNumber(
                        oItem[sCategory],
                      );
                    }.bind(this),
                  );
                }.bind(this),
              );

              aAssignments = this._buildCapacityFirstReturnAssignments(
                oAggregatedItem,
                aItems,
                aCategories,
              );

              aAssignments.forEach(
                function (oAssignment) {
                  var oItem = oAssignment.item;
                  var oCounts = oAssignment.counts;

                  oItem.MengeFire = this._toODataDecimal(oCounts.MengeFire);
                  oItem.MengeKalite = this._toODataDecimal(oCounts.MengeKalite);
                  oItem.MengeLansman = this._toODataDecimal(
                    oCounts.MengeLansman,
                  );
                  oItem.MengeSatilab = this._toODataDecimal(
                    oCounts.MengeSatilab,
                  );
                  oItem.MengeSayim = this._toODataDecimal(
                    oCounts.MengeFire +
                      oCounts.MengeKalite +
                      oCounts.MengeLansman +
                      oCounts.MengeSatilab,
                  );
                }.bind(this),
              );
            }.bind(this),
          );
        },

        _getSelectedReturnDate: function () {
          var oFilterModel = this.getOwnerComponent().getModel("filterModel");
          var sSelectedDate = oFilterModel
            ? oFilterModel.getProperty("/selectedDate")
            : "";

          return this._toODataDate(sSelectedDate);
        },

        _toODataDate: function (vValue) {
          var oDate;
          var aDateParts;
          var aODataDate;

          if (vValue instanceof Date) {
            oDate = new Date(vValue.getTime());
          } else if (typeof vValue === "number") {
            oDate = vValue > 0 ? new Date(vValue) : null;
          } else if (typeof vValue === "string") {
            aODataDate = /^\/Date\((\d+)(?:[+-]\d{4})?\)\/$/.exec(vValue);
            if (aODataDate) {
              oDate =
                Number(aODataDate[1]) > 0
                  ? new Date(Number(aODataDate[1]))
                  : null;
            } else {
              aDateParts = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(vValue);
              if (aDateParts) {
                oDate = new Date(
                  Date.UTC(
                    Number(aDateParts[1]),
                    Number(aDateParts[2]) - 1,
                    Number(aDateParts[3]),
                  ),
                );
              }
            }
          }

          return oDate && !isNaN(oDate.getTime()) ? oDate : null;
        },

        _submitPayloads: function (aPayloads) {
          var oODataModel = this.getOwnerComponent().getModel();
          sap.ui.core.BusyIndicator.show(0);
          oODataModel.setUseBatch(false);

          Promise.all(
            aPayloads.map(function (oPayload) {
              return new Promise(function (resolve, reject) {
                oODataModel.create("/ReturnHeaderSet", oPayload, {
                  success: resolve,
                  error: reject,
                });
              });
            }),
          )
            .then(
              function () {
                oODataModel.setUseBatch(true);
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("İade sayımları başarıyla onaylandı.");
                this.refreshDashboardData();
                this._loadReturnCountData();
              }.bind(this),
            )
            .catch(
              function (oError) {
                oODataModel.setUseBatch(true);
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(
                  this._getErrorMessage(oError, "İade sayımı onaylanamadı."),
                );
              }.bind(this),
            );
        },

        _normalizeUpperText: function (vValue) {
          return String(vValue || "").trim().toUpperCase();
        },

        _toNumber: function (vValue) {
          var fValue = parseFloat(vValue);
          return isNaN(fValue) ? 0 : fValue;
        },

        _toODataDecimal: function (vValue) {
          return String(this._toNumber(vValue));
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
