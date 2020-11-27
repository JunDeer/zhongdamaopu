// const { fail } = require("assert");

const verifyTplId = 'AtntuAUGnzoBumjfmGB8Yyc-67FUxRH5Cw7bnEYFCXo'; //审核结果通知模板Id
const feedbackTplId = 'IeKS7nPSsBy62REOKiDC2zuz_M7RbKwR97ZiIy_ocmw'; // 反馈回复结果模板Id
const notifyVerifyTplId = 'jxcvND-iLSQZLZhlHD2A91gY0tLSfzyYc3bl39bxVuk'; // 提醒审核模版Id // jxcvND-iLSQZLZhlHD2A91ZfBLp0Kexv569MzTxa3zk

async function requestNotice(template) {
  var tplId;
  if (template == 'verify') {
    tplId = verifyTplId;
  } else if( template == 'notifyVerify'){
    tplId = notifyVerifyTplId;
  }
  else {
    tplId = feedbackTplId;
  }
  let res = await wx.requestSubscribeMessage({
    tmplIds: [tplId],
  });
  // console.log(res)
  if (res.errMsg != 'requestSubscribeMessage:ok') {
    console.log('调用消息订阅请求接口失败' + res.errCode);
    await wx.showToast({
      title: '消息订阅好像出了点问题',
      icon: 'none',
      duration: 500,
    })
    return false;
  }
  if (res[tplId] == 'accept') {
    await wx.showToast({
      title: '结果能通知你啦',
      icon: 'success',
      duration: 500,
    })
    return true;
  } else {
    await wx.showToast({
      title: '你拒收了通知QAQ',
      icon: 'none',
      duration: 500,
    })
    return false;
  }
}

// 发送审核消息
function sendVerifyNotice(notice_list) {
  const openids = Object.keys(notice_list);
  if(!openids.length) {
    return false;
  }
  const db = wx.cloud.database();
  const _ = db.command;
  // 获取需要发送的list
  for (const openid of openids) {
    wx.cloud.callFunction({
      name: 'sendMsg',
      data: {
        openid: openid,
        tplId: verifyTplId,
        content: notice_list[openid]
      }
    });
  }
}

// 发送回复消息
async function sendReplyNotice(openid, fb_id, reply) {
  const db = wx.cloud.database();
  const _ = db.command;
  let res = await wx.cloud.callFunction({
    name: 'sendMsg',
    data: {
      openid: openid,
      tplId: feedbackTplId,
      fb_id: fb_id,
      reply: reply
    }
  });
  return res.result;
}

// 发送提醒审核消息
function sendNotifyVertifyNotice(numUnchkPhotos) {
  const db = wx.cloud.database();
  const _ = db.command;
  let res = wx.cloud.callFunction({
    name: 'sendMsg',
    data: {
      numUnchkPhotos: numUnchkPhotos,
      tplId: notifyVerifyTplId,
    },
    success:res=>{
      console.log("callSendMsgSuccess:",res);
    },
    fail:res => {
      console.log("callSendMsgFail:",res);
    }
  });
  return res;
}

module.exports = {
  requestNotice,
  sendVerifyNotice,
  sendReplyNotice,
  sendNotifyVertifyNotice,
  notifyVerifyTplId
}