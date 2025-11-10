sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.Login", {
        onInit: function() {
            // Initialize the view model
            var oViewModel = new JSONModel({
                userId: "",
                password: ""
            });
            this.setModel(oViewModel, "loginView");
        },

        onLoginPress: function(oEvent) {
            // Accept event parameter whether from Button press or Input submit
            var oViewModel = this.getModel("loginView");

            var oUserInput = this.byId("userIdInput");
            var oPasswordInput = this.byId("passwordInput");

            var sUserId = "";
            var sPassword = "";

            if (oUserInput && typeof oUserInput.getValue === "function") {
                sUserId = oUserInput.getValue();
            } else {
                // fallback to model or log
                sUserId = (oViewModel && oViewModel.getProperty("/userId")) || "";
                console.warn("userIdInput control not found or invalid");
            }

            if (oPasswordInput && typeof oPasswordInput.getValue === "function") {
                sPassword = oPasswordInput.getValue();
            } else {
                sPassword = (oViewModel && oViewModel.getProperty("/password")) || "";
                console.warn("passwordInput control not found or invalid");
            }

            // Basic validation
            if (!sUserId || !sPassword) {
                this.showMessage("Lütfen sicil numarası ve şifre giriniz");
                return;
            }

            // TODO: Add actual authentication logic here
            // For now, just navigate to home
            try {
                this.getRouter().navTo("home");
            } catch (e) {
                // Log detailed error to help diagnose issues like 'isEditable is not a function'
                /* eslint-disable no-console */
                console.error("Navigation to home failed:", e);
                /* eslint-enable no-console */
                this.showMessage("Beklenmeyen bir hata oluştu");
            }
        },

        onForgotPasswordPress: function() {
            this.getRouter().navTo("passwordReset");
        }
    });
});