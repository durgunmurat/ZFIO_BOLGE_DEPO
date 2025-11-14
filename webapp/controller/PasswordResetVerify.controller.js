sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.PasswordResetVerify", {
        onInit: function () {
            // Get the router instance
            this.getRouter().getRoute("passwordResetVerify").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            // Get userId from route parameters
            var oArgs = oEvent.getParameter("arguments") || {};
            this._sUsername = oArgs.userId;
            // Read auth token from temporary component model (more secure than URL)
            var oPwModel = this.getOwnerComponent().getModel("pwReset");
            this._sAuthToken = (oPwModel && oPwModel.getProperty("/authToken")) ? oPwModel.getProperty("/authToken") : "";
            // Clear SMS input and reset validation state when navigating to this view
            var oSmsInput = this.byId("idSmsCodeInput");
            try {
                if (oSmsInput && oSmsInput.setValue) {
                    oSmsInput.setValue("");
                    oSmsInput.setValueState(sap.ui.core.ValueState.None);
                }
            } catch (e) {
                // ignore
            }
        },

        onVerifyPress: function () {
            var sSmsCode = this.byId("idSmsCodeInput") && this.byId("idSmsCodeInput").getValue ? this.byId("idSmsCodeInput").getValue() : "";

            if (!sSmsCode || sSmsCode.length !== 6) {
                MessageBox.error("Lütfen geçerli bir SMS kodu giriniz.");
                return;
            }
            // Ensure we have username and auth token from the previous step
            if (!this._sUsername) {
                MessageBox.error("Kullanıcı bilgisi bulunamadı. Lütfen tekrar deneyin.");
                this.getRouter().navTo("passwordReset");
                return;
            }

            if (!this._sAuthToken) {
                MessageBox.error("Doğrulama bilgisi bulunamadı. Lütfen tekrar SMS gönderin.");
                this.getRouter().navTo("passwordReset");
                return;
            }

            // Frontend validation: compare entered SMS code with the token passed from previous step
            if (sSmsCode !== this._sAuthToken) {
                MessageBox.error("Sms kodu hatalı");
                return;
            }

            // Call VerifySMS via BaseController helper (handles busy & errors)
            this.callFunctionImport("VerifySMS", {
                urlParameters: {
                    Username: this._sUsername,
                    SmsCode: sSmsCode
                }
            }).then(function(oData) {
                if (oData) {
                    // Clear temporary auth token from component model for security
                    var oPwModel = this.getOwnerComponent().getModel("pwReset");
                    if (oPwModel) {
                        oPwModel.setProperty("/authToken", "");
                    }

                    // Delegate session initialization to shared private helper
                    this._onAuthSuccess(oData);
                } else {
                    MessageBox.error("Doğrulama başarısız oldu.");
                }
            }.bind(this)).catch(function(sError) {
                // helper already showed error
            });
        },

        onResendCode: function () {
            if (!this._sUsername) {
                MessageBox.error("Kullanıcı bilgisi bulunamadı. Lütfen tekrar deneyin.");
                this.getRouter().navTo("passwordReset");
                return;
            }

            // Call ForgotPassword again via helper
            this.callFunctionImport("ForgotPassword", {
                urlParameters: {
                    Username: this._sUsername
                }
            }).then(function(oData) {
                // update auth token if returned
                var sNewToken = (oData && oData.ForgotPassword.AuthToken) ? oData.ForgotPassword.AuthToken : null;
                if (sNewToken) {
                    this._sAuthToken = sNewToken;
                    // also persist it to the component model so it survives route changes
                    var oPwModel = this.getOwnerComponent().getModel("pwReset");
                    if (!oPwModel) {
                        oPwModel = new JSONModel({ authToken: sNewToken });
                        this.getOwnerComponent().setModel(oPwModel, "pwReset");
                    } else {
                        oPwModel.setProperty("/authToken", sNewToken);
                    }
                }
                MessageBox.success("SMS kodu tekrar gönderildi.");
            }.bind(this)).catch(function(sError) {
                // helper already displayed error
            });
        },

        /**
         * Private helper to initialize session after successful auth-related function import.
         * This mirrors the logic in Login.controller.js so both auth flows initialize session identically.
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
            var oLoginPayload = (oSessionData && oSessionData.VerifySMS) ? oSessionData.VerifySMS : {};
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
                oDashboardModel.setData(Object.assign({}, oDashboardModel.getData() || {}, oDashboardPayload));
            }

            // Navigate to home/dashboard
            this.getRouter().navTo("home");
        },

        onNavBack: function () {
            this.getRouter().navTo("passwordReset");
        }
    });
});