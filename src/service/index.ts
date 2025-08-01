import {httpRequest} from '../utils/HttpUtils';
import type {MyAwesomeData} from '../utils/HttpUtils';
import api from '../api';
import type * as types from '../types';
import md5 from 'md5';

/**
 * @description: 根据token获取用户信息
 * @date: 2023-12-1 23:39
 * @author wuwenqiang
 */
export const getUserDataService = (token:string):Promise<MyAwesomeData<types.UserDataType>>=> {
	httpRequest.setToken(token);
	return httpRequest.get<types.UserDataType>(api.getUserData,{},{noShowMsg:true});
}

/**
 * @author: wuwenqiang
 * @description: 更新用户信息
 * @date: 2023-12-28 23:18
 */
export const updateUserDataService = (userData:types.UserDataType):Promise<MyAwesomeData<number>>=>{
    return httpRequest.put<number>(api.updateUser,userData)
};

/**
 * @description: 登录
 * @date: 2024-01-15 21:32
 * @author wuwenqiang
 */
export const loginService = (userAccount:string,password:string):Promise<MyAwesomeData<types.UserDataType>>=>{
	password = md5(password);
	return httpRequest.post<types.UserDataType>(api.login,{userAccount,password})
};


/**
 * @description: 注册
 * @date: 2024-01-19 23:51
 * @author wuwenqiang
 */
export const registerService = (userData:types.UserDataType):Promise<MyAwesomeData<types.UserDataType>>=>{
	userData.password = md5(userData.password);
	return httpRequest.post<types.UserDataType>(api.register,userData)
};

/**
 * @description: 校验账号和密码是否存在
 * @date: 2024-01-19 23:51
 * @author wuwenqiang
 */
export const vertifyUserService = (userData:types.UserDataType):Promise<MyAwesomeData<number>>=>{
	return httpRequest.post<number>(api.vertifyUser,userData)
};

/**
 * @description: 找回密码
 * @date: 2025-01-19 22:59
 * @author wuwenqiang
 */
export const sendEmailVertifyCodeService = (email:string):Promise<MyAwesomeData<number>>=>{
    return httpRequest.post<number>(api.sendEmailVertifyCode,{email})
}; 

export const resetPasswordService = (email:string,password:string,code:number):Promise<MyAwesomeData<types.UserDataType>>=>{
    password = md5(password);
    return httpRequest.post<types.UserDataType>(api.resetPassword,{email,password,code})
}; 

/**
 * @description: 更新密码
 * @date: 2025-01-28 14:22
 * @author wuwenqiang
 */
export const updatePasswordService = (oldPassword:string,newPassword:string):Promise<MyAwesomeData<number>>=>{
    oldPassword = md5(oldPassword);
    newPassword = md5(newPassword);
    return httpRequest.put<number>(api.updatePassword,{oldPassword,newPassword},{noShowMsg:true})
}; 

/**
 * @description: 邮箱验证码登录
 * @date: 2025-01-28 14:22
 * @author wuwenqiang
 */
export const loginByEmailService = (email:string,code:string):Promise<MyAwesomeData<types.UserDataType>>=>{
    return httpRequest.post<types.UserDataType>(api.loginByEmail,{email,code})
}; 

/**
 * @description: 获取聊天对话历史记录
 * @date: 2025-05-16 00:19
 * @author wuwenqiang
 */
export const getChatHistoryService = (pageNum:number,pageSize:number):Promise<MyAwesomeData<Array<types.ChatHistoryType>>> => {
    return httpRequest.get<Array<types.ChatHistoryType>>(`${api.getChatHistory}?pageNum=${pageNum}&pageSize=${pageSize}`);
}

/**
 * @description: 获取模型列表
 * @date: 2025-05-16 00:19
 * @author wuwenqiang
 */
export const getModelListService = ():Promise<MyAwesomeData<Array<types.ChatModelType>>> => {
  return httpRequest.get<Array<types.ChatModelType>>(api.getModelList)
}

/**
 * @description: 上传文档
 * @date: 2025-06-21 13:48
 * @author wuwenqiang
 */
export const getMyDocumentService = (directoryId:string):Promise<MyAwesomeData<Array<types.DocumentInterface>>> => {
    return httpRequest.get<Array<types.DocumentInterface>>(`${api.getDocList}?directoryId=${directoryId}`);
}

/**
 * @description: 删除文档
 * @date: 2025-07-12 11:31
 * @author wuwenqiang
 */
export const deleteMyDocumentService = (docId:string,directoryId:string):Promise<MyAwesomeData<number>> => {
  return httpRequest.delete<number>(`${api.deleteDoc}${docId}?directoryId=${directoryId}`);
}

/**
 * @description: 获取目录列表
 * @date: 2025-07-26 20:21
 * @author wuwenqiang
 */
export const getDirectoryListService = ():Promise<MyAwesomeData<types.DirectoryInterce[]>> => {
  return httpRequest.get<types.DirectoryInterce[]>(api.getDirectoryList);
}

/**
 * @description: 创建目录
 * @date: 2025-07-27 12:42
 * @author wuwenqiang
 */
export const createDirectoryService = (directory:types.DirectoryInterce):Promise<MyAwesomeData<types.DirectoryInterce>> => {
  return httpRequest.post<types.DirectoryInterce>(api.createDir,directory);
}
