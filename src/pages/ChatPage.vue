<template>
	<view class="page-wrapper">
		<view class="page-header">
			<AvaterComponent size="small"/>
			<view class="title-wrapper">
				<text @click="onSwitchTenant">{{ store.tenantUser?.tenantName || '租户' }}</text>
				<text>|</text>
				<text @click="onSwitchModel">{{chatModelList.length > 0 ? chatModelList[activeModelIndex].modelName : ""}}</text>
			</view>
			<view class="menu-wrapper">
				<image class="icon-small icon-record" @click="onShowMenu" :src="icon_menu"/>
				<template v-if="showMenu">
					<view class="menu-box" >
						<view class="menu-arrow"></view>
						<view class="menu-list">
							<view class="menu-item" @click="onUploadDoc">上传文档</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onShowMyDoc">我的文档</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onShowHistory">会话记录</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onSwitchModel">切换模型</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onSettingPrompt">设置提示词</view>
							<view class="menu-line"></view>
							<view class="menu-item" @click="onMyPrompt">我收藏的提示词</view>
						</view>
					</view>
					<view class="menu-mask" @click="onHideMenu"></view>
				</template>
			</view>
		</view>
		<view class="page-body">
			<scroll-view class="scroll-view" scroll-y :show-scrollbar="false" :scroll-top="scrollTop" @scroll="onScroll">
				<view class="chat-list">
					<template v-for="item,index in chatList" :key="'chat'+index">
						<view class="chat-wrapper">
							<template v-if="item.position === PositionEnum.LEFT && (item.thinkContent || item.responseContent)">
								<image :src="icon_ai" class="icon-middle"/>
								<view class="chat-text-wrapper">
									<view class="chat-text chat-prompt">
										<view class="icon-angle icon-angle-left"></view>
											<view class="think-text" v-if="item.thinkContent">
												<text>
													{{ item.thinkContent.replace(/^(<think>)[\s\s\n]?|(<\/think>[\s\S\n]?)$/gi,"") }}
												</text>
											</view>
											<!-- 正式回答黑色区块 -->
											 <view class="response-box">
												<mp-html :content="marked.parse(item.responseContent)"></mp-html>
											 </view>
									</view>
								</view>		
								<image v-if="item.type === 'system'" @click="onEditPrompt" :src="icon_edit" class="icon-small"/>
							</template>
							<template v-else-if="item.text">
								<view class="chat-prompt-wrapper">
									<view class="chat-prompt">
										<view class="icon-angle icon-angle-right"></view>
										<text>{{ item.text }}</text>
									</view>
								</view>
								<AvaterComponent/>
							</template>
						</view>
					</template>
					<view class="chat-wrapper" v-if="thinking">
						<image :src="icon_ai" class="icon-middle"/>
						<view class="chat-text-wrapper">
							<view class="chat-text chat-prompt">
								<view class="icon-angle icon-angle-left"></view>
								<view  class="think-text">
									<text>正在思考中</text>
								</view>
							</view>
						</view>	
					</view>
				</view>
			</scroll-view>
		</view>
		<scroll-view scroll-x class="scroll-container">
			<view class="type-wrapper">
			    <text class="type-item" :class="{'type-item-active': showThink}" @click="onSwitchThink()">深度思考</text>
			    <text class="type-item" :class="{'type-item-active': promptId !== ''}" @click="onShowPromptDialog()">提示词</text>
			    <view class="type-item type-item-doc" :class="{'type-item-active': type === 'document'}" @click="onSetDocument">
			        <text>查询文档</text>
			        <view v-if="selectedDocCount > 0" class="doc-badge">{{ selectedDocCount }}</view>
			    </view>
			    <text class="type-item" :class="{'type-item-active': useTool}" @click="onSwitchTool()">使用工具</text>
			    <view class="type-item type-item-language" @click="onSwitchLang()"><text>{{ language }}</text><image class="icon-small" :src="icon_switch"/></view>
			</view>
		</scroll-view>
		
		<view class="input-wrapper">
			<image :src="icon_chat" class="icon-middle icon_send" @click="onCreateNewChat"/>
			<input class="chat-input" placeholder="有问题，尽管问" v-model="inputValue">
			<view class="icon-wrapper">
				<image v-show="isCompleted" :src="icon_send" class="icon-middle icon_send" @click="onSend"></image>
				<view class="icon-sending" v-show="!isCompleted"></view>
			</view>
		</view>
		<view class="side-wrapper" v-show="showHistory">
			<scroll-view class="pop-scroll-view side-scroll-view" scroll-y :show-scrollbar="false" @scrolltolower="onScrolltolower">
				<view class="history-list">
					<view class="chat-item" :key="items.timeAgo" v-for="items in chatHistoryData">
						<text class="chat-time">{{ items.timeAgo }}</text>
						<text class="chat-content" @click="onChat(item)" :key="'chat-content'+index" v-for="item,index in items.list">{{ item[0].prompt }}</text>
					</view>
				</view>
			</scroll-view>
			<view class="side-mask" @click="onClose"></view>
		</view>
		<DialogComponent v-if="showMyDoc" @onClose="showMyDoc = false">
			<template #header>
				<text class="dialog-header">我的文档</text>
			</template>
			<template #content>
				<scroll-view class="pop-scroll-view" scroll-y :show-scrollbar="false">
					<uni-swipe-action>
						<template v-for="aItem,aIndex in myDocList" :key="'docList'+aIndex">
							<text class="directory-name">{{ aItem.directoryName }}</text>
							<uni-swipe-action-item v-for="item,bIndex in aItem.docList" :key="item.id">
								<view class="doc-item">
									<text class="doc-name">{{ item.name }}</text>
									<text class="doc-time"> {{ formatTimeAgo(item.createTime) }}</text>
								</view>
								<template v-slot:right>
									<view class="delete-button" @click="onDeleteDoc(item,aIndex,bIndex)"><text class="delete-button-text">删除</text></view>
								</template>
							</uni-swipe-action-item>
							<view class="line" v-if="aIndex < myDocList.length -1"></view>
						</template>
					</uni-swipe-action>
				</scroll-view>
			</template>
		</DialogComponent>
		<OptionsDialog ref="modelOptionsDialog" @onCheck="onCheckModel" :options="chatModelOption"/>
		<OptionsDialog ref="tenantOptionsDialog" @onCheck="onSelectTenant" :options="tenantOptionList"/>
		<PopupComponent :text="dialogText" @on-sure="sureDeleteDoc" ref="popupComponent"></PopupComponent>
		<DialogComponent v-if="showDirDialog" @onClose="showDirDialog = false">
			<template #header>
				<image :src="icon_menu_add" @click="onCreateDirectory" class="icon-middle icon-add-directory" />
				<text class="dialog-header">选择文件夹</text>
			</template>
			<template #content>
				<view class="directory-wrapper">
					<scroll-view scroll-y class="directory-scroll" :show-scrollbar="false">
						<radio-group class="directory-list module-block" @change="onSelectDirectory">
							<label class="directory-item" v-for="item in directoryList" :key="item.id">
								<view class="directory-name-wrapper">
									<text class="directory-name">{{ item.directory }}</text>
								</view>
								<radio :checked="directoryId === item.id" :value="item.id"></radio>
							</label>
						</radio-group>
					</scroll-view>
					<view class="dialog-btn-wrapper">
					    <text class="dialog-btn dialog-btn-sure" :class="{'dialog-btn-disabled': selectedDocCount === 0}" @click="onSureCheck">确定</text>
					    <text class="dialog-btn dialog-btn-cancle" @click="onCancelCheck">取消</text>
					</view>
				</view>
				<view class="create-dialog" v-if="showCreateDialog">
				  <view class="create-mask" @click="onCloseCreateDialog"></view>
				  <view class="create-wrapper">
				    <view class="create-title">创建文件夹</view>
				    <view class="create-form">
				      <input class="directory-input" v-model="directoryName" placeholder="请输入文件夹名称" />
				    </view>
				    <view class="create-btn-wrapper">
				      <text class="create-btn create-sure" :class="{'create-btn-disabled': !directoryName.trim()}" @click="onCreateDirectorySure">确定</text>
				      <text class="create-btn create-cancle" @click="onCloseCreateDialog">取消</text>
				    </view>
				  </view>
				</view>
			</template>
		</DialogComponent>
		
		<DialogComponent v-if="showUploadDialog" :z-index="3" @onClose="onCloseUploadDialog">
		  <template #header>
		    <text class="dialog-header">上传文档</text>
		  </template>
		  <template #content>
		    <view class="directory-wrapper">
		      <scroll-view scroll-y class="directory-scroll" :show-scrollbar="false">
		        <radio-group class="directory-list module-block" @change="onSelectUploadDirectory">
		          <label class="directory-item" v-for="item in directoryList" :key="item.id">
		            <view class="directory-name-wrapper">
		              <text class="directory-name">{{ item.directory }}</text>
		            </view>
		            <radio :checked="uploadDirectoryId === item.id" :color="'#ffae00'" :value="item.id"></radio>
		          </label>
		        </radio-group>
		      </scroll-view>
		      <view class="dialog-btn-wrapper">
				  <text
				    class="dialog-btn dialog-btn-sure"
				    :class="{'dialog-btn-active': !!uploadDirectoryId, 'dialog-btn-disabled': !uploadDirectoryId}"
				    @click="onUploadSure"
				  >确定</text>
		        <text class="dialog-btn dialog-btn-cancle" @click="onCloseUploadDialog">取消</text>
		      </view>
		    </view>
		  </template>
		</DialogComponent>

		<!-- ChatPage.vue - 选择文档弹窗 -->
		<DialogComponent v-if="showCheckDocument" :show-close="false" @onClose="onCloseCheckDocument">
		  <template #header>
		    <view class="dialog-header-wrapper">
		      <image :src="icon_refresh" class="icon-small icon-refresh" @click="onRefreshDirectory" />
		      <text class="dialog-header">选择文档</text>
		      <view class="header-right-icons">
		        <image :src="icon_create_directory" class="icon-small icon-header" @click="onShowCreateDirectory" />
		        <image :src="icon_upload" class="icon-small icon-header" @click="onShowUpload" />
		      </view>
		    </view>
		  </template>
		  <template #content>
		    <view class="directory-wrapper">
		      <scroll-view scroll-y class="directory-scroll" :show-scrollbar="false">
		        <view class="directory-list module-block">
		          <view class="directory-item directory-item-select" v-for="item in directoryList" :key="item.id">
		            <!-- 目录名称 + 展开箭头 -->
		            <view class="directory-info" @click="onToggleDirectory(item)">
		              <text class="directory-name">{{ item.directory }}</text>
		              <image class="icon-mini icon-arrow" :class="item.expand ? 'icon-rotate' : ''" :src="icon_arrow"></image>
		            </view>
		            <view class="doc-wrapper" v-if="item.expand && item.docList?.length">
		              <view class="doc-item" v-for="doc in item.docList" :key="doc.id">
		                <text class="doc-name">{{ doc.name }}</text>
		                <checkbox
		                  :checked="doc.checked"
		                  :value="doc.id"
		                  :color="PRIMARY_COLOR"
		                  @click="checkDoc(doc)"
		                />
		              </view>
		            </view>
		          </view>
		        </view>
		      </scroll-view>
		      <view class="dialog-btn-wrapper">
		        <text
		          class="dialog-btn dialog-btn-sure"
		          :class="{'dialog-btn-active': selectedDocCount > 0, 'dialog-btn-disabled': selectedDocCount === 0}"
		          @click="onSureCheck"
		        >确定</text>
		        <text class="dialog-btn dialog-btn-cancle" @click="onCancelCheck">取消</text>
		      </view>
		    </view>
		  </template>
		</DialogComponent>

		<!-- 提示词弹窗 -->
		<DialogComponent v-if="showPromptDialog" :show-close="false" @onClose="onCancelPrompt">
			<template #header>
				<view class="dialog-header-wrapper">
					<image :src="icon_refresh" class="icon-small icon-refresh" @click="onRefreshPrompt" />
					<text class="dialog-header">提示词</text>
					<view class="header-right-icons">
						<image :src="icon_add" class="icon-small icon-header" @click="onAddPrompt" />
					</view>
				</view>
			</template>
			<template #content>
				<view class="prompt-dialog-wrapper">
					<view class="prompt-search">
						<input class="prompt-search-input" v-model="promptKeyword" @input="onPromptKeywordInput" placeholder="搜索提示词" />
					</view>
					<scroll-view scroll-y class="prompt-scroll" :show-scrollbar="false" @scrolltolower="onPromptLoadMore">
						<view class="prompt-list">
							<uni-swipe-action>
								<template v-for="item,index in promptList" :key="'prompt-item'+index">
									<uni-swipe-action-item>
										<view class="prompt-item">
											<text class="prompt-text" :class="{'prompt-text-active': item.id === promptId}">{{ item.prompt }}</text>
										</view>
										<template v-slot:right>
											<view class="prompt-button-wrapper">
												<view class="prompt-op-button prompt-delete-button" @click="onDeletePrompt(item)"><text class="prompt-button-text">删除</text></view>
												<view class="prompt-op-button" @click="onEditPromptItem(item)"><text class="prompt-button-text">编辑</text></view>
												<view class="prompt-op-button" @click="onUsePrompt(item)"><text class="prompt-button-text">{{ item.id === promptId ? '取消使用' : '使用' }}</text></view>
											</view>
										</template>
									</uni-swipe-action-item>
									<view class="line" v-if="index < promptList.length - 1"></view>
								</template>
							</uni-swipe-action>
						</view>
					</scroll-view>
					<view class="dialog-btn-wrapper">
						<text class="dialog-btn dialog-btn-sure" :class="{'dialog-btn-active': promptId !== '', 'dialog-btn-disabled': promptId === ''}" @click="onConfirmPrompt">确定</text>
						<text class="dialog-btn dialog-btn-cancle" @click="onCancelPrompt">取消</text>
					</view>
				</view>
			</template>
		</DialogComponent>
	</view>
