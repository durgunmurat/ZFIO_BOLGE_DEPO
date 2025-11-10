sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.PasswordResetVerify", {
        onInit: function () {
            // Get the router instance
            this.getRouter().getRoute("passwordResetVerify").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            // Get userId from route parameters
            this.userId = oEvent.getParameter("arguments").userId;
        },

        onVerifyCode: function () {
            var smsCode = this.byId("smsCodeInput").getValue();
            
            if (!smsCode || smsCode.length !== 6) {
                MessageToast.show("Lütfen geçerli bir SMS kodu girin");
                return;
            }

            // Demo için sabit kod kontrolü
            if (smsCode === "727061") {
                // Successful verification - navigate to Home view
                this.getRouter().navTo("home");
                MessageToast.show("Şifre sıfırlama başarılı!");
            } else {
                MessageToast.show("SMS kodu hatalı!");
            }
        },

        onResendCode: function () {
            MessageToast.show("SMS kodu tekrar gönderildi!");
        },

        onNavBack: function () {
            this.getRouter().navTo("passwordReset");
        }
    });
});