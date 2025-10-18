import { defineStore } from 'pinia'
import type {UserDataType, AppStoreStateType, TenantUserType} from '../types/index';
import {DEFAULT_TENANT_USER,DEFAULT_PROMPT} from "../common/constant";
export const useStore = defineStore("myStore", {
     state: (): AppStoreStateType => ({
		userData: {} as UserDataType,
		token: '',
		platform: '', // 平台
		device: '',
		version: '',
		prompt:DEFAULT_PROMPT,
		tenantUser: DEFAULT_TENANT_USER
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
		}
    }
})