</template>

<script setup lang="ts">
	import { marked } from 'marked';
	import mpHtml from "mp-html/dist/uni-app/components/mp-html/mp-html";
	import 'highlight.js/styles/github.css';
	import "highlight.js/styles/paraiso-light.css";
    import { reactive, ref, onBeforeUnmount,defineAsyncComponent } from 'vue';
	import icon_send from '../../static/icon_send.png';
	import icon_menu from '../../static/icon_menu.png';
	import icon_ai from '../../static/icon_ai.png';
	import icon_chat from '../../static/icon_chat.png';
	import icon_switch from '../../static/icon_switch.png';
	import icon_menu_add from '../../static/icon_menu_add.png';
	import icon_edit from "../../static/icon_edit.png";
	import icon_setting_active from "../../static/icon_setting_active.png";
	import icon_setting_disabled from "../../static/icon_setting_disabled.png";
	import icon_arrow from "../../static/icon_arrow.png";
	import icon_refresh from '../../static/icon_refresh.png';
	import icon_create_directory from '../../static/icon_create_directory.png';
	import icon_upload from '../../static/icon_upload.png';
	import icon_add from '../../static/icon_add.png';
	import AvaterComponent from '../components/AvaterComponent.vue';
    import type {
      OptionType,
      DocumentInterface,
      ChatHistoryType,
      ChatType,
      ChatStructure,
      ChatModelType,
      GroupedByChatIdType,
      FileType,
      PayloadInterface,
      UploadFile,
      UploadResponse,
      DirectoryInterce,
      TenantUserType,
	  DirectoryCheckInterface,
	  PromptInterface,
	  TenantType
    } from '../types';
    import { PositionEnum } from '../enum';
	import { formatTimeAgo, generateSecureID } from "../utils/util";
    import {HOST, PAGE_SIZE, DEFAULT_TENANT_USER,PRIMARY_COLOR} from '../common/constant';
	import api from '@/api';
    import {
      getChatHistoryService,
      getModelListService,
      getMyDocumentService,
      deleteMyDocumentService,
      getDirectoryListService,
      createDirectoryService,
      getTenantUserService,
      getPromptService,
      getPromptListService,
      deletePromptService,
      getTenantListService,
	  getDocListByDirIdService,
	  getCompanyListService,
	  uploadDocService
    } from "../service";
	import { useStore } from "../stores/useStore";
	import uniSwipeAction from '@dcloudio/uni-ui/lib/uni-swipe-action/uni-swipe-action.vue';
	import uniSwipeActionItem from '@dcloudio/uni-ui/lib/uni-swipe-action-item/uni-swipe-action-item.vue';
	import PopupComponent from "../components/PopupComponent.vue";
	import {LanguageEnum,LanguageMap} from '../enum/index';

	const OptionsDialog = defineAsyncComponent(()=>import('../components/OptionsDialog.vue'))
	const DialogComponent = defineAsyncComponent(()=>import('../components/DialogComponent.vue'));

	// 响应式状态
	let socketTask: UniApp.SocketTask | null = null; // WebSocket 实例
	const isCompleted = ref<boolean>(true);
	const chatHistoryData = reactive<Array<ChatStructure>>([]);
	const pageNum = ref<number>(1);
	const showHistory = ref<boolean>(false);
	const total = ref<number>(0);
	let chatId:string = "";
	let deleteIndex:number = -1;
	let deleteDirIndex:number = -1;
	const popupComponent = ref<null | InstanceType<typeof PopupComponent>>(null);
	const inputValue = ref<string>("");
	const store = useStore();
	const scrollTop = ref<number>(0);
	const activeModelIndex = ref<number>(0);
	const showMenu = ref<boolean>(false);
	const showMyDoc = ref<boolean>(false);
	const myDocList = reactive<DirectoryCheckInterface[]>([]);
	const showThink = ref<boolean>(false);// 是否深度思考
	const useTool = ref<boolean>(false);// 是否使用工具
	const thinking = ref<boolean>(false);
	const dialogText = ref<string>("");// 弹窗的内容
	const checkedDocIds = reactive<string[]>([]);
	const chatList = reactive<Array<ChatType>>([
		{
			responseContent:"你好，我是智能助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT,
			type:"system"
		}
	]);
	const chatModelList = reactive<Array<ChatModelType>>([]);
	const chatModelOption = reactive<Array<OptionType>>([]);
	const modelOptionsDialog = ref<null | InstanceType<typeof OptionsDialog>>(null);
	const tenantOptionsDialog = ref<null | InstanceType<typeof OptionsDialog>>(null);
	const tenantOptionList = reactive<OptionType[]>([]);
	const type = ref<string>("");
	const language = ref<LanguageEnum>(LanguageEnum.zh);
	const directoryId = ref<string>("default");
	const mDirectoryId = ref<string>("default");// 待确定选择的文件夹
	const showDirDialog = ref<boolean>(false);// 实现上传文档的目录
	const showCheckDocument = ref<boolean>(false);
	const promptData = ref<PromptInterface | null>(null); // 存储提示词对象
	const directoryList = reactive<DirectoryInterce[]>([{
		directory:"默认文件夹",
		id:"public",
    	tenantId:store.tenantUser?.id??"",
	}]);
	const selectedDocCount = ref<number>(0);
	const tempCheckedDocIds = reactive<string[]>([]);
	const showCreateDialog = ref<boolean>(false);// 创建文件夹弹窗
	const directoryName = ref<string>("");// 文件夹名称
	const showUploadDialog = ref<boolean>(false);// 上传文档弹窗
	const uploadDirectoryId = ref<string>("");// 上传选中的目录id
	const showPromptDialog = ref<boolean>(false);// 提示词弹窗
	const promptList = reactive<PromptInterface[]>([]);// 提示词列表
	const promptKeyword = ref<string>("");// 提示词搜索关键字
	const promptPageNum = ref<number>(1);// 提示词分页页码
	const promptTotal = ref<number>(0);// 提示词总数
	const promptId = ref<string>("");// 当前使用的提示词id
	
	// 支持的MIME类型映射
    const supportedMimeTypes = {
      'txt': 'text/plain',
      'pdf': 'application/pdf'
    }

	// 支持的扩展名
    const supportedExtensions = Object.keys(supportedMimeTypes) as FileType[]
    /**
	 * @author: wuwenqiang
	 * @description: 获取模型列表
	 * @date: 2025-06-02 21:45
	 */
	getModelListService(store.company?.id??"").then((res)=>{
		chatModelList.push(...res.data);
		res.data.forEach((item,index)=>chatModelOption.push({value:index,text:item.modelName}));
    	activeModelIndex.value = 0;
	});

    /**
	 * @author: wuwenqiang
	 * @description: 发送
	 * @date: 2025-05-10 22:13
	 */
	const onSend = async() => {
		if(inputValue.value.trim()){
			chatList.push({
				text:inputValue.value.trim(),
				position:PositionEnum.RIGHT
			});
			if(!chatId)chatId = generateSecureID();
			const item:ChatType = {
				text:"",
				position:PositionEnum.LEFT,
				thinkContent:"",
				responseContent:"",
				start:false
			}
			chatList.push(item);
			const payload:PayloadInterface = {
				modelId: chatModelList[activeModelIndex.value].id,
				chatId, // 替换为实际聊天ID
				type:type.value,
				companyId:store.company?.id??"",
				systemPrompt:store.prompt,
				docIds:type.value == 'document' ? checkedDocIds : [],
				prompt: inputValue.value.trim(),
				showThink:showThink.value,
				useTool:useTool.value,
				promptId:promptId.value,
        		tenantId:store.tenantUser?.id!,
				language: LanguageMap[language.value],
			};
			console.log(payload)
			await connectWebSocket();
			socketTask?.send({
				data: JSON.stringify(payload),
				success: () => {
					console.log('消息发送成功');
					inputValue.value = "";
					isCompleted.value = false;
					thinking.value = true;
				},
				fail: (err) => {
					uni.showToast({
						duration: 2000,
						position: 'center',
						title: '发送消息失败：' + err.toString()
					});
				}
			});
		}	
	}

	/**
	 * @description: 返回按钮
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
     const useBack = ()=>{
		uni.navigateBack()
	}

	/**
	 * @description: 加载历史记录
	 * @date: 2024-05-10 22:10
	 * @author wuwenqiang
	 */
	const useChatHistory = () => {
		chatHistoryData.length = 0;
		getChatHistoryService(store.tenantUser.id,pageNum.value,PAGE_SIZE).then((res) => {
			total.value = res.total;
			const chatIdGroud:GroupedByChatIdType = {};
			res.data.forEach((item)=>{
				item.timeAgo = formatTimeAgo(item.createTime);
				if(!chatIdGroud[item.chatId]){
					chatIdGroud[item.chatId] = [];
				}
				chatIdGroud[item.chatId].push(item)
			});
			for(let key in chatIdGroud){
				chatIdGroud[key].reverse();
				const timeAgo:string = chatIdGroud[key][0].timeAgo;
				let items = chatHistoryData.find((item)=>item.timeAgo === timeAgo);
				if(!items){
					items = {
						timeAgo,
						list:[]
					}
					chatHistoryData.push(items)
				}
				items?.list.unshift(chatIdGroud[key])
			}
		});
	}

	/**
	 * @description: 展示历史记录
	 * @date: 2025-05-18 12:29
	 * @author wuwenqiang
	 */
	const onShowHistory = ()=>{
		showHistory.value = true;
		showMenu.value = false;
		pageNum.value = 1;
		useChatHistory();
	}

	/**
	 * @description: 展示菜单
	 * @date: 2025-06-21 12:56
	 * @author wuwenqiang
	 */
	const onShowMenu = () =>{
		showMenu.value = true;
	}

	/**
	 * @description: 展示菜单
	 * @date: 2025-06-21 12:56
	 * @author wuwenqiang
	 */
	const onHideMenu = () =>{
		showMenu.value = false;
	}

	/**
	 * @description: 滚动加载历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onScrolltolower = ()=>{
		if(total.value > pageNum.value * PAGE_SIZE){
			useChatHistory();
		}
	}

	/**
	 * @description: 滚动加载历史记录
	 * @date: 2024-05-18 12:29
	 * @author wuwenqiang
	 */
	const onChat = (chatHistoryList:Array<ChatHistoryType>)=>{
		chatList.length = 0;
		showHistory.value = false;
		chatId = chatHistoryList[0].chatId;
		chatHistoryList.forEach((item)=>{
			chatList.push({
				text:item.prompt,
				position:PositionEnum.RIGHT,
			});
			chatList.push({
				text:"",
				start:true,
				position:PositionEnum.LEFT,
				thinkContent: item.thinkContent,
				responseContent: item.responseContent
			});
		})
	}	

	const connectWebSocket = () => {
		return new Promise((resolve,reject)=>{
			socketTask = uni.connectSocket({
				url: `${HOST.replace(/http[s]?/,'ws')}${api.chatWs}?token=Bearer ${store.token}`,
				success: (res) => {
					console.log('WebSocket 连接成功:', res);
					
				},
				fail: (err) => {
				console.error('WebSocket 连接失败:', err);
				}
			});

			socketTask.onOpen(() => {
				resolve(null)
				console.log('WebSocket 连接已建立');
			});

			socketTask.onMessage(({data}) => {
				thinking.value = false;
				if(data == "[completed]"){
					return isCompleted.value = true;
					closeSocket()
				}
				chatList[chatList.length - 1].start = true;
				// 匹配所有形式的 `<think>` 标签（包括属性和自闭合）
				const regex = /<think>([\s\S]*?)<\/think>/gi
				if(!showThink.value || regex.test(chatList[chatList.length - 1].thinkContent || "")){
					chatList[chatList.length - 1].responseContent += data;
				}else{
					chatList[chatList.length - 1].thinkContent += data;
				}
				scrollTop.value+=10
			});

			socketTask.onError((err) => {
				console.error('WebSocket 错误:', err);
				thinking.value = false;
			});

			socketTask.onClose(() => {
				thinking.value = false;
				console.log('WebSocket 连接已关闭');
			});
			
		})
      
    };

	/**	
	 * @description: 创建新会话
	 * @date: 2025-06-21 12:19
	 * @author wuwenqiang
	 */	
	const onCreateNewChat = () => {
		chatList.length = 0;
		chatId = "";
		chatList.push({
			responseContent:"你好，我是智能音乐助手小吴同学，请问有什么可以帮助您？",
			position: PositionEnum.LEFT
		});
	}

	/**	
	 * @description: 上传文档
	 * @date: 2025-06-21 12:58
	 * @author wuwenqiang
	 */	
    const onUploadDoc = () => {
      showDirDialog.value = true;
      showMenu.value = false;
      directoryList.splice(1,directoryList.length);
      getDirectoryListService(store.tenantUser.tenantId??"").then((res)=>{
        directoryList.push(...res.data);
      });
	  };

	/**	
	 * @description: 展示我的文档
	 * @date: 2025-06-21 12:58
	 * @author wuwenqiang
	 */
	const onShowMyDoc = () => {
		uni.showLoading();
		getMyDocumentList().then((res)=>{
			showMyDoc.value = true;
			showMenu.value = false;
			myDocList.length = 0;
			myDocList.push(...res);
		}).finally(()=>{
			uni.hideLoading();
		});
	}

	const getMyDocumentList = ():Promise<DirectoryCheckInterface[]> => {
		return getMyDocumentService(store.tenantUser?.tenantId??"personal").then((res)=>{
			const myDocList:DirectoryCheckInterface[] = []
			res.data.forEach((aItem)=>{
				let bItems = myDocList.find((item)=>{
					return item.directoryName === aItem.directoryName;
				});
				if(!bItems){
					bItems = {
						directoryName:aItem.directoryName,
						docList:[] as DocumentInterface[]
					};
					myDocList.push(bItems);
				}
				aItem.checked = checkedDocIds.includes(aItem.id);
				bItems.docList.push(aItem);
			});
			return myDocList;
		})
	}

	const onClose = ()=>{
		showMyDoc.value = showHistory.value = false;
	}

	const onScroll = (event : Event)=>{
		scrollTop.value = event.detail.scrollTop
	}

	// 在组件卸载前断开 WebSocket 连接
    onBeforeUnmount(() => {
      	socketTask?.close({
          success: () => {
            console.log('WebSocket 连接已关闭');
          }
        });
    });
	
	const closeSocket = ()=>{
		socketTask?.close({
          success: () => {
            console.log('WebSocket 连接已关闭');
          }
        });
	}
	/**	
	 * @description: 选择文档
	 * @date: 2025-06-21 18:47
	 * @author wuwenqiang
	 */
	const onCheckType = (checkType:string)=>{
		type.value = type.value === checkType ? "" : checkType;
	}

	/**	
	 * @description: 是否开启深度思考
	 * @date: 2025-06-21 18:47
	 * @author wuwenqiang
	 */
	const onSwitchThink = () => {
		showThink.value = !showThink.value;
	}

	/**
	 * @description: 是否开启使用工具
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onSwitchTool = () => {
		useTool.value = !useTool.value;
	}

	/**
	 * @description: 打开提示词弹窗
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onShowPromptDialog = () => {
		showPromptDialog.value = true;
		loadPromptList(true);
	}

	/**
	 * @description: 加载提示词列表
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const loadPromptList = (reset: boolean = false) => {
		if (reset) {
			promptList.length = 0;
			promptPageNum.value = 1;
		}
		const tenantId = store.tenantUser?.tenantId ?? "";
		uni.showLoading({ title: '加载中...', mask: true });
		getPromptListService(tenantId, promptKeyword.value, promptPageNum.value, PAGE_SIZE).then((res) => {
			promptList.push(...res.data);
			promptTotal.value = res.total;
		}).catch((err) => {
			console.error('加载提示词列表失败:', err);
		}).finally(() => {
			uni.hideLoading();
		});
	}

	/**
	 * @description: 刷新提示词列表
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onRefreshPrompt = () => {
		loadPromptList(true);
		uni.showToast({ duration: 2000, position: 'center', title: '刷新成功' });
	}

	/**
	 * @description: 提示词搜索框输入（实时搜索）
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onPromptKeywordInput = (event: any) => {
		promptKeyword.value = event.detail.value;
		loadPromptList(true);
	}

	/**
	 * @description: 提示词列表滚动加载更多
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onPromptLoadMore = () => {
		if (promptTotal.value > promptPageNum.value * PAGE_SIZE) {
			promptPageNum.value++;
			loadPromptList(false);
		}
	}

	/**
	 * @description: 使用/取消使用提示词
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onUsePrompt = (item: PromptInterface) => {
		if (promptId.value === item.id) {
			promptId.value = "";
		} else {
			promptId.value = item.id;
		}
	}

	/**
	 * @description: 删除提示词
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onDeletePrompt = (item: PromptInterface) => {
		uni.showModal({
			title: '提示',
			content: `是否删除提示词：${item.prompt}`,
			success: (res) => {
				if (res.confirm) {
					deletePromptService(item.id, store.tenantUser?.tenantId ?? "").then((resp) => {
						if (resp.data > 0) {
							uni.showToast({ duration: 2000, position: 'center', title: '删除成功' });
							const index = promptList.findIndex((p) => p.id === item.id);
							if (index !== -1) promptList.splice(index, 1);
							if (promptId.value === item.id) promptId.value = "";
						} else {
							uni.showToast({ duration: 2000, position: 'center', title: '删除失败' });
						}
					}).catch(() => {
						uni.showToast({ duration: 2000, position: 'center', title: '删除失败' });
					});
				}
			}
		});
	}

	/**
	 * @description: 编辑提示词（跳转到 UpdatePrompt 页面）
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onEditPromptItem = (item: PromptInterface) => {
		uni.setStorageSync('editingPrompt', item);
		uni.navigateTo({ url: '../pages/UpdatePrompt' });
	}

	/**
	 * @description: 添加提示词（跳转到 AddPromptPage 页面）
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onAddPrompt = () => {
		uni.navigateTo({ url: '../pages/AddPromptPage' });
	}

	/**
	 * @description: 确定选择提示词
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onConfirmPrompt = () => {
		showPromptDialog.value = false;
	}

	/**
	 * @description: 取消选择提示词
	 * @date: 2026-09-17
	 * @author wuwenqiang
	 */
	const onCancelPrompt = () => {
		showPromptDialog.value = false;
		promptId.value = "";
	}

	/**	
	 * @description: 切换模型
	 * @date: 2025-07-05 18:47
	 * @author wuwenqiang
	 */
	const onSwitchModel = ()=>{
		modelOptionsDialog.value?.$refs.popup.open('top');
		showMenu.value = false;
	}

	/**	
	 * @description: 选择模型
	 * @date: 2025-07-05 18:47
	 * @author wuwenqiang
	 */
	const onCheckModel = (index:number) => {
    activeModelIndex.value = index
	}

	/**	
	 * @description: 删除文档
	 * @date: 2025-07-12 13:03
	 * @author wuwenqiang
	 */
	const onDeleteDoc = (item:DocumentInterface,dirIndex:number,index:number) =>{
		deleteIndex = index;
		deleteDirIndex = dirIndex;
		dialogText.value = `是否删除文档：${item.name}`;
		popupComponent.value?.popup.value?.open('top');
	}

	/**	
	 * @description: 确认删除文档
	 * @date: 2025-07-12 13:03
	 * @author wuwenqiang
	 */
	const sureDeleteDoc = ()=>{
		deleteMyDocumentService(myDocList[deleteDirIndex][deleteIndex].id,directoryId.value).then((res)=>{
			uni.showToast({
				duration:2000,
				position:'center',
				title: "删除文档成功"
			});
			myDocList.splice(deleteIndex,1);
			popupComponent.value?.popup?.close();
		}).catch(()=>{
			uni.showToast({
				duration:2000,
				position:'center',
				title: "删除文档失败"
			});
		});
	}

	const onSwitchLang = ()=>{
		language.value = language.value === LanguageEnum.zh ? LanguageEnum.en : LanguageEnum.zh
	}

	const onCreateDirectory = ()=>{
		showCreateDialog.value = true;
	}

	const onCreateSure = ()=>{
		if(!directoryName.value)
		return uni.showToast({
			duration:2000,
			position:'center',
			title: "请输入文件夹名称"
		});
		if(directoryList.find((item)=>item.directory === directoryName.value)){
			return uni.showToast({
				duration:2000,
				position:'center',
				title: "文件夹名称已存在"
			});
		}
		createDirectoryService({directory:directoryName.value,tenantId:store.tenantUser?.tenantId??""}).then((res)=>{
			 uni.showToast({
				duration:2000,
				position:'center',
				title: "创建文件夹成功"
			});
			directoryList.splice(1,0,res.data);
			showCreateDialog.value = false;
		}).catch((res)=>{
			uni.showToast({
				duration:2000,
				position:'center',
				title: res.msg
			});
		})
	}

	const onSelectDirectory = (event:Event)=>{
		directoryId.value = event.detail.value;
	}

	const onSelectDoc = (event:Event)=>{
		mDirectoryId.value = event.detail.value;
	}

	/**
	 * @description: 点击查询文档按钮，打开选择文档弹窗
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onSetDocument = () => {
	  showCheckDocument.value = true;
	  loadDirectoryList();
	};

	/**
	 * @description: 加载文档目录列表
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const loadDirectoryList = () => {
	  uni.showLoading({ title: '加载中...', mask: true });
	  getDirectoryListService(store.tenantUser?.tenantId ?? "").then((res) => {
	    directoryList.length = 0;
	    res.data.forEach((item) => {
	      directoryList.push({
	        ...item,
	        expand: false,
	        docList: []
	      });
	    });
	  }).catch((err) => {
	    console.error('加载目录列表失败:', err);
	  }).finally(() => {
	    uni.hideLoading();
	  });
	};
	
	/**
	 * @description: 刷新目录列表
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onRefreshDirectory = () => {
	  loadDirectoryList();
	  uni.showToast({
	    duration: 2000,
	    position: 'center',
	    title: '刷新成功'
	  });
	};
	
	/**
	 * @description: 点击目录名称，展开/折叠并加载文档列表
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onToggleDirectory = (item: DirectoryCheckInterface) => {
	  if (item.expand) {
	    // 已展开，折叠
	    item.expand = false;
	    return;
	  }
	  item.expand = true;
	  // 如果已经加载过文档列表，不再重复请求
	  if (item.docList && item.docList.length > 0) {
	    return;
	  }
	  uni.showLoading({ title: '加载中...', mask: true });
	  getDocListByDirIdService(store.tenantUser?.tenantId ?? "", item.id!).then((res) => {
	    item.docList = res.data.map((doc) => ({
	      ...doc,
	      checked: checkedDocIds.includes(doc.id)
	    }));
	  }).catch((err) => {
	    console.error('加载文档列表失败:', err);
	  }).finally(() => {
	    uni.hideLoading();
	  });
	};
	
	/**
	 * @description: 打开创建文件夹对话框
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onShowCreateDirectory = () => {
	  directoryName.value = "";
	  showCreateDialog.value = true;
	};
	
	/**
	 * @description: 关闭创建文件夹对话框
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onCloseCreateDialog = () => {
	  showCreateDialog.value = false;
	};
	
	/**
	 * @description: 确定创建文件夹
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onCreateDirectorySure = () => {
	  if (!directoryName.value.trim()) return;
	  if (directoryList.find((item) => item.directory === directoryName.value.trim())) {
	    uni.showToast({
	      duration: 2000,
	      position: 'center',
	      title: '文件夹名称已存在'
	    });
	    return;
	  }
	  uni.showLoading({ title: '创建中...', mask: true });
	  createDirectoryService({
	    directory: directoryName.value.trim(),
	    tenantId: store.tenantUser?.tenantId ?? ""
	  }).then((res) => {
	    if (res.data) {
	      uni.showToast({
	        duration: 2000,
	        position: 'center',
	        title: '创建文件夹成功'
	      });
	      showCreateDialog.value = false;
	      // 刷新目录列表
	      loadDirectoryList();
	    } else {
	      uni.showToast({
	        duration: 2000,
	        position: 'center',
	        title: '创建文件夹失败'
	      });
	    }
	  }).catch((err) => {
	    uni.showToast({
	      duration: 2000,
	      position: 'center',
	      title: err.msg || '创建失败'
	    });
	  }).finally(() => {
	    uni.hideLoading();
	  });
	};
	
	/**
	 * @description: 打开上传文档对话框
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onShowUpload = () => {
	  uploadDirectoryId.value = "";
	  showUploadDialog.value = true;
	  // 确保目录列表已加载
	  if (directoryList.length === 0) {
	    loadDirectoryList();
	  }
	};
	
	/**
	 * @description: 关闭上传文档对话框
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onCloseUploadDialog = () => {
	  showUploadDialog.value = false;
	};
	
	/**
	 * @description: 选择上传目录
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onSelectUploadDirectory = (event: any) => {
	  uploadDirectoryId.value = event.detail.value;
	};
	
	/**
	 * @description: 关闭选择文档弹窗
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onCloseCheckDocument = () => {
	  showCheckDocument.value = false;
	  tempCheckedDocIds.length = 0;
	};
	
	/**
	 * @description: 上传文档确定
	 * @date: 2026-09-13
	 * @author wuwenqiang
	 */
	const onUploadSure = () => {
	  if (!uploadDirectoryId.value) return;
	  const supportedExtensions = ['txt', 'pdf', 'doc', 'docx'];
	  uni.chooseFile({
	    count: 9,
	    type: 'file',
	    extension: supportedExtensions,
	    success: async (res: { tempFiles: UploadFile[] }) => {
	      const validFiles = res.tempFiles.filter(file => {
	        const ext = file.name.split('.').pop()?.toLowerCase();
	        return ext && supportedExtensions.includes(ext);
	      });
	      if (validFiles.length === 0) {
	        uni.showToast({
	          icon: 'none',
	          title: '未选择有效的txt、pdf或word文件',
	          duration: 2000
	        });
	        return;
	      }
	      uni.showLoading({ title: '上传中...', mask: true });
	      try {
	        const uploadPromises = validFiles.map(file => {
	          return uploadDocService(
	            file.path,
	            file.name,
	            store.tenantUser?.tenantId ?? "",
	            uploadDirectoryId.value
	          );
	        });
	        await Promise.all(uploadPromises);
	        uni.showToast({
	          title: `成功上传${validFiles.length}个文件`,
	          icon: 'success',
	          duration: 2000
	        });
	        showUploadDialog.value = false;
	        // 刷新目录列表
	        loadDirectoryList();
	      } catch (error) {
	        uni.showToast({
	          title: error instanceof Error ? error.message : '上传过程中出错',
	          icon: 'none',
	          duration: 2000
	        });
	      } finally {
	        uni.hideLoading();
	      }
	    },
	    fail: () => {
	      uni.showToast({
	        duration: 2000,
	        position: 'center',
	        title: "选择文件失败",
	        icon: 'none'
	      });
	    }
	  });
	};

	/**
	 * @description: 确定选择文档
	 * @date: 2026-09-05
	 * @author wuwenqiang
	 */
	const onSureCheck = () => {
	    // 检查是否至少选中一篇文档
	    if (selectedDocCount.value === 0) {
	        uni.showToast({
	            duration: 2000,
	            position: 'center',
	            title: '请至少选择一篇文档'
	        });
	        return;
	    }
	    showCheckDocument.value = false;
	    // 更新正式选中的文档ID列表
	    checkedDocIds.length = 0;
	    checkedDocIds.push(...tempCheckedDocIds);
	    // 更新选中数量
	    selectedDocCount.value = checkedDocIds.length;
	    // 设置查询文档为激活状态
	    type.value = 'document';
	};

	/**
	 * @description: 取消选择文档
	 * @date: 2026-09-05
	 * @author wuwenqiang
	 */
	const onCancelCheck = () => {
	    showCheckDocument.value = false;
	    // 清空临时选中的文档ID
	    tempCheckedDocIds.length = 0;
	    // 清空正式选中的文档ID
	    checkedDocIds.length = 0;
	    // 重置选中数量
	    selectedDocCount.value = 0;
	    // 查询文档变为灰色状态（非激活）
	    type.value = '';
	    // 重置所有文档的选中状态
	    myDocList.forEach((dir) => {
	        dir.docList?.forEach((doc) => {
	            doc.checked = false;
	        });
	    });
	};


	/**
	 * @author: wuwenqiang
	 * @description: 获取提示词
	 * @date: 2026-04-14
	 * @author wuwenqiang
	 */
	const getPrompt = (tenantId: string) => {
		if (!tenantId) return;
		getPromptService(tenantId).then((res) => {
			if (res.data) {
				promptData.value = res.data;
				// 如果后端返回了提示词，更新到 store 中
				if (res.data.prompt) {
					store.setPrompt(res.data.prompt);
				}
			}
		}).catch((err) => {
			console.error('获取提示词失败:', err);
		});
	}

	/**
	 * @author: wuwenqiang
	 * @description: 显示租户切换弹窗
	 * @date: 2026-04-14
	 * @author wuwenqiang
	 */
	const onSwitchTenant = () => {
		getTenantListForSwitch();
		tenantOptionsDialog.value?.$refs.popup.open('top');
	}

	/**
	 * @author: wuwenqiang
	 * @description: 获取租户信息（优化版：先从缓存获取tenantId，再调用接口获取租户列表）
	 * @date: 2026-06-01
	 * @author wuwenqiang
	 */
	const getStorageTenant = async () => {
		// 1. 先从缓存获取用户保存的租户ID（key为 userId:tenantId）
		const cachedTenantId = await store.getTenantIdFromStorage();
		
		// 2. 获取当前公司ID
		const cachedCompanyId = await store.getCompanyIdFromStorage();
		const currentCompany = store.company;
		
		// 如果 store 中没有公司信息但缓存中有，说明是从 CompanyPage 新选择的公司
		if (!currentCompany && cachedCompanyId) {
			// 需要重新获取公司列表并设置公司信息
			try {
				const companyRes = await getCompanyListService();
				const foundCompany = companyRes.data?.find(item => item.id === cachedCompanyId);
				if (foundCompany) {
					store.setCompany(foundCompany);
				}
			} catch (error) {
				console.error('获取公司信息失败:', error);
			}
		}
		
		// 3. 获取当前公司下的所有租户列表
		if (!store.company?.id) {
			console.error('公司ID不存在');
			store.setTenantUser(getDefaultTenantUser());
			getPrompt(store.userData.id!);
			return;
		}
		
		try {
			const res = await getTenantListService(store.company.id);
			const tenantList = res.data || [];
			
			// 4. 如果缓存中有tenantId，在租户列表中查找匹配的记录
			if (cachedTenantId) {
				const matchedTenant = tenantList.find(tenant => tenant.id === cachedTenantId);
				if (matchedTenant) {
					// 找到匹配的租户，调用接口获取完整租户信息并设置
					await setTenantUserByTenantId(matchedTenant.id);
					return;
				}
			}
			
			// 5. 如果没有找到匹配的租户，使用默认逻辑（从缓存或接口获取租户信息）
			await fallbackGetTenant();
			
		} catch (error) {
			console.error('获取租户列表失败:', error);
			await fallbackGetTenant();
		}
	};

	/**
	 * @description: 降级获取租户信息（兜底逻辑）
	 * @date: 2026-06-01
	 * @author wuwenqiang
	 */
	const fallbackGetTenant = async () => {
		const cachedTenantId = await store.getTenantIdFromStorage();
		
		if (cachedTenantId) {
			// 从缓存获取tenantId，调用接口获取租户详细信息
			getTenantUserService(cachedTenantId).then((response) => {
				if (response.data) {
					store.setTenantUser(response.data as TenantUserType);
					getPrompt(cachedTenantId);
				} else {
					store.setTenantUser(getDefaultTenantUser());
					getPrompt(store.userData.id!);
				}
			}).catch(() => {
				store.setTenantUser(getDefaultTenantUser());
				getPrompt(store.userData.id!);
			});
		} else {
			store.setTenantUser(getDefaultTenantUser());
			getPrompt(store.userData.id!);
		}
		
		// 获取提示词
		uni.getStorage({ key: `${store.userData.id}:prompt` }).then((res) => {
			if (res.data) {
				store.setPrompt(res.data);
			}
		});
	};

	/**
	 * @description: 根据租户ID设置租户信息
	 * @date: 2026-06-01
	 * @author wuwenqiang
	 */
	const setTenantUserByTenantId = async (tenantId: string) => {
		try {
			const response = await getTenantUserService(tenantId);
			if (response.data) {
				store.setTenantUser(response.data as TenantUserType);
				getPrompt(tenantId);
			} else {
				store.setTenantUser(getDefaultTenantUser());
				getPrompt(store.userData.id!);
			}
		} catch (error) {
			console.error('获取租户信息失败:', error);
			store.setTenantUser(getDefaultTenantUser());
			getPrompt(store.userData.id!);
		}
	};

	/**
	 * @author: wuwenqiang
	 * @description: 获取租户列表（用于切换租户弹窗）
	 * @date: 2026-06-01
	 * @author wuwenqiang
	 */
	const getTenantListForSwitch = () => {
		if (!store.company?.id) {
			console.error('公司ID不存在');
			uni.showToast({
				duration: 2000,
				position: 'center',
				title: '请先选择公司'
			});
			return;
		}
		
		// 显示加载提示
		uni.showLoading({ title: '加载中...', mask: true });
		
		getTenantListService(store.company.id).then((res) => {
			tenantOptionList.length = 0;
			// 添加私人空间选项（私人空间的 tenantId 就是 userId）
			tenantOptionList.push({ value: store.userData.id!, text: "私人空间" });
			// 添加公司下的租户列表
			res.data.forEach((item: TenantType) => {
				tenantOptionList.push({ value: item.id, text: item.name });
			});
			// 打开选择弹窗
			tenantOptionsDialog.value?.$refs.popup.open('top');
		}).catch((err) => {
			console.error('获取租户列表失败:', err);
			uni.showToast({
				duration: 2000,
				position: 'center',
				title: '获取租户列表失败'
			});
		}).finally(() => {
			uni.hideLoading();
		});
	}

	/**
	 * @author: wuwenqiang
	 * @description: 选择租户后切换，并保存到缓存（key为 userId:tenantId）
	 * @date: 2026-06-01
	 * @author wuwenqiang
	 */
	const onSelectTenant = async (tenantId: string) => {
		uni.showLoading({ title: '切换中...', mask: true });
		try {
			const response = await getTenantUserService(tenantId);
			const data: TenantUserType = response.data ? response.data as TenantUserType : {
				id: "",
				tenantId: store.userData.id!,
				tenantName: "私人空间",
				userId: store.userData.id!,
				roleType: 0,
				joinDate: "",
				createBy: "",
				username: store.userData.username,
				avater: store.userData.avater,
				disabled: 0,
				email: store.userData.email
			} as TenantUserType;
			
			// setTenantUser 内部会保存 tenantId 到缓存（key为 userId:tenantId）
			store.setTenantUser(data);
			// 切换租户后重新获取提示词
			getPrompt(data.tenantId ?? "");
			
			uni.showToast({
				duration: 2000,
				position: 'center',
				title: '切换成功'
			});
		} catch (error) {
			console.error('切换租户失败:', error);
			uni.showToast({
				duration: 2000,
				position: 'center',
				title: '切换失败，请重试'
			});
		} finally {
			uni.hideLoading();
		}
	};

	/**
	 * @author: wuwenqiang
	 * @description: 获取默认租户信息
	 * @date: 2026-06-01
	 * @author wuwenqiang
	 */
	const getDefaultTenantUser = (): TenantUserType => {
		const defaultTenantUser: TenantUserType = { ...DEFAULT_TENANT_USER };
		defaultTenantUser.tenantId = store.userData.id!;
		defaultTenantUser.userId = store.userData.id!;
		defaultTenantUser.tenantName = "私人空间";
		return defaultTenantUser;
	}

    /**
     * @author: wuwenqiang
     * @description: 获取租户i
     * @date: 2025-8-10 18:06
     */
	const onSureCreate = ()=>{
		createDirectoryService({directory:directoryName.value,tenantId:store.tenantUser.tenantId}).then(res=>{
			if(res.data){
			directoryList.splice(1,0,res.data);
			}
			showCreateDialog.value = false;
			uni.showToast({
			duration:2000,
			position:'center',
			title: `创建文件夹${res.data ? '成功' :'失败'}`
			})
		})
	}

	const onSettingPrompt = ()=>{
		uni.navigateTo({url: `../pages/PromptPage`})
		showMenu.value = false;
	}

	const onEditPrompt = ()=>{
		uni.navigateTo({url: `../pages/SettingPromptPage`})
		showMenu.value = false;
	}

	const onMyPrompt = ()=>{
		uni.navigateTo({url: `../pages/MyPromptPage`})
		showMenu.value = false;
	}

	/**
	 * @description: 选中或取消选中文档
	 * @date: 2026-09-05
	 * @author wuwenqiang
	 */
	const checkDoc = (docItem: DocumentInterface) => {
	  docItem.checked = !docItem.checked;
	  updateTempCheckedDocIds();
	  updateSelectedCount();
	};
	
	/**
	 * @description: 更新选中的文档数量
	 * @date: 2026-09-05
	 * @author wuwenqiang
	 */
	const updateSelectedCount = () => {
	  selectedDocCount.value = tempCheckedDocIds.length;
	};

	/**
	 * @description: 更新临时选中的文档ID列表
	 * @date: 2026-09-05
	 * @author wuwenqiang
	 */
	const updateTempCheckedDocIds = () => {
	  tempCheckedDocIds.length = 0;
	  directoryList.forEach((dir) => {
	    dir.docList?.forEach((doc) => {
	      if (doc.checked) {
	        tempCheckedDocIds.push(doc.id);
	      }
	    });
	  });
	};

	const getCheckedDocIds = ()=>{
		checkedDocIds.length = 0;
		myDocList.forEach((aItem)=>{
			aItem.docList?.forEach((bItem)=>{
				if(bItem.checked)checkedDocIds.push(bItem.id);
			})
		});		
	}

	/**
	 * @description: 展开/折叠目录
	 * @date: 2026-09-05
	 * @author wuwenqiang
	 */
	const onExpandDir = (item: DirectoryCheckInterface) => {
	    item.expand = !item.expand;
	};
	
	getStorageTenant()
