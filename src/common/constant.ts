// export const HOST:string = 'http://254a2y1767.qicp.vip';
export const HOST:string = 'http://127.0.0.1:5001';

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