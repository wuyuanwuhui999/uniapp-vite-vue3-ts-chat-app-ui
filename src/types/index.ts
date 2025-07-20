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
  language:string;
};

export interface DocumentInterface {
  id: string;// 文档id
  name: string; // 文档名称
  ext:string; // 文档格式
  userId: string;// 用户id
  createTime: string;//创建时间
  updateTime: string// 更新时间
  directory:string// 租户id
};

export interface OptionInterce {
		text:string,
		value:string | number
	}