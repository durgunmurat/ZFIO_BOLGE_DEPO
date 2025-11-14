sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.Login", {
        onInit: function() {
            // Ensure global session model exists
            if (!this.getOwnerComponent().getModel("sessionModel")) {
                this.getOwnerComponent().setModel(new JSONModel(), "sessionModel");
            }
            // Clear inputs each time the login route is matched
            if (this.getRouter && this.getRouter().getRoute) {
                try {
                    this.getRouter().getRoute("login").attachPatternMatched(this._onRouteMatched, this);
                } catch (e) {
                    // route may not exist in some configs; fail silently
                }
            }
        },

        _onRouteMatched: function (oEvent) {
            // Clear login inputs and reset validation state
            var oUserInput = this.byId("idUserInput");
            var oPasswordInput = this.byId("idPasswordInput");
            try {
                if (oUserInput && oUserInput.setValue) {
                    oUserInput.setValue("");
                    oUserInput.setValueState(sap.ui.core.ValueState.None);
                }
                if (oPasswordInput && oPasswordInput.setValue) {
                    oPasswordInput.setValue("");
                    oPasswordInput.setValueState(sap.ui.core.ValueState.None);
                }
            } catch (e) {
                // ignore UI clearing errors
            }
        },

        onLoginPress: function(oEvent) {
            var sUsername = this.byId("idUserInput") && this.byId("idUserInput").getValue ? this.byId("idUserInput").getValue() : "";
            var sPassword = this.byId("idPasswordInput") && this.byId("idPasswordInput").getValue ? this.byId("idPasswordInput").getValue() : "";

            // Basic frontend validation
            if (!sUsername || !sPassword) {
                MessageBox.error("Lütfen kullanıcı adı ve şifre giriniz.");
                return;
            }

            // Call the Login function import via BaseController helper
            this.callFunctionImport("Login", {
                urlParameters: {
                    Username: sUsername,
                    Password: sPassword
                }
            }).then(function(oData) {
                if (!oData) {
                    MessageBox.error("Giriş sırasında beklenmeyen bir yanıt alındı.");
                    return;
                }

                // Delegate session initialization to shared private helper
                this._onAuthSuccess(oData);
            }.bind(this)).catch(function(sError) {
                // error already shown by helper MessageBox; optionally handle further
            });
        },

        onForgotPasswordPress: function() {
            this.getRouter().navTo("passwordReset");
        },

        /**
         * Private helper to initialize session after successful auth-related function import.
         * Sets the global session model, updates dashboard counts and navigates to home.
         * @param {object} oSessionData SessionContext payload returned from the backend
         */
        _onAuthSuccess: function (oSessionData) {
            var oSessionModel = this.getOwnerComponent().getModel("sessionModel");
            if (!oSessionModel) {
                oSessionModel = new JSONModel();
                this.getOwnerComponent().setModel(oSessionModel, "sessionModel");
            }
            oSessionModel.setData(oSessionData);

            // Save session to localStorage for persistence across page refreshes
            try {
                localStorage.setItem("sessionData", JSON.stringify(oSessionData));
            } catch (e) {
                console.warn("Could not save session to localStorage:", e);
            }

            // Create/update dashboardData global model with mapped counts
            var oDashboardModel = this.getOwnerComponent().getModel("dashboardData");
            var oLoginPayload = (oSessionData && oSessionData.Login) ? oSessionData.Login : {};
            var oDashboardPayload = {
                pendingReceipts: oLoginPayload.PendingGRCount || 0,
                pendingShipments: oLoginPayload.PendingShipAssignCount || 0,
                pendingDeliveries: oLoginPayload.PendingGICount || 0,
                pendingCounts: oLoginPayload.PendingInvCount || 0
            };
            if (!oDashboardModel) {
                oDashboardModel = new JSONModel(oDashboardPayload);
                this.getOwnerComponent().setModel(oDashboardModel, "dashboardData");
            } else {
                // merge into existing model to preserve computed fields
                oDashboardModel.setData(Object.assign({}, oDashboardModel.getData() || {}, oDashboardPayload));
            }

            // Navigate to home/dashboard
            this.getRouter().navTo("home");
        }
    });
});