</script>

<style lang="less" scoped>
	@import '../theme/color.less';
	@import '../theme/size.less';
	@import '../theme/style.less';
	.page-wrapper{
		position: relative;
		.page-header {
			padding: @middle-padding;
			display: flex;
			justify-content: space-between;
			background: @white-color;
			align-items: center;
			.title-wrapper {
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				gap:@middle-padding;
				.tenant-name,.model-name {
					font-size: @normal-font-size;
				}
			}
			.icon-back{
				width: @small-icon-size;
				height: @small-icon-size;
				opacity: 0.2;
			}
			.icon-record{
				opacity: 0.5;
			}
			.menu-wrapper{
				width: @small-icon-size;
				height: @small-icon-size;
				position: relative;
				.menu-box{
					position: absolute;
					z-index: 2;
					width: @popup-menu-width;
					background-color: @pop-background-color;
					right: -@arrow-size;
					top: calc(@small-icon-size + @arrow-size);
					border-radius: @module-border-radius;
					.menu-arrow{
						position: absolute;
						width: 0;
						height: 0;
						top: @arrow-size;
						border-top: @arrow-size solid transparent;   
						border-bottom: @arrow-size solid @pop-background-color; 
						border-right:@arrow-size solid transparent;;
						border-left:@arrow-size solid transparent;
						z-index: 1;
						right: calc(@arrow-size * 2);
						top: calc(@arrow-size * -2);
					}
					.menu-list{
						padding: @middle-padding;
						display: flex;
						flex-direction: column;
						color:@white-color;
						gap:@middle-padding;
						.menu-line{
							height: 1rpx;
							background-color: @pop-line-color;
						}
						.menu-item{

						}
					}
				}
				.menu-mask{
					width: 100vw;
					height: 100vh;
					z-index: 1;
					left: 0;
					top:0;
					position: fixed;
					background-color: transparent;
				}
			}
		}
		.page-body{
			flex: 1;
			height: 0;
			.scroll-view{
				height: 100%;
				.chat-list{
					display: flex;
					flex-direction: column;
					gap: @middle-padding;
					padding: @middle-padding;
					.chat-wrapper{
						display: flex;
						gap:@middle-padding;	
						.chat-prompt-wrapper{
							flex: 1;
							display: flex;
							justify-content: flex-end;
							.chat-prompt{
								max-width: 100%;
								background-color: @white-color;
								padding: @middle-padding;
								border-radius: @btn-border-radius;
								position: relative;
							}
						}
						.chat-text-wrapper{
							flex: 1;
							display: flex;
							.chat-text{
								max-width: 100%;
								background-color: @white-color;
								padding: @middle-padding;
								border-radius: calc(@btn-border-radius / 2);
								position: relative;
								
								.think-text{
									color:@sub-title-color;
								}
							}
						}
						
						.icon-angle{
							position: absolute;
							width: 0;
							height: 0;
							top: 15rpx;
							border-top: 15rpx solid transparent;   
							border-bottom: 15rpx solid transparent; 
							&.icon-angle-left{
								left: -15rpx;
								border-right: 15rpx solid @white-color;
							}
							&.icon-angle-right{
								right: -15rpx;
								border-left: 15rpx solid @white-color;
							}
						}
					}
				}
			}
		}
		.scroll-container {
			width: 100%;
			white-space: nowrap;
			.type-wrapper{
				display: flex;
				justify-content: flex-start;
				background-color: @page-background-color;
				padding: @middle-padding 0;
				gap: @middle-padding;
				flex-wrap: nowrap;
				width: auto;
				float: left;
				.type-item{
					padding: @small-padding @middle-padding;
					color: @sub-title-color;
					border: 1rpx solid @gray-color;
					border-radius: @big-border-radius;
					background-color: @white-color;
					display: flex;
					justify-content: center;
					align-items: center;
					white-space: nowrap;
					flex-shrink: 0;
					gap:@small-padding;
					&.type-item-doc{
						display: flex;
						position: relative;
						.doc-badge {
							position: absolute;
							top: -10rpx;
							right: -10rpx;
							min-width: 32rpx;
							height: 32rpx;
							background-color: @primary-color;
							color: @white-color;
							font-size: 20rpx;
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 0 6rpx;
							box-sizing: border-box;
						}
					}
					&.type-item-language{
						color: #000;
					}
					&.type-item-active{
						border-color: @primary-color;
						color:  @primary-color;
					}
					&:first-child{
						margin-left: @middle-padding;
					}
					&:last-child{
						margin-right: calc(@middle-padding * 3);
					}
				}
			}
		}
		
		.input-wrapper{
			display: flex;
			gap:@middle-padding;
			padding: @middle-padding;
			background-color: @white-color;
			align-items: center;
			.chat-input{
				background-color: @page-background-color;
				flex: 1;
				height: @middle-avater;
				border-radius: @middle-avater;
				padding-left: @middle-padding;
				box-sizing: border-box;
			}
			.icon-wrapper{
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 50%;
				background-color: @page-background-color;
				width:  @middle-avater;
				height:  @middle-avater;
				.icon-sending{
					width: 35%;
					height: 35%;
					border-radius: @btn-border-radius;
					background-color: @sub-title-color;
				}
			}
		}
		.directory-wrapper{
			height: 100%;
			display: flex;
			flex-direction: column;
			gap:@middle-padding;
      		background: @page-background-color;
			.create-directory{
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: @middle-padding;
			}
			.directory-scroll{
				flex: 1;
				height: 0;
        		margin-bottom: @middle-padding;
				.directory-list{
          			margin: @middle-padding;
					.directory-item{
						display: flex;
						justify-content: space-between;   // 关键：左右两端对齐
						align-items: center;
						padding: @middle-padding;
            			border-bottom: 1rpx solid @gray-color;
						&.directory-item-select{
							flex-direction: column;
						}
						&:first-child{
							padding-top: 0;
						}
						&:last-child{
							border-bottom: none;
							padding-bottom: 0;
						}
						.directory-info{
							display: flex;
							width: 100%;
							align-items: center;
							gap:@small-padding
						}
						.directory-name{
							text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
							flex: 1;
						}
						.icon-mini{
							opacity: 0.5;
							&.icon-rotate{
								transform: rotate(90deg);
							}
						}
						.check-part{
							opacity: 0.5;
						}
						.doc-wrapper{
							display: flex;
							flex-direction: column;
							width: 100%;
							gap: @middle-padding;
							margin-top: @middle-padding;
							.doc-item{
								display: flex;
								.doc-name{
									flex: 1;
								}
							}
						}
					}
				}	
			}	
			.dialog-btn-wrapper{
				display: flex;
				gap:@middle-padding;
				padding: @middle-padding;
        		background: @white-color;
				.dialog-btn{
					flex: 1;
					height: @input-height;
					display: flex;
					justify-content: center;
					align-items: center;
					border-radius: @input-height;
					&.dialog-btn-sure{
						color: @white-color;
						background-color: @gray-color ;
						border: 1rpx solid @gray-color;
						&.dialog-btn-active {
						    background-color: @primary-color !important;
						    border-color: @primary-color !important;
						}
						&.dialog-btn-disabled {
							background-color: @gray-color !important;
							color: @white-color !important;
							border-color: @gray-color !important;
						}
					}
					&.dialog-btn-cancle{
						border:1rpx solid @gray-color;
					}
				}
			}		
		}
		.icon-add-directory{
			position: absolute;
			left: @middle-padding;
			top: 50%;
			transform: translateY(-50%);
			opacity: 0.5;
		}
		.create-dialog{
			width: 100vw;
			height: 100vh;
			position: fixed;
			left: 0;
			top:0;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 1;
			.create-mask{
				width: 100%;
				height: 100%;
				position: absolute;
				left: 0;
				top:0;
				background-color: @black-color;
				opacity: 0.5;
			}
			.create-wrapper{
				background: @white-color;
				position: relative;
				z-index: 1;
				border-radius: @module-border-radius;
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 80%;
				.create-tip{
					width: 100%;
					border-bottom: 1rpx solid @gray-color;
					padding:  @middle-padding;
					box-sizing: border-box;
					margin-bottom: @middle-padding;
					text-align: center;
				}
				.create-form{
					padding: calc(@middle-padding * 3) @middle-padding;
					display: flex;
					gap:@middle-padding;
					width: 100%;
					align-items: center;
					box-sizing: border-box;
					.directory-input{
						flex: 1;
						height: @input-height;
						outline: none;
						padding: 0 @middle-padding;
						border-radius: @module-border-radius;
						border: 1rpx solid @gray-color;
					}
				}
				
				.create-btn-wrapper{
					display: flex;
					width: 100%;
					border-top: 1rpx solid @gray-color;
					.create-btn{
						flex: 1;
						display: flex;
						justify-content: center;
						align-items: center;
						border-right: 1rpx solid @gray-color;
						box-sizing: border-box;
						height: @btn-height;
						&.create-sure{
							border-right: 1rpx solid @gray-color;
							color:@gray-color;
						}
					}
					
				}
			}
		}
		.side-wrapper{
			position:fixed;
			top: 0;
			left:0;
			width: 100vw;
			height: 100vh;
			
			display: flex;
			.side-mask{
				flex:1;
				background-color: @black-color;
				opacity: 0.5;
			}
		}
		.pop-scroll-view{
			background-color: @white-color;
			&.side-scroll-view{
				width: 80%;
			}
			height: 100vh;
			padding: @middle-padding;
			box-sizing: border-box;
			.line{
				height: 1rpx;
				background-color: @gray-color;
				margin-bottom: @middle-padding;
			}
			.history-list{
				padding: @middle-padding;
				display: flex;
				flex-direction: column;
				gap: calc(@middle-padding * 2);
				.chat-item{
					display: flex;
					flex-direction: column;
					gap:  @middle-padding;
					.chat-time{
						color: @sub-title-color;
					}
					.chat-content{
						display: block;
						width: 100%;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
				
			}
			.delete-button{
				display: flex;
				height: 100%;
				flex: 1;
				flex-direction: row;
				justify-content: center;
				align-items: center;
				background-color: @warn-color;
				margin-left: @middle-padding;
				.delete-button-text{
					color: @white-color;
					padding: 0 calc(@middle-padding * 2);
				}
			}
			.directory-name{
				padding-bottom: @middle-padding;
				display: block;
			}
			.doc-item{
				padding-bottom: @middle-padding;
				border-bottom: 1rpx solid @gray-color;
				padding-top: @middle-padding;
				&:last-child{
					border-bottom: none;
				}
				&:first-child{
					padding-top:0;
				}
				.doc-name{
					flex: 1;
				}
				.doc-time{
					color: @sub-title-color;
					padding-left: @middle-padding;
				}
				
			}
		}
				
		.dialog-header-wrapper {
		  display: flex;
		  align-items: center;
		  justify-content: space-between;
		  width: 100%;
		  padding: 0 @middle-padding;
		  box-sizing: border-box;
		
		  .icon-refresh {
		    opacity: 0.5;
		    flex-shrink: 0;
		  }
		  .dialog-header {
		    flex: 1;
		    text-align: center;
		    font-weight: bold;
		  }
		  .header-right-icons {
		    display: flex;
		    gap: @middle-padding;
		    flex-shrink: 0;
		    .icon-header {
		      opacity: 0.5;
		    }
		  }
		}
		
		// 目录箭头旋转
		.icon-arrow {
		  transition: transform 0.2s;
		  &.icon-rotate {
		    transform: rotate(90deg);
		  }
		}
		
		// 创建对话框
		.create-dialog {
		  .create-title {
		    text-align: center;
		    font-weight: bold;
		    padding: @middle-padding;
		    border-bottom: 1rpx solid @gray-color;
		    width: 100%;
		    box-sizing: border-box;
		  }
		  .create-btn-disabled {
		    color: @gray-color !important;
		    pointer-events: none;
		  }
		}
	// 提示词弹窗
	.prompt-dialog-wrapper {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: @middle-padding;
		background: @page-background-color;
		.prompt-search {
			padding: @middle-padding @middle-padding 0 @middle-padding;
			.prompt-search-input {
				height: @input-height;
				background-color: @white-color;
				border-radius: @big-border-radius;
				padding: 0 @middle-padding;
				box-sizing: border-box;
			}
		}
		.prompt-scroll {
			flex: 1;
			height: 0;
			.prompt-list {
				margin: 0 @middle-padding;
				background-color: @white-color;
				border-radius: @module-border-radius;
				padding:0 @middle-padding;
				box-sizing: border-box;
				.prompt-item {
					padding: @middle-padding 0;
					display: flex;
					align-items: center;
					.prompt-text {
						flex: 1;
						width: 0;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						overflow: hidden;
						text-overflow: ellipsis;
						-webkit-line-clamp: 3;
						&.prompt-text-active {
							color: @primary-color;
						}
					}
				}
				.line {
					height: 1rpx;
					background: @gray-color;
				}
				.prompt-button-wrapper {
					display: flex;
					.prompt-op-button {
						display: flex;
						height: 100%;
						flex-direction: row;
						justify-content: center;
						align-items: center;
						margin-left: @middle-padding;
						background-color: @gray-color;
						color: @white-color;
						&.prompt-delete-button {
							background-color: @warn-color;
						}
						.prompt-button-text {
							padding: 0 calc(@middle-padding * 2);
						}
					}
				}
			}
		}
		.dialog-btn-wrapper {
			display: flex;
			gap: @middle-padding;
			padding: @middle-padding;
			background: @white-color;
			.dialog-btn {
				flex: 1;
				height: @input-height;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: @input-height;
				&.dialog-btn-sure {
					color: @white-color;
					background-color: @gray-color;
					border: 1rpx solid @gray-color;
					&.dialog-btn-active {
						background-color: @primary-color !important;
						border-color: @primary-color !important;
					}
					&.dialog-btn-disabled {
						background-color: @gray-color !important;
						color: @white-color !important;
						border-color: @gray-color !important;
					}
				}
				&.dialog-btn-cancle {
					border: 1rpx solid @gray-color;
				}
			}
		}
	}
	}
</style>