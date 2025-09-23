<template>
    <view class="page-wrapper">
		<NavigatorTitleComponent title="租户管理">
			<template #default>
				<image class="icon-small" @click="onShowAddDialog" :src="icon_menu_add"/>
			</template>
		</NavigatorTitleComponent>
		<scroll-view class="page-body" scroll-y show-scrollbar="false" @scrolltolower="onScrolltolower">
      <view>
        <view class="module-block module-block-column">
          <uniSwipeAction>
            <template v-for="item,index in tenantUserList" :key="'user-info'+index">
              <uniSwipeActionItem>
                <view class="user-info"  :class="index === tenantUserList.length -1 ? 'user-info-last-child' : (index === 0 ? 'user-info-first-child' : '')">
                  <image class="user-avater user-avater-small"  :src = "item.avater ? HOST + item.avater: defaulAvater"/>
                  <text>{{item.username}}</text>
                </view>
                <template v-slot:right>
                  <view class="button-wrapper">
                    <view class="op-button set-admin-button">
                      <text @click="onAdmin(item)" class="button-text">{{item.roleType === 1 ? '取消管理员' :'设为管理员'}}</text>
                    </view>
                    <view class="op-button delete-button">
                      <text @click="onDeleteTenantUser(index)" class="button-text">删除</text>
                    </view>
                  </view>
                </template>
              </uniSwipeActionItem>
              <view class="line" v-if="index < tenantUserList.length - 1"></view>
            </template>
          </uniSwipeAction>
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
                  <text class="user-name">{{item.username}}</text>
                  <text class="user-account">{{item.userAccount}}</text>
                  <image @click="addTenant(item)" class="icon-small" :src="item.checked ? icon_add_tenant_active :icon_add_tenant"></image>
                </view>
                <view class="line" v-if="index !== searchUserList.length - 1"></view>
              </template>
            </view>
            <text class="load-data">暂无数据</text>
          </scroll-view>
        </view>
      </template>
    </DialogComponent>
    <PopupComponent :text="'是否删除用户 ' + tenantUserList[deleteIndex]?.username" @on-sure="sureDeleteTenantUser" ref="popupComponent"></PopupComponent>
	</view>
</template>

<script lang="ts" setup>
import icon_menu_add from "../../static/icon_menu_add.png"
import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
import type{TenantUserType, UserWithChecked} from "../types";
import {reactive, ref} from "vue";
import {
  getTenantUserListService, searchUserListService, addTenantUserService, addAdminService, deleteAdminService,
  deleteTenantUserService
} from "../service";
import { useStore } from '../stores/useStore';
import {HOST, PAGE_SIZE} from "../common/constant";
import defaulAvater from "../../static/default_avater.png";
import DialogComponent from "../components/DialogComponent.vue";
import icon_search from "../../static/icon_search.png";
import icon_add_tenant from "../../static/icon_add_tenant.png";
import icon_add_tenant_active from "../../static/icon_add_tenant_active.png";
import uniSwipeAction from '@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.vue';
import uniSwipeActionItem from '@dcloudio/uni-ui/lib/uni-swipe-action-item/uni-swipe-action-item.vue';
import PopupComponent from "../components/PopupComponent.vue";

const popupComponent = ref<null | InstanceType<typeof PopupComponent>>(null);
const deleteIndex = ref<number>(-1);
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
  getTenantUserListService(store.tenantUser?.tenantId??"",pageNum.value,PAGE_SIZE).then((res)=>{
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

/**
 * @author: wuwenqiang
 * @description: 搜索用户
 * @date: 2025-08-30 21:48
 */
const onSearchUser = () => {
  searchUserList.length = 0;
  pageNum.value = 1;
  getSearchUserList();
}

/**
 * @author: wuwenqiang
 * @description: 搜索用户
 * @date: 2025-08-30 21:48
 */
const getSearchUserList = ()=>{
  searchUserListService(inputValue.value,store.tenantUser.tenantId,searchPageNum.value,PAGE_SIZE).then((res)=>{
    searchUserTotal.value = res.total;
    searchUserList.push(...res.data);
  })
} 

/**
 * @author: wuwenqiang
 * @description: 加载更多用户列表
 * @date: 2025-08-30 21:48
 */
const onLoadMoreUser = ()=>{
  if(searchUserTotal.value > searchPageNum.value * PAGE_SIZE){
    searchPageNum.value++;
    getSearchUserList();
  }
}

/**
 * @author: wuwenqiang
 * @description: 添加租户
 * @date: 2025-09-01 21:53
 */
const addTenant = (item:UserWithChecked)=>{
  if(item.checked){
    uni.showToast({
      duration:2000,
      position:'center',
      title: "该用户已添加"
    });
  }else{
    addTenantUserService(store.tenantUser.tenantId,item.id!).then((res)=>{
      uni.showToast({
        duration:2000,
        position:'center',
        title: "添加用户成功"
      });
      item.checked = 1;
      tenantUserList.push(res.data)
    })
  }
}

/**
 * @author: wuwenqiang
 * @description: 显示添加用户的弹窗
 * @date: 2025-09-01 21:53
 */
const onShowAddDialog = ()=>{
  showAddDialog.value = true;
  searchUserList.length = 0;
}

/**
 * @author: wuwenqiang
 * @description: 删除租户
 * @date: 2025-09-02 07:39
 */
const onDeleteTenantUser = (index:number)=>{
  deleteIndex.value = index;
  popupComponent.value?.popup.value?.open('top');
}

const onAdmin = (item:TenantUserType)=>{
  if(item.roleType === 1){
    deleteAdminService(store.tenantUser.tenantId!,item.userId).then((res)=>{
      item.roleType = 0;
      uni.showToast({
        duration:2000,
        position:'center',
        title: "取消管理员成功"
      })
    })
  }else{
    addAdminService(store.tenantUser.tenantId,item.userId).then((res)=>{
      item.roleType = 1;
      uni.showToast({
        duration:2000,
        position:'center',
        title: "添加管理员成功"
      })
    })
  }

}
/**
 * @author: wuwenqiang
 * @description: 确认删除
 * @date: 2025-09-02 07:39
 */
const sureDeleteTenantUser = ()=>{
  deleteTenantUserService(store.tenantUser.tenantId,tenantUserList[deleteIndex.value].userId).then((res)=>{
    if(res.data){
      uni.showToast({
        duration:2000,
        position:'center',
        title: "删除用户成功"
      })
      tenantUserList.splice(deleteIndex.value,1);
      popupComponent.value?.popup.value?.close();
    }else{
      uni.showToast({
        duration:2000,
        position:'center',
        title: "删除用户失败"
      })
    }
  }).catch((err)=>{
    uni.showToast({
      duration:2000,
      position:'center',
      title: err.msg || "删除用户失败"
    })
  });
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
      padding:@page-padding;
      &.user-info-first-child{
        padding-top: 0;
      }
      &.user-info-last-child{
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom:none;
      }
      .user-account{
        color: @disable-text-color;
        flex: 1;
      }
    }
    .line{
      height: 1rpx;
      background: @disable-text-color;
    }
    .user-avater{
      border-radius: 50%;
      &.user-avater-small{
        width: @small-avater;
        height: @small-avater;
      }
    }
    .button-wrapper{
      display: flex;
      .op-button{
        display: flex;
        height: 100%;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        margin-left: @page-padding;
        &.delete-button{
          background-color: @warn-color;
          color: @module-background-color;
        }
        &.set-admin-button{
          background-color: @line-color;
          color: @module-background-color;
        }
        .button-text{
          padding: 0 calc(@page-padding * 2);
        }
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