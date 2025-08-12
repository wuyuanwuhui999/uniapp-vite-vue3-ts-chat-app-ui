// import { type } from "os"
import type {CircleEnum} from '../common/enum';
import type { PositionEnum } from '../enum/index';

export type UserDataType = {
	id?: string;
    userAccount:     string;
    createDate?: string;
    updateDate?: string;
    username:   string;
    telephone:  string;
    email:      string;
    avater?:     string;
    birthday:   string;
    sex:        number;
    role?:       string;
    password:   string;
    sign:       string;
    region:     string;
    disabled?:   number;
    permission?: number;
}

// 主体数据结构，键是时间前缀，值是该时间前缀下的消息组
export type ChatStructure = {
	timeAgo:string,
	list:Array<Array<ChatHistoryType>>
}

export type ChatModelType = {
  id:number,
  modelName:string,
  updateTime:string,
  createTime:string
}

// 聊天气泡
export type ChatType = {
  text?:string,
  position:PositionEnum,
  thinkContent?:string,
  responseContent?:string,
  start?:boolean
}
// 聊天气泡
export type ChatHistoryType = {
  id: number;          // 主键
  modelName:string,      // 模型id
  userId: string;      // 用户id
  files?: string;       // 文件（
  chatId: string;      // 会话id
  prompt: string;      // 提示词
  content: string;     // 内容
  createTime: string;  // 创建时间
  thinkContent?:string,// 思考内容
  responseContent?:string,// 正文内容
  timeAgo:string;// xx分钟、小时、天、月前
}

export type GroupedByChatIdType = {
  [chatId: string]: ChatHistoryType[];
}

export type GroupedByTimeAgoType = {
  [timeAgo: string]:  ChatHistoryType[][];
}

export type FileType = 'txt' | 'pdf';

export interface UploadFile {
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadResponse {
  code: number;
  message: string;
  data?: any;
  status:string;
}

export interface PayloadInterface {
  modelName: string;
  token: string; // 替换为实际用户ID
  chatId:string; // 替换为实际聊天ID
  type: string;
  prompt: string;
  showThink:boolean;
  directoryId?:string;
  language:string;
};

export interface DocumentInterface {
  id: string;// 文档id
  name: string; // 文档名称
  ext:string; // 文档格式
  userId: string;// 用户id
  createTime: string;//创建时间
  updateTime: string// 更新时间
  directoryId:string// 目录id
  directoryName:string;// 目录名称
};

export interface OptionType {
  text:string,
  value:string | number
}

// 文档的目录
export interface DirectoryInterce {
  id?:string;// 目录id
  userId?:string;// 用户id
  directory:string;// 目录名称
  tenantId: string;// 租户id
  createTime?:string;// 创建时间
  updateTime?:string;// 更新时间
}

// 租户
export interface TenantUserType {
  id: string; // 主键
  tenant_id: string; // 租户id
  user_id: string; // 用户id
  role_type: number; // 用户角色 (0-普通用户，1-租户管理员，2-超级管理员)
  join_date: Date; // 加入日期
  create_by: string; // 创建足额
}

/** 租户状态枚举 */
export enum TenantStatus {
  DISABLED = 0,// 禁用
  ENABLED = 1// 启用
}

export interface TenantType {
  id: string;// 租户ID（主键）
  name: string;// 租户名称
  code: string;// 租户编码（唯一）
  description?: string | null;// 租户描述（可选）
  status: TenantStatus;// 租户状态
  create_date?: Date;// 创建时间
  update_date?: Date | null;// 更新时间（可选）
  created_by: string;// 创建人ID
  updated_by?: string | null;// 更新人ID（可选）
}

export interface AppStoreStateType {
  userData: UserDataType;
  token: string;
  platform: string;
  device: string;
  version: string;
  tenant: TenantType |null;
}
