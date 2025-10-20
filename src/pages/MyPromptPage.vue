<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="我收藏的提示词">
            <image :src="icon_search" class="icon-small"></image>
        </NavigatorTitleComponent>
        <view class="page-body">
            <template v-if="promptCategoryList.length !== 0">
                <view class="module-block category-wrapper" v-if="promptCategoryList.length !== 0">
                    <text :class="activeIndex === index ? 'category-lable-active': ''" @click="onTabLable(index)" v-for="item,index in promptCategoryList" class="category-lable" :key="item.category">{{ item.category }}</text>
                </view>
                <scroll-view  v-if="systemPromptTypeList.length !== 0" class="scroll-view" scroll-y show-scrollbar="false" @scrolltolower="onLoadMoreUser">
                    <view class="prompt-wrapper">
                        <view class="module-block prompt-list">
                            <uniSwipeAction>
                                <template v-for="item,index in systemPromptTypeList" :key="'prompt-item'+index">
                                    <uniSwipeActionItem>
                                        <view class="prompt-item" :class="{'prompt-item-first':index == 0,'prompt-item-last':index === systemPromptTypeList.length - 1}">
                                            <text class="prompt-text">{{ item.prompt }}</text>
                                            <view class="prompt-icon-wrapper">
                                                <image :src="icon_copy" class="icon-small" @click="onCopy"/>
                                            </view>
                                        </view>
                                        <template v-slot:right>
                                            <view class="button-wrapper">
                                                <view class="op-button set-admin-button">
                                                    <text @click="onUsePrompt(item.prompt)" class="button-text">{{store.prompt === item.prompt ? '取消使用提示词' :'使用提示词'}}</text>
                                                </view>
                                                <view class="op-button set-admin-button">
                                                    <text @click="onDeletePrompt(index)" class="button-text">取消收藏</text>
                                                </view>
                                            </view>
                                        </template>
                                    </uniSwipeActionItem>
                                    <view class="line" v-if="index < systemPromptTypeList.length - 1"></view>
                                </template>
                            </uniSwipeAction>
                        </view>
                    </view>
                    
                </scroll-view>
            </template>
            <view v-else class="module-block">
                <text class="no-data">暂无数据</text>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
    import { reactive,ref } from "vue";
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
    import { getMyCollectPromptCategoryService,getMyCollectPromptListService,deleteCollectPromptService} from "../service";
    import type { PromptCategoryType,SystemPromptType } from "../types";
    import icon_search from "../../static/icon_search.png";
    import { PAGE_SIZE } from "../common/constant";
    import icon_copy from "../../static/icon_copy.png";
	import { useStore } from "../stores/useStore";
    const promptCategoryList = reactive<PromptCategoryType[]>([]);
    const systemPromptTypeList = reactive<SystemPromptType[]>([]);
    const activeIndex = ref<number>(0);
    const pageNum = ref<number>(1);
    const keyword = ref<string>("");
    const total = ref<number>(0);
	const store = useStore();

    getMyCollectPromptCategoryService(store.tenantUser.tenantId).then((res)=>{
        if(res.data.length === 0){
            return;
        } else if(res.data.length > 1){
            promptCategoryList.push({
                id:"",
                category:"全部",
                createTime:"",
                updateTime:"",
            })
        };
        promptCategoryList.push(...res.data);
        getMyCollectPromptList()
    })

    const getMyCollectPromptList = ()=>{
        getMyCollectPromptListService(store.tenantUser.tenantId,promptCategoryList[activeIndex.value].id,pageNum.value,PAGE_SIZE).then((res)=>{
            systemPromptTypeList.push(...res.data);
            total.value = res.total;
        })
    }

    

    const onTabLable = (index:number)=>{
        activeIndex.value = index;
        systemPromptTypeList.length = 0;
        pageNum.value = 1
        getMyCollectPromptList()
    }

    const onLoadMoreUser = ()=>{
        if(total.value > pageNum.value * PAGE_SIZE){
            pageNum.value++;
            getMyCollectPromptList()
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
    
     /**
	 * @author: wuwenqiang
	 * @description: 新增和取消收藏
	 * @date: 2025-10-18 11:22
	 */
    const onDeletePrompt = (item:SystemPromptType)=>{
        deleteCollectPromptService(item.id).then((res)=>{
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: `取消收藏${res.data > 0 ? '成功' : '失败'}`
            })
            if(res.data > 0)item.isCollect = 0;
        })
    }

     /**
	 * @author: wuwenqiang
	 * @description: 使用或者取消提示词
	 * @date: 2025-10-18 11:22
	 */
    const onUsePrompt = (prompt:string)=>{
        if(store.prompt === prompt)prompt=""
        store.setPrompt(prompt)
    }
</script>

<style lang="less">
    @import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
    .page-wrapper{
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
                            display: flex;
                            &.prompt-item-first{
                                padding-top: 0;
                            }
                            &.prompt-item-last{
                                padding-bottom: 0;
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
                        .line{
                            height: 1rpx;
                            background: @disable-text-color;
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
                    
                }
                
            }
        }
    }
</style>