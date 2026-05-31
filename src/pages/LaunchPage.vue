<template>
  <view class="page-wrapper">
      <text>欢迎使用</text>
  </view>
</template>

<script setup lang="ts">
import { useStore } from '../stores/useStore'
import { getUserDataService } from '../service';
import { httpRequest } from '../utils/HttpUtils';

const store = useStore()
const token: string = uni.getStorageSync('token');

uni.getSystemInfo({
  success: (info) => {
    store.setDeviceInfo(info);
  }
});

setTimeout(() => {
    if (token) {
        getUserDataService(token).then((res) => {
            store.setUserData(res.data);
            store.setToken(res.token);
            uni.setStorage({ key: 'token', data: res.token });
            httpRequest.setToken(res.token);
            // 跳转到 CompanyPage
            uni.redirectTo({ url: '../pages/CompanyPage' });
        }).catch((err) => {
            uni.redirectTo({ url: '../pages/LoginPage' });
        });
    } else {
        uni.redirectTo({ url: '../pages/LoginPage' });
    }
}, 1000);
</script>

<style lang="less" scoped>
@import '../theme/color.less';
@import '../theme/size.less';
@import '../theme/style.less';

.page-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: @page-background-color;
}
</style>