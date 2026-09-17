<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="更新提示词"/>
        <view class="page-body">
            <view class="module-block form-card">
                <textarea class="prompt-area" v-model="inputValue" @input="onPromptInput" placeholder="请输入提示词" maxlength="3000"></textarea>
            </view>
            <view class="btn-wrapper">
                <text class="btn btn-cancel" @click="onCancel">取消</text>
                <text class="btn btn-sure" :class="{'btn-sure-active': isEnabled, 'btn-sure-disabled': !isEnabled}" @click="onConfirm">确定</text>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
    import { ref, computed } from "vue";
    import { onLoad } from '@dcloudio/uni-app';
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
    import { updatePromptContentService } from "../service";
    import type { PromptInterface } from "../types";

    const inputValue = ref<string>("");
    const promptId = ref<string>("");

    /**
     * @description: 确定按钮是否可用（输入不为空）
     */
    const isEnabled = computed(() => inputValue.value.trim() !== "");

    /**
     * @description: 监听输入变化
     */
    const onPromptInput = () => {};

    /**
     * @description: 接收提示词对象（通过临时存储传递）
     */
    onLoad(() => {
        const item: PromptInterface | null = uni.getStorageSync('editingPrompt');
        if (item) {
            promptId.value = item.id;
            inputValue.value = item.prompt;
            uni.removeStorageSync('editingPrompt');
        }
    });

    /**
     * @description: 取消
     */
    const onCancel = () => {
        uni.navigateBack();
    };

    /**
     * @description: 确定更新提示词
     */
    const onConfirm = () => {
        if (!isEnabled.value) return;
        uni.showLoading({ title: '更新中...', mask: true });
        updatePromptContentService(promptId.value, inputValue.value.trim()).then((res) => {
            if (res.data > 0) {
                uni.showToast({ duration: 2000, position: 'center', title: '更新成功' });
                setTimeout(() => {
                    uni.navigateBack();
                }, 1000);
            } else {
                uni.showToast({ duration: 2000, position: 'center', title: res.msg || '更新失败' });
            }
        }).catch((err) => {
            console.error('更新提示词失败:', err);
            uni.showToast({ duration: 2000, position: 'center', title: err.msg || '更新失败' });
        }).finally(() => {
            uni.hideLoading();
        });
    };
</script>

<style lang="less" scoped>
    @import '../theme/color.less';
    @import '../theme/size.less';
    @import '../theme/style.less';
    .page-wrapper{
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: @page-background-color;
        .page-body{
            margin: 0 @middle-padding;
            flex: 1;
            display: flex;
            height: 0;
            flex-direction: column;
            .form-card{
                flex: 1;
                height: 0;
                margin-top: @middle-padding;
                .prompt-area{
                    width: 100%;
                    height: 100%;
                    padding: @middle-padding;
                    box-sizing: border-box;
                    background-color: @white-color;
                    border-radius: @module-border-radius;
                    font-size: @normal-font-size;
                }
            }
            .btn-wrapper{
                display: flex;
                gap: @middle-padding;
                margin: @middle-padding 0;
                .btn{
                    flex: 1;
                    height: @btn-height;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: @big-border-radius;
                    &.btn-cancel{
                        border: 1rpx solid @gray-color;
                        color: @sub-title-color;
                        background-color: @white-color;
                    }
                    &.btn-sure{
                        color: @white-color;
                        &.btn-sure-active{
                            background-color: @primary-color;
                        }
                        &.btn-sure-disabled{
                            background-color: @gray-color;
                        }
                    }
                }
            }
        }
    }
</style>
