import { defineStore } from 'pinia'
import type {UserDataType,AppStoreStateType, TenantType} from '../types/index';
export const useStore = defineStore("myStore", {
     state: (): AppStoreStateType => ({
		userData: {} as UserDataType,
		token: '',
		platform: '', // 平台
		device: '',
		version: '',
		tenant: null
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
