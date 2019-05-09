export default {
  set_sync(accounts) {
    const syncValue = {};
    syncValue[this.data().syncSetKey] = accounts;
    chrome.storage.sync.set(syncValue);
  },
  data() {
    return {
      consoleUrl: 'https://jp.twilio.com/console/',
      syncSetKey: 'twilio_accounts',
      cookieName: 'current-account',
    };
  },
};
