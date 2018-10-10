const axios = require('axios');
// let endpoint = '/api';
// let endpoint = '/wwjProxy'; //生成环境
let endpoint = '/ifaas/WebClient/menjin'; //生成环境


/**
 * @param {String} url
 * @param {String} message
 * @param {Number} statusCode
 * @constructor
 */
function ApiError(url, message, statusCode) {
    this.url = url;
    this.message = message;
    this.statusCode = statusCode || '';
    this.title = 'API Error';
    this.stack = (new Error()).stack;
}
    //用户即时提现
    function transferMoney(payload) {
        return axios.post(`${endpoint}/transfer/transferMoney`, JSON.stringify(payload), {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    }
export default {
    transferMoney,

};