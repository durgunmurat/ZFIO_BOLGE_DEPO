sap.ui.define([
    "com/sut/bolgeyonetim/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.sut.bolgeyonetim.controller.GoodsReceipt", {
        onInit: function() {
            var oViewModel = new JSONModel({
                goodsReceipts: [
                    {
                        id: "35CK015STR",
                        source: "DR: İstanbul",
                        destination: "ÜY: Aksaray Fabrika",
                        photoCount: "0/5",
                        deliveryNote: "ST220225000013022",
                        productCount: "13 farklı ürün"
                    }
                ]
            });
            this.setModel(oViewModel);
        },

        onAcceptPress: function(oEvent) {
            // TODO: Implement goods receipt acceptance logic
            this.showMessage("Mal kabul işlemi başlatıldı");
        },

        onPhotoPress: function(oEvent) {
            // TODO: Implement photo capture/upload logic
            this.showMessage("Fotoğraf ekleme özelliği");
        },

        onProductListPress: function(oEvent) {
            // TODO: Show product list dialog
            this.showMessage("Ürün listesi gösterilecek");
        }
    });
});