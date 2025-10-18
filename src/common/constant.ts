import type{ TenantType, TenantUserType} from "../types";

// export const HOST:string = 'http://254a2y1767.qicp.vip';
export const HOST:string = 'http://169.254.32.117:3000';

export const EMAIL_REG:RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// 邮箱正则表达式

export const PAGE_SIZE:number = 20;// 每页的数量

type CommonType = {
    0:string,
    1:string
} 

export const SexMap:CommonType = {
    0: '男',
    1: '女'
}

export const DEFAULT_TENANT:TenantType = {
    id: "0",
    name: "私人空间",
    code: "personal",
    status: 1,
    created_by:"system"
}

export const DEFAULT_TENANT_USER:TenantUserType = {
    id: "", // 主键
    tenantId: '', // 租户id
    tenantName: "私人空间",
    userId: "", // 用户id
    roleType: 0, // 用户角色 (0-普通用户，1-租户管理员，2-超级管理员)
    joinDate: '', // 加入日期
    createBy: "", // 创建时间
    username: '', // 用户名
    avater: '', // 头像
    disabled: 0,// 是否禁用
    email: ''// 邮箱
}

export const DEFAULT_PROMPT = "你叫小吴同学，是一个无所不能的AI助手，上知天文下知地理，请用小吴同学的身份回答问题。"