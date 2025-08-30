<template>
    <view class="page-wrapper">
		<NavigatorTitleComponent :title="store.tenant?.name">
			<template #default>
				<image class="icon-small" :src="icon_switch"/>
			</template>
		</NavigatorTitleComponent>
		<scroll-view class="page-body" scroll-y show-scrollbar="false" @scrolltolower="onScrolltolower">
      <view>
        <view class="module-block module-block-column">
          <template v-for="item,index in tenantUserList" :key="'user-info'+index">
            <view class="user-info">
              <image class="user-avater user-avater-small"  :src = "item.avater ? HOST + item.avater: defaulAvater"/>
              <text>{{item.username}}</text>
            </view>
            <view class="line" v-if="index !== tenantUserList.length - 1"></view>
          </template>
        </view>
        <text class="load-data" v-if="total === tenantUserList.length">数据加载完毕</text>
        <text class="load-data" v-else>增加加载更多</text>
      </view>
		</scroll-view>
	</view>
</template>

<script lang="ts" setup>
import icon_switch from "../../static/icon_switch.png"
import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
import type{TenantUserType} from "../types";
import {reactive, ref} from "vue";
import {getTenantUserListService} from "../service";
import { useStore } from '../stores/useStore';
import {HOST, PAGE_SIZE} from "../common/constant";
import defaulAvater from "../../static/default_avater.png";

const total = ref<number>(0);// 总数
const pageNum = ref<number>(1);
const tenantUserList = reactive<TenantUserType[]>([]);
const store = useStore();

/**
 * @author: wuwenqiang
 * @description: 获取租户列表
 * @date: 2025-08-30 21:48
 */
const getTenantList = ()=>{
  getTenantUserListService(store.tenant?.id??"",pageNum.value,PAGE_SIZE).then((res)=>{
    tenantUserList.push(...res.data);
    total.value = res.total;
  });
}

/**
 * @author: wuwenqiang
 * @description: 获取更多用户列表
 * @date: 2025-08-30 21:48
 */
const onScrolltolower = ()=>{
  if(pageNum.value * PAGE_SIZE < total.value){
    pageNum.value++;
    getTenantList();
  }
}

getTenantList();
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
  .module-block{
    margin:  @page-padding;
    gap:@page-padding;
    .user-info{
      display: flex;
      align-items: center;
      gap: @page-padding;
    }
    .line{
      height: 1rpx;
      background-color: @disable-text-color;
    }
    .user-avater{
      border-radius: 50%;
      &.user-avater-small{
        width: @small-avater;
        height: @small-avater;
      }
    }
  }
  .load-data{
    padding-top: @page-padding;
    text-align: center;
    color: @disable-text-color;
    display: inline-block;
    width: 100%;
  }
	.icon-small{
		opacity: 0.5;
	}
</style>