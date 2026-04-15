<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="设置提示词"/>
        <view class="page-body">
            <view class="module-block">
                <textarea class="prompt-area" v-model="inputValue" @input="onPromptInput" placeholder="请输出提示词" maxlength="3000"></textarea>
            </view>
            <view class="save-btn" :class="{'save-btn-active': isSaveEnabled, 'save-btn-disabled': !isSaveEnabled}" @click="onSavePrompt">保存</view>
        </view>
       
    </view>        
</template>

<script lang="ts" setup>
    import { ref, computed, onMounted } from "vue";
    import NavigatorTitleComponent from "../components/NavigatorTitleComponent.vue";
	import { useStore } from "../stores/useStore";
    import { getPromptService, updatePromptService } from "../service";
    import type { PromptInterface } from "../types";

    const store = useStore();
    const inputValue = ref<string>("");
    const promptId = ref<string>("");

    /**
     * @description: 判断保存按钮是否可用
     * @date: 2026-04-15
     * @author wuwenqiang
     */
    const isSaveEnabled = computed(() => {
        return inputValue.value && inputValue.value.trim() !== "";
    });

    /**
     * @description: 监听输入变化
     * @date: 2026-04-15
     * @author wuwenqiang
     */
    const onPromptInput = () => {
        // 触发计算属性重新计算
    };

    /**
     * @description: 获取当前租户的提示词
     * @date: 2026-04-15
     * @author wuwenqiang
     */
    const getPrompt = () => {
        const tenantId = store.tenantUser?.tenantId;
        if (!tenantId) return;
        
        getPromptService(tenantId).then((res) => {
            if (res.data && res.data.prompt) {
                inputValue.value = res.data.prompt;
                promptId.value = res.data.id;
            } else if (store.prompt) {
                // 如果没有从后端获取到，使用 store 中的提示词
                inputValue.value = store.prompt;
            }
        }).catch((err) => {
            console.error('获取提示词失败:', err);
            // 获取失败时使用 store 中的提示词
            if (store.prompt) {
                inputValue.value = store.prompt;
            }
        });
    };

    /**
     * @description: 保存提示词
     * @date: 2026-04-15
     * @author wuwenqiang
     */
    const onSavePrompt = () => {
        if (!isSaveEnabled.value) {
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: '提示词不能为空'
            });
            return;
        }

        uni.showLoading({
            title: '保存中...',
            mask: true
        });

        const tenantId = store.tenantUser?.tenantId;
        if (!tenantId) {
            uni.hideLoading();
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: '租户信息不存在'
            });
            return;
        }

        const promptData: PromptInterface = {
            id: promptId.value,
            tenantId: tenantId,
            userId: store.userData.id!,
            prompt: inputValue.value.trim()
        };

        updatePromptService(promptData).then((res) => {
            if (res.data) {
                // 更新成功，同步到 store
                store.setPrompt(inputValue.value.trim());
                uni.showToast({
                    duration: 2000,
                    position: 'center',
                    title: '保存成功'
                });
                // 返回上一页
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } else {
                uni.showToast({
                    duration: 2000,
                    position: 'center',
                    title: res.msg || '保存失败'
                });
            }
        }).catch((err) => {
            console.error('保存提示词失败:', err);
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: err.msg || '保存失败，请稍后重试'
            });
        }).finally(() => {
            uni.hideLoading();
        });
    };

    // 页面加载时获取提示词
    onMounted(() => {
        getPrompt();
    });
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
            .module-block{
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
            .save-btn{
                text-align: center;
                width: 100%;
                padding: @middle-padding;
                box-sizing: border-box;
                border-radius: @big-border-radius;
                margin: @middle-padding 0;
                display: inline-block;
                height: @btn-height;
                &.save-btn-active{
                    background-color: @primary-color;
                    color: @white-color;
                }
                &.save-btn-disabled{
                    background-color: @gray-color;
                    color: @white-color;
                }
            }
        }
    }
</style>