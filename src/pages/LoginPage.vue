<template>
	<view class="page-wrapper">
		<view class="module-block module-block-column">
			<image :src="icon_logo" class="icon-logo"/>

			<view class="tab-container">
				<view class="tab-item">
					<text @click="useTab(0)" :class="tabIndex === 0 ? 'tab-text-active' : ''">账号密码登录</text>
				</view>
				<view class="tab-item">
					<text @click="useTab(1)" :class="tabIndex === 1 ? 'tab-text-active' : ''">邮箱验证码登录</text>
				</view>
			</view>

			<view class="login-input-wrapper" v-show="tabIndex === 0">
				<image :src="icon_user_active" class="icon-login"/>
				<input v-model="userAccount" @blur="userVertify('userAccount')" class="login-input" placeholder="请输入账号或者邮箱"/>
			</view>

			<view class="login-input-wrapper" v-show="tabIndex === 0">
				<image :src="icon_password" class="icon-login"/>
				<input type="password" v-model="password" @blur="userVertify('password')" class="login-input" placeholder="请输入密码"/>
			</view>

			<view class="login-input-wrapper" v-show="tabIndex === 1">
				<image :src="icon_user_active" class="icon-login"/>
				<input v-model="email" class="login-input"  @blur="userVertify('email')" placeholder="请输入邮箱"/>
				<image @click="useSendEmailVertifyCode" :src="icon_send" class="icon-login icon-send"/>
			</view>

			<view class="login-input-wrapper" v-show="tabIndex === 1">
				<image :src="icon_user_active" class="icon-login"/>
				<input v-model="code" class="login-input" @blur="userVertify('code')" placeholder="请输入验证码"/>
			</view>

			<view class="login-btn" @click="useLogin">登录</view>

			<view class="register-btn" @click="useRegister">注册</view>

			<view class="register-btn" @click="useForgetPassword">忘记密码</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { loginService, loginByEmailService, sendEmailVertifyCodeService} from '../service';
	import { useStore } from '../stores/useStore';
	import {httpRequest} from '../utils/HttpUtils';
	import { EMAIL_REG } from '../common/constant';
	import icon_logo from '../../static/icon_ai.png';
	import icon_user_active from '../../static/icon_user_active.png';
	import icon_password from '../../static/icon_password.png';
	import icon_send from '../../static/icon_send.png';
	
	const userAccount = ref<string>('');
	const password = ref<string>('');
	const tabIndex = ref<number>(0);
	const email = ref<string>('');
	const code = ref<string>('');

	const store = useStore();
	userAccount.value = store.userData.userAccount || "";
	uni.getStorage({key:userAccount.value}).then(res=>{
		password.value = res.data || ""
	});

	const useTab = (index:number)=>{
		tabIndex.value = index;
	}

	 /**
	 * @description: 失去焦点校验输入框
	 * @date: 2025-03-02 10:54
	 * @author wuwenqiang
	 */
	const userVertify = (field:string)=>{
		if(field === "userAccount" && userAccount.value.trim() === ""){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'请输入账号'
			})
		}else if(field === "password" && (password.value.trim().length < 6 || password.value.trim().length > 18)){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'请输入6-18位的密码'
			})
		}else if(field === 'email' && !EMAIL_REG.test(email.value.trim())){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'请输入正确的邮箱格式'
			})
		}else if(field === 'code' && code.value.trim().length !== 4){
			uni.showToast({
				duration:2000,
				position:'center',
				title:'请输入四位数的验证码'
			})
		}
	}

	const useLogin = () => {
		if(tabIndex.value === 0){
			if(!userAccount.value.trim()){
				uni.showToast({
					duration:2000,
					position:'center',
					title:'账号不能为空'
				})
			}else if(password.value.trim().length > 18 || password.value.trim().length < 6){
				uni.showToast({
					duration:2000,
					position:'center',
					title:'请输入6-18位的密码'
				})
			}else{
				uni.showLoading();
				// 登录方法，userAccount:账号或邮箱，password密码
				loginService(userAccount.value,password.value).then((res)=>{
					uni.setStorage({key:userAccount.value,data:password.value});// 登录成功后保存账号和密码到缓存中
					store.setUserData(res.data);// 将用户信息保存到全局状态管理器中
					store.setToken(res.token);// 将token保存到状态管理中 
					uni.setStorage({key:'token',data:res.token});// 将token保存到缓存中,以便下次进入时自动登录
					httpRequest.setToken(res.token);// 设置请求头token值
					uni.reLaunch({// 重定向到首页
						url: `../pages/ChatPage`
					})
					uni.showToast({// 弹出提示
						duration:2000,
						position:'center',
						title:'登录成功'
					})
				}).catch(()=>{// 登录失败，弹出提示
					uni.showToast({
						duration:2000,
						position:'center',
						title:'账号或密码错误'
					})
				}).finally(()=>{
					uni.hideLoading();// 隐藏loading框
				})
			}
		}else{
			if(!EMAIL_REG.test(email.value.trim())){
				uni.showToast({
					duration:2000,
					position:'center',
					title:'请输入正确的邮箱格式'
				})	
			}else if(code.value.trim().length !== 4){
				uni.showToast({
					duration:2000,
					position:'center',
					title:'请输入4位数的验证码'
				})
			}else{
				uni.showLoading();
				loginByEmailService(email.value,code.value).then((res)=>{
					uni.setStorage({key:userAccount.value,data:password.value});
					store.setUserData(res.data)
					store.setToken(res.token)
					uni.setStorage({key:'token',data:res.token});
					httpRequest.setToken(res.token);
					uni.reLaunch({
						url: `../pages/MusicIndexPage`
					})
					uni.showToast({
						duration:2000,
						position:'center',
						title:'登录成功'
					})
				}).catch(()=>{
					uni.showToast({
						duration:2000,
						position:'center',
						title:'邮箱或者验证码错误'
					})
				}).finally(()=>{
					uni.hideLoading();
				})
			}
		}
	}

	const useSendEmailVertifyCode = () => {
		if(EMAIL_REG.test(email.value.trim())){
			uni.showLoading()
			sendEmailVertifyCodeService(email.value).then((res)=>{
				uni.showToast({
					duration:2000,
					position:'center',
					title: res.msg
				});
			}).finally(()=>{
				uni.hideLoading();
			})
		}else{
			uni.showToast({
				duration:2000,
				position:'center',
				title: "请输入正确的邮箱格式"
			});
		}
	}

	/**
	 * @description: 注册
	 * @date: 2025-01-19 14:13
	 * @author wuwenqiang
	 */
	const useRegister = () => {
		uni.navigateTo({
			url: `../pages/RegisterPage`
		})
	}

	/**
	 * @description: 忘记密码
	 * @date: 2025-01-19 14:13
	 * @author wuwenqiang
	 */
	const useForgetPassword = ()=>{
		uni.navigateTo({
			url: `../pages/ForgetPasswordPage`
		})
	}
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: 0 @page-padding @page-padding;
		background-color: @page-background-color;
		.tab-container{
				display: flex;
				gap: @page-padding;
				width: 100%;
				.tab-item{
					padding-bottom: @small-margin;
					flex: 1;
					text-align: center;
					.tab-text-active{
						color: @selected-color;
						border-bottom: @border-size solid @selected-color;
					}
				}
			}
		.module-block{
			height: 100%;
			align-items: center;
			.icon-logo{
				width: @big-avater;
				height: @big-avater;
				margin: @middle-icon-size 0;
			}
			.login-input-wrapper{
				margin-top: @page-padding;
				display: flex;
				align-items: center;
				width: 100%;
				border: 1rpx solid @disable-text-color;
				padding: @page-padding;
				box-sizing: border-box;
				border-radius: @big-border-radius;
				.icon-login{
					width: @small-icon-size;
					height: @middle-icon-size;
					&.icon-send{
						margin-right: @page-padding;
					}
				}
				.login-input{
					flex: 1;
					margin-left: @page-padding;
				}
			}

			.login-btn{
				text-align: center;
				width: 100%;
				padding: @page-padding;
				box-sizing: border-box;
				border-radius: @big-border-radius;
				margin-top:  @page-padding;
				background-color: @warn-color;
				color: @module-background-color;
				display: inline-block;
			}

			.register-btn{
				text-align: center;
				width: 100%;
				border: 1rpx solid @disable-text-color;
				padding: @page-padding;
				box-sizing: border-box;
				border-radius: @big-border-radius;
				margin-top:  @page-padding;
				display: inline-block;
				background-color: transparent;
			}
		}
	}
</style>
