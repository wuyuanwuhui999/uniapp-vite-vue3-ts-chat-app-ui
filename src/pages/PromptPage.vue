<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="设置提示词">
            <image :src="icon_search" class="icon-small"></image>
        </NavigatorTitleComponent>
        <view class="page-body">
            <view class="module-block category-wrapper">
                <text :class="activeIndex === index ? 'category-lable-active': ''" @click="onTabLable(index)" v-for="item,index in promptCategoryList" class="category-lable" :key="item.category">{{ item.category }}</text>
            </view>
            <scroll-view class="scroll-view" scroll-y show-scrollbar="false" @scrolltolower="onLoadMoreUser">
                <view class="prompt-wrapper">
                    <view class="module-block prompt-list">
                        <view class="prompt-item" v-for="item in systemPromptTypeList">
                            <text class="prompt-text">{{ item.prompt }}</text>
                            <view class="prompt-icon-wrapper">
                                <img :src="icon_copy" class="icon-small" @click="onCopy"/>
                                <img :src="item.isLike ? icon_full_star : icon_empty_star" class="icon-small"/>
                            </view>
                        </view>
                    </view>
                </view>
                
            </scroll-view>
        </view>
    </view>
</template>

<script lang="ts" setup>
    import { reactive,ref } from "vue";
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
    import { getPromptCategoryListService,getSystemPromptListByCategoryService } from "../service";
    import type { PromptCategoryType,SystemPromptType } from "../types";
    import icon_search from "../../static/icon_search.png";
    import { PAGE_SIZE } from "../common/constant";
    import icon_empty_star from "../../static/icon_empty_star.png";
    import icon_full_star from "../../static/icon_full_star.png";
    import icon_copy from "../../static/icon_copy.png";
    const promptCategoryList = reactive<PromptCategoryType[]>([]);
    const systemPromptTypeList = reactive<SystemPromptType[]>([]);
    const activeIndex = ref<number>(0);
    const pageNum = ref<number>(1);
    const keyword = ref<string>("");
    const total = ref<number>(0);

    const getSystemPromptListByCategory = ()=>{
        getSystemPromptListByCategoryService(promptCategoryList[activeIndex.value].id,keyword.value,pageNum.value,PAGE_SIZE).then((res)=>{
            systemPromptTypeList.push(...res.data);
            total.value = res.total;
        })
    }

    getPromptCategoryListService().then((res)=>{
        promptCategoryList.push({
            id:"",
            category:"全部",
            createTime:"",
            updateTime:"",
        })
        promptCategoryList.push(...res.data);
        getSystemPromptListByCategory()
    })

    const onTabLable = (index:number)=>{
        activeIndex.value = index;
        systemPromptTypeList.length = 0;
        pageNum.value = 1
        getSystemPromptListByCategory()
    }

    const onLoadMoreUser = ()=>{
        if(total.value > pageNum.value * PAGE_SIZE){
            pageNum.value++;
            getSystemPromptListByCategory()
        }
    }

    const onCopy = (text:string)=>{
        uni.setClipboardData({
            data: text,
            success: () => uni.showToast({
                duration: 2000,
                position: 'center',
                title: '复制成功'
            }),
            fail: (err) => {
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: '复制失败'
            })
            }
        })        
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
            flex: 1;
            display: flex;
            height: 0;
            flex-direction: column;
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
            .scroll-view{
                flex: 1;
                height: 0;
                padding-top: @page-padding;
                box-sizing: border-box;
                .prompt-wrapper{
                    padding-bottom: @page-padding;
                    box-sizing: border-box;
                    .prompt-list{
                        margin-top: 0;
                        .prompt-item{
                            padding-top: @page-padding;
                            padding-bottom: @page-padding;
                            border-bottom: 1rpx solid @disable-text-color;
                            display: flex;
                            &:first-child{
                                padding-top: 0
                            }
                            &:last-child{
                                border-bottom:none;
                            }
                            .prompt-text{
                                flex: 1;
                                width: 0;
                                 display: -webkit-box;
                                -webkit-box-orient: vertical;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                -webkit-line-clamp: 3;
                                text-overflow: ellipsis;
                            }
                            .prompt-icon-wrapper{
                                display: flex;
                                gap: @page-padding;
                                margin-left: @page-padding;
                                align-items: center;
                            }
                        }
                    }
                }
                
            }
        }
    }
</style>