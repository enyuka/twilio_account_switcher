<template>
  <div class="main">
    <b-container v-if="accounts.length" class="p-0">
      <b-row v-for="(account, index) in accounts" :key="index">
        <b-col class="p-0" cols="1">
          <b-form-radio v-model="current_account_sid" name="account_sid_value" :id="account.sid" :value="account.sid"> </b-form-radio>
        </b-col>
        <b-col class="p-0 ml-n4" cols="10">
          <label :for="account.sid" :class="{active: current_account_sid === account.sid}">{{ account.name }}: {{ account.sid }}</label>
        </b-col>
        <b-col class="p-0" cols="1">
          <button @click="delete_account(account)" type="button" class="close" aria-label="削除">
            <span aria-hidden="true">&times;</span>
          </button>
        </b-col>
      </b-row>
    </b-container>
    アカウント情報を入力してください
    <div v-if="errors.length">
      <b-alert show variant="warning">
        <p>エラーを修正してください:</p>
        <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
      </b-alert>
    </div>
    <b-form id="form" @submit="register" novalidate>
      *アカウント名:
      <b-form-input type="text" v-model="account_name" required placeholder="" />
      *アカウントSID:
      <b-form-input type="text" v-model="account_sid" required placeholder="AC0123456789xxxxxxxxxxxxxxxxxxxxxx" />
      <b-button type="submit" variant="info">登録</b-button>
    </b-form>
  </div>
</template>

<script>
import constants from '../../../constants.js';
export default {
  data() {
    return {
      errors: [],
      accounts: [],
      account_name: '',
      account_sid: '',
      current_account_sid: '',
      start_watch: false,
    };
  },
  computed: {
    console_url: function() {
      return constants.data().consoleUrl;
    },
    sync_set_key: function() {
      return constants.data().syncSetKey;
    },
    cookie_name: function() {
      return constants.data().cookieName;
    },
  },
  created: function() {
    this.load();
  },
  watch: {
    current_account_sid: function() {
      if (this.start_watch) {
        this.change_account(this.current_account_sid);
      } else {
        // 初回のCookieから取得したときはアカウント変更ではないので、処理は行わず、監視開始だけする
        this.start_watch = true;
      }
    },
  },
  methods: {
    load: function() {
      this.accounts = [];
      chrome.storage.sync.get(this.sync_set_key, (result) => {
        if (result.hasOwnProperty(this.sync_set_key) && result.twilio_accounts.length > 0) {
          result.twilio_accounts.forEach((account) => {
            this.accounts.push(account);
          });
        }
        chrome.cookies.get({url: this.console_url, name: this.cookie_name}, (result) => {
          if (result !== null && result.hasOwnProperty('value')) {
            const cookieAccountSid = result.value;
            const foundCurrentAccountSid = this.accounts.some((account) => {
              return account.sid === cookieAccountSid;
            });
            if (foundCurrentAccountSid) {
              this.current_account_sid = cookieAccountSid;
            }
          }
          if (this.current_account_sid === '') {
            // Cookieから取得できなかったときは監視を開始する
            this.start_watch = true;
          }
        });
      });
    },
    register: function(e) {
      this.errors = [];
      if (!this.account_name) {
        this.errors.push('アカウント名を入力してください');
      }
      if (!this.account_sid) {
        this.errors.push('アカウントSIDを入力してください');
      }
      if (!/^AC\w{32}/.test(this.account_sid)) {
        this.errors.push('アカウントSIDはこのフォーマットで入力してください: AC0123456789xxxxxxxxxxxxxxxxxxxxxx');
      }
      const duplicate = this.accounts.some((account) => {
        return account.sid === this.account_sid;
      });
      if (duplicate) {
        this.errors.push('入力されたアカウントSIDはすでに登録されています');
      }
      if (this.errors.length > 0) {
        e.preventDefault();
        return;
      }

      this.accounts.push({
        name: this.account_name,
        sid: this.account_sid,
      });
      constants.set_sync(this.accounts);
      this.account_name = '';
      this.account_sid = '';
    },
    change_account: function(sid) {
      // jp.twilio.comのCookieはドメインをなぜかピリオド始まりにしているので、domainを指定している
      chrome.cookies.set({url: this.console_url, domain: '.jp.twilio.com', name: this.cookie_name, value: sid}, () => {
        const url = this.console_url + '*';
        chrome.tabs.query({active: true, url: url}, (queryTabs) => {
          if (queryTabs.length > 0) {
            queryTabs.forEach((tab) => {
              chrome.tabs.reload(tab.id);
            });
          }
        });
      });
    },
    delete_account: function(account) {
      this.accounts.splice(this.accounts.indexOf(account), 1);
      constants.set_sync(this.accounts);
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  min-width: 600px;
  min-height: 300px;
  margin: 1em;
  color: #7f8c8d;
}
.active {
  color: #42b983;
}
</style>
