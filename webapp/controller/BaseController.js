sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, History, UIComponent, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.sut.bolgeyonetim.controller.BaseController", {
        getRouter: function() {
            return UIComponent.getRouterFor(this);
        },

        getModel: function(sName) {
            return this.getView().getModel(sName);
        },

        setModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("home", {}, true);
            }
        },

        showMessage: function(sMessage) {
            MessageToast.show(sMessage);
        },

        /**
         * Logout user and clear session data
         * Clears sessionModel and localStorage, then navigates to login
         */
        onLogout: function() {
            MessageBox.confirm("Çıkış yapmak istediğinizden emin misiniz?", {
                title: "Çıkış",
                onClose: function(sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        // Clear session model
                        var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
                        if (oSessionModel) {
                            oSessionModel.setData({});
                        }
                        
                        // Clear dashboard data
                        var oDashboardModel = this.getOwnerComponent().getModel("dashboardData");
                        if (oDashboardModel) {
                            oDashboardModel.setData({
                                pendingReceipts: 0,
                                pendingShipments: 0,
                                pendingDeliveries: 0,
                                pendingCounts: 0
                            });
                        }
                        
                        // Clear localStorage (session and filter data only, preserve work drafts)
                        try {
                            localStorage.removeItem("sessionData");
                            localStorage.removeItem("filterModel");
                            console.log("Session data cleared from localStorage");
                        } catch (e) {
                            console.error("Failed to clear localStorage:", e);
                        }
                        
                        // Navigate to login
                        this.getRouter().navTo("login", {}, true);
                        MessageToast.show("Çıkış yapıldı");
                    }
                }.bind(this)
            });
        },

        /**
         * Helper to call an OData Function Import using the component's default model.
         * Returns a Promise which resolves with the success payload or rejects with an error message.
         * @param {string} sFunctionName
         * @param {object} mOptions (urlParameters, additional call options)
         * @returns {Promise}
         */
        callFunctionImport: function(sFunctionName, mOptions) {
            mOptions = mOptions || {};
            var oModel = this.getOwnerComponent().getModel();

            return new Promise(function(resolve, reject) {
                sap.ui.core.BusyIndicator.show(0);

                var mCallOptions = Object.assign({}, mOptions);
                mCallOptions.success = function(oData, response) {
                    sap.ui.core.BusyIndicator.hide();
                    resolve(oData);
                };
                mCallOptions.error = function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    var sMessage = "İşlem sırasında hata oluştu.";
                    try {
                        if (oError && oError.responseText) {
                            var o = JSON.parse(oError.responseText);

                            // Standard OData v2 error shape: o.error.message.value
                            if (o && o.error && o.error.message && o.error.message.value) {
                                sMessage = o.error.message.value;
                            }

                            // SAP Gateway specific: look for innererror.errordetails (message container)
                            // errordetails is an array with entries that include message and severity
                            var aDetails = null;
                            if (o && o.error && o.error.innererror && o.error.innererror.errordetails) {
                                aDetails = o.error.innererror.errordetails;
                            } else if (o && o.error && o.error.errordetails) {
                                aDetails = o.error.errordetails;
                            }

                            if (aDetails && Array.isArray(aDetails) && aDetails.length) {
                                // Build a combined message from errordetails
                                var aMsgs = aDetails.map(function(d) {
                                    // prefer 'message' property, fallback to 'message' nested in some shapes
                                    return d.message || d.Message || JSON.stringify(d);
                                }).filter(Boolean);
                                if (aMsgs.length) {
                                    sMessage = aMsgs.join('\n');
                                }
                            }
                        } else if (oError && oError.statusText) {
                            sMessage = oError.statusText;
                        }
                    } catch (e) {
                        if (oError && oError.statusText) {
                            sMessage = oError.statusText;
                        }
                    }
                    MessageBox.error(sMessage);
                    reject(sMessage);
                };

                // Ensure metadata is loaded before calling function import so we can validate available function imports
                var sNormalized = (sFunctionName || "").replace(/^\/+/, "");
                oModel.metadataLoaded().then(function() {
                    try {
                        // Inspect metadata to find available function imports (robust across metadata shapes)
                        var oMeta = oModel.getServiceMetadata();
                        var aAvailable = [];
                        if (oMeta && oMeta.dataServices && oMeta.dataServices.schema) {
                            var aSchemas = Array.isArray(oMeta.dataServices.schema) ? oMeta.dataServices.schema : [oMeta.dataServices.schema];
                            aSchemas.forEach(function(schema) {
                                // entityContainer can be an array or object
                                var aContainers = [];
                                if (schema.entityContainer) {
                                    aContainers = Array.isArray(schema.entityContainer) ? schema.entityContainer : [schema.entityContainer];
                                }
                                aContainers.forEach(function(cont) {
                                    if (cont.functionImport) {
                                        var aFis = Array.isArray(cont.functionImport) ? cont.functionImport : [cont.functionImport];
                                        aFis.forEach(function(fi) { if (fi && fi.name) { aAvailable.push(fi.name); } });
                                    }
                                });
                            });
                        }

                        var mFiMethods = {};
                        if (aAvailable.length) {
                            // build map of functionImport -> declared HTTP method (if present)
                            aSchemas.forEach(function(schema) {
                                var aContainers = [];
                                if (schema.entityContainer) {
                                    aContainers = Array.isArray(schema.entityContainer) ? schema.entityContainer : [schema.entityContainer];
                                }
                                aContainers.forEach(function(cont) {
                                    if (cont.functionImport) {
                                        var aFis = Array.isArray(cont.functionImport) ? cont.functionImport : [cont.functionImport];
                                        aFis.forEach(function(fi) {
                                            if (fi && fi.name) {
                                                // attempt to read declared HTTP method (namespace-prefixed attribute)
                                                var sHttp = fi["m:HttpMethod"] || fi["m:HttpMethod"] || fi["httpMethod"] || fi["HttpMethod"] || null;
                                                if (sHttp) { mFiMethods[fi.name] = ("" + sHttp).toUpperCase(); }
                                            }
                                        });
                                    }
                                });
                            });
                        }

                        if (aAvailable.length && aAvailable.indexOf(sNormalized) === -1) {
                            var sMsg = "Function import '" + sNormalized + "' not found in the service metadata. Available: " + aAvailable.join(", ");
                            sap.ui.core.BusyIndicator.hide();
                            MessageBox.error(sMsg);
                            reject(sMsg);
                            return;
                        }

                        // If metadata declares an HTTP method for this function import, use it as default
                        var sDeclaredMethod = mFiMethods[sNormalized];
                        mCallOptions.method = mCallOptions.method || sDeclaredMethod || "POST";

                        // Call the function import (use leading slash as UI5 expects it)
                        oModel.callFunction("/" + sNormalized, mCallOptions);
                    } catch (e) {
                        sap.ui.core.BusyIndicator.hide();
                        var s = e && e.message ? e.message : "callFunction hata verdi.";
                        MessageBox.error(s);
                        reject(s);
                    }
                }).catch(function(err) {
                    sap.ui.core.BusyIndicator.hide();
                    var s = err && err.message ? err.message : "Metadata yüklenemedi.";
                    MessageBox.error(s);
                    reject(s);
                });
            });
        },

        /**
         * Refresh dashboard data by calling Login function import with selected date
         * Can be called from any controller after data-changing operations
         * @param {boolean} bShowBusy - Whether to show busy indicator (default: false)
         */
        refreshDashboardData: function(bShowBusy) {
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            if (!oSessionModel) {
                return Promise.resolve();
            }
            
            var oLoginData = oSessionModel.getProperty("/Login");
            if (!oLoginData || !oLoginData.Username || !oLoginData.AuthToken) {
                return Promise.resolve();
            }
            
            // Get date from filterModel or use today
            var oFilterModel = this.getOwnerComponent().getModel("filterModel");
            var sSelectedDate = oFilterModel ? oFilterModel.getProperty("/selectedDate") : null;
            var oArrivalDate;
            
            if (sSelectedDate) {
                var aParts = sSelectedDate.split("-");
                oArrivalDate = new Date(Date.UTC(parseInt(aParts[0]), parseInt(aParts[1]) - 1, parseInt(aParts[2]), 0, 0, 0));
            } else {
                var oToday = new Date();
                oArrivalDate = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), 0, 0, 0));
            }
            
            var that = this;
            
            // Use callFunctionImport which handles metadata loading and error handling
            // Note: callFunctionImport already shows/hides busy indicator
            return this.callFunctionImport("Login", {
                urlParameters: {
                    Username: oLoginData.Username,
                    Password: oLoginData.AuthToken,
                    ArrivalDate: oArrivalDate
                }
            }).then(function(oData) {
                if (!oData || !oData.Login) {
                    return;
                }
                
                // Update dashboard counts
                var oDashboardModel = that.getOwnerComponent().getModel("dashboardData");
                var oLoginPayload = oData.Login;
                var oDashboardPayload = {
                    pendingReceipts: oLoginPayload.PendingGRCount || 0,
                    pendingShipments: oLoginPayload.PendingShipAssignCount || 0,
                    pendingDeliveries: oLoginPayload.PendingGICount || 0,
                    pendingCounts: oLoginPayload.PendingInvCount || 0
                };
                
                if (oDashboardModel) {
                    oDashboardModel.setData(Object.assign({}, oDashboardModel.getData() || {}, oDashboardPayload));
                }
            }).catch(function(oError) {
                console.error("Dashboard refresh failed:", oError);
                // Don't re-throw, just log the error - callFunctionImport already shows error message
            });
        }
    });
});