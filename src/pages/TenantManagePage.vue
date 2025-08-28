<template>
    <view class="page-wrapper">
		<NavigatorTitleComponent :title="store.tenant?.name">
			<template #default>
				<image class="icon-small" :src="icon_switch"/>
			</template>
		</NavigatorTitleComponent>
		<scroll-view class="page-body">
			<view>
				<view v-for="item in tenantUserList">
					
				</view>
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
import { PAGE_SIZE } from "../common/constant";
const pageNum = ref<number>(1);
const tenantUserList = reactive<TenantUserType[]>([]);
const store = useStore();

getTenantUserListService(store.tenant?.id??"",pageNum.value,PAGE_SIZE).then((res)=>{
	tenantUserList.splice(0,tenantUserList.length,...res.data);
})

</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.icon-small{
		opacity: 0.5;
	}
</style>