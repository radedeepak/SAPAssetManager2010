{
	"Localization": "/SAPAssetManager/i18n/i18n.properties",
	"MainPage": "/SAPAssetManager/Pages/Overview.page",
	"OnDidUpdate": "/SAPAssetManager/Rules/ApplicationEvents/ApplicationOnDidUpdate.js",
	"OnLaunch": [
		"/SAPAssetManager/Actions/OData/InitializeOfflineOData.action",
		"/SAPAssetManager/Rules/Log/InitializeLogger.js",
		"/SAPAssetManager/Rules/Sync/InitializeSyncState.js"
	],
	"OnReceiveFetchCompletion": "/SAPAssetManager/Rules/PushNotifications/PushNotificationsContentAvailableEventHandler.js",
	"OnReceiveForegroundNotification": "/SAPAssetManager/Rules/PushNotifications/PushNotificationsForegroundNotificationEventHandler.js",
	"OnReceiveNotificationResponse": "/SAPAssetManager/Rules/PushNotifications/PushNotificationsReceiveNotificationResponseEventHandler.js",
	"OnWillUpdate": "/SAPAssetManager/Rules/ApplicationEvents/ApplicationOnWillUpdate.js",
	"SDKStyles": "/SAPAssetManager/Styles/SDKStyles.nss",
	"Styles": "/SAPAssetManager/Styles/Styles.css",
	"Version": "1",
	"_Name": "SAPAssetManager"
}