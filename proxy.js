const axios = require('axios-https-proxy-fix');
const moment = require('moment');
const https = require('https');
// const axios = require('axios');

const agent = new https.Agent({
    rejectUnauthorized: true
});

const checkKeyProxy = async (key) => {
    let res = await axios({
        url: `http://proxy.shoplike.vn/Api/getCurrentProxy?access_token=${key}`,
        method: 'get',
        httpsAgent: agent
    })
    if (res?.data?.status == "success" || res?.data?.mess?.includes("proxy")) {
        return true
    }
    return false
}

const checkCurrentIp = async (key) => {
    let res = await axios({
        url: `http://proxy.shoplike.vn/Api/getCurrentProxy?access_token=${key}`,
        method: 'get',
        httpsAgent: agent
    })
    if (res?.data?.status == "success") {
        return res?.data?.data;
    }
    return false
}

const checkCurrentIpTmp = async (key) => {
    let res = await axios({
        url: `https://tmproxy.com/api/proxy/get-current-proxy`,
        method: 'post',
        data: {
            api_key: key
        },
        httpsAgent: agent
    },)
    if (res.data?.data) {
        return {
            ...res.data?.data,
            proxy: res.data?.data?.https
        }
    }
    return false
}

const getNewIp = async (key) => {
    let res = await axios({
        url: `http://proxy.shoplike.vn/Api/getNewProxy?access_token=${key}`,
        method: 'get',
        httpsAgent: agent
    })
    if (res?.data?.status == "success") {
        return res?.data?.data;
    } else {
        return await checkCurrentIp(key);
    }
}

const getNewIpTmp = async (key) => {
    let checkIp = await checkCurrentIpTmp(key);
    if (checkIp?.next_request <= 0) {
        let res = await axios({
            url: `https://tmproxy.com/api/proxy/get-new-proxy`,
            method: 'post',
            data: {
                api_key: key,
                id_location: 1
            },
            httpsAgent: agent
        })
        if (res.data?.data) {
            return {
                ...res.data?.data,
                proxy: res.data?.data?.https
            }
        }
    }
    return checkIp
}

const checkKeyProxyTmp = async (key) => {
    let res = await axios({
        url: `https://tmproxy.com/api/proxy/stats`,
        method: 'post',
        data: {
            api_key: key,
        },
        httpsAgent: agent
    })
    if (res.data?.data?.expired_at) {
        return new Date().getTime() < moment(res.data?.data?.expired_at, "hh:mm:ss DD/MM/YYYY").toDate().getTime()
    }
    return false
}

// (async () => {
//     let a = await getNewIp("f660e1dd117a56fcb56d3b8f5c01e749");
//     console.log(a);
// })()


module.exports = {
    checkKeyProxy,
    checkCurrentIp,
    getNewIp,
    checkCurrentIpTmp,
    getNewIpTmp,
    checkKeyProxyTmp
};
