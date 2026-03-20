import {
  Monitor, Download, Connection, Refresh, Link, EditPen, Location, Setting, VideoPlay, Key, Cpu, Document, Switch, SetUp
} from '@element-plus/icons-vue';

export const getStepStyle = (type: string) => {
    switch (type) {
        case 'shell': return { icon: Monitor, color: '#374151', bg: '#f3f4f6' };
        case 'download_url': return { icon: Download, color: '#2563eb', bg: '#eff6ff' };
        case 'download_cloud': return { icon: Download, color: '#0891b2', bg: '#ecfeff' };
        case 'change_os_and_wait': return { icon: Refresh, color: '#ea580c', bg: '#fff7ed' };
        case 'set_proxy_and_wait': return { icon: Connection, color: '#7c3aed', bg: '#f5f3ff' };
        case 'set_location': return { icon: Location, color: '#dc2626', bg: '#fef2f2' };
        case 'install_app_and_wait': return { icon: Setting, color: '#0d9488', bg: '#f0fdfa' };
        case 'start_bot': return { icon: VideoPlay, color: '#2563eb', bg: '#eff6ff' };
        case 'run_script': return { icon: Cpu, color: '#059669', bg: '#ecfdf5' };
        case 'http_request': return { icon: Link, color: '#16a34a', bg: '#f0fdf4' };
        case 'custom_js': return { icon: EditPen, color: '#9333ea', bg: '#faf5ff' };
        case 'get_root': return { icon: Key, color: '#b91c1c', bg: '#fef2f2' };
        // 新增步骤类型
        case 'execute_repo_script': return { icon: Document, color: '#0284c7', bg: '#e0f2fe' };
        case 'set_variables': return { icon: SetUp, color: '#ca8a04', bg: '#fef9c3' };
        case 'network_check': return { icon: Connection, color: '#0891b2', bg: '#ecfeff' };
        case 'condition_check': return { icon: Switch, color: '#7c3aed', bg: '#ede9fe' };
        default: return { icon: Connection, color: '#6b7280', bg: '#f9fafb' };
    }
};

export const getTaskColor = (id: string | number) => {
    const idStr = String(id);
    const colors = ['#007aff', '#34c759', '#5856d6', '#ff9500', '#ff2d55', '#af52de', '#ff3b30', '#5ac8fa', '#ffcc00'];
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const formatStepType = (type: string, _t?: (key: string) => string) => {
    const map: Record<string, string> = {
        shell: 'Shell命令',
        download_url: 'URL下载',
        download_cloud: '云端下载',
        change_os_and_wait: '改机重启',
        set_proxy_and_wait: '设置代理',
        set_location: '设置定位',
        install_app_and_wait: '安装应用',
        start_bot: '启动脚本',
        run_script: '执行脚本',
        http_request: 'HTTP请求',
        custom_js: '自定义JS',
        get_root: '应用提权',
        // 新增步骤类型
        execute_repo_script: '仓库脚本',
        set_variables: '设置变量',
        network_check: '网络检测',
        condition_check: '条件判断'
    };
    return map[type] || type;
};
