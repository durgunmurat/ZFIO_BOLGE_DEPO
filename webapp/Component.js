sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("com.sut.bolgeyonetim.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // set device model
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // Restore sessionModel from localStorage if it exists
            this._restoreSessionModel();

            // Clean old localStorage data (older than 24 hours)
            this.cleanOldLocalStorageData();

            // create the views based on the url/hash
            this.getRouter().initialize();
        },

        _restoreSessionModel: function() {
            try {
                var sStoredSession = localStorage.getItem("sessionData");
                if (sStoredSession) {
                    var oSessionData = JSON.parse(sStoredSession);
                    
                    // Check if session is too old (8 hours)
                    if (oSessionData.Login && oSessionData.Login.LoginTime) {
                        var iSessionAge = Date.now() - new Date(oSessionData.Login.LoginTime).getTime();
                        var iMaxAge = 8 * 60 * 60 * 1000; // 8 hours
                        
                        if (iSessionAge > iMaxAge) {
                            console.log("Session expired (older than 8 hours), clearing localStorage");
                            localStorage.removeItem("sessionData");
                            this.setModel(new JSONModel({}), "sessionModel");
                            return;
                        }
                    }
                    
                    var oSessionModel = new JSONModel(oSessionData);
                    this.setModel(oSessionModel, "sessionModel");
                } else {
                    // Initialize empty session model if not found
                    this.setModel(new JSONModel({}), "sessionModel");
                }
            } catch (e) {
                // If there's an error reading from localStorage, just continue
                console.warn("Could not restore session from localStorage:", e);
                this.setModel(new JSONModel({}), "sessionModel");
            }
        },

        /**
         * Save session model to localStorage
         * Called after successful login or session updates
         */
        saveSessionToLocalStorage: function() {
            try {
                var oSessionModel = this.getModel("sessionModel");
                if (oSessionModel) {
                    var oData = oSessionModel.getData();
                    localStorage.setItem("sessionData", JSON.stringify(oData));
                    console.log("Session saved to localStorage");
                }
            } catch (e) {
                console.error("Failed to save session to localStorage:", e);
                // Check if quota exceeded
                if (e.name === 'QuotaExceededError') {
                    this.cleanOldLocalStorageData();
                    // Try again after cleanup
                    try {
                        var oSessionModel2 = this.getModel("sessionModel");
                        if (oSessionModel2) {
                            localStorage.setItem("sessionData", JSON.stringify(oSessionModel2.getData()));
                        }
                    } catch (e2) {
                        console.error("Failed to save session even after cleanup:", e2);
                    }
                }
            }
        },

        /**
         * Clean old localStorage data (older than 24 hours)
         * Called on app init and when quota exceeded
         */
        cleanOldLocalStorageData: function() {
            var iMaxAge = 24 * 60 * 60 * 1000; // 24 hours
            var iNow = Date.now();
            var iCleanedCount = 0;

            try {
                // Collect keys to remove (can't modify during iteration)
                var aKeysToRemove = [];

                for (var i = 0; i < localStorage.length; i++) {
                    var sKey = localStorage.key(i);
                    
                    // Skip sessionData and filterModel
                    if (sKey === "sessionData" || sKey === "filterModel") {
                        continue;
                    }

                    // Check if key matches pattern: SicilNo_DeliveryItemId
                    if (sKey && sKey.indexOf("_") !== -1) {
                        try {
                            var sValue = localStorage.getItem(sKey);
                            if (sValue) {
                                var oData = JSON.parse(sValue);
                                
                                // Check timestamp if available
                                if (oData.timestamp) {
                                    var iAge = iNow - new Date(oData.timestamp).getTime();
                                    if (iAge > iMaxAge) {
                                        aKeysToRemove.push(sKey);
                                    }
                                }
                            }
                        } catch (e) {
                            // Invalid JSON - mark for removal
                            aKeysToRemove.push(sKey);
                        }
                    }
                }

                // Remove old items
                aKeysToRemove.forEach(function(sKey) {
                    localStorage.removeItem(sKey);
                    iCleanedCount++;
                });

                if (iCleanedCount > 0) {
                    console.log("Cleaned " + iCleanedCount + " old localStorage items");
                }
            } catch (e) {
                console.error("Error cleaning localStorage:", e);
            }
        }
    });
});