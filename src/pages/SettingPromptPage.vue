<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="设置提示词"/>
        <view class="page-body">
            <view class="module-block">
                <textarea class="prompt-area" v-model="inputValue" placeholder="请输出提示词" maxlength="3000"></textarea>
            </view>
            <view class="save-btn" @click="onSavePrompt">保存</view>
        </view>
       
    </view>        
</template>
<script lang="ts" setup>
    import {ref} from "vue";
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
	import { useStore } from "../stores/useStore";

    const store = useStore();
    const inputValue = ref<string>(store.prompt);

    const onSavePrompt = ()=>{
        store.setPrompt(inputValue.value);
        uni.navigateBack()
    }

</script>
<style lang="less" scoped>
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
            .module-block{
                flex: 1;
                height: 0;
                .prompt-area{
                    width: 100%;
                    height: 100%;
                }
            }
            .save-btn{
                text-align: center;
				width: 100%;
				padding: @page-padding;
				box-sizing: border-box;
				border-radius: @big-border-radius;
				margin:  @page-padding 0;
				background-color: @warn-color;
				color: @module-background-color;
				display: inline-block;
            }
        }
        
       
    }
</style>