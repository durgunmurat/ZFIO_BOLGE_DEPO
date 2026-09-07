sap.ui.define(
  [
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    DateFormat,
    NumberFormat,
    MessageBox,
    MessageToast,
  ) {
    "use strict";

    var POLL_INTERVAL = 5000;
    var POLL_STORAGE_KEY = "factoryShipmentApprovalPollingLogUid";

    return BaseController.extend(
      "com.sut.bolgeyonetim.controller.FactoryShipmentApproval",
      {
        onInit: function () {
          this._mProcessingLogUids = {};
          this._oDateFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
          this._oQuantityFormat = NumberFormat.getFloatInstance({
            maxFractionDigits: 3,
            minFractionDigits: 0,
            groupingEnabled: true,
          });

          var oViewModel = new JSONModel({
            documents: [],
            filter: {
              date: this._getTodayFilterValue(),
              status: "WAIT_APPROVAL",
            },
            selectedLogUid: "",
            collapsedLogUid: "",
            selectedDocument: null,
            detailItems: [],
            approvalCategoryFilters: [],
            selectedApprovalCategory: "ALL",
            approvalDetailItemCount: 0,
            expandedApprovalItemCount: 0,
            listBusy: false,
            approvalBusy: false,
            rejectionBusy: false,
            canApprove: false,
            canReject: false,
            pollingLogUid: "",
            confirmation: {
              question: "",
              plate: "",
              date: "",
              sourceLgort: "",
              materialCount: 0,
              totalQuantities: [],
              differenceCount: 0,
              differences: [],
            },
            rejection: {
              reason: "",
              reasonValid: false,
              maxLength: this._getFunctionParameterMaxLength(
                "RejectReturnFactoryShipment",
                "RejectionReason",
              ),
              plate: "",
              date: "",
              sourceLgort: "",
            },
          });
          oViewModel.setSizeLimit(9999);
          this.getView().setModel(oViewModel, "factoryApprovalModel");
          this.getOwnerComponent()
            .getModel()
            .metadataLoaded()
            .then(
              function () {
                oViewModel.setProperty(
                  "/rejection/maxLength",
                  this._getFunctionParameterMaxLength(
                    "RejectReturnFactoryShipment",
                    "RejectionReason",
                  ),
                );
              }.bind(this),
            );

          this.getRouter()
            .getRoute("factoryShipmentApproval")
            .attachPatternMatched(this._onRouteMatched, this);
          this.getRouter().attachRouteMatched(this._onAnyRouteMatched, this);
        },

        onExit: function () {
          this._cleanupApprovalResources(true);
          this.getRouter().detachRouteMatched(this._onAnyRouteMatched, this);
          if (this._oApprovalDialog) {
            this._oApprovalDialog.destroy();
            this._oApprovalDialog = null;
          }
          if (this._oRejectionDialog) {
            this._oRejectionDialog.destroy();
            this._oRejectionDialog = null;
          }
        },

        _onRouteMatched: function () {
          this._bApprovalRouteActive = true;
          this.getModel("factoryApprovalModel").setProperty(
            "/filter/date",
            this._getTodayFilterValue(),
          );
          this._loadApprovals().then(
            function () {
              var sPollingLogUid = this._getStoredPollingLogUid();
              if (sPollingLogUid) {
                this._startPolling(sPollingLogUid, true);
              }
            }.bind(this),
          );
        },

        _onAnyRouteMatched: function (oEvent) {
          if (oEvent.getParameter("name") !== "factoryShipmentApproval") {
            this._bApprovalRouteActive = false;
            this._cleanupApprovalResources(false);
          }
        },

        onRefreshPress: function () {
          this._loadApprovals();
        },

        onApprovalFilterPress: function () {
          this._loadApprovals();
        },

        onApprovalDateFilterChange: function (oEvent) {
          var oDatePicker = oEvent.getSource();
          var oDate = oDatePicker.getDateValue();
          var sDate = "";

          if (oDate && oEvent.getParameter("valid") !== false) {
            sDate =
              String(oDate.getFullYear()).padStart(4, "0") +
              "-" +
              String(oDate.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(oDate.getDate()).padStart(2, "0");
          }

          this.getModel("factoryApprovalModel").setProperty(
            "/filter/date",
            sDate,
          );
          this._loadApprovals();
        },

        onApprovalStatusFilterChange: function (oEvent) {
          this.getModel("factoryApprovalModel").setProperty(
            "/filter/status",
            oEvent.getSource().getSelectedKey(),
          );
          this._loadApprovals();
        },

        onApprovalFilterResetPress: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          oViewModel.setProperty("/filter/date", this._getTodayFilterValue());
          oViewModel.setProperty("/filter/status", "WAIT_APPROVAL");
          this._loadApprovals();
        },

        _getTodayFilterValue: function () {
          var oToday = new Date();

          return (
            String(oToday.getFullYear()).padStart(4, "0") +
            "-" +
            String(oToday.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(oToday.getDate()).padStart(2, "0")
          );
        },

        _buildApprovalFilters: function () {
          var oFilter =
            this.getModel("factoryApprovalModel").getProperty("/filter") || {};
          var aFilters = [];
          var sStatus = String(oFilter.status || "WAIT_APPROVAL");

          if (sStatus === "ALL") {
            // An explicit, unrestricted status filter prevents the service's
            // default WAIT_APPROVAL restriction from being applied.
            aFilters.push(new Filter("Status", FilterOperator.NE, ""));
          } else if (sStatus === "COMPLETE") {
            aFilters.push(new Filter("Status", FilterOperator.EQ, "S"));
          } else if (sStatus === "ERROR") {
            aFilters.push(new Filter("Status", FilterOperator.EQ, "E"));
          } else if (sStatus === "REJECTED") {
            aFilters.push(new Filter("Status", FilterOperator.EQ, "R"));
          } else {
            aFilters.push(new Filter("LastStep", FilterOperator.EQ, sStatus));
          }

          return aFilters;
        },

        _loadApprovals: function (aFilters) {
          var oViewModel = this.getModel("factoryApprovalModel");
          var sSelectedLogUid = oViewModel.getProperty("/selectedLogUid");
          var iRequestId = (this._iListRequestId || 0) + 1;
          this._iListRequestId = iRequestId;
          oViewModel.setProperty("/listBusy", true);

          return this._readApprovalRows(
            aFilters || this._buildApprovalFilters(),
            false,
            true,
          )
            .then(
              function (aRows) {
                if (iRequestId !== this._iListRequestId) {
                  return [];
                }
                var aDocuments = this._filterApprovalDocumentsByDate(
                  this._groupRows(aRows),
                );
                oViewModel.setProperty("/documents", aDocuments);
                this._selectDocumentByLogUid(sSelectedLogUid, false);
                return aDocuments;
              }.bind(this),
            )
            .catch(
              function (oError) {
                if (iRequestId !== this._iListRequestId) {
                  return [];
                }
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    this._text("factoryApprovalLoadError"),
                  ),
                );
                return [];
              }.bind(this),
            )
            .then(
              function (vResult) {
                if (iRequestId === this._iListRequestId) {
                  oViewModel.setProperty("/listBusy", false);
                }
                return vResult;
              }.bind(this),
            );
        },

        _filterApprovalDocumentsByDate: function (aDocuments) {
          var sSelectedDate = String(
            this.getModel("factoryApprovalModel").getProperty("/filter/date") ||
              "",
          );
          var aDateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sSelectedDate);

          if (!aDateParts) {
            return aDocuments || [];
          }

          var sExpectedDate =
            aDateParts[3] + "." + aDateParts[2] + "." + aDateParts[1];
          return (aDocuments || []).filter(function (oDocument) {
            return oDocument.IrsTarText === sExpectedDate;
          });
        },

        _readApprovalRows: function (aFilters, bPollingRequest, bListRequest) {
          var oODataModel = this.getOwnerComponent().getModel();

          return new Promise(
            function (resolve, reject) {
              var oRequest;
              oRequest = oODataModel.read("/ReturnFactoryApprovalSet", {
                filters: aFilters || [],
                success: function (oData) {
                  if (bPollingRequest) {
                    this._oPollingRequest = null;
                  }
                  if (bListRequest && this._oListRequest === oRequest) {
                    this._oListRequest = null;
                  }
                  resolve((oData && oData.results) || []);
                }.bind(this),
                error: function (oError) {
                  if (bPollingRequest) {
                    this._oPollingRequest = null;
                  }
                  if (bListRequest && this._oListRequest === oRequest) {
                    this._oListRequest = null;
                  }
                  reject(oError);
                }.bind(this),
              });

              if (bPollingRequest) {
                this._oPollingRequest = oRequest;
              }
              if (bListRequest) {
                this._oListRequest = oRequest;
              }
            }.bind(this),
          );
        },

        _groupRows: function (aRows) {
          var mDocuments = {};
          var aOrder = [];

          (aRows || []).forEach(
            function (oRow) {
              var sLogUid = String(oRow.LogUid || "");
              if (!mDocuments[sLogUid]) {
                mDocuments[sLogUid] = {
                  LogUid: sLogUid,
                  PlakaNo: oRow.PlakaNo || "",
                  IrsTar: oRow.IrsTar,
                  IrsTarText: this._formatDate(oRow.IrsTar),
                  Werks: oRow.Werks || "",
                  Lgort: oRow.Lgort || "",
                  SourceLgort: oRow.SourceLgort || "",
                  Status: oRow.Status || "",
                  LastStep: oRow.LastStep || "",
                  LastMessage: oRow.LastMessage || "",
                  SnapshotHashes: {},
                  SnapshotHash: "",
                  Ebeln: oRow.Ebeln || "",
                  Mblnr351: oRow.Mblnr351 || "",
                  Mjahr351: oRow.Mjahr351 || "",
                  Items: [],
                  MaterialKeys: {},
                  DifferenceMaterialKeys: {},
                  MaterialCount: 0,
                  TotalQuantityValue: 0,
                  TotalsByUnit: {},
                  TotalStocksByUnit: {},
                  TotalDifferencesByUnit: {},
                  TotalQuantities: [],
                  TotalStocks: [],
                  TotalDifferences: [],
                  DifferenceCount: 0,
                  StatusKey: "",
                  StatusText: "",
                  StatusState: "None",
                  Processing: false,
                };
                aOrder.push(sLogUid);
              }

              var oDocument = mDocuments[sLogUid];
              var fCurrentStock = this._toNumber(oRow.MevcutStok);
              var fTotalCount = this._toNumber(oRow.ToplamSayim);
              var fDifference = fCurrentStock - fTotalCount;
              var fOther = Math.max(
                fCurrentStock -
                  this._toNumber(oRow.SatisFiresi) -
                  this._toNumber(oRow.UretimHatali) -
                  this._toNumber(oRow.FabrikaLojistik),
                0,
              );
              var oItem = Object.assign({}, oRow, {
                Fark: fDifference,
                Diger: fOther,
                MatnrText: this._formatMaterialCode(oRow.Matnr),
                MevcutStokText: this._formatQuantity(fCurrentStock),
                SatisFiresiText: this._formatQuantity(oRow.SatisFiresi),
                UretimHataliText: this._formatQuantity(oRow.UretimHatali),
                FabrikaLojistikText: this._formatQuantity(oRow.FabrikaLojistik),
                DigerText: this._formatQuantity(fOther),
                ToplamSayimText: this._formatQuantity(fTotalCount),
                FarkText: this._formatQuantity(fDifference),
                DifferenceState: this._getDifferenceState(fDifference),
                DifferenceHighlight: this._getDifferenceHighlight(fDifference),
                _expanded: false,
              });

              oDocument.Items.push(oItem);
              oDocument.MaterialKeys[String(oRow.Matnr || oRow.Posnr || "")] = true;
              oDocument.TotalQuantityValue += this._toNumber(oRow.ToplamSayim);
              var sUnit = String(oRow.Meins || "");
              oDocument.TotalsByUnit[sUnit] =
                (oDocument.TotalsByUnit[sUnit] || 0) +
                fTotalCount;
              oDocument.TotalStocksByUnit[sUnit] =
                (oDocument.TotalStocksByUnit[sUnit] || 0) + fCurrentStock;
              oDocument.TotalDifferencesByUnit[sUnit] =
                (oDocument.TotalDifferencesByUnit[sUnit] || 0) + fDifference;
              if (fDifference !== 0) {
                oDocument.DifferenceMaterialKeys[
                  String(oRow.Matnr || oRow.Posnr || "")
                ] = true;
              }
              if (oRow.SnapshotHash) {
                oDocument.SnapshotHashes[oRow.SnapshotHash] = true;
              }
              oDocument.LastMessage = oRow.LastMessage || oDocument.LastMessage;
              oDocument.Ebeln = oRow.Ebeln || oDocument.Ebeln;
              oDocument.Mblnr351 = oRow.Mblnr351 || oDocument.Mblnr351;
              oDocument.Mjahr351 = oRow.Mjahr351 || oDocument.Mjahr351;
              oDocument.Status = oRow.Status || oDocument.Status;
              oDocument.LastStep = oRow.LastStep || oDocument.LastStep;
            }.bind(this),
          );

          return aOrder.map(
            function (sLogUid) {
              var oDocument = mDocuments[sLogUid];
              var aHashes = Object.keys(oDocument.SnapshotHashes);
              oDocument.SnapshotHash = aHashes.length === 1 ? aHashes[0] : "";
              oDocument.HasSnapshotMismatch = aHashes.length !== 1;
              oDocument.MaterialCount = Object.keys(
                oDocument.MaterialKeys,
              ).length;
              oDocument.DifferenceCount = Object.keys(
                oDocument.DifferenceMaterialKeys,
              ).length;
              oDocument.TotalQuantities = Object.keys(
                oDocument.TotalsByUnit,
              ).map(
                function (sUnit) {
                  return {
                    NumberText: this._formatQuantity(
                      oDocument.TotalsByUnit[sUnit],
                    ),
                    Meins: sUnit,
                  };
                }.bind(this),
              );
              oDocument.TotalStocks = this._quantityTotalsToArray(
                oDocument.TotalStocksByUnit,
              );
              oDocument.TotalDifferences = this._quantityTotalsToArray(
                oDocument.TotalDifferencesByUnit,
              );
              oDocument.StatusKey = this._getStatusKey(
                oDocument.Status,
                oDocument.LastStep,
              );
              oDocument.ShowStockComparison =
                oDocument.StatusKey !== "COMPLETE";
              var bSubmitted =
                ["WAIT_APPROVAL", "QUEUED", "RUNNING"].indexOf(
                  oDocument.StatusKey,
                ) !== -1 &&
                Boolean(
                  this._mProcessingLogUids[oDocument.LogUid] ||
                    this._getStoredPollingLogUid() === oDocument.LogUid ||
                    oDocument.StatusKey === "QUEUED" ||
                    oDocument.StatusKey === "RUNNING",
                );
              oDocument.StatusText = bSubmitted
                ? this._text("factoryStatusSubmitted")
                : this._getStatusText(oDocument.StatusKey);
              oDocument.StatusState = bSubmitted
                ? "Success"
                : this._getStatusState(oDocument.StatusKey);
              if (bSubmitted) {
                oDocument.LastMessage = this._text(
                  "factoryApprovalSubmittedMessage",
                );
              } else if (oDocument.StatusKey === "COMPLETE") {
                oDocument.LastMessage = this._text(
                  "factoryApprovalCompleteMessage",
                );
              }
              oDocument.ActionAllowed =
                !bSubmitted &&
                String(oDocument.Status || "").toUpperCase() === "P" &&
                String(oDocument.LastStep || "").toUpperCase() ===
                  "WAIT_APPROVAL";
              oDocument.Processing = Boolean(
                this._mProcessingLogUids[oDocument.LogUid] ||
                  oDocument.StatusKey === "QUEUED" ||
                  oDocument.StatusKey === "RUNNING",
              );
              oDocument.Items.forEach(function (oItem) {
                oItem.StatusText = oDocument.StatusText;
                oItem.StatusState = oDocument.StatusState;
                oItem.ShowStockComparison = oDocument.ShowStockComparison;
                if (!oDocument.ShowStockComparison) {
                  oItem.DifferenceHighlight = "None";
                }
              });
              return oDocument;
            }.bind(this),
          );
        },

        onDocumentSelectionChange: function (oEvent) {
          var oListItem = oEvent.getParameter("listItem");
          var oContext =
            oListItem && oListItem.getBindingContext("factoryApprovalModel");
          var oDocument = oContext && oContext.getObject();
          var sCurrentPolling = this.getModel("factoryApprovalModel").getProperty(
            "/pollingLogUid",
          );

          if (!oDocument) {
            this._clearSelection();
            return;
          }

          if (
            this.getModel("factoryApprovalModel").getProperty(
              "/selectedLogUid",
            ) === oDocument.LogUid
          ) {
            this.getModel("factoryApprovalModel").setProperty(
              "/collapsedLogUid",
              oDocument.LogUid,
            );
            this._clearSelection();
            return;
          }

          if (sCurrentPolling && sCurrentPolling !== oDocument.LogUid) {
            this._stopPolling(true);
          }

          this._setSelectedDocument(oDocument);
          if (
            oDocument.StatusKey === "QUEUED" ||
            oDocument.StatusKey === "RUNNING"
          ) {
            this._startPolling(oDocument.LogUid, true);
          }
        },

        _setSelectedDocument: function (oDocument) {
          var oViewModel = this.getModel("factoryApprovalModel");
          var sPreviousLogUid = oViewModel.getProperty("/selectedLogUid");

          oViewModel.setProperty("/collapsedLogUid", "");
          if (sPreviousLogUid !== oDocument.LogUid) {
            oViewModel.setProperty("/selectedApprovalCategory", "ALL");
            oDocument.Items.forEach(function (oItem) {
              oItem._expanded = false;
            });
          }
          oViewModel.setProperty("/selectedLogUid", oDocument.LogUid);
          oViewModel.setProperty("/selectedDocument", oDocument);
          oViewModel.setProperty(
            "/canApprove",
            oDocument.ActionAllowed === true &&
              !oDocument.Processing &&
              !oViewModel.getProperty("/approvalBusy") &&
              !oViewModel.getProperty("/rejectionBusy"),
          );
          this._applyApprovalCategoryFilter();
          oViewModel.setProperty(
            "/canReject",
            oDocument.ActionAllowed === true &&
              !oDocument.Processing &&
              !oViewModel.getProperty("/approvalBusy") &&
              !oViewModel.getProperty("/rejectionBusy"),
          );
        },

        _selectDocumentByLogUid: function (sLogUid, bSelectFirst) {
          var oViewModel = this.getModel("factoryApprovalModel");
          var aDocuments = oViewModel.getProperty("/documents") || [];
          var oDocument = aDocuments.find(function (oItem) {
            return oItem.LogUid === sLogUid;
          });

          if (!oDocument && bSelectFirst) {
            oDocument = aDocuments[0];
          }
          if (oDocument) {
            this._setSelectedDocument(oDocument);
          } else {
            this._clearSelection();
          }
        },

        _clearSelection: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          oViewModel.setProperty("/selectedLogUid", "");
          oViewModel.setProperty("/selectedDocument", null);
          oViewModel.setProperty("/detailItems", []);
          oViewModel.setProperty("/approvalCategoryFilters", []);
          oViewModel.setProperty("/selectedApprovalCategory", "ALL");
          oViewModel.setProperty("/approvalDetailItemCount", 0);
          oViewModel.setProperty("/expandedApprovalItemCount", 0);
          oViewModel.setProperty("/canApprove", false);
          oViewModel.setProperty("/canReject", false);
        },

        onApprovalCategoryFilterPress: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("factoryApprovalModel");
          var sCategoryKey = oContext ? oContext.getProperty("key") : "ALL";

          this.getModel("factoryApprovalModel").setProperty(
            "/selectedApprovalCategory",
            sCategoryKey || "ALL",
          );
          this._applyApprovalCategoryFilter();
        },

        _applyApprovalCategoryFilter: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          var oDocument = oViewModel.getProperty("/selectedDocument");
          var aItems = (oDocument && oDocument.Items) || [];
          var sCategoryKey =
            oViewModel.getProperty("/selectedApprovalCategory") || "ALL";
          if (oDocument && !oDocument.ShowStockComparison) {
            sCategoryKey = "ALL";
            oViewModel.setProperty("/selectedApprovalCategory", "ALL");
          }
          var aDefinitions = this._getApprovalCategoryFilterDefinitions();
          var oDefinition = aDefinitions.find(function (oItem) {
            return oItem.key === sCategoryKey;
          });

          if (!oDefinition) {
            oDefinition = aDefinitions[0];
            oViewModel.setProperty("/selectedApprovalCategory", "ALL");
          }

          oViewModel.setProperty(
            "/approvalCategoryFilters",
            this._getApprovalCategoryFilterOptions(aItems),
          );
          var aDetailItems = oDefinition.differenceOnly
            ? aItems.filter(function (oItem) {
                return this._toNumber(oItem.Fark) !== 0;
              }.bind(this))
            : aItems.slice();
          oViewModel.setProperty("/detailItems", aDetailItems);
          this._updateApprovalExpansionState();
        },

        _getApprovalCategoryFilterDefinitions: function () {
          return [
            { key: "ALL", textKey: "factoryApprovalCategoryAll" },
            {
              key: "DIFFERENCES",
              textKey: "factoryApprovalCategoryDifferences",
              differenceOnly: true,
            },
          ];
        },

        _getApprovalCategoryFilterOptions: function (aItems) {
          var aProductItems = aItems || [];

          return this._getApprovalCategoryFilterDefinitions().map(
            function (oDefinition) {
              var iCount = oDefinition.differenceOnly
                ? aProductItems.filter(
                    function (oItem) {
                      return this._toNumber(oItem.Fark) !== 0;
                    }.bind(this),
                  ).length
                : aProductItems.length;

              return {
                key: oDefinition.key,
                count: iCount,
                text: this._text("factoryApprovalCategoryOption", [
                  this._text(oDefinition.textKey),
                  iCount,
                ]),
              };
            }.bind(this),
          );
        },

        onApprovalItemTogglePress: function (oEvent) {
          var oContext = oEvent
            .getSource()
            .getBindingContext("factoryApprovalModel");
          if (!oContext) {
            return;
          }
          var oViewModel = oContext.getModel();
          var sPath = oContext.getPath() + "/_expanded";
          oViewModel.setProperty(sPath, oViewModel.getProperty(sPath) !== true);
          this._updateApprovalExpansionState();
        },

        onExpandAllApprovalItemsPress: function (oEvent) {
          var vExpanded = oEvent.getSource().data("expanded");
          var bExpanded = vExpanded === true || vExpanded === "true";
          var oViewModel = this.getModel("factoryApprovalModel");
          var aItems = oViewModel.getProperty("/detailItems") || [];
          aItems.forEach(function (oItem, iIndex) {
            oItem._expanded = bExpanded;
            oViewModel.setProperty(
              "/detailItems/" + iIndex + "/_expanded",
              bExpanded,
            );
          });
          this._updateApprovalExpansionState();
          oViewModel.refresh(true);
        },

        _updateApprovalExpansionState: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          var aItems = oViewModel.getProperty("/detailItems") || [];
          oViewModel.setProperty("/approvalDetailItemCount", aItems.length);
          oViewModel.setProperty(
            "/expandedApprovalItemCount",
            aItems.filter(function (oItem) {
              return oItem._expanded === true;
            }).length,
          );
        },

        _quantityTotalsToArray: function (mTotals) {
          return Object.keys(mTotals || {}).map(
            function (sUnit) {
              return {
                NumberText: this._formatQuantity(mTotals[sUnit]),
                Meins: sUnit,
              };
            }.bind(this),
          );
        },

        onApprovePress: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          var oDocument = oViewModel.getProperty("/selectedDocument");

          if (!oDocument) {
            MessageBox.warning(this._text("factoryApprovalSelectDocument"));
            return;
          }
          if (!oDocument.ActionAllowed) {
            return;
          }
          if (oDocument.Processing || this._mProcessingLogUids[oDocument.LogUid]) {
            return;
          }
          if (oDocument.HasSnapshotMismatch || !oDocument.SnapshotHash) {
            MessageBox.warning(this._text("factoryApprovalSnapshotMismatch"));
            this._loadApprovals();
            return;
          }

          var aDifferences = oDocument.Items.filter(function (oItem) {
            return Number(oItem.Fark) !== 0;
          });
          oViewModel.setProperty("/confirmation", {
            question: this._text(
              aDifferences.length
                ? "factoryApprovalConfirmWithDifference"
                : "factoryApprovalConfirmWithoutDifference",
            ),
            plate: oDocument.PlakaNo,
            date: oDocument.IrsTarText,
            sourceLgort: oDocument.SourceLgort,
            materialCount: oDocument.MaterialCount,
            totalQuantities: oDocument.TotalQuantities,
            differenceCount: oDocument.DifferenceCount,
            differences: aDifferences,
          });
          this._openApprovalDialog();
        },

        _openApprovalDialog: function () {
          if (!this._oApprovalDialog) {
            this._oApprovalDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.sut.bolgeyonetim.view.FactoryShipmentApprovalDialog",
              this,
            );
            this.getView().addDependent(this._oApprovalDialog);
            this._oApprovalDialog.setEscapeHandler(
              function (oPromise) {
                if (
                  !this.getModel("factoryApprovalModel").getProperty(
                    "/approvalBusy",
                  )
                ) {
                  oPromise.resolve();
                }
              }.bind(this),
            );
          }
          this._oApprovalDialog.open();
        },

        onConfirmApproval: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          var oDocument = oViewModel.getProperty("/selectedDocument");

          if (
            !oDocument ||
            !oDocument.ActionAllowed ||
            oViewModel.getProperty("/approvalBusy") ||
            oViewModel.getProperty("/rejectionBusy") ||
            this._mProcessingLogUids[oDocument.LogUid]
          ) {
            return;
          }

          this._mProcessingLogUids[oDocument.LogUid] = true;
          oDocument.Processing = true;
          oViewModel.setProperty("/approvalBusy", true);
          oViewModel.setProperty("/canApprove", false);
          oViewModel.setProperty("/canReject", false);
          oViewModel.refresh(true);

          this.getOwnerComponent().getModel().callFunction(
            "/ApproveReturnFactoryShipment",
            {
              method: "POST",
              urlParameters: {
                LogUid: oDocument.LogUid,
                SnapshotHash: oDocument.SnapshotHash,
              },
              success: function () {
                oViewModel.setProperty("/approvalBusy", false);
                if (this._oApprovalDialog) {
                  this._oApprovalDialog.close();
                }
                oDocument.StatusText = this._text("factoryStatusSubmitted");
                oDocument.StatusState = "Success";
                oDocument.LastMessage = this._text(
                  "factoryApprovalSubmittedMessage",
                );
                oDocument.ActionAllowed = false;
                oDocument.Items.forEach(function (oItem) {
                  oItem.StatusText = oDocument.StatusText;
                  oItem.StatusState = oDocument.StatusState;
                });
                oViewModel.refresh(true);
                MessageToast.show(
                  this._text("factoryApprovalSubmittedMessage"),
                );
                this._storePollingLogUid(oDocument.LogUid);
                if (this._bApprovalRouteActive) {
                  this._startPolling(oDocument.LogUid, true);
                }
              }.bind(this),
              error: function (oError) {
                delete this._mProcessingLogUids[oDocument.LogUid];
                oViewModel.setProperty("/approvalBusy", false);
                oDocument.Processing = false;
                this._setSelectedDocument(oDocument);
                if (this._oApprovalDialog) {
                  this._oApprovalDialog.close();
                }
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    this._text("factoryApprovalActionError"),
                  ),
                );
                this._reloadLogUid(oDocument.LogUid);
              }.bind(this),
            },
          );
        },

        onCancelApproval: function () {
          if (
            this._oApprovalDialog &&
            !this.getModel("factoryApprovalModel").getProperty("/approvalBusy")
          ) {
            this._oApprovalDialog.close();
          }
        },

        onRejectPress: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          var oDocument = oViewModel.getProperty("/selectedDocument");

          if (!oDocument) {
            MessageBox.warning(this._text("factoryApprovalSelectDocument"));
            return;
          }
          if (
            !oDocument.ActionAllowed ||
            oDocument.Processing ||
            this._mProcessingLogUids[oDocument.LogUid]
          ) {
            return;
          }

          oViewModel.setProperty("/rejection/reason", "");
          oViewModel.setProperty("/rejection/reasonValid", false);
          oViewModel.setProperty("/rejection/plate", oDocument.PlakaNo);
          oViewModel.setProperty("/rejection/date", oDocument.IrsTarText);
          oViewModel.setProperty(
            "/rejection/sourceLgort",
            oDocument.SourceLgort,
          );
          this._openRejectionDialog();
        },

        _openRejectionDialog: function () {
          if (!this._oRejectionDialog) {
            this._oRejectionDialog = sap.ui.xmlfragment(
              this.getView().getId(),
              "com.sut.bolgeyonetim.view.FactoryShipmentRejectionDialog",
              this,
            );
            this.getView().addDependent(this._oRejectionDialog);
            this._oRejectionDialog.setEscapeHandler(
              function (oPromise) {
                if (
                  !this.getModel("factoryApprovalModel").getProperty(
                    "/rejectionBusy",
                  )
                ) {
                  oPromise.resolve();
                }
              }.bind(this),
            );
          }
          this._oRejectionDialog.open();
        },

        onRejectionReasonLiveChange: function (oEvent) {
          var sReason = String(oEvent.getParameter("value") || "").trim();
          var iMaxLength = Number(
            this.getModel("factoryApprovalModel").getProperty(
              "/rejection/maxLength",
            ) || 0,
          );
          this.getModel("factoryApprovalModel").setProperty(
            "/rejection/reasonValid",
            sReason.length > 0 &&
              (iMaxLength === 0 || sReason.length <= iMaxLength),
          );
        },

        onConfirmRejection: function () {
          var oViewModel = this.getModel("factoryApprovalModel");
          var oDocument = oViewModel.getProperty("/selectedDocument");
          var sReason = String(
            oViewModel.getProperty("/rejection/reason") || "",
          ).trim();
          var iReasonMaxLength = Number(
            oViewModel.getProperty("/rejection/maxLength") || 0,
          );

          if (
            !oDocument ||
            !oDocument.ActionAllowed ||
            !sReason ||
            (iReasonMaxLength > 0 && sReason.length > iReasonMaxLength) ||
            oViewModel.getProperty("/rejectionBusy") ||
            this._mProcessingLogUids[oDocument.LogUid]
          ) {
            return;
          }

          oViewModel.setProperty("/rejection/reason", sReason);
          oViewModel.setProperty("/rejectionBusy", true);
          oViewModel.setProperty("/canApprove", false);
          oViewModel.setProperty("/canReject", false);
          this._mProcessingLogUids[oDocument.LogUid] = true;
          oDocument.Processing = true;
          oViewModel.refresh(true);

          this.getOwnerComponent().getModel().callFunction(
            "/RejectReturnFactoryShipment",
            {
              method: "POST",
              urlParameters: {
                LogUid: oDocument.LogUid,
                RejectionReason: sReason,
              },
              success: function (oData) {
                delete this._mProcessingLogUids[oDocument.LogUid];
                oViewModel.setProperty("/rejectionBusy", false);
                if (
                  oViewModel.getProperty("/pollingLogUid") === oDocument.LogUid
                ) {
                  this._stopPolling(true);
                }
                if (this._oRejectionDialog) {
                  this._oRejectionDialog.close();
                }
                if (oData && oData.Message) {
                  MessageToast.show(oData.Message);
                }
                this.refreshDashboardData(false);
                this._clearSelection();
                this._loadApprovals();
              }.bind(this),
              error: function (oError) {
                delete this._mProcessingLogUids[oDocument.LogUid];
                oViewModel.setProperty("/rejectionBusy", false);
                oDocument.Processing = false;
                MessageBox.error(
                  this._getErrorMessage(
                    oError,
                    this._text("factoryRejectionActionError"),
                  ),
                );
                this._reloadLogUid(oDocument.LogUid).then(
                  function (oReloadedDocument) {
                    if (
                      !oReloadedDocument ||
                      !oReloadedDocument.ActionAllowed
                    ) {
                      this._loadApprovals();
                    } else {
                      this._setSelectedDocument(oReloadedDocument);
                    }
                  }.bind(this),
                );
              }.bind(this),
            },
          );
        },

        onCancelRejection: function () {
          if (
            this._oRejectionDialog &&
            !this.getModel("factoryApprovalModel").getProperty(
              "/rejectionBusy",
            )
          ) {
            this._oRejectionDialog.close();
          }
        },

        _reloadLogUid: function (sLogUid) {
          return this._readApprovalRows([
            new Filter("LogUid", FilterOperator.EQ, sLogUid),
          ])
            .then(
              function (aRows) {
                var aDocuments = this._groupRows(aRows);
                if (aDocuments[0]) {
                  this._upsertDocument(aDocuments[0]);
                }
                return aDocuments[0] || null;
              }.bind(this),
            )
            .catch(function () {
              return null;
            });
        },

        _startPolling: function (sLogUid, bImmediate) {
          if (!sLogUid) {
            return;
          }
          this._stopPolling(false);
          this.getModel("factoryApprovalModel").setProperty(
            "/pollingLogUid",
            sLogUid,
          );
          this._storePollingLogUid(sLogUid);
          if (bImmediate) {
            this._pollOnce(sLogUid);
          } else {
            this._schedulePoll(sLogUid);
          }
        },

        _schedulePoll: function (sLogUid) {
          this._iPollingTimer = setTimeout(
            function () {
              this._pollOnce(sLogUid);
            }.bind(this),
            POLL_INTERVAL,
          );
        },

        _pollOnce: function (sLogUid) {
          if (
            this._bPollInFlight ||
            this.getModel("factoryApprovalModel").getProperty("/pollingLogUid") !==
              sLogUid
          ) {
            return;
          }

          this._bPollInFlight = true;
          this._readApprovalRows(
            [new Filter("LogUid", FilterOperator.EQ, sLogUid)],
            true,
          )
            .then(
              function (aRows) {
                this._bPollInFlight = false;
                var oDocument = this._groupRows(aRows)[0];
                if (!oDocument) {
                  this._stopPolling(true);
                  MessageBox.error(this._text("factoryApprovalRecordNotFound"));
                  return;
                }

                this._upsertDocument(oDocument);
                if (
                  oDocument.StatusKey === "QUEUED" ||
                  oDocument.StatusKey === "RUNNING"
                ) {
                  this._schedulePoll(sLogUid);
                  return;
                }

                delete this._mProcessingLogUids[sLogUid];
                this._stopPolling(true);
                if (oDocument.StatusKey === "COMPLETE") {
                  MessageBox.success(
                    this._text("factoryApprovalCompleteMessage"),
                  );
                } else if (oDocument.StatusKey === "ERROR") {
                  // BAPI ayrintisi secili kayitta kalir; tablet akisini teknik
                  // ve bloklayan bir popup ile kesmeyiz.
                  MessageToast.show(
                    this._text("factoryApprovalBackgroundErrorToast"),
                  );
                }
              }.bind(this),
            )
            .catch(
              function (oError) {
                this._bPollInFlight = false;
                if (
                  this.getModel("factoryApprovalModel").getProperty(
                    "/pollingLogUid",
                  ) === sLogUid
                ) {
                  MessageBox.error(
                    this._getErrorMessage(
                      oError,
                      this._text("factoryApprovalPollingError"),
                    ),
                  );
                  this._schedulePoll(sLogUid);
                }
              }.bind(this),
            );
        },

        _upsertDocument: function (oDocument) {
          var oViewModel = this.getModel("factoryApprovalModel");
          var aDocuments = oViewModel.getProperty("/documents") || [];
          var iIndex = aDocuments.findIndex(function (oItem) {
            return oItem.LogUid === oDocument.LogUid;
          });

          if (iIndex >= 0) {
            aDocuments.splice(iIndex, 1, oDocument);
          } else {
            aDocuments.unshift(oDocument);
          }
          oViewModel.setProperty("/documents", aDocuments.slice());
          if (
            oViewModel.getProperty("/selectedLogUid") === oDocument.LogUid ||
            (!oViewModel.getProperty("/selectedLogUid") &&
              oViewModel.getProperty("/collapsedLogUid") !== oDocument.LogUid)
          ) {
            this._setSelectedDocument(oDocument);
          }
        },

        _stopPolling: function (bClearStoredLogUid) {
          if (this._iPollingTimer) {
            clearTimeout(this._iPollingTimer);
            this._iPollingTimer = null;
          }
          if (this._oPollingRequest && this._oPollingRequest.abort) {
            this._oPollingRequest.abort();
          }
          this._oPollingRequest = null;
          this._bPollInFlight = false;
          if (this.getModel("factoryApprovalModel")) {
            this.getModel("factoryApprovalModel").setProperty(
              "/pollingLogUid",
              "",
            );
          }
          if (bClearStoredLogUid) {
            this._storePollingLogUid("");
          }
        },

        _cleanupApprovalResources: function (bDestroying) {
          this._stopPolling(false);
          this._iListRequestId = (this._iListRequestId || 0) + 1;
          if (this._oListRequest && this._oListRequest.abort) {
            this._oListRequest.abort();
          }
          this._oListRequest = null;
          if (this._oApprovalDialog && this._oApprovalDialog.isOpen()) {
            this._oApprovalDialog.close();
          }
          if (this._oRejectionDialog && this._oRejectionDialog.isOpen()) {
            this._oRejectionDialog.close();
          }
          if (bDestroying) {
            this._mProcessingLogUids = {};
          }
        },

        _storePollingLogUid: function (sLogUid) {
          try {
            if (sLogUid) {
              sessionStorage.setItem(POLL_STORAGE_KEY, sLogUid);
            } else {
              sessionStorage.removeItem(POLL_STORAGE_KEY);
            }
          } catch (oError) {
            // Session storage is optional; polling continues in the active view.
          }
        },

        _getStoredPollingLogUid: function () {
          try {
            return sessionStorage.getItem(POLL_STORAGE_KEY) || "";
          } catch (oError) {
            return "";
          }
        },

        _getStatusKey: function (sStatus, sLastStep) {
          var sStep = String(sLastStep || "").toUpperCase();
          var sHeaderStatus = String(sStatus || "").toUpperCase();
          if (
            [
              "WAIT_APPROVAL",
              "QUEUED",
              "RUNNING",
              "COMPLETE",
              "ERROR",
              "REJECTED",
            ].indexOf(sStep) !== -1
          ) {
            return sStep;
          }
          if (sHeaderStatus === "S") {
            return "COMPLETE";
          }
          if (sHeaderStatus === "E") {
            return "ERROR";
          }
          if (sHeaderStatus === "R") {
            return "REJECTED";
          }
          return "WAIT_APPROVAL";
        },

        _getStatusText: function (sStatusKey) {
          var mKeys = {
            WAIT_APPROVAL: "factoryStatusWaitApproval",
            QUEUED: "factoryStatusQueued",
            RUNNING: "factoryStatusRunning",
            COMPLETE: "factoryStatusComplete",
            ERROR: "factoryStatusError",
            REJECTED: "factoryStatusRejected",
          };
          return this._text(mKeys[sStatusKey] || "factoryStatusWaitApproval");
        },

        _getStatusState: function (sStatusKey) {
          if (sStatusKey === "COMPLETE") {
            return "Success";
          }
          if (sStatusKey === "ERROR") {
            return "Error";
          }
          if (sStatusKey === "REJECTED") {
            return "None";
          }
          if (sStatusKey === "WAIT_APPROVAL") {
            return "Warning";
          }
          // Eski UI5 sürümlerinde ObjectStatus, Information ValueState'ini
          // desteklemiyor. QUEUED ve RUNNING durumlarını nötr göster.
          return "None";
        },

        _getDifferenceState: function (fDifference) {
          if (fDifference > 0) {
            return "Error";
          }
          if (fDifference < 0) {
            return "Warning";
          }
          return "Success";
        },

        _getDifferenceHighlight: function (fDifference) {
          if (fDifference > 0) {
            return "Error";
          }
          if (fDifference < 0) {
            return "Warning";
          }
          return "Success";
        },

        _formatDate: function (vDate) {
          var oDate = vDate;
          if (typeof vDate === "string") {
            var aODataDate = /\/Date\((\d+)/.exec(vDate);
            oDate = aODataDate ? new Date(Number(aODataDate[1])) : new Date(vDate);
          }
          return oDate instanceof Date && !isNaN(oDate.getTime())
            ? this._oDateFormat.format(oDate)
            : "";
        },

        _formatQuantity: function (vValue) {
          return this._oQuantityFormat.format(this._toNumber(vValue));
        },

        _formatMaterialCode: function (sMatnr) {
          var sCode = String(sMatnr || "").replace(/^0+/, "");
          return sCode || "0";
        },

        _toNumber: function (vValue) {
          var fValue = parseFloat(vValue);
          return isNaN(fValue) ? 0 : fValue;
        },

        _getFunctionParameterMaxLength: function (
          sFunctionName,
          sParameterName,
        ) {
          var oMetadata = this.getOwnerComponent()
            .getModel()
            .getServiceMetadata();
          var aSchemas =
            (oMetadata &&
              oMetadata.dataServices &&
              oMetadata.dataServices.schema) ||
            [];
          var iMaxLength = 0;

          (Array.isArray(aSchemas) ? aSchemas : [aSchemas]).some(function (
            oSchema,
          ) {
            var aContainers = oSchema.entityContainer || [];
            return (Array.isArray(aContainers) ? aContainers : [aContainers]).some(
              function (oContainer) {
                var aFunctions = oContainer.functionImport || [];
                return (Array.isArray(aFunctions) ? aFunctions : [aFunctions]).some(
                  function (oFunction) {
                    if (!oFunction || oFunction.name !== sFunctionName) {
                      return false;
                    }
                    var aParameters = oFunction.parameter || [];
                    var oParameter = (
                      Array.isArray(aParameters) ? aParameters : [aParameters]
                    ).find(function (oItem) {
                      return oItem && oItem.name === sParameterName;
                    });
                    iMaxLength = oParameter
                      ? Number(
                          oParameter.maxLength ||
                            oParameter.MaxLength ||
                            oParameter["sap:maxLength"] ||
                            0,
                        )
                      : 0;
                    return true;
                  },
                );
              },
            );
          });

          return isNaN(iMaxLength) ? 0 : iMaxLength;
        },

        _text: function (sKey, aParameters) {
          return this.getResourceBundle().getText(sKey, aParameters || []);
        },

        _getErrorMessage: function (oError, sFallback) {
          try {
            var oResponse = JSON.parse(oError.responseText);
            return oResponse.error.message.value || sFallback;
          } catch (oException) {
            return (oError && (oError.message || oError.statusText)) || sFallback;
          }
        },
      },
    );
  },
);
