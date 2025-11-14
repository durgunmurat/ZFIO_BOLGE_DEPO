 sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.PasswordReset", {
        onInit: function() {
            // Attach route matched to clear inputs when navigating to this view
            if (this.getRouter && this.getRouter().getRoute) {
                try {
                    this.getRouter().getRoute("passwordReset").attachPatternMatched(this._onRouteMatched, this);
                } catch (e) {
                    // route might not exist in some test setups
                }
            }
        },

        _onRouteMatched: function () {
            // Clear reset user input and reset any validation state
            var oResetInput = this.byId("idResetUserInput");
            try {
                if (oResetInput && oResetInput.setValue) {
                    oResetInput.setValue("");
                    oResetInput.setValueState(sap.ui.core.ValueState.None);
                }
            } catch (e) {
                // ignore
            }
        },

        onSendSmsPress: function() {
            var sUsername = this.byId("idResetUserInput") && this.byId("idResetUserInput").getValue ? this.byId("idResetUserInput").getValue() : "";

            if (!sUsername) {
                MessageBox.error("Lütfen sicil numaranızı giriniz.");
                return;
            }

            // Use helper to call ForgotPassword
                this.callFunctionImport("ForgotPassword", {
                    urlParameters: {
                        Username: sUsername
                    }
                }).then(function(oData) {
                    // Expecting the service to return an AuthToken (SMS code) in the payload
                    var sAuthToken = (oData && oData.ForgotPassword.AuthToken) ? oData.ForgotPassword.AuthToken : "";
                    // Store token in a temporary component-level model instead of including it in the URL
                    var oPwModel = this.getOwnerComponent().getModel("pwReset");
                    if (!oPwModel) {
                        oPwModel = new JSONModel({ authToken: sAuthToken });
                        this.getOwnerComponent().setModel(oPwModel, "pwReset");
                    } else {
                        oPwModel.setProperty("/authToken", sAuthToken);
                    }
                    MessageBox.success("SMS kodu gönderildi.", {
                        onClose: function() {
                            // Navigate with only username; token is read from pwReset model by the verify controller
                            this.getRouter().navTo("passwordResetVerify", { userId: sUsername });
                        }.bind(this)
                    });
                }.bind(this)).catch(function(sError) {
                    // error already displayed by helper
                });
        },

        onNavBack: function() {
            this.getRouter().navTo("login");
        }
    });
});