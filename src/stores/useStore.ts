import { defineStore } from 'pinia'
import type {UserDataType,AppStoreStateType, TenantType} from '../types/index';
import {DEFAULT_TENANT} from "../common/constant"
export const useStore = defineStore("myStore", {
     state: (): AppStoreStateType => ({
		userData: {} as UserDataType,
		token: '',
		platform: '', // 平台
		device: '',
		version: '',
		tenant: DEFAULT_TENANT
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

		setTenant(tenant:TenantType|null){
			this.tenant = tenant;
		}
    }
})
