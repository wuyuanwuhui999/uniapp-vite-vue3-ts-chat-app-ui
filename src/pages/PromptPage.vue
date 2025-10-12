<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="设置提示词"></NavigatorTitleComponent>
        <view class="page-body">
            <view class="module-block category-wrapper">

            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
    import { reactive } from "vue";
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
    import { getPromptCategoryListService } from "../service";
    import type { PromptCategoryType } from "../types";
    const promptCategoryList = reactive<PromptCategoryType[]>([]);

    getPromptCategoryListService().then((res)=>{
        promptCategoryList.push(...res.data);
    })
</script>

<style lang="less">
    @import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
    .page-wrapper{
		.page-body{
			margin: 0 @page-padding;
            .category-wrapper{
                display: flex;
                flex-wrap: wrap;
            }
        }
    }
</style>