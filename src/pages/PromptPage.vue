<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="设置提示词">
            <image :src="icon_search" class="icon-small"></image>
        </NavigatorTitleComponent>
        <view class="page-body">
            <view class="module-block category-wrapper">
                <text :class="activeIndex === index ? 'category-lable-active': ''" @click="onTabLable(index)" v-for="item,index in promptCategoryList" class="category-lable" :key="item.category">{{ item.category }}</text>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
    import { reactive,ref } from "vue";
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
    import { getPromptCategoryListService } from "../service";
    import type { PromptCategoryType } from "../types";
    import icon_search from "../../static/icon_search.png";
    const promptCategoryList = reactive<PromptCategoryType[]>([]);
    const activeIndex = ref<number>(0);

    getPromptCategoryListService().then((res)=>{
        promptCategoryList.push({
            id:"",
            category:"全部",
            createTime:"",
            updateTime:"",
        })
        promptCategoryList.push(...res.data);
    })

    const onTabLable = (index:number)=>{
        activeIndex.value = index;
    }
</script>

<style lang="less">
    @import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
    .page-wrapper{
        .icon-small{
            filter: grayscale(100%);
        }
		.page-body{
			margin: 0 @page-padding;
            .category-wrapper{
                display: grid;
                grid-template-columns: repeat(5,1fr);
                gap:@page-padding;
                .category-lable{
                    border-radius: @module-border-radius;
                    padding:@page-padding 0;
                    display: flex;
                    justify-content: center;
                    border: 1rpx solid @disable-text-color;
                    &.category-lable-active{
                        border-color:@tab-color-active;
                        color: @tab-color-active;
                    }
                }
            }
        }
    }
</style>