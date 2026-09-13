<!-- components/DialogComponent.vue -->
<template>
    <view class="dialog-wrapper" :style="{ zIndex: zIndex }">
        <view class="mask" @click="onClose"></view>
        <view class="dialog-body-wrapper">
            <view class="dialog-header">
                <slot name="header"/>
                <image v-if="showClose" class="icon-close icon-mini" @click="onClose" :src="icon_close"/>
            </view>
            <slot name="content"></slot>
        </view>
    </view>
</template>

<script setup lang="ts">
    import icon_close from "../../static/icon_close.png"
    import { defineProps } from 'vue';

    const props = defineProps({
        /**
         * 是否显示关闭按钮
         * 默认 true，保持原有行为
         */
        showClose: {
            type: Boolean,
            default: true
        },
		
		/**
		* 弹窗层级
		 * 默认 2，多个弹窗叠加时可指定更大的值
		*/
		zIndex: {
		    type: Number,
		    default: 2
		}
    });

    const emits = defineEmits(['onClose']);

    /**
	 * @description: 关闭弹窗
	 * @date: 2024-05-18 16:27
	 * @author wuwenqiang
	 */
    const onClose = () => {
        emits('onClose');
    }
</script>

<style scoped lang="less">
@import '../theme/color.less';
@import '../theme/size.less';
@import '../theme/style.less';
.dialog-wrapper{
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    .mask{
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        background: @black-color;
        opacity: 0.5;
    }
    .dialog-body-wrapper{
        height: 80%;
        background: @white-color;
        position: absolute;
        width: 100%;
        z-index: 1;
        bottom: 0;
        border-top-right-radius: @module-border-radius;
        border-top-left-radius: @module-border-radius;
        display: flex;
        flex-direction: column;
        
        .dialog-header{
            position: relative;
            height: 10%;
            border-bottom: 1rpx solid @page-background-color;
            display: flex;
            justify-content: center;
            align-items: center;
            .icon-close{
                position: absolute;
                right: @middle-padding;
                top: 50%;
                transform: translateY(-50%);
                opacity: 0.5;
            }
        }
    }
}
</style>