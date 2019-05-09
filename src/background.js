import constants from './constants.js';
global.browser = require('webextension-polyfill');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'set_sync_with_master_from_cookie':
      chrome.cookies.get({url: constants.data().consoleUrl, name: constants.data().cookieName}, (result) => {
        if (result !== null && result.hasOwnProperty('value')) {
          const cookieAccountSid = result.value;
          const foundCurrentAccountSid = request.accountInfo.some((account) => {
            return account.sid === cookieAccountSid;
          });
          if (!foundCurrentAccountSid) {
            request.accountInfo.unshift({
              name: 'Master',
              sid: cookieAccountSid,
            });
          }
        }
        constants.set_sync(request.accountInfo);
        alert('アカウント情報を保存しました');
      });
      break;
  }
});
