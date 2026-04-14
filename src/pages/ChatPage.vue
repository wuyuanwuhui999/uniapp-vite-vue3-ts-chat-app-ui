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
				<view  class="type-item type-item-doc" :class="{'type-item-active': type === 'document'}">
					<text @click="onCheckType('document')">知识库</text>
					<image class="icon-mini" @click="onSetDocument" :src="type == 'document' ? icon_setting_active : icon_setting_disabled"/>
				</view>
				<text class="type-item" :class="{'type-item-active': type === 'db'}" @click="onCheckType('db')">查询数据库</text>
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
						<text class="dialog-btn dialog-btn-sure" @click="onUploadSure">确定</text>
						<text class="dialog-btn dialog-btn-cancle" @click="showDirDialog = false">取消</text>
					</view>
				</view>
				<view class="create-dialog" v-if="showCreateDialog">
					<view class="create-mask" @click="showCreateDialog = false"></view>
					<view class="create-wrapper">
						<view class="create-form">
							<text>文件夹名称</text>
							<input class="directory-input" v-model="directoryName">
						</view>
						<view class="create-btn-wrapper">
							<text class="create-btn create-sure" @click="onSureCreate">确定</text>
							<text class="create-btn create-cancle" @click="showCreateDialog = false">取消</text>
						</view>
					</view>

				</view>
			</template>
		</DialogComponent>

		<DialogComponent v-if="showCheckDocument" @onClose="showCheckDocument = false">
			<template #header>
				<text class="dialog-header">知识库</text>
			</template>
			<template #content>
				<view class="directory-wrapper">
					<scroll-view scroll-y class="directory-scroll" :show-scrollbar="false">
						<view class="directory-list module-block">
							<view class="directory-item" v-for="item in myDocList" :key="item.directoryName">
								<view class="directory-info"  @click="onExpandDir(item)">
									<text class="directory-name" @click="">{{ item.directoryName }}</text>
									<image class="icon-mini" :class="item.expand ? 'icon-rotate': '' " :src="icon_arrow"></image>
								</view>
								<view class="doc-wrapper" v-if="item.expand && item.docList?.length">
									<view class="doc-item" v-for="value in item.docList">
										<text class="doc-name">{{ value.name }}</text>
										<radio :checked="value.checked" @click="checkDoc(value)" :value="value.id"></radio>
									</view>
								</view>
							</view>

						</view>
					</scroll-view>
					<view class="dialog-btn-wrapper">
						<text class="dialog-btn dialog-btn-sure" @click="onSureCheck">确定</text>
						<text class="dialog-btn dialog-btn-cancle" @click="showCheckDocument = false">取消</text>
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
    import {HOST, PAGE_SIZE, DEFAULT_TENANT_USER} from '../common/constant';
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
      getTenantListService
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
	const showCreateDialog = ref<boolean>(false);// 创建文件夹弹窗
	const directoryName = ref<string>("");// 文件夹名称
	const showCheckDocument = ref<boolean>(false);
	const promptData = ref<PromptInterface | null>(null); // 存储提示词对象
	const directoryList = reactive<DirectoryInterce[]>([{
		directory:"默认文件夹",
		id:"public",
    	tenantId:store.tenantUser?.id??"",
	}]);

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
	getModelListService().then((res)=>{
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
				token: store.token, // 替换为实际用户ID
				chatId, // 替换为实际聊天ID
				type:type.value,
				systemPrompt:store.prompt,
				docIds:type.value == 'document' ? checkedDocIds : [],
				prompt: inputValue.value.trim(),
				showThink:showThink.value,
        		tenantId:store.tenantUser?.tenantId!,
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
		getChatHistoryService(pageNum.value,PAGE_SIZE).then((res) => {
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
				url: `${HOST.replace(/http[s]?/,'ws')}${api.chatWs}`,
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

	const onUploadSure = ()=>{
		uni.chooseFile({
			count: 9,
			type: 'file',
			extension: supportedExtensions,
			success: async (res: { tempFiles: UploadFile[] }) => {
			// 过滤出符合类型的文件
			const validFiles = res.tempFiles.filter(file => {
				const ext = file.name.split('.').pop()?.toLowerCase() as FileType | undefined;
				return ext && supportedExtensions.includes(ext);
			});

			if (validFiles.length === 0) {
				uni.showToast({
				icon: 'none',
				title: '未选择有效的txt或pdf文件',
				duration: 2000
				});
				return;
			}

			// 显示加载中
			uni.showLoading({
				title: '上传中...',
				mask: true
			});

			try {
				uni.addInterceptor('uploadFile', {
					invoke(options) {
						options.header = {
							...options.header,
							'Authorization': `Bearer ${store.token}`
						};
					}
				});
				// 使用Promise.all并行上传所有文件
				const uploadPromises = validFiles.map(file => {
					return new Promise<void>((resolve, reject) => {
						uni.uploadFile({
						url: `${HOST}${api.uploadDoc}/${store.tenantUser.tenantId}/${directoryId.value}`, // 替换为你的上传接口URL
						filePath: file.path,
						name: 'file',
						formData: {
							filename: file.name
						},
						success: (uploadRes) => {
							try {
							const data: UploadResponse = JSON.parse(uploadRes.data);
							if (data.status !== "SUCCESS") {
								reject(new Error(data.message || '上传失败'));
							} else {
								uni.showToast({
									duration: 2000,
									position: 'center',
									title: '文件上传成功'
								});
								resolve();
							}
							} catch (e) {
								reject(new Error('解析响应数据失败'));
							}
						},
						fail: (err) => {
							reject(new Error(err.errMsg || '上传请求失败'));
						}
						});
					});
				});

				// 等待所有文件上传完成
				await Promise.all(uploadPromises);
				
				// 上传成功提示
				uni.showToast({
					title: `成功上传${validFiles.length}个文件`,
					icon: 'success',
					duration: 2000
				});
				showDirDialog.value = false;
			} catch (error) {
				uni.showToast({
					title: error instanceof Error ? error.message : '上传过程中出错',
					icon: 'none',
					duration: 2000
				});
			} finally {
				showMenu.value = false;
				uni.hideLoading();
			}
			},
			fail: (err) => {
				uni.showToast({
					duration: 2000,
					position: 'center',
					title: "上传文档失败",
					icon: 'none'
				});
			}
		});
	}

	/**	
	 * @description: 选择要查询的文件夹
	 * @date: 2025-07-12 13:03
	 * @author wuwenqiang
	 */
	const onSetDocument = ()=>{
		if(type.value !== 'document'){
			type.value = 'document';
		}else{
			showCheckDocument.value = true;
			getMyDocumentList().then((res)=>{
				myDocList.length = 0;
				myDocList.push(...res);
			})
		}
	
	}

	/**	
	 * @description: 确定选择
	 * @date: 2025-08-2 12:20
	 * @author wuwenqiang
	 */
	const onSureCheck = ()=>{
		showCheckDocument.value = false;
		getCheckedDocIds();
	}

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
	 * @description: 获取租户列表（用于切换租户弹窗）
	 * @date: 2026-04-14
	 * @author wuwenqiang
	 */
	const getTenantListForSwitch = () => {
		getTenantListService().then((res) => {
			tenantOptionList.length = 0;
			tenantOptionList.push({ value: store.userData.id!, text: "私人空间" });
			res.data.forEach((item: TenantType) => {
				tenantOptionList.push({ value: item.id, text: item.name });
			});
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
	 * @description: 选择租户后切换
	 * @date: 2026-04-14
	 * @author wuwenqiang
	 */
	const onSelectTenant = (tenantId: string) => {
		getTenantUserService(tenantId).then(res => {
			const data: TenantUserType = res.data ? res.data as TenantUserType : {
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
			store.setTenantUser(data);
			uni.setStorage({ key: `${store.userData.id}:tenantId`, data: data.tenantId ?? "" });
			// 切换租户后重新获取提示词
			getPrompt(data.tenantId ?? "");
		});
	}

	/**
	 * @author: wuwenqiang
	 * @description: 获取租户i
	 * @date: 2025-8-10 18:06
	 */
	const getStorageTenant = ()=>{
		uni.getStorage({key:`${store.userData.id}:tenantId`}).then((res)=>{
			const tenantId = res.data ?? "";
			getTenantUserService(tenantId).then((respone)=>{
				if(respone.data){
					store.setTenantUser(respone.data as TenantUserType);
					// 获取租户对应的提示词
					getPrompt(tenantId);
				}else{
					store.setTenantUser(getDefaultTenantUser());
					getPrompt(store.userData.id!);
				}
			}).catch(()=>{
				store.setTenantUser(getDefaultTenantUser());
				getPrompt(store.userData.id!);
			});
		}).catch(()=>{
			store.setTenantUser(getDefaultTenantUser());
			getPrompt(store.userData.id!);
		});
		uni.getStorage({key:`${store.userData.id}:prompt`}).then((res)=>{
			if(res.data){
				store.setPrompt(res.data)
			}
		})
	}

	const getDefaultTenantUser = ():TenantUserType=>{
		const defaultTenantUser:TenantUserType = {...DEFAULT_TENANT_USER};
		defaultTenantUser.tenantId = store.userData.id!;
		defaultTenantUser.userId = store.userData.id!;
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
     * @author: wuwenqiang
     * @description: 选中或取消选中文档
     * @date: 2025-11-02 14:37
     */
	const checkDoc = (docItem:DocumentInterface) => {
		docItem.checked = !docItem.checked;
	}

	const getCheckedDocIds = ()=>{
		checkedDocIds.length = 0;
		myDocList.forEach((aItem)=>{
			aItem.docList?.forEach((bItem)=>{
				if(bItem.checked)checkedDocIds.push(bItem.id);
			})
		});		
	}

	const onExpandDir = (item:DirectoryCheckInterface)=>{
		item.expand = !item.expand;
	}
	
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
								border-radius: @btn-border-radius;
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
						flex-direction: column;
						align-items: center;
						padding: @middle-padding;
            			border-bottom: 1rpx solid @gray-color;
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
	}
</style>