<template>
    <view class="page-wrapper">
		<NavigatorTitleComponent :title="store.tenant?.name">
			<template #default>
				<image class="icon-small" @click="showAddDialog = true" :src="icon_menu_add"/>
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
    <DialogComponent  v-if="showAddDialog" @onClose="showAddDialog = false">
      <template #header>
				<text class="dialog-header">添加用户</text>
			</template>
      <template #content>
        <view class="dialog-content">
          <view class="module-block">
            <view class="search-wrapper">
              <input class="search-input" v-model="inputValue" type="search" @keyup.enter="onSearchUser" placeholder="请输入用户姓名/账号/电话/邮箱"/>
              <image :src="icon_search" @click="onSearchUser" class="icon-small"/>
            </view>
          </view>

          <scroll-view class="user-scroll-view" scroll-y show-scrollbar="false" @scrolltolower="onLoadMoreUser">
            <view class="module-block module-block-column user-list" v-if="searchUserList.length > 0">
              <template v-for="item,index in searchUserList" :key="'search-user'+index">
                <view class="user-info">
                  <image class="user-avater user-avater-small"  :src = "item.avater ? HOST + item.avater: defaulAvater"/>
                  <text>{{item.userAccount}} - {{item.username}}</text>
                </view>
                <view class="line" v-if="index !== searchUserList.length - 1"></view>
              </template>
            </view>
            <text class="load-data">暂无数据</text>
          </scroll-view>
        </view>
      </template>
    </DialogComponent>
	</view>
</template>

<script lang="ts" setup>
import icon_menu_add from "../../static/icon_menu_add.png"
import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
import type{TenantUserType, UserWithChecked} from "../types";
import {reactive, ref} from "vue";
import {getTenantUserListService,searchUserListService} from "../service";
import { useStore } from '../stores/useStore';
import {HOST, PAGE_SIZE} from "../common/constant";
import defaulAvater from "../../static/default_avater.png";
import DialogComponent from "../components/DialogComponent.vue";
import icon_search from "../../static/icon_search.png";

const showAddDialog = ref<boolean>(false);
const total = ref<number>(0);// 总数
const pageNum = ref<number>(1);
const searchPageNum = ref<number>(1);
const searchUserList = reactive<UserWithChecked[]>([]);// 搜索的用户列表
const searchUserTotal = ref<number>(0);// 搜索总数
const tenantUserList = reactive<TenantUserType[]>([]);
const inputValue = ref<string>("");
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

const onSearchUser = () => {
  searchUserList.length = 0;
  pageNum.value = 1;
  getSearchUserList();
}

const getSearchUserList = ()=>{
  searchUserListService(inputValue.value,store.tenant?.id??"",searchPageNum.value,PAGE_SIZE).then((res)=>{
    searchUserTotal.value = res.total;
    searchUserList.push(...res.data);
  })
} 

const onLoadMoreUser = ()=>{
  if(searchUserTotal.value > searchPageNum.value * PAGE_SIZE){
    searchPageNum.value++;
    getSearchUserList();
  }
}
getTenantList();
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
  .module-block{
    margin: @page-padding;
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
    text-align: center;
    color: @disable-text-color;
    display: inline-block;
    width: 100%;
  }
	.icon-small{
		opacity: 0.5;
	}
  .dialog-content{
    background-color: @page-background-color;
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-wrapper{
      display: flex;
      gap: @page-padding;
      height:@small-avater;
      align-items: center;
      background-color: @page-background-color;
      border-radius: @middle-avater;
      padding: 0 @small-margin;
      .search-input{
        height: 100%;
        flex: 1;
        padding-left: @small-margin;
      }
      .icon-small{
        filter: grayscale(100%);
      }
    }
    .user-scroll-view{
      flex: 1;
      height: 0;
      .user-list{
        gap:@page-padding;
        margin-top: 0;
      }
    }
  }
  
</style>