import constants from './constants.js';

window.onload = () => {
  $('.table').insertBefore('<a id="fetch_accounts" class="btn btn-default switch-account-bound"> アカウント情報を取得 </a>');
  $('#fetch_accounts').on('click', () => {
    const accountInfo = [];
    const $trs = $('tbody > tr').value;

    chrome.storage.sync.get(constants.data().syncSetKey, (result) => {
      if (result.hasOwnProperty(constants.data().syncSetKey) && result.twilio_accounts.length > 0) {
        result.twilio_accounts.forEach((account) => {
          accountInfo.push(account);
        });
      }
      $trs.forEach(($tr) => {
        const name = $tr.getElementsByTagName('th')[0].innerText;
        const sid = $tr.getElementsByClassName('text-code')[0].innerText;
        const duplicate = accountInfo.some((account) => {
          return account.sid === sid;
        });
        if (!duplicate) {
          accountInfo.push({
            name: name,
            sid: sid,
          });
        }
      });

      const $switchToMasterButton = $('header a.switch-account-bound');
      if ($switchToMasterButton.value.length > 0) {
        // マスター以外のサブアカウントだと、マスターへ切り替えるボタンからマスターアカウントSIDを取得する
        const masterSid = $switchToMasterButton.getAttr('data-sid');
        const duplicate = accountInfo.some((account) => {
          return account.sid === masterSid;
        });
        if (!duplicate) {
          accountInfo.unshift({
            name: 'Master',
            sid: masterSid,
          });
        }
        constants.set_sync(accountInfo);
        alert('アカウント情報を保存しました');
      } else {
        // マスターアカウントだとマスターへ切り替えるボタンがでないので、CookieからマスターアカウントSIDを取得する
        chrome.runtime.sendMessage({
          type: 'set_sync_with_master_from_cookie',
          accountInfo: accountInfo,
        });
      }
    });
  });
};
