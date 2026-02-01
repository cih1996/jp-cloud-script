export declare enum Protoc {
    TypePing = 1,//ping
    TypePong = 2,//pong
    TypeTestDelayRequest = 3,//测速请求
    TypeTestDelayResponse = 4,//测速回复
    TypeBinary = 5,//纯二进制数据
    TypeMsgpack = 6,//msgpack编码的Message
    TypeJson = 7,//json编码的Message
    TypeText = 8,//纯粹的文本
    TypeVideo = 9,//视频流
    TypeAudio = 10,//音频流
    TypeSpeedTest = 11,//测速
    TypeSecretMsgpack = 12,//加密msgpack编码的Message
    TypeTerminal = 13
}
export declare enum Func {
    FuncTestDelay = 1,//延迟测试
    FuncAddPermit = 2,//集控平台向中间件发送添加用户权限
    FuncDelPermit = 3,//集控平台向中间件发送移除用户权限
    FuncDevice = 4,//一台设备的信息设备上线会主动推送,中间件被动接收
    FuncDevices = 5,//设备列表(本地缓存一份列表,只有当设备信息有变化或集控平台主动请求,才发送)
    FuncOnlineList = 6,//每次连接成功向集控平台推送设备的在线情况列表.(仅在线或离线的状态,不包含其他信息,省流)
    FuncTunnel = 7,//集控平台向中间件发送打洞请求(前端的屏幕墙连接,串流连接,都从这里开始)
    FuncLogin = 8,//
    FuncTerm = 9,//开启或关闭shell串流(websocket->中间件->手机) 参数:public.TermAction
    FuncVersionSequence = 10,//{"file":1,"device2version":1}升级包总版本号和盘位vs插件版本发行序号.集控平台管理所有插件的版本,有个总版本号,每次修改了插件版本,此版本号可加1.中间件获取后和本地缓存版本号比较,决定是否要下载版本列表
    FuncPlugins = 11,//下载版本列表{"version":111,"list":[]Version}
    FuncDevice2Version = 12,//手机和版本的关联关系["deviceId":{"main":1,"plugin":[]}]
    FuncMgtDevices = 13,//集中管理平台专用,带缓存差异推送设备信息变化
    FuncBatchCommand = 14,//执行单句shell命令,比如  ls -l. 发送string返回string
    FuncExit = 15,//命令进程强制退出(触发进程重启)
    FuncPortMap = 16,//开始映射的信令
    FuncPortTunnel = 17,//集控平台向中间件发送打洞请求(端口映射专用)
    FuncFileServer = 100,//设置httpCache地址
    FuncBroadcastInfo = 101,//用途1:中间件将采集到的设备信息广播给所有用户.用途2:udp广播扫描取设备基本信息(中间件广播,手机armLinux回应)
    FuncPreSetting = 102,//udp发送预分配的手机设置(dhcp发送,手机armLinux接收)
    FuncGetSettingByHid = 103,//armLinux在hid硬件标志存在的情况下,发送sn,中间件返回签名后的Setting
    FuncGetSettingByPreSetting = 104,//armLinux发送PreSetting,中间件返回签名后的Setting
    FuncDeviceVersion = 105,//手机内程序版本: {"name":"main","id":1,"version":"","url":""}
    FuncHidSwitchMode = 106,//小板控制指令:切换0=usb模式或1=otg模式.{"seat":1,"mode":0}
    FuncHidPower = 107,//小板控制指令:0=断电,1=上电,2=重启.{"seat":1,"mode":0}
    FuncHidFastboot = 108,//小板控制指令:进入Fastboot模式1和Fastboot2.{"seat":1,"mode":1}
    FuncHidFind = 109,//小板控制指令:手机进入寻找模式.0=退出,1=进入.{"seat":1,"mode":1}
    FuncHidWriteDefaultScript = 110,//小板控制指令:写入MCU默认上电脚本
    FuncGetWorkMode = 111,//获取当前中间件的工作模式. 0=DHCP,1=硬件版.返回:{"seat":0,"mode":1}
    FuncFlashSubscribe = 112,//刷机:订阅或取消订阅: {"seat":0,"action":0,"session":13723423412345} seat=0全局订阅,大于0是具体某个盘位的,action=0取消1订阅,当seat>0的时候需要提供session
    FuncImageList = 113,//刷机:取可用镜像列表
    FuncImageDelete = 114,//刷机:删除镜像
    FuncFlashLogList = 115,//刷机:取刷机日志文件列表
    FuncFlashTaskDetail = 116,//刷机:刷机的详细过程
    FuncFlashList = 117,//刷机:获取任务列表
    FuncFlashTask = 118,//刷机:推送单个任务状态变化
    FuncFlashTaskAdd = 119,//刷机:新增刷机任务,参数是:public.FlashTask
    FuncFlashTaskRemove = 120,//刷机:移除任务
    FuncFlashTaskAction = 121,//刷机:强制启动/停止任务
    FuncScreenChange = 250,//设备屏幕旋转广播
    FuncStartVideo = 251,//开启设备的视频编码,群控连接禁止调用
    FuncStopVideo = 252,//停止设备的视频编码,群控连接禁止调用
    FuncStartAudio = 253,//开启设备的音频编码,群控连接禁止调用
    FuncStopAudio = 254,//停止设备的音频编码,群控连接禁止调用
    FuncAuth = 255,//设备鉴权
    FuncTouchAbs = 257,//触摸绝对坐标
    FuncTouch = 258,//触摸,屏幕宽高千分比
    FuncScroll = 259,//滚动
    FuncKey = 281,//发送按键.{action: 3, keyCode: 3}	action：0按下1抬起3按下并抬起，4ctrol+组合键 keyCode：键码
    FuncCMD = 288,
    FuncCMDWithResult = 289,
    FuncWakeup = 297,
    FuncWakeupAlways = 298,
    FuncImg = 299,
    FuncTransferStart = 301,//1.开始上传:{path,size,toPhotos}=>{id:xxxx}
    FuncTransferFile = 302,//2.上传{id:xxxx,seq:n,payload:[....]}=>返回:成功/文件已关闭
    FuncTransferCancel = 303,//取消上传
    FuncFileList = 304,//列出文件列表.{path}
    FuncFileStat = 305,//取文件基本信息:{path}=>{path,isDir,modifyAt,createAt}
    FuncFileMove = 306,//文件改名/移动.{srcPath,dstPath}
    FuncFileDelete = 307,//删除一个文件. {path}
    FuncToPhotos = 308,//将图片或视频发送到相册{path}
    FuncDownFileBegin = 309,//开始下载文件 请求{path}==>返回{path,size,id}
    FuncDownFileChunk = 310,//下载文件块,请求{id,offset}==>返回{id,offset,payload}
    FuncTopApp = 320,//取前台app
    FuncFindNode = 321,//使用jsonPath类似的DSL语句查询元素
    FuncFindDialog = 322,//找系统弹窗
    FuncURL = 323,//app浏览框跳转
    FuncTTS = 324,//执行siri指令
    FuncToast = 325,//发送通知
    FuncTransferPic = 398,//上传图片最大9M,图片对象将保存到缓存池,并返回存储id.
    FuncTransferPicZip = 399,//载入301上传的zip到图片缓存,一般用来传找图用的小图,后端解压存入缓存池的时候id是 图片路径名称 作为id,所以自己需要注意名称别重复.
    FuncCleanCache = 400,//清空图片缓存.(删除已缓存的全部图片).
    FuncScreenshotHold = 401,//截图到缓存池,返回id(默认3分钟无访问自动清理)
    FuncRenewPic = 402,//为指定id的图片缓存续命3分钟.
    FuncReleasePic = 403,//从图片缓存池释放掉一张图片.
    FuncGetPicById = 404,//通过图片id,从缓存池下载图片.(图片id,格式),参数同FuncImg //格式:0=jpeg,1=png,2=webp,-1=raw(缓存的原始nsdata)
    FuncCached = 405,//获取全部已缓存图片的key
    FuncGetColor = 406,//取色   :(图片id,x,y,hold)=>{pic:图片id,color:"RRGGBB"} //返回值里的图片id是立即截屏并hold后产生的,方便后续操作,比如下一步找图.
    FuncCmpColor = 407,//多点比色:(图片id,"x|y|color,x|y|color",hold)=>{pic:图片id,sim:0.8} //图片数组传一个值就是单点比色了.
    FuncFindColor = 408,//找色(返1):(图片id,x,y,width,height,color,[{x,y,color}],相似度,hold)=>=>{pic:图片id,result:0.99} ////找到第一个点之后以第一个点为基准找偏移[{x,y,color}]的点,都存在就算找到了.
    FuncFindPic = 409,//找图   :(图片id,[{x,y,width,height,目标图片id,偏色,相似度}],hold)//在源图片上,找多个小图,每个小图都能定义矩形范围和偏色
    FuncFindPicEx = 410,//模糊找图:使用opencv的SIFT特征点算法
    FuncOCR = 411,//OCR   :(图片id,x,y,width,height,["zh-Hans","en"],hold) //图片缩指定的矩形范围内识别 简体中文和英文.如果不指定语言那就是按手机系统的当前语言识别.
    FuncHttp = 500,//支持代理的HTTP请求:(url,method[post/get/put/delete],header[文本数组],body[字节],proxy[socks5://username:password@host:port],timeout[可省略,默认1分钟])=>{code,body,header}
    FuncOSInfo = 501,//系统基本信息:语言,地区,时区,当前时间,开机时长,网络情况
    FuncInputText = 769,//输出文本
    FuncGetClipBoard = 770,//取剪切板,需要app处于前台
    FuncSetClipBoard = 771,//置剪切板,需要app处于前台
    FuncGetAppList = 290,
    FuncStartApp = 291,
    FuncKillApp = 292,
    FuncAddDownloadTask = 293,
    FuncGetCurrentDownloadTask = 294,
    FuncCancelDownloadTask = 295,
    FuncGetDownloadList = 296,
    FuncScreenOff = 297,
    FuncScreenOn = 298,
    FuncSwitchUsbMode = 218,
    FuncControlAdb = 219,
    FuncSwitchCamera = 515,
    FuncRootGrant = 516,
    FuncRootRevoke = 517,
    FuncSetIME = 518,
    FuncGetLocation = 149,
    FuncSimulateLocation = 150,
    FuncStopSimulateLocation = 151,
    FuncRebootDevice = 155,
    FuncWipeDevice = 156,
    FuncSetLanguageLocale = 157,
    FuncUninstallApp = 159,
    FuncGetAppWebviewUrl = 326,
    FuncExecuteJsScript = 510,
    FuncExecuteJsScriptFile = 511,
    FuncUnzipFile = 311
}
export declare const keyCode: {
    action: {
        down: number;
        up: number;
        downAndUp: number;
        mouseDown: number;
        mouseMove: number;
        mouserUp: number;
        wheel: number;
        ctrl: number;
    };
    soundPlus: number;
    soundReduce: number;
    backspace: number;
    enter: number;
    up: number;
    down: number;
    left: number;
    right: number;
    delete: number;
    home: number;
    menu: number;
    back: number;
    power: number;
    mouse: number;
    ctrl: number;
    keyUp: number;
    keyDown: number;
    fileDownload: number;
    A: number;
    C: number;
    X: number;
    fileDownLoadAndInstall: number;
};
export declare const keyMap: Map<string, number>;
