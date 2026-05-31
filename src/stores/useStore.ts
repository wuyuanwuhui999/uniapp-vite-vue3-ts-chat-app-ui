// src/stores/useStore.ts
import { defineStore } from 'pinia'
import type {UserDataType, AppStoreStateType, TenantUserType, CompanyType} from '../types/index';
import {DEFAULT_TENANT_USER,DEFAULT_PROMPT} from "../common/constant";

export const useStore = defineStore("myStore", {
     state: (): AppStoreStateType => ({
		userData: {} as UserDataType,
		token: '',
		platform: '', // 平台
		device: '',
		version: '',
		prompt:DEFAULT_PROMPT,
		tenantUser: DEFAULT_TENANT_USER,
		company: null as CompanyType | null
	}),
    actions: {
		setUserData(userData:UserDataType){
			this.userData = userData;
		},

		setDeviceInfo(deviceInfo:any){
			this.platform = deviceInfo.platform;
			this.device = deviceInfo.deviceModel;
			this.version = deviceInfo.osVersion;
		},

		setToken(token:string){
			this.token = token
		},

		setTenantUser(tenantUser:TenantUserType){
            const mTenantUser:TenantUserType = {...tenantUser}
            if(!mTenantUser.tenantId){
                mTenantUser.tenantId = mTenantUser.userId;
            }
			this.tenantUser = mTenantUser;
		},
		setPrompt(prompt:string){
			this.prompt = prompt;
			uni.setStorage({key:`${this.userData.id}:prompt`,data:prompt})
		},
		/**
		 * @description: 设置公司信息
		 * @date: 2026-05-30
		 * @author wuwenqiang
		 */
		setCompany(company: CompanyType | null) {
			this.company = company;
			// 将公司ID拼接用户ID保存到缓存
			if (company && this.userData.id) {
				uni.setStorage({ 
					key: `${this.userData.id}:companyId`, 
					data: company.id 
				});
			}
		},
		/**
		 * @description: 从缓存获取公司ID
		 * @date: 2026-05-30
		 * @author wuwenqiang
		 */
		async getCompanyIdFromStorage(): Promise<string | null> {
			if (!this.userData.id) return null;
			return new Promise((resolve) => {
				uni.getStorage({ 
					key: `${this.userData.id}:companyId` 
				}).then(res => {
					resolve(res.data as string);
				}).catch(() => {
					resolve(null);
				});
			});
		}
    }
})