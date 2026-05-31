<template>
    <view class="page-wrapper">
        <NavigatorTitleComponent title="选择公司"/>
        <view class="page-body">
            <view class="company-container">
                <view class="module-block module-block-column">
                    <view class="company-list">
                        <view 
                            v-for="item in companyList" 
                            :key="item.id"
                            class="company-item"
                            :class="{ 'company-item-active': selectedCompanyId === item.id }"
                            @click="onSelectCompany(item.id)"
                        >
                            <text class="company-name">{{ item.name }}</text>
                            <radio 
                                :checked="selectedCompanyId === item.id" 
                                :value="item.id"
                                :color="primaryColor"
                                class="company-radio"
                            />
                        </view>
                    </view>
                </view>
                <view class="btn-wrapper">
                    <view class="confirm-btn" @click="onConfirm">确定</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, computed } from 'vue';
    import NavigatorTitleComponent from '../components/NavigatorTitleComponent.vue';
    import { useStore } from '../stores/useStore';
    import { getCompanyListService } from '../service';
    import type { CompanyType } from '../types';
    
    const store = useStore();
    const companyList = reactive<CompanyType[]>([]);
    const selectedCompanyId = ref<string>('');
    
    /**
     * @description: 主题主色调
     * @date: 2026-05-31
     * @author wuwenqiang
     */
    const primaryColor = computed(() => {
        // 小程序/App 环境下无法获取 CSS 变量，直接返回主题色值
        // #ffae00 是 theme/color.less 中 @primary-color 的值
        return '#ffae00';
    });
    
    /**
     * @description: 获取公司列表
     * @date: 2026-05-30
     * @author wuwenqiang
     */
    const getCompanyList = async () => {
        try {
            const res = await getCompanyListService();
            if (res.data && res.data.length > 0) {
                companyList.push(...res.data);
                
                // 从缓存获取公司ID
                const cachedCompanyId = await store.getCompanyIdFromStorage();
                
                if (cachedCompanyId) {
                    // 检查缓存的公司ID是否在公司列表中，如果在则自动选中
                    const foundCompany = companyList.find(item => item.id === cachedCompanyId);
                    if (foundCompany) {
                        selectedCompanyId.value = cachedCompanyId;
                        return;
                    }
                }
                
                // 如果没有找到缓存的公司，默认选中第一个
                if (companyList.length > 0 && !selectedCompanyId.value) {
                    selectedCompanyId.value = companyList[0].id;
                }
            }
        } catch (error) {
            console.error('获取公司列表失败:', error);
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: '获取公司列表失败'
            });
        }
    };
    
    /**
     * @description: 选择公司（单选，每次只能选中一个）
     * @date: 2026-05-31
     * @author wuwenqiang
     */
    const onSelectCompany = (companyId: string) => {
        // 直接设置为选中的公司ID，实现单选效果
        selectedCompanyId.value = companyId;
    };
    
    /**
     * @description: 确认选择公司，使用 reLaunch 清空所有路由堆栈后跳转到 ChatPage
     * @date: 2026-05-30
     * @author wuwenqiang
     */
    const onConfirm = () => {
        if (!selectedCompanyId.value) {
            uni.showToast({
                duration: 2000,
                position: 'center',
                title: '请选择公司'
            });
            return;
        }
        
        const selectedCompany = companyList.find(item => item.id === selectedCompanyId.value);
        if (selectedCompany) {
            // 保存选中的公司信息到 store
            store.setCompany(selectedCompany);
            // 使用 reLaunch 清空所有历史页面，然后跳转到 ChatPage
            // 这样用户无法通过返回按钮回到 CompanyPage 或之前的任何页面
            uni.reLaunch({
                url: '../pages/ChatPage'
            });
        }
    };
    
    onMounted(() => {
        getCompanyList();
    });
</script>

<style lang="less" scoped>
    @import '../theme/color.less';
    @import '../theme/size.less';
    @import '../theme/style.less';
    
    .page-wrapper {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: @page-background-color;
        
        .page-body {
            flex: 1;
            padding: @middle-padding;
            box-sizing: border-box;
            
            .company-container {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                
                .module-block {
                    margin: 0;
                    max-height: 70vh;
                    overflow-y: auto;
                    
                    .company-list {
                        .company-item {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: @middle-padding;
                            border-bottom: 1rpx solid @page-background-color;
                            
                            &:last-child {
                                border-bottom: none;
                            }
                            
                            &.company-item-active {
                                background-color: @page-background-color;
                            }
                            
                            .company-name {
                                font-size: @normal-font-size;
                                font-weight: bold;
                                color: @black-color;
                                flex: 1;
                            }
                            
                            .company-radio {
                                transform: scale(0.8);
                                pointer-events: none;
                            }
                        }
                    }
                }
                
                .btn-wrapper {
                    margin-top: @middle-padding;
                    
                    .confirm-btn {
                        text-align: center;
                        width: 100%;
                        padding: @middle-padding;
                        box-sizing: border-box;
                        border-radius: @big-border-radius;
                        background-color: @primary-color;
                        color: @white-color;
                        display: inline-block;
                        height: @btn-height;
                        line-height: calc(@btn-height - @middle-padding * 2);
                    }
                }
            }
        }
    }
</style>