export default {
  login: '/service/user/login', //登录
  getUserData: '/service/user-getway/getUserData', // 获取用户信息
  updateUser: '/service/user-getway/updateUser',//更新用户信息
  register: '/service/user/register',//注册
  vertifyUser: '/service/user/vertifyUser',// 校验账号是否存在
  sendEmailVertifyCode: '/service/user/sendEmailVertifyCode',// 找回密码
  resetPassword: '/service/user/resetPassword',// 重置密码
  updateAvater:'/service/user-getway/updateAvater',//更新头像
  updatePassword: '/service/user-getway/updatePassword',//更新密码
  loginByEmail: '/service/user/loginByEmail',//邮箱登录
  chat:"/service/ai/chat",// ai聊天
  getChatHistory: "/service/ai/getChatHistory",// ai聊天
  // chatWs: "/service/music/ws/chat",// ai聊天
  chatWs: "/service/ai/ws/chat",// ai聊天
  getModelList: "/service/ai/getModelList",// ai聊天
  uploadDoc: "/service/ai/uploadDoc",// 生成向量
  getDocList: "/service/ai/getDocList",// 查询我的文档
  deleteDoc: "/service/ai/deleteDoc/",// 查询我的文档
  getDirectoryList: "/service/ai/getDirectoryList",// 查询目录列表
  createDir: "/service/ai/createDir",// 创建目录
  renameDir: "/service/ai/renameDir",// 重命名目录
  deleteDir: "/service/ai/deleteDir/",// 删除目录
};
