sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.PasswordReset", {
        onInit: function() {
        },

        onSendSMSPress: function() {
            var sUserId = this.byId("userIdInput").getValue();
            
            if (!sUserId) {
                MessageToast.show("Lütfen sicil numarası giriniz");
                return;
            }

            // Demo için kullanıcı kontrolü
            var validUserIds = ["494113744S", "123456789O", "234567890T"];
            if (validUserIds.indexOf(sUserId) === -1) {
                MessageToast.show("Geçersiz sicil numarası!");
                return;
            }

            // SMS gönderme simülasyonu
            MessageToast.show("SMS kodu gönderildi");
            
            // SMS doğrulama ekranına yönlendirme
            this.getRouter().navTo("passwordResetVerify", {
                userId: sUserId
            });
        }
    });
